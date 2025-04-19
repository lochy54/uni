import { Component, computed, effect, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { game } from '../../../../service/api-service.service';
import { BleServiceService } from '../../../../service/ble-service.service';
import { PlayerServiceService } from '../../../../service/player-service.service';
import { SoundServiceService } from '../../../../service/sound-service.service';
import { Background } from '../backgorund';
import { Sprite } from '../sprite';
import { GameOverComponent } from "../game-over/game-over.component";
import { ScoreComponent } from "../score/score.component";

interface Food {
  good : boolean,
  element : Sprite
}


@Component({
  selector: 'app-grab',
  imports: [GameOverComponent, ScoreComponent],
  templateUrl: './grab.component.html',
  styleUrl: './grab.component.scss'
})
export class GrabComponent {

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
  private coin: HTMLImageElement = new Image();
  private skull: HTMLImageElement = new Image();

  private items: Food[] = [];


  private fly = false

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
    const pgreverse: HTMLImageElement = new Image();

    const backgorund: HTMLImageElement = new Image();
    this.skull.src ='./game-stuf/skull.png'
    this.coin.src ='./game-stuf/coin.png'
    pgrun.src = './game-stuf/pigeon_walking-Sheet.png';
    pgreverse.src = './game-stuf/pigeon_walking-Sheet-rev.png';

    backgorund.src = '/game-stuf/city2.png';
    pgrun.onload = () => {
      this.bird = new Sprite(
          pgrun,
          50,
          this.canvas.nativeElement.height / 1.5,
          32,
          32,
          4,
          this.canvas.nativeElement,
          'circle',
          pgreverse,
          4
        ),
      backgorund.onload = () => {
        this.back = new Background(backgorund, this.canvas.nativeElement);
      };
    };
  }

  private loadElement() {
    this.bird.reset()
    this.items = [];
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

  }

  private update() {
      if(!this.fly){
        this.bird.update(Date.now() - this.startDate,this.difficulty(),0)
        if(this.bird.isOutOfCanvas()){
          this.bird.update(Date.now() - this.startDate,-this.difficulty(),0)
        }
      }else{
        this.bird.update(Date.now() - this.startDate,-this.difficulty(),0)
        if(this.bird.isOutOfCanvas()){
          this.bird.update(Date.now() - this.startDate,+this.difficulty(),0)
        }
      }
      

  }

  private render() {
    this.context.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
    this.back.draw();
    this.bird.draw(this.fly);
    this.items.forEach((val) => val.element.draw());
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'a' || event.key === 'A') {
      this.fly = true;
      this.soundService.playJumpSound();
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'a' || event.key === 'A') {
      this.fly = false;
    }
  }

}
