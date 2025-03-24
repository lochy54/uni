import { Component, computed, effect, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiServiceService } from '../../service/api-service.service';
import { ErrorServiceService } from '../../service/error-service.service';
import { BleSelectorComponent } from "./ble-selector/ble-selector.component";
import { ToasterErrorComponent } from "../toaster-error/toaster-error.component";
import { BleServiceService } from '../../service/ble-service.service';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { LandscapeComponent } from "./landscape/landscape.component";
import { GameCoverComponent } from "./game-cover/game-cover.component";
import { FlappyComponent } from "./games/flappy/flappy.component";
import { SoundServiceService } from './service/sound-service.service';

export interface game{
  name : string
  logo : string
  pso : number
}
@Component({
  selector: 'app-gaming',
  standalone: true,
  imports: [BleSelectorComponent, ToasterErrorComponent, HeaderComponent, FooterComponent, LandscapeComponent, GameCoverComponent, FlappyComponent],
  templateUrl: './gaming.component.html',
  styleUrl: './gaming.component.scss'
})
export class GamingComponent implements OnInit {
  @ViewChild('fullscreenDiv') fullscreenDiv!: ElementRef;
  gameCode: string = '';
  username = signal<string|undefined>(undefined)
  difficulty = signal<number>(5)
  audioEffect = signal<number>(5)
  audioSong = signal<number>(5)


  pression = computed<number | undefined>(()=>this.bleService.pressureSignal())
  gameSelect = signal<number>(0)
  gameStart = true

  openAudio = signal<boolean>(false)
  openPLayer = signal<boolean>(false)
  openDiff= signal<boolean>(false)
  gameList : game[] = [
    {
      pso : 2,
      name: "flappy",
      logo : "game-logo/flappy.png"
    },
    {
      pso : 2,
      name: "flappy",
      logo : "game-logo/flappy.png"
    },
    {
      pso : 2,
      name: "flappy",
      logo : "game-logo/flappy.png"
    },
  ]
  chakLandsapeMode = computed<boolean>(()=>{return window.innerWidth>window.innerHeight})
  constructor(private route: ActivatedRoute, private apiService : ApiServiceService, private errorService:ErrorServiceService,private router : Router,
              private bleService: BleServiceService,
              public soundService : SoundServiceService
  ) {

    effect(()=>{
     if( this.username()&&this.pression()&&this.gameStart) {
      this.gameStart=false
      this.gameSelect.set(1)
     }
    },{allowSignalWrites:true})


    effect(()=>{
      if(this.gameSelect()==1){
        this.soundService.stopLoopGame()
        this.soundService.playLoopMain()
      }else{
        this.soundService.stopLoopMain() 
        this.soundService.playLoopGame() 
      }
    })
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.gameCode = params.get('code') || ''; 
      this.apiService.isCodeActive(this.gameCode).subscribe({
          error : (_)=> {
            this.router.navigate(['/']);
          },
      })
    });

}


  toggleFullscreen() {
    const elem = this.fullscreenDiv.nativeElement;

    if (!document.fullscreenElement) {
      elem.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }


onDifficultyChange(event: Event) {
  const inputElement = event.target as HTMLInputElement;
  if (inputElement) {
    this.difficulty.set(+inputElement.value)
  }
}

onAudioEffectChange(event: Event) {
  const inputElement = event.target as HTMLInputElement;
  if (inputElement) {
    this.audioEffect.set(+inputElement.value)
    this.soundService.setVolumeEffect(+inputElement.value)
  }
}

onAudioSongChange(event: Event) {
  const inputElement = event.target as HTMLInputElement;
  if (inputElement) {
    this.audioSong.set(+inputElement.value)
    this.soundService.setVolumeSong(+inputElement.value)
  }
}


}




// fare primo gioco
