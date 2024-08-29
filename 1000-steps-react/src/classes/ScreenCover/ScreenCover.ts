class ScreenCover {
  element?: HTMLElement;

  setElementRef(ref: HTMLElement | null) {
    this.element = ref;
  }

  setColor(value: string) {
    if (this.element) {
      this.element.style.backgroundColor = value;
    }
  }

  setDuration(ms: number) {
    this.element.style.transitionDuration = `${ms}ms`;
  }

  async flash(color, flashcallback = null, finishcallback = null, time = 500) {
    this.setColor(color);
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
        this.setDuration(time);
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

export const screenCover = new ScreenCover();
