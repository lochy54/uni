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
  
    const pg = new Image();
    const background = new Image();
    const pillarImg = new Image();
  
    const loadImage = (img: HTMLImageElement, src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => reject(`Errore nel caricamento di ${src}`);
      });
    };
  
    Promise.all([
      loadImage(pg, './game-stuf/pigeon_fiy-Sheet.png'),
      loadImage(background, '/game-stuf/city.png'),
      loadImage(pillarImg, './game-stuf/pipe.png')
    ])
    .then(([loadedPg, loadedBackground, loadedPipe]) => {
      this.pillarImg.src = loadedPipe.src;
  
      this.bird = new Sprite(
        this.canvas.nativeElement,
        "circle",
        this.canvas.nativeElement.width / 10,
        this.canvas.nativeElement.height / 5,
        {
          image: loadedPg,
          frameIndex: 0,
          totalFrames: 7,
          width: 32,
          height: 32
        }
      );
  
      this.back = new Background(loadedBackground, this.canvas.nativeElement);
    })
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
        canvas,"rect",canvas.width,canvas.height / 2 + gap,{
          frameIndex:0,
          totalFrames:1,
          height:this.pillarImg.height,
          width:this.pillarImg.width,
          image:this.pillarImg
        }
      )
    };
    const pilar2: pillar = {
      passed: false,
      element: new Sprite(
        canvas,"rect",canvas.width, canvas.height / 2 -
        (this.pillarImg.height * canvas.width) / (10 * this.pillarImg.width) -
        gap1,{
          frameIndex:0,
          totalFrames:1,
          height:this.pillarImg.height,
          width:this.pillarImg.width,
          image:this.pillarImg
        }
      )
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
      else{
        val.element.update(Date.now(), -this.difficulty(), 0)
        if (!val.passed && val.element.getPos.x < this.bird.getPos.x) {
          val.passed = true;
          this.points.update((val) => val + 1);
        }
      }
    });

    if (this.pressure()! <= this.pression()!) {
      this.bird.update(Date.now() - this.startDate, 0, -this.difficulty());
    } else {
      this.soundService.playJumpSound();
      this.bird.update(Date.now() - this.startDate, 0, +this.difficulty());
    }

    if (
      !this.pillars.some(
        (p) => p.element.getPos.x > canvas.width - p.element.getV().w *3
      )
    ) {
      this.drowPilar();
    }


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
