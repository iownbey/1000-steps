import type { Vector2D } from "../../../Vector2D";
import { convertToFlip, easeInOut } from "../TimingFunctionsHelpers";
import { TimingIndicator } from "../TimingIndicator";
import { TimingPoint } from "./TimingPoint";

export class SinePoint extends TimingPoint {
  period: number;
  amplitude: number;
  phase: number;
  offset: Vector2D;
  offsetN: Vector2D;
  lifetime: number;
  /**
   * @param {Vector2D} offset - offset from the center that the point will start at
   * @param {number} phase - sinusoidal wave offset
   * @param {number} amplitude - sinusoidal wave amplitude
   * @param {number} period - sinusoidal wave period
   * @param {number} activeTime - Length of time the point will be active after the delay
   * @param {delayTime} delayTime - Length of time the point will be inactive after the TimingIndicator is activated
   */
  constructor(
    offset: Vector2D,
    phase: number,
    amplitude: number,
    period: number,
    activeTime: number,
    delayTime = 0
  ) {
    super(offset.x, offset.y);
    this.period = period;
    this.amplitude = amplitude;
    this.phase = phase;
    this.offset = offset;
    this.offsetN = offset.normalize().getNormal();
    this.timeAlive = 0;
    this.lifetime = activeTime + delayTime;
    this.delayTime = delayTime;
  }

  update(timeDelta: number, context: CanvasRenderingContext2D) {
    this.timeAlive += timeDelta;

    if (this.timeAlive > this.delayTime) {
      if (this.timeAlive < this.lifetime) {
        var blend =
          (this.timeAlive - this.delayTime) / (this.lifetime - this.delayTime);
        var movement = convertToFlip(easeInOut(blend));
        var pos = TimingIndicator.current
          .getOrigin()
          .add(this.offset.scale(movement))
          .add(
            this.offsetN.scale(
              this.amplitude *
                Math.sin(
                  (movement + this.phase) * ((2 * Math.PI) / this.period)
                )
            )
          );
        this.x = pos.x;
        this.y = pos.y;
        this.standardDraw(context, blend);
      } else TimingIndicator.MarkDone(this);
    }
  }
}
