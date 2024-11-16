import { sound } from "../../../SoundManager";
import { semicircle } from "../TimingFunctionsHelpers";

export abstract class TimingPoint {
  x: number;
  y: number;
  radius = 20;
  contacting = false;
  state = 0;
  isStrong = false;
  isLure = false;
  timeAlive = 0;
  delayTime = 0;
  onFail?: () => void;
  onSuccess?: () => void;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  abstract update(timeDelta: number, ctx: CanvasRenderingContext2D): void;

  strong() {
    this.isStrong = true;
    return this;
  }

  lure() {
    this.isLure = true;
    return this;
  }

  standardDraw(context: CanvasRenderingContext2D, blend: number) {
    context.globalAlpha = 1 - semicircle(blend);

    if (this.isStrong && !player.defending) context.fillStyle = "yellow";
    else
      switch (this.state) {
        case -1:
          context.fillStyle = "#FF000033";
          break;
        case 0:
          {
            context.fillStyle = this.contacting ? "blue" : "white";
          }
          break;
        case 1:
          context.fillStyle = "#00000000";
          break;
        default:
          context.fillStyle = "orange";
          break;
      }

    if (this.isLure) {
      var cross = new Path2D(
        `M ${this.x} ${this.y} m 0 -6 l 12 -12 l 6 6 l -12 12 l 12 12 l -6 6 l -12 -12 l -12 12 l -6 -6 l 12 -12 l -12 -12 l 6 -6 z`
      );
      context.fill(cross);
    } else {
      context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
      context.fill();
    }
  }

  onenter() {}

  onexit() {
    if (!this.isLure && this.state === 0) {
      sound.playPersistant(fx.errorBlip);
      this.state = -1;
    }
  }
}
