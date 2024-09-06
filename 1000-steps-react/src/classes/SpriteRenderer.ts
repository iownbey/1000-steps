import { observable } from "@fobx/core";
import { getPercentage, getRandom, randomInt } from "./Utils";

export type SpritePos = {
  x: number;
  y: number;
};

export type SpriteAnimationFrame = SpritePos & {
  time?: number;
};

class SpriteRenderer {
  imageDimensions = { width: 0, height: 0 };
  image: string;
  cellWidth: number;
  cellHeight: number;
  currentSprite: SpritePos = { x: 0, y: 0 };

  constructor(image: string, cellWidth: number, cellHeight: number) {
    this.image = image;
    this.cellHeight = cellHeight;
    this.cellWidth = cellWidth;
    observable(this);

    const img = new Image();
    img.onload = () => {
      this.imageDimensions = {
        width: img.width,
        height: img.height,
      };
    };
    img.src = image;
  }

  get wn() {
    return this.imageDimensions.width / this.cellWidth;
  }

  get hn() {
    return this.imageDimensions.height / this.cellHeight;
  }

  get style() {
    return {
      backgroundImage: `url(${this.image})`,
      backgroundSize: `${this.wn * 100}%`,
      backgroundPosition: `bottom ${getPercentage(
        this.currentSprite.y,
        this.hn
      )}% left ${getPercentage(this.currentSprite.x, this.wn)}%`,
    };
  }

  randomize(positions?: { x: number; y: number }[]) {
    if (positions) {
      this.currentSprite = getRandom(positions);
    } else {
      this.currentSprite = {
        x: randomInt(1, this.wn + 1),
        y: randomInt(1, this.hn + 1),
      };
    }
  }

  animate({
    frames,
    defaultTime,
    loop,
  }: {
    frames: SpriteAnimationFrame[];
    defaultTime?: number;
    loop?: boolean;
  }) {
    const animationLoop = (i) => {
      var frame = frames[i];
      this.currentSprite = { x: frame.x, y: frame.y };

      i++;
      if (i != frames.length || loop) {
        i %= frames.length;
        const timeoutMs = frame.time ?? defaultTime ?? 16.7;
        setTimeout(() => {
          animationLoop(i);
        }, timeoutMs);
      }
    };
    animationLoop(0);
  }
}
