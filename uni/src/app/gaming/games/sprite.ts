export class Sprite {
  private frameIndex: number = 0;
  private frameIndexSecond: number = 0;

  private frameTimer: number = 0;
  private resetx!: number;
  private resety!: number;
  private frameSpeed: number = 50;
  private w: number;
  private h: number;
  constructor(
    private image: HTMLImageElement,
    private x: number,
    private y: number,
    private width: number,
    private height: number,
    private totalFrames: number,
    private canvas: HTMLCanvasElement,
    private type : "circle" | "rect",
    private second ? :HTMLImageElement,
    private totalFramesSecond?: number,

  ) {
    this.w = canvas.width / 10;
    this.h = (this.height * canvas.width) / (10 * this.width);
    this.resetx = x;
    this.resety = y;
  }

  update(deltaTime: number, vx: number, vy: number): void {
    this.x += vx;
    this.y += vy;
    if (deltaTime - this.frameTimer >= this.frameSpeed) {
      this.frameIndex = (this.frameIndex + 1) % this.totalFrames;
      if(this.second && this.totalFramesSecond){
      this.frameIndexSecond = (this.frameIndexSecond + 1) % this.totalFramesSecond;
      }
      this.frameTimer = deltaTime;
    }
  }

  draw(second=false): void {
    if(!this.second || !this.totalFramesSecond){
      second = false
    }

    const sx = (second ? this.frameIndexSecond : this.frameIndex )* this.width;
    const ctx = this.canvas.getContext('2d');
    ctx!.drawImage(
      second ? this.second! : this.image,
      sx,
      0,
      this.width,
      this.height, // Source
      this.x,
      this.y,
      this.w,
      this.h // Destination
    );
  }

  collisionCheck(other: Sprite): boolean {
    const combo = `${this.type}-${other.type}`;
    const margin = this.canvas.width/100;
  
    switch (combo) {
      case 'rect-rect': {
        return !(
          this.x + this.w - margin <= other.x + margin ||
          this.x + margin >= other.x + other.w - margin ||
          this.y + this.h - margin <= other.y + margin ||
          this.y + margin >= other.y + other.h - margin
        );
      }
  
      case 'circle-circle': {
        const thisCx = this.x + this.w / 2;
        const thisCy = this.y + this.h / 2;
        const otherCx = other.x + other.w / 2;
        const otherCy = other.y + other.h / 2;
  
        const dx = thisCx - otherCx;
        const dy = thisCy - otherCy;
        const distance = Math.sqrt(dx * dx + dy * dy);
  
        const thisRadius = this.w / 2 - margin;
        const otherRadius = other.w / 2 - margin;
  
        return distance < thisRadius + otherRadius;
      }
  
      case 'circle-rect':
      case 'rect-circle': {
        const circle = this.type === 'circle' ? this : other;
        const rect = this.type === 'rect' ? this : other;
  
        const cx = circle.x + circle.w / 2;
        const cy = circle.y + circle.h / 2;
        const radius = circle.w / 2 - margin;
  
        const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
        const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  
        const dx = cx - closestX;
        const dy = cy - closestY;
  
        return (dx * dx + dy * dy) < (radius * radius);
      }
  
      default:
        console.warn(`Unsupported type combination: ${combo}`);
        return false;
    }
  }
  
  
  reset() {
    this.frameTimer = 0;
    this.x = this.resetx;
    this.y = this.resety;
  }

  isOutOfCanvas(): boolean {
    return (
      this.x < 0 ||
      this.x + this.w > this.canvas.width ||
      this.y < 0 ||
      this.y + this.h > this.canvas.height
    );
  }

  get wi(){
    return this.w
  }

  get getPos() {
    return {
      x: this.x,
      y: this.y,
    };
  }
}
