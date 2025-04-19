import {
  Component,
  ElementRef,
  ViewChild,
  signal,
  AfterViewInit,
  inject,
  effect,
  computed,
  HostListener,
} from '@angular/core';
import { BleServiceService } from '../../../../service/ble-service.service';
import { PlayerServiceService } from '../../../../service/player-service.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { GameOverComponent } from '../game-over/game-over.component';
import { ScoreComponent } from '../score/score.component';
import { SoundServiceService } from '../../../../service/sound-service.service';
import { game } from '../../../../service/api-service.service';
import { Sprite } from '../sprite';
import { Background } from '../backgorund';

interface pillar {
  passed: boolean;
  element: Sprite;
}

@Component({
  selector: 'app-flappy',
  standalone: true,
  templateUrl: './flappy.component.html',
  styleUrls: ['./flappy.component.scss'],
  imports: [GameOverComponent, ScoreComponent],
})
export class FlappyComponent implements AfterViewInit {
  @ViewChild('gameCanvas') canvas!: ElementRef<HTMLCanvasElement>;

  // Game state
  readonly points = signal<number>(0);
  readonly gameOver = signal<boolean>(true);
  private sens!: game[];
  private startDate!: number;
  // Services
  private readonly bleService = inject(BleServiceService);
  private readonly playerService = inject(PlayerServiceService);
  private readonly soundService = inject(SoundServiceService);
  // Signal values
  private readonly rawDifficulty = toSignal(
    this.playerService.difficultySignal
  );
  private readonly difficulty = computed(() => this.rawDifficulty()!);
  private readonly pressure = toSignal(this.playerService.pressureSetSignal);
  private readonly pause = toSignal(this.playerService.pouseSignal);
  private readonly pression = toSignal(this.bleService.pressureSignal);

  // Canvas context
  private context!: CanvasRenderingContext2D;
  // Game assets and objects
  private bird!: Sprite;
  private back!: Background;
  private pillars: pillar[] = [];
  private pillarImg: HTMLImageElement = new Image();

  constructor() {
    effect(() => {
      if (this.pause() || this.gameOver()) {
        this.soundService.stopLoopGame();
      } else {
        this.soundService.playLoopGame();
      }
    });
  }

  ngAfterViewInit(): void {
    this.setupCanvas();
    const pg: HTMLImageElement = new Image();
    const backgorund: HTMLImageElement = new Image();
    pg.src = './game-stuf/pigeon_fiy-Sheet.png';
    this.pillarImg.src = './game-stuf/pipe.png';
    backgorund.src = '/game-stuf/city.png';
    pg.onload = () => {
      this.bird = new Sprite(
        pg,
        50,
        50,
        32,
        32,
        7,
        this.canvas.nativeElement,
        'circle'
      );
    };
    backgorund.onload = () => {
      this.back = new Background(backgorund, this.canvas.nativeElement);
    };
  }

  private loadElement() {
    this.bird.reset();
    this.pillars = [];
  }

  private setupCanvas() {
    const canvasEl = this.canvas.nativeElement;
    canvasEl.width = canvasEl.clientWidth;
    canvasEl.height = canvasEl.clientHeight;
    this.context = canvasEl.getContext('2d')!;
  }

  startGame() {
    this.loadElement();
    this.gameOver.set(false);
    this.points.set(0);
    this.sens = [];
    this.startDate = Date.now();
    this.gameLoop();
  }

  private gameLoop() {
    if (this.gameOver()) {
      return;
    }
    if (!this.pause()) {
      this.update();
      this.render();
    }
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private drowPilar() {
    const canvas = this.canvas.nativeElement;
    const minGap = canvas.width / 15;
    const maxGap = canvas.height / 2;
    const gap = Math.random() * (maxGap - minGap) + minGap;
    const gap1 = Math.random() * (maxGap - minGap) + minGap;
    const pilar1: pillar = {
      passed: false,
      element: new Sprite(
        this.pillarImg,
        canvas.width,
        canvas.height / 2 + gap,
        this.pillarImg.width,
        this.pillarImg.height,
        1,
        canvas,
        'rect'
      ),
    };
    const pilar2: pillar = {
      passed: false,
      element: new Sprite(
        this.pillarImg,
        canvas.width,
        canvas.height / 2 -
          (this.pillarImg.height * canvas.width) / (10 * this.pillarImg.width) -
          gap1,
        this.pillarImg.width,
        this.pillarImg.height,
        1,
        canvas,
        'rect'
      ),
    };

    this.pillars.push(pilar1, pilar2);
  }

  private update() {
    this.back.update(this.difficulty());
    this.sens.push({
      pression: this.pression()!,
      timestap: Date.now() - this.startDate,
    });
    const canvas = this.canvas.nativeElement;
    this.back.update(this.difficulty());
    if (this.bird.isOutOfCanvas()) {
      this.gameOver.set(true);
      this.playerService.savePression(this.sens);
      this.soundService.stopLoopGame();
      this.soundService.playDieSound();
      return;
    }
    this.pillars.forEach((val) => {
      if (val.element.collisionCheck(this.bird)) {
        this.gameOver.set(true);
        this.playerService.savePression(this.sens);
        this.soundService.stopLoopGame();
        this.soundService.playDieSound();
        return;
      }
    });

    if (this.pressure()! <= this.pression()!) {
      this.bird.update(Date.now() - this.startDate, 0, -this.difficulty());
    } else {
      this.soundService.playJumpSound();
      this.bird.update(Date.now() - this.startDate, 0, +this.difficulty());
    }

    this.pillars.forEach((p) =>
      p.element.update(Date.now(), -this.difficulty(), 0)
    );

    if (
      !this.pillars.some(
        (p) => p.element.getPos.x > canvas.width - p.element.wi * 3
      )
    ) {
      this.drowPilar();
    }

    this.pillars.forEach((p) => {
      if (!p.passed && p.element.getPos.x < this.bird.getPos.x) {
        p.passed = true;
        this.points.update((val) => val + 1);
      }
    });

    this.pillars = this.pillars.filter((p) => p.element.getPos.x > 0);
  }

  private render() {
    this.context.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
    this.back.draw();
    this.bird.draw();
    this.pillars.forEach((val) => val.element.draw());
  }


}
