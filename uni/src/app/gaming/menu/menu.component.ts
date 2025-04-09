import { Component, computed, effect, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { SoundServiceService } from '../service/sound-service.service';
import { BleServiceService } from '../service/ble-service.service';
import { PlayerServiceService } from '../service/player-service.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  openMenu = signal<boolean>(false)
  openBle= signal<boolean>(false)
  openAudio = signal<boolean>(false)
  openPLayer = signal<boolean>(false)
  openDiff= signal<boolean>(false)
  soundService = inject(SoundServiceService)
  audio = toSignal(this.soundService.volume)
  private bleService = inject(BleServiceService)
  pression = toSignal(this.bleService.pressureSignal)
  private playerService = inject(PlayerServiceService)
  username = toSignal(this.playerService.usernameSignal)
  difficulty = toSignal(this.playerService.difficultySignal)
  sensibility = toSignal(this.playerService.pressureSetSignal)
  @Output() fullScreen : EventEmitter<boolean> = new EventEmitter()
  @Output() resetGame : EventEmitter<boolean> = new EventEmitter()

  constructor(){
  }


  onDifficultyChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.playerService.setDifficulty(+inputElement.value)
    }
  }

  
  onSensChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.playerService.setPressure(+inputElement.value)
    }
  }
  
  onAudioEffectChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.soundService.setVolumeEffect(+inputElement.value)
    }
  }
  
  onAudioSongChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.soundService.setVolumeSong(+inputElement.value)
    }
  }

  onPouse(p:boolean){
    this.playerService.pouse(p)
  }

}
