import { Component, computed, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { BleSelectorComponent } from "./ble-selector/ble-selector.component";
import { BleServiceService } from '../../service/ble-service.service';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { LandscapeComponent } from "./landscape/landscape.component";
import { FlappyComponent } from "./games/flappy/flappy.component";
import { SoundServiceService } from '../../service/sound-service.service';
import { MenuComponent } from "./menu/menu.component";
import { toSignal } from '@angular/core/rxjs-interop';
import { PlayerServiceService } from '../../service/player-service.service';
import { FormsModule } from '@angular/forms';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-gaming',
  standalone: true,
  imports: [BleSelectorComponent, HeaderComponent, FooterComponent, LandscapeComponent, MenuComponent, FlappyComponent,  
    CardModule, ButtonModule],
  templateUrl: './gaming.component.html',
  styleUrl: './gaming.component.scss'
})
export class GamingComponent {

  games = [
    { name: 'Flappy', logo: 'game-logo/flappy.png', pso: 1 },
  ];
  


  @ViewChild('fullscreenDiv') fullscreenDiv!: ElementRef;
  private readonly playerService = inject(PlayerServiceService)
  private readonly soundService = inject(SoundServiceService)
  private readonly bleService = inject(BleServiceService)

  readonly pause = toSignal(this.playerService.pouseSignal)
  readonly gameSelect = signal<number|undefined>(undefined)
  readonly pression = toSignal(this.bleService.pressureSignal)
  readonly chakLandsapeMode = computed<boolean>(()=>{return window.innerWidth>window.innerHeight})

  constructor(
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

  play(n : number){
    this.soundService.playClickSound()
    this.gameSelect.set(n)
  }

}



