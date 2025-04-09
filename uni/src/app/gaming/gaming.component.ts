import { Component, computed, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { BleSelectorComponent } from "./ble-selector/ble-selector.component";
import { ToasterErrorComponent } from "../toaster-error/toaster-error.component";
import { BleServiceService } from './service/ble-service.service';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { LandscapeComponent } from "./landscape/landscape.component";
import { GameCoverComponent } from "./game-cover/game-cover.component";
import { FlappyComponent } from "./games/flappy/flappy.component";
import { SoundServiceService } from './service/sound-service.service';
import { MenuComponent } from "./menu/menu.component";
import { toSignal } from '@angular/core/rxjs-interop';
import { PlayerServiceService } from './service/player-service.service';

@Component({
  selector: 'app-gaming',
  standalone: true,
  imports: [BleSelectorComponent, ToasterErrorComponent, HeaderComponent, FooterComponent, LandscapeComponent, GameCoverComponent, MenuComponent, FlappyComponent],
  templateUrl: './gaming.component.html',
  styleUrl: './gaming.component.scss'
})
export class GamingComponent {
  @ViewChild('fullscreenDiv') fullscreenDiv!: ElementRef;
  private playerService = inject(PlayerServiceService)
  pause = toSignal(this.playerService.pouseSignal)
  gameSelect = signal<number|undefined>(undefined)
  private bleService = inject(BleServiceService)
  pression = toSignal(this.bleService.pressureSignal)
  chakLandsapeMode = computed<boolean>(()=>{return window.innerWidth>window.innerHeight})
  constructor(
        private soundService : SoundServiceService, 
  ) {


    effect(()=>{
      if(this.pression()==undefined){
        this.gameSelect.set(undefined)
        this.playerService.pouse(false)
      }
    },{allowSignalWrites:true})

    effect(()=>{
      if(this.pause() || this.gameSelect()!=0){
        this.soundService.stopLoopMain() 
      }else{
      this.soundService.playLoopMain()
      }
      })      
  }
 
  toggleFullscreen() {
    const elem = this.fullscreenDiv.nativeElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

}



