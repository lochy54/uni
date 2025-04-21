

interface frame {
  image: HTMLImageElement,
  width: number,
  height: number,
  frameIndex: number,
  totalFrames: number
}

export class Sprite {

  private frameTimer: number = 0;
  private resetx!: number;
  private resety!: number;
  private frameSpeed: number = 50;
  private frames! : frame[];
  private _currentFrame = 0
  constructor(
    private canvas: HTMLCanvasElement,
    private type : "circle" | "rect",
    private x : number,
    private y : number,
    ...frames : frame[]

  ) {
    this.frames = frames
    this.resetx = x;
    this.resety = y;
  }

  getV(){
    const f = this.frames[this._currentFrame]
    return {
      w : this.canvas.width / 10,
      h : (f.height * this.canvas.width) / (10 * f.width)
    }
  }

  update(deltaTime: number, vx: number, vy: number): void {
    this.x += vx;
    this.y += vy;
    if (deltaTime - this.frameTimer >= this.frameSpeed) {
      this.frames.forEach(f => {
        f.frameIndex = (f.frameIndex + 1) % f.totalFrames;
      });
      this.frameTimer = deltaTime;
    }    
  }
  set currentFrame(pos : number){
    if(this.frames[pos]){
      this._currentFrame = pos
    }
  }

  draw(): void {
    const f = this.frames[this._currentFrame]
    const tv = this.getV()
    const sx =  f.frameIndex* f.width;
    const ctx = this.canvas.getContext('2d');
    ctx!.drawImage(
      f.image,
      sx,
      0,
      f.width,
      f.height, 
      this.x,
      this.y,
      tv.w,
      tv.h
    );
  }

  collisionCheck(other: Sprite): boolean {
    const combo = `${this.type}-${other.type}`;
    const margin = this.canvas.width/100;
    const f = this.frames[this._currentFrame]
    const tv = this.getV()
    const otv = other.getV()
    switch (combo) {
      case 'rect-rect': {
        return !(
          this.x + tv.w - margin <= other.x + margin ||
          this.x + margin >= other.x + otv.w - margin ||
          this.y + tv.h - margin <= other.y + margin ||
          this.y + margin >= other.y + otv.h - margin
        );
      }
  
      case 'circle-circle': {
        const thisCx = this.x + tv.w / 2;
        const thisCy = this.y + tv.h / 2;
        const otherCx = other.x + otv.w / 2;
        const otherCy = other.y + otv.h / 2;
  
        const dx = thisCx - otherCx;
        const dy = thisCy - otherCy;
        const distance = Math.sqrt(dx * dx + dy * dy);
  
        const thisRadius = tv.w / 2 - margin;
        const otherRadius = otv.w / 2 - margin;
  
        return distance < thisRadius + otherRadius;
      }
  
      case 'circle-rect':
      case 'rect-circle': {
        const circle = this.type === 'circle' ? this : other;
        const rect = this.type === 'rect' ? this : other;
        const ctv = circle.getV()
        const rtv = rect.getV()
        const cx = circle.x + ctv.w / 2;
        const cy = circle.y + ctv.h / 2;
        const radius = ctv.w / 2 - margin;
  
        const closestX = Math.max(rect.x, Math.min(cx, rect.x + rtv.w));
        const closestY = Math.max(rect.y, Math.min(cy, rect.y + rtv.h));
  
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
    const tv = this.getV()
    return (
      this.x < 0 ||
      this.x + tv.w > this.canvas.width ||
      this.y < 0 ||
      this.y + tv.h > this.canvas.height
    );
  }


  get getPos() {
    return {
      x: this.x,
      y: this.y,
    };
  }
}
