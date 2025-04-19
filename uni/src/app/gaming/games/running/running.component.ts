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


@Component({
  selector: 'app-running',
  imports: [GameOverComponent, ScoreComponent],
  templateUrl: './running.component.html',
  styleUrl: './running.component.scss',
})
export class SpaceComponent {
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

  private fly = false;
  private falling = true;
  // Canvas context
  private context!: CanvasRenderingContext2D;
  // Game assets and objects
  private bird!: Sprite;
  private back!: Background;
  private timeoutId: any; // store the timer

  private enemy: Sprite[] = [];

  private ratImg: HTMLImageElement = new Image();
  private batImg: HTMLImageElement = new Image();

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
    const pgrun: HTMLImageElement = new Image();
    const pgfly: HTMLImageElement = new Image();

    const backgorund: HTMLImageElement = new Image();
    pgrun.src = './game-stuf/pigeon_walking-Sheet.png';
    pgfly.src = './game-stuf/pigeon_fiy-Sheet.png';

    this.ratImg.src = './game-stuf/Slime_Spiked_Idle.png';
    this.batImg.src = './game-stuf/Bat_Fly.png';

    backgorund.src = '/game-stuf/city2.png';
    pgfly.onload = () => {
      this.bird =
         new Sprite(
          pgrun,
          50,
          this.canvas.nativeElement.height / 1.5,
          32,
          32,
          4,
          this.canvas.nativeElement,
          'circle',
          pgfly,
          7
        )
      backgorund.onload = () => {
        this.back = new Background(backgorund, this.canvas.nativeElement);
      };
    };
  }

  private loadElement() {
    this.bird.reset()
    this.enemy = [];
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

  private drowEnemy() {
    const canvas = this.canvas.nativeElement;
    const useBat = Math.random() < 0.5;

    const enemy: Sprite = new Sprite(
      useBat ? this.batImg : this.ratImg,
      canvas.width,
      useBat ? canvas.height / 2.5 : canvas.height / 1.5,
      useBat ? 32 : 20,
      useBat ? 32 : 18,
      4,
      canvas,
      'circle'
    );

    this.enemy.push(enemy);
  }

  private update() {
    this.points.set(Math.round((Date.now() - this.startDate) / 1000));
    const canvas = this.canvas.nativeElement;
    this.back.update(this.difficulty());
    this.sens.push({
      pression: this.pression()!,
      timestap: Date.now() - this.startDate,
    });

    this.enemy.forEach((val) => {
      if (val.collisionCheck(this.bird)) {
        this.gameOver.set(true);
        this.playerService.savePression(this.sens);
        this.soundService.stopLoopGame();
        this.soundService.playDieSound();
        return;
      }
    });

    if (this.pressure()! >= this.pression()! && !this.fly && !this.falling) {
      this.fly = true;
      this.soundService.playJumpSound();
      this.timeoutId = setTimeout(() => {
        this.fly = false;
      }, Math.floor(2500 / this.difficulty()));
    } else {
      this.fly = false;
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    }

    const birdY = this.bird.getPos.y;
    if (this.fly) {
      this.bird.update(Date.now() - this.startDate, 0, -this.difficulty());
      this.falling = true;
    } else if (this.falling) {
      if (birdY < canvas.height / 1.5) {
        this.bird.update(
          Date.now() - this.startDate,
          0,
          +this.difficulty()
        );
      } else {
        // Atterraggio
        this.falling = false;
        this.bird.update(Date.now() - this.startDate, 0, 0);
      }
    } else {
      // Se a terra e non in volo
      this.bird.update(Date.now() - this.startDate, 0, 0);
    }

    // Nemici
    this.enemy.forEach((p) => p.update(Date.now(), -this.difficulty(), 0));
    if (!this.enemy.some((p) => p.getPos.x > canvas.width - p.wi * 4)) {
      this.drowEnemy();
    }
    this.enemy = this.enemy.filter((p) => p.getPos.x > 0);
  }

  private render() {
    this.context.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
    this.back.draw();
    this.bird.draw(this.fly || this.falling);
    this.enemy.forEach((val) => val.draw());
  }

}
