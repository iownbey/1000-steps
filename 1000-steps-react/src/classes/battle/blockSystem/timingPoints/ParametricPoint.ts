import { Vector2D } from "../../../Vector2D";
import type { EasingFunction } from "../TimingFunctionsHelpers";
import { TimingIndicator } from "../TimingIndicator";
import { TimingPoint } from "./TimingPoint";

export class ParametricPoint extends TimingPoint {
  xFunc: EasingFunction;
  yFunc: EasingFunction;
  lifetime: number;

  constructor(
    xFunc: EasingFunction,
    yFunc: EasingFunction,
    activeTime: number,
    delayTime = 0
  ) {
    super(xFunc(0), yFunc(0));
    this.xFunc = xFunc;
    this.yFunc = yFunc;

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
        var pos = TimingIndicator.current
          .getOrigin()
          .add(new Vector2D(this.xFunc(blend), this.yFunc(blend)));
        this.x = pos.x;
        this.y = pos.y;
        this.standardDraw(context, blend);
      } else TimingIndicator.MarkDone(this);
    }
  }
}
