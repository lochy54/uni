import { Component, computed, effect, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { SoundServiceService } from '../../../service/sound-service.service';
import { BleServiceService } from '../../../service/ble-service.service';
import { PlayerServiceService } from '../../../service/player-service.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { TreeModule } from 'primeng/tree';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [TreeModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {

  private readonly soundService = inject(SoundServiceService)
  private readonly bleService = inject(BleServiceService)
  private readonly playerService = inject(PlayerServiceService)

  readonly openMenu = signal<boolean>(false)
  readonly openBle= signal<boolean>(false)
  readonly openAudio = signal<boolean>(false)
  readonly openPLayer = signal<boolean>(false)
  readonly openDiff= signal<boolean>(false)
  readonly audio = toSignal(this.soundService.volume)
  readonly pression = toSignal(this.bleService.pressureSignal)
  readonly username = toSignal(this.playerService.usernameSignal)
  readonly difficulty = toSignal(this.playerService.difficultySignal)
  readonly sensibility = toSignal(this.playerService.pressureSetSignal)
  @Output() fullScreen : EventEmitter<boolean> = new EventEmitter()
  @Output() resetGame : EventEmitter<boolean> = new EventEmitter()


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
  click(){
    this.soundService.playClickSound()
  }

}
