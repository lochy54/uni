import { Component, OnInit, ElementRef, ViewChild, HostListener, signal, Input } from '@angular/core';

@Component({
  selector: 'app-flappy',
  standalone: true,
  imports: [],
  templateUrl: './flappy.component.html',
  styleUrls: ['./flappy.component.scss']
})
export class FlappyComponent  {
  @ViewChild('gameCanvas') canvasRef: ElementRef | undefined;
  private ctx: CanvasRenderingContext2D | undefined;

  score = signal<number>(0)
  isGameOver = signal<boolean>(false)

  startGame() {


  }
}
