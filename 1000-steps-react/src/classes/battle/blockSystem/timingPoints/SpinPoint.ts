import type { Vector2D } from "../../../Vector2D";
import { TimingIndicator } from "../TimingIndicator";
import { TimingPoint } from "./TimingPoint";

export class SpinPoint extends TimingPoint {
  offset: Vector2D;
  lifetime: number;

  constructor(offset: Vector2D, activeTime: number, delayTime = 0) {
    super(offset.x, offset.y);
    this.offset = offset;
    this.timeAlive = 0;
    this.lifetime = activeTime + delayTime;
    this.delayTime = delayTime;
  }

  override update(timeDelta: number, context: CanvasRenderingContext2D) {
    this.timeAlive += timeDelta;

    if (this.timeAlive > this.delayTime) {
      if (this.timeAlive < this.lifetime) {
        var blend =
          (this.timeAlive - this.delayTime) / (this.lifetime - this.delayTime);
        var spun = this.offset.rotate(blend * 2 * Math.PI);
        var pos = TimingIndicator.current
          .getOrigin()
          .add(this.offset)
          .add(spun);
        this.x = pos.x;
        this.y = pos.y;
        this.standardDraw(context, blend);
      } else TimingIndicator.MarkDone(this);
    }
  }
}
