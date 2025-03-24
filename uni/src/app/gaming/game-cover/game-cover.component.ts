import { Component, EventEmitter, Input, Output } from '@angular/core';
import { game } from '../gaming.component';
import { SoundServiceService } from '../service/sound-service.service';

@Component({
  selector: 'app-game-cover',
  standalone: true,
  imports: [],
  templateUrl: './game-cover.component.html',
  styleUrl: './game-cover.component.scss'
})
export class GameCoverComponent {
  @Input({required:true})game!: game;
  @Output() selected : EventEmitter<number> = new EventEmitter
  constructor(public soundService : SoundServiceService){}
}
