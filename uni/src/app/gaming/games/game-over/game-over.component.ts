import { Component, effect, EventEmitter, inject, Output, signal } from '@angular/core';
import { SoundServiceService } from '../../service/sound-service.service';
import { PlayerServiceService } from '../../service/player-service.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-game-over',
  standalone: true,
  imports: [],
  templateUrl: './game-over.component.html',
  styleUrl: './game-over.component.scss'
})
export class GameOverComponent {
    @Output() PlayAgane : EventEmitter<boolean> = new EventEmitter()
    countDown = signal<number|undefined>(undefined)
    private countdownInterval: any;
    private playerService = inject(PlayerServiceService)
    private pause = toSignal(this.playerService.pouseSignal)
    private pausedAt : number | undefined
    constructor(private soundservice : SoundServiceService){
      effect(() => {
        if (this.pause()) {
          if (this.countDown()) {
            this.pausedAt = this.countDown();
            clearInterval(this.countdownInterval);
            console.log("no")
          }
        } else {
          if (this.pausedAt) {
            console.log("si")
            this.startCountdown(this.pausedAt);
            this.pausedAt = undefined;
          }
        }
      },{allowSignalWrites:true});
    }
    again() {
      if(this.countDown()) return
      this.soundservice.playClickSound();
      this.startCountdown(3);
    }

    startCountdown(n : number) {
      this.countDown.set(n)
      this.countdownInterval = setInterval(() => {
        if (this.countDown()! > 1) {
          this.countDown.set(this.countDown()!-1);
        } else {
          clearInterval(this.countdownInterval);
          this.countDown.set(undefined)
          this.PlayAgane.emit(true); 
        }
      }, 1000); 
    }
  }
