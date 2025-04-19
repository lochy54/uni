export class Background {
    private x1: number;
    private x2: number;
  
    constructor(
      private image: HTMLImageElement,
      private canvas: HTMLCanvasElement

    ) {
      this.x1 = 0;
      this.x2 = this.canvas.width;
    }
  
    update(speed : number): void {
      this.x1 -= speed;
      this.x2 -= speed;
  
      // Se un'immagine esce completamente dallo schermo, la riposiziono a destra
      if (this.x1 + this.canvas.width <= 0) {
        this.x1 = this.x2 + this.canvas.width;
      }
      if (this.x2 + this.canvas.width <= 0) {
        this.x2 = this.x1 + this.canvas.width;
      }
    }
  
    draw(): void {
      const ctx = this.canvas.getContext("2d")
      ctx!.drawImage(this.image, this.x1, 0, this.canvas.width, this.canvas.height);
      ctx!.drawImage(this.image, this.x2, 0, this.canvas.width, this.canvas.height);
    }
  }
  