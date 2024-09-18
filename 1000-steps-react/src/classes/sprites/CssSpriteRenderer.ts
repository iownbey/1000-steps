import { getPercentage } from "../../Utils";
import { SpriteRenderer } from "./SpriteRenderer";

export class CssSpriteRenderer extends SpriteRenderer {
  get style() {
    return {
      backgroundImage: `url(${this.image})`,
      backgroundSize: `${this.wn * 100}% ${this.hn * 100}%`,
      backgroundPosition: `bottom ${getPercentage(
        this.currentSprite.y - 1,
        this.hn
      )}% left ${getPercentage(this.currentSprite.x, this.wn - 1)}%`,
    };
  }
}
