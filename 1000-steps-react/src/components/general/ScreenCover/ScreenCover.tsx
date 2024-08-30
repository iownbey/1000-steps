import { observer } from "@fobx/react";

class ScreenCover {
  element?: HTMLElement;
  duration: number;
  backgroundColor: string;

  setRef = (ref: HTMLElement) => {
    this.element = ref;
  };

  setColor(color: string) {
    this.backgroundColor = color;
  }

  get style() {
    return {
      backgroundColor: this.backgroundColor,
      transitionDuration: `${this.duration}ms`,
    };
  }

  async flash(
    color: string,
    flashcallback = null,
    finishcallback = null,
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
        this.element.style.opacity = `${opacity}`;
        const listener = () => {
          this.element.removeEventListener("transitionend", listener);
          resolve();
        };
        this.element.addEventListener("transitionend", listener);
      }
    });
  }
}

export const ScreenCoverComponent = observer(() => {
  return (
    <div
      className="screen-cover"
      style={screenCover.style}
      ref={screenCover.setRef}
    />
  );
});

export const screenCover = new ScreenCover();
