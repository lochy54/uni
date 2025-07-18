import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SoundServiceService {
  private readonly click = new Audio('./sound/click.wav');
  private readonly loopMain = new Audio('./sound/loopMain.mp3');
  private readonly start = new Audio('./sound/start.mp3');
  private readonly connected = new Audio('./sound/connected.mp3');
  private readonly loopGame = new Audio('./sound/loopGame.mp3'); 
  private readonly die = new Audio('./sound/die.mp3');
  private readonly coin = new Audio('./sound/coin.mp3');
  private readonly jump = new Audio('./sound/animation.mp3');

  private  volumeS: number = 0.1;
  private  volumeA: number = 0.3;

  private readonly _volume  = new BehaviorSubject({
    volumeA : this.volumeA*10,
    volumeS : this.volumeS*10
  })
  private domReady = false;

  constructor() {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      this.domReady = true;
      this.initializeSounds();
    }
  }
  private initializeSounds() {
    [this.click, this.loopMain, this.connected, this.loopGame, this.start, this.die, this.jump,this.coin ].forEach(audio => {
      audio.volume = this.volumeS;
      audio.load();
    });
  }

  get volume(){
    return  this._volume.asObservable()
  }

  playClickSound() {
    this.playSound(this.click);
  }

  playConnSound() {
    this.playSound(this.connected);
  }


  playLoopMain() {
    this.loopMain.loop = true;
    this.loopMain.play();
  }

  playLoopGame() {
    this.loopGame.loop = true;
    this.loopGame.play();
  }

  playStartSound() {
    this.playSound(this.start);
  }

  playDieSound() {
    this.playSound(this.die);
  }

  playJumpSound() {
    this.playSound(this.jump);
  }

  playCoinSound(){
    this.playSound(this.coin)
  }


  setVolumeEffect(vol: number) {
    this.volumeA = vol / 10;
    this._volume.next({
      volumeA : vol,
      volumeS : this.volumeS * 10
    });
    [this.click ,this.start, this.die, this.jump , this.connected,this.coin].forEach(audio => {
      audio.volume = this.volumeA;
    });
  }

  setVolumeSong(vol: number) {
    this.volumeS = vol / 10;
    this._volume.next({
      volumeS : vol,
      volumeA : this.volumeA *10
    });
    [this.loopMain, this.loopGame].forEach(audio => {
      audio.volume = this.volumeS;
    });
  }


  private async playSound(audio: HTMLAudioElement) {
    if (!this.domReady) {
      await new Promise<void>(resolve => {
        document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
      });
      this.domReady = true;
      this.initializeSounds(); // Assicuriamoci che venga chiamato una sola volta
    }
  
    audio.currentTime = 0;
    audio.play();
  }
  

  stopLoopMain() {
    this.loopMain.pause();
    this.loopMain.currentTime = 0;
  }

  stopLoopGame() {
    this.loopGame.pause();
    this.loopGame.currentTime = 0;
  }


}