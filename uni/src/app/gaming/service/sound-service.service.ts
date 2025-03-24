import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundServiceService {
  private click = new Audio('./sound/click.wav');
  private loopMain = new Audio('./sound/loopMain.mp3');
  private loopGame = new Audio('./sound/loopGame.mp3');
  private start = new Audio('./sound/start.mp3');
  private connected = new Audio('./sound/connected.mp3');

  private die = new Audio('./sound/die.wav');
  private animation = new Audio('./sound/animation.wav');

  private volumeS: number = 0.5;
  private volumeA: number = 0.5;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    [this.click, this.loopMain, this.connected, this.loopGame, this.start, this.die, this.animation].forEach(audio => {
      audio.volume = this.volumeS;
      audio.load();
    });
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

  playAnimationSound() {
    this.playSound(this.animation);
  }

  setVolumeEffect(vol: number) {
    this.volumeA = vol / 10;
    [this.click ,this.start, this.die, this.animation , this.connected].forEach(audio => {
      audio.volume = this.volumeA;
    });
  }

  setVolumeSong(vol: number) {
    this.volumeS = vol / 10;
    [this.loopMain, this.loopGame].forEach(audio => {
      audio.volume = this.volumeS;
    });
  }


  private playSound(audio: HTMLAudioElement) {
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
    console.log("£")
  }


}