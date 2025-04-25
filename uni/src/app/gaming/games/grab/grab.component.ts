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
  element : Sprite,
  grubbed : boolean
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
  private plat!: Background;
  private coin: HTMLImageElement = new Image();
  private skull: HTMLImageElement = new Image();

  private items: Food[] = [];


  private run = true
  private lastRun = true 
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
    const pgreverse = new Image();
    const background = new Image();
    const skull = new Image();
    const coin = new Image();
    const plat = new Image()
    pgrun.src = './game-stuf/pigeon_walking-Sheet.png';
    pgreverse.src = './game-stuf/pigeon_walking-Sheet-rev.png';
    background.src = './game-stuf/city3.png';
    skull.src = './game-stuf/skull.png';
    coin.src = './game-stuf/coin.png';
    plat.src = './game-stuf/ground.png';
    const loadImage = (img: HTMLImageElement): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        img.onload = () => resolve(img);
      });
    };
  
    Promise.all([
      loadImage(pgrun),
      loadImage(pgreverse),
      loadImage(background),
      loadImage(skull),
      loadImage(coin),
      loadImage(plat)
    ]).then(([loadedPgrun, loadedPgreverse, loadedBackground, loadedSkull, loadedCoin, loadedPlat]) => {
      this.skull.src = loadedSkull.src;
      this.coin.src = loadedCoin.src;
  
      this.bird = new Sprite(
        this.canvas.nativeElement,
        "circle",
        this.canvas.nativeElement.width / 10,
        this.canvas.nativeElement.height / 1.6,
        {
          frameIndex: 0,
          height: 32,
          width: 32,
          image: loadedPgrun,
          totalFrames: 4
        },
        {
          frameIndex: 0,
          height: 32,
          width: 32,
          image: loadedPgreverse,
          totalFrames: 4
        }
      );
  
      this.back = new Background(loadedBackground, this.canvas.nativeElement);
      this.plat = new Background(loadedPlat,this.canvas.nativeElement,(this.canvas.nativeElement.height/1.6)+this.canvas.nativeElement.width / 10)
    });
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

  private dorwFood() {
    const canvas = this.canvas.nativeElement;
    const useCoin = Math.random() < 0.5;
    const margin = canvas.width/10
    const random = Math.floor(Math.random() * (canvas.width - 2 * margin)) + margin;
    const food : Food = {
      good : useCoin,
      grubbed : false,
      element : new Sprite(canvas , "circle" ,random, 0 , {
        frameIndex : 0,
        image : useCoin ? this.coin : this.skull,
        height: useCoin ? 18 : 530,
        width: useCoin ? 20 : 359,
        totalFrames: useCoin ? 9 : 3,
      })
    }
    this.items.push(food)
  }

  private update() {
    this.run = this.pressure()! >= this.pression()!
    if(this.run!=this.lastRun){
      this.soundService.playJumpSound()
      this.lastRun=this.run
    }
    const canvas = this.canvas.nativeElement
    this.items.forEach(f => {
     if( f.element.collisionCheck(this.bird)){
      if(!f.good){
      this.gameOver.set(true);
      this.playerService.savePression(this.sens);
      this.soundService.stopLoopGame();
      this.soundService.playDieSound();
      }else if(!f.grubbed){
        f.grubbed = true 
        this.points.update(val => val+1)
        this.soundService.playCoinSound()
      }
      return;
     }else{
      f.element.update(Date.now(),0 , +this.difficulty()/1.5)
     }
    })

      if(!this.run){
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
      
      if (!this.items.some(p => p.element.getPos.y < canvas.height / 4+ p.element.getV().h)) {
        this.dorwFood();
      }

      this.items = this.items.filter(f =>  !f.grubbed && f.element.getPos.y <canvas.height );
    }

  

  private render() {
    this.context.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
    this.bird.currentFrame = this.run ? 1 : 0
    this.back.draw();
    this.bird.draw();
    this.plat.draw();
    this.items.forEach((val) => val.element.draw());
  }


}
