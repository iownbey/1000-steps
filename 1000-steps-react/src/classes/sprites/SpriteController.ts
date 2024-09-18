import { isObservable, observable, runInAction } from "@fobx/core";
import { getRandom, randomInt } from "../../Utils";
import { SpriteRenderer } from "./SpriteRenderer";

export type SpritePos = {
  x: number;
  y: number;
};

export type SpriteAnimationFrame = SpritePos & {
  time?: number;
};

export type SpriteAnimation = {
  frames: SpriteAnimationFrame[];
  defaultTime?: number;
  loop?: boolean;
};

export class SpriteController<T extends SpriteRenderer> {
  renderer: T;
  animationTimeoutHandle: ReturnType<typeof setTimeout>;

  constructor(renderer: T) {
    this.renderer = renderer;
    observable(this);
  }

  randomize(positions?: SpritePos[]) {
    if (positions) {
      this.renderer.currentSprite = getRandom(positions);
    } else {
      this.renderer.currentSprite = {
        x: randomInt(1, this.renderer.wn + 1),
        y: randomInt(1, this.renderer.hn + 1),
      };
    }
  }

  stopAnimation() {
    clearTimeout(this.animationTimeoutHandle);
  }

  animate({ frames, defaultTime, loop }: SpriteAnimation) {
    this.stopAnimation();
    const animationLoop = (i: number) => {
      var frame = frames[i];
      runInAction(() => {
        this.renderer.currentSprite = { x: frame.x, y: frame.y };
      });

      i++;
      if (i != frames.length || loop) {
        i %= frames.length;
        const timeoutMs = frame.time ?? defaultTime ?? 16.7;
        this.animationTimeoutHandle = setTimeout(() => {
          animationLoop(i);
        }, timeoutMs);
      }
    };
    animationLoop(0);
  }
}
