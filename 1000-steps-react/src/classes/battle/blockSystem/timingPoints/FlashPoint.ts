import { Vector2D } from "../../../Vector2D";
import { TimingIndicator } from "../TimingIndicator";
import { TimingPoint } from "./TimingPoint";

export class FlashPoint extends TimingPoint {
  offset: Vector2D;
  lifetime: number;

  constructor(x: number, y: number, activeTime: number, delayTime = 0) {
    super(x, y);

    this.offset = new Vector2D(x, y);

    this.timeAlive = 0;
    this.lifetime = activeTime + delayTime;
    this.delayTime = delayTime;
  }

  update(timeDelta: number, context: CanvasRenderingContext2D) {
    this.timeAlive += timeDelta;

    if (this.timeAlive > this.delayTime) {
      if (this.timeAlive < this.lifetime) {
        var pos = TimingIndicator.current.getOrigin().add(this.offset);
        this.x = pos.x;
        this.y = pos.y;
        this.standardDraw(context, 0.5);
      } else TimingIndicator.MarkDone(this);
    }
  }
}
