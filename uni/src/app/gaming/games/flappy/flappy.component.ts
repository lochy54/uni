import {
  Component,
  ElementRef,
  ViewChild,
  signal,
  AfterViewInit,
  inject,
  HostListener,
  effect,
  computed
} from '@angular/core';
import { BleServiceService } from '../../service/ble-service.service';
import { PlayerServiceService } from '../../service/player-service.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { GameOverComponent } from "../game-over/game-over.component";
import { ScoreComponent } from "../score/score.component";
import { SoundServiceService } from '../../service/sound-service.service';
import { sensibility } from '../../../../service/api-service.service';

interface Element {
  w: number;
  h: number;
  x: number;
  y: number;
  passed? : boolean
}

@Component({
  selector: 'app-flappy',
  standalone: true,
  templateUrl: './flappy.component.html',
  styleUrls: ['./flappy.component.scss'],
  imports: [GameOverComponent, ScoreComponent]
})
export class FlappyComponent implements AfterViewInit {
  @ViewChild('gameCanvas') canvas!: ElementRef<HTMLCanvasElement>;


  // Game state
  readonly points = signal<number>(0);
  readonly gameOver = signal<boolean>(true);
  private sens! : sensibility[]
  private startDate! : number 
  // Services
  private readonly bleService = inject(BleServiceService);
  private readonly playerService = inject(PlayerServiceService);
  private readonly soundService = inject(SoundServiceService)
  // Signal values
  private readonly rawDifficulty = toSignal(this.playerService.difficultySignal);
  private readonly difficulty = computed(() =>
    this.rawDifficulty()! * (this.canvas.nativeElement.width / 800)
  ); 
  private readonly pressure = toSignal(this.playerService.pressureSetSignal);
  private readonly pause = toSignal(this.playerService.pouseSignal);
  private readonly pression = toSignal(this.bleService.pressureSignal);

  // Canvas context
  private context!: CanvasRenderingContext2D;
  private pitch : boolean = false
  // Game assets and objects
  private bird!: Element;
  private back!: Element[];
  private pillars!: Element[] ;
  private readonly pg: HTMLImageElement = new Image();
  private readonly pillarImg: HTMLImageElement = new Image();
  private readonly backgorund : HTMLImageElement = new Image()


  
  constructor() {

        effect(()=>{
          if(this.pause() || this.gameOver() ){
            this.soundService.stopLoopGame() 
          }else{
          this.soundService.playLoopGame()
          }
          })   
  }

  ngAfterViewInit(): void {
    this.setupCanvas();
    this.pg.src = './game-stuf/flappy-pn.png';
    this.pillarImg.src = './game-stuf/pipe.png';
    this.backgorund.src = '/game-stuf/back.jpg'
    this.pg.onload = () => {
      this.loadElement()
    };
  }

  private loadElement(){
    const canvas = this.canvas.nativeElement;
    this.pillars = []
    this.bird = {
      w: canvas.width / 10,
      h: (this.pg.height * canvas.width) / (10 * this.pg.width),
      x: canvas.width / 10,
      y: canvas.height / 3 ,
    };
    this.back = [{
      w: canvas.width+100,
      h: canvas.height,
      x: 0,
      y: 0,
    },{
      w: canvas.width+100,
      h: canvas.height,
      x: canvas.width,
      y: 0,
    },
    ]
    this.drowPilar()
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
    this.sens = []
    this.startDate = Date.now()
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

  private drowPilar(){
    const canvas = this.canvas.nativeElement;

    const minGap =  (this.pg.height * canvas.width) / (10 * this.pg.width)/3 *2; 
    const maxGap = canvas.height/2 ;
    const gap = Math.random() * (maxGap - minGap) + minGap;
    const gap1 = Math.random() * (maxGap - minGap) + minGap;


    this.pillars.push({
      w: canvas.width / 10,
      h: (this.pillarImg.height * canvas.width) / (10 * this.pillarImg.width)  ,
      x: canvas.width,
      y: (canvas.height)/2 + gap,
      passed : false
    })
    this.pillars.push({
      w: canvas.width / 10,
      h: (this.pillarImg.height * canvas.width) / (10 * this.pillarImg.width),
      x: canvas.width,
      y: (canvas.height)/2-(this.pillarImg.height * canvas.width) / (10 * this.pillarImg.width) -gap1,
      passed : false

    })
  }

  private update() {
    this.sens.push({
      pression : this.pression()!,
      timestap :  Date.now() - this.startDate
    })
    const canvas = this.canvas.nativeElement;
    this.back.forEach( (b) =>{ 
      b.x -= this.difficulty()!
      if(b.x<-canvas.width){
        b.x = canvas.width
      }
    })
    
    this.collision()
    if(this.pressure()!<=this.pression()!){
      this.bird.y -= this.difficulty()!
      this.pitch = false
    }else{
      this.soundService.playAnimationSound()
      this.bird.y += this.difficulty()!
      this.pitch = true

    }
    this.pillars.forEach(p => p.x -= this.difficulty()!)
    if(!this.pillars.some(p => p.x > canvas.width - p.w*2 )){
      this.drowPilar()
    }

    this.pillars.forEach(p => {
      if (!p.passed && p.x  < this.bird.x ) {
        p.passed = true
        this.points.update((val) => val+1)
      }
    });

    this.pillars = this.pillars.filter( p => p.x > 0)
  }

  private render() {
      this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      const angle = this.pitch ? Math.PI / 6 : Math.PI /270;
      this.back.forEach((b) => {
        this.context.drawImage(this.backgorund, b.x, b.y, b.w, b.h);
      });
      this.context.save();
      this.context.translate(this.bird.x + this.bird.w / 2, this.bird.y + this.bird.h / 2);
      this.context.rotate(angle);
      this.context.drawImage(
        this.pg,
        -this.bird.w / 2,
        -this.bird.h / 2,
        this.bird.w,
        this.bird.h
      );
      this.context.restore();

      // Disegna i pilastri
      this.pillars.forEach((p) => {
        this.context.drawImage(this.pillarImg, p.x, p.y, p.w, p.h);
      });
  }
  


  private collision() {
    const canvas = this.canvas.nativeElement;
    this.pillars.forEach((p)=>{
      const birdLeft = this.bird.x;
      const birdRight = this.bird.x + this.bird.w;
      const birdTop = this.bird.y;
      const birdBottom = this.bird.y + this.bird.h;

      const pillarLeft = p.x;
      const pillarRight = p.x + p.w;
      const pillarTop = p.y;
      const pillarBottom = p.y + p.h;
  
      const horizontalOverlap = birdRight > pillarLeft && birdLeft < pillarRight;
      const verticalOverlap = birdBottom > pillarTop && birdTop < pillarBottom;
  
      if (horizontalOverlap && verticalOverlap) {
        this.gameOver.set(true);
        this.playerService.savePression(this.sens)
        this.soundService.stopLoopGame()
        this.soundService.playDieSound()
      
      }
    })
    if (this.bird.y < 0 || this.bird.y + this.bird.h > canvas.height) {
      this.gameOver.set(true);
      this.playerService.savePression(this.sens)
      this.soundService.stopLoopGame()
      this.soundService.playDieSound()
  }  


}



}




















