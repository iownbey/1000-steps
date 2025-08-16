import { observable, runInAction } from "@fobx/core";
import { observer } from "@fobx/react";
import "./screenCover.css";

class ScreenCover {
  element: HTMLElement | null = null;
  duration: number = 0;
  backgroundColor: string = "white";
  opacity: number = 0;

  constructor() {
    observable(this, {
      element: "observable.ref",
      render: "none",
    });
  }

  setRef = (ref: HTMLElement | null) => {
    this.element = ref;
  };

  setColor(color: string) {
    this.backgroundColor = color;
  }

  get style() {
    return {
      backgroundColor: this.backgroundColor,
      transitionDuration: `${this.duration}ms`,
      opacity: this.opacity,
    };
  }

  async flash(
    color: string,
    flashcallback?: () => void,
    finishcallback?: () => void,
    time = 500
  ) {
    this.backgroundColor = color;
    await this.fadeTo(1, time / 2);
    flashcallback?.();
    await this.fadeTo(0, time / 2);
    finishcallback?.();
  }

  async fadeTo(opacity: number, time: number) {
    return new Promise<void>((resolve, reject) => {
      if (!this.element) {
        reject();
      } else {
        this.duration = time;
        requestAnimationFrame(() => {
          runInAction(() => {
            this.opacity = opacity;
          });
        });
        const aborter = new AbortController();
        this.element.addEventListener(
          "transitionend",
          () => {
            resolve();
            aborter.abort();
          },
          { signal: aborter.signal }
        );
      }
    });
  }

  render = observer(() => {
    return (
      <div
        className="screen-cover"
        style={screenCover.style}
        ref={screenCover.setRef}
      />
    );
  });
}

export const screenCover = new ScreenCover();
