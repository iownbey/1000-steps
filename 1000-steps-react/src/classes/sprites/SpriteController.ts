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
  restart?: boolean;
  onEnd?: () => void;
};

export class SpriteController<T extends SpriteRenderer> {
  renderer: T;
  animationTimeoutHandle: ReturnType<typeof setTimeout>;
  runningAnimation: SpriteAnimation | null = null;

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
    const onEnd = this.runningAnimation?.onEnd;
    this.runningAnimation = null;
    onEnd?.();
  }

  animate(anim: SpriteAnimation) {
    if (!anim.restart && anim.frames === this.runningAnimation?.frames) {
      this.runningAnimation = anim;
      return;
    }

    this.stopAnimation();
    this.runningAnimation = anim;
    const animationLoop = (i: number) => {
      const anim = this.runningAnimation;
      var frame = anim.frames[i];
      runInAction(() => {
        this.renderer.currentSprite = { x: frame.x, y: frame.y };
      });

      i++;
      if (i != anim.frames.length || anim.loop) {
        i %= anim.frames.length;
        const timeoutMs = frame.time ?? anim.defaultTime ?? 16.7;
        this.animationTimeoutHandle = setTimeout(() => {
          animationLoop(i);
        }, timeoutMs);
      } else {
        this.stopAnimation();
      }
    };
    animationLoop(0);
  }
}
