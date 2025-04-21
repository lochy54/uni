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
  private plat!: Background;

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
  
    const pgrun = new Image();
    const pgfly = new Image();
    const background = new Image();
    const ratImg = new Image();
    const batImg = new Image();
    const plat = new Image()
    const loadImage = (img: HTMLImageElement, src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => reject(`Errore nel caricamento di ${src}`);
      });
    };
  
    Promise.all([
      loadImage(pgrun, './game-stuf/pigeon_walking-Sheet.png'),
      loadImage(pgfly, './game-stuf/pigeon_fiy-Sheet.png'),
      loadImage(background, '/game-stuf/city2.png'),
      loadImage(ratImg, './game-stuf/Slime_Spiked_Idle.png'),
      loadImage(batImg, './game-stuf/Bat_Fly.png'),
      loadImage(plat , './game-stuf/ground.png')
      

    ])
    .then(([loadedPgrun, loadedPgfly, loadedBackground, loadedRat, loadedBat,loadedPlat]) => {
      this.ratImg.src = loadedRat.src;
      this.batImg.src = loadedBat.src;
  
      this.bird = new Sprite(
        this.canvas.nativeElement,
        "circle",
        this.canvas.nativeElement.width / 10,
        this.canvas.nativeElement.height / 1.6,
        {
          frameIndex: 0,
          totalFrames: 4,
          height: 32,
          width: 32,
          image: loadedPgrun
        },
        {
          frameIndex: 0,
          totalFrames: 7,
          height: 32,
          width: 32,
          image: loadedPgfly
        }
      );
  
      this.back = new Background(loadedBackground, this.canvas.nativeElement);
      this.plat = new Background(loadedPlat,this.canvas.nativeElement,(this.canvas.nativeElement.height/1.6)+this.canvas.nativeElement.width / 10)

    })
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
      canvas,
      "circle",
       canvas.width,
      useBat ? canvas.height / 2.8 : canvas.height / 1.55,
      {
        frameIndex:0,
        width: useBat ? 32 : 20,
        height:  useBat ? 32 : 18,
        image : useBat ? this.batImg : this.ratImg,
        totalFrames:4
      }
    );

    this.enemy.push(enemy);
  }

  private update() {
    this.points.set(Math.round((Date.now() - this.startDate) / 1000));
    const canvas = this.canvas.nativeElement;
    this.back.update(this.difficulty());
    this.plat.update(this.difficulty());
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
      }else{
        val.update(Date.now(), -this.difficulty(), 0)
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
      if (birdY < canvas.height / 1.8) {
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
    if (!this.enemy.some((p) => p.getPos.x > canvas.width - p.getV().w * 4)) {
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
    this.bird.currentFrame = ((this.fly || this.falling) ? 1 : 0)
    this.back.draw();
    this.bird.draw();
    this.plat.draw(); 
    this.enemy.forEach((val) => val.draw());
  }

}
