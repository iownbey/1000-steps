import { runInAction } from "@fobx/core";

export type GameInput = {
  key: KeyboardEvent["key"] | "lmb" | "mmb" | "rmb";
};

export class InputHandler {
  handler: (e: GameInput) => void;

  constructor(handler: (e: GameInput) => void) {
    this.handler = (e: GameInput) => {
      runInAction(() => {
        handler(e);
      });
    };

    document.addEventListener("keydown", this.onkeydown);
    document.addEventListener("mouseup", this.onmouse);
  }

  onmouse = (e: MouseEvent) => {
    switch (e.button) {
      case 0:
        this.handler({ key: "lmb" });
        break;
      case 1:
        this.handler({ key: "mmb" });
        break;
      case 2:
        this.handler({ key: "rmb" });
        break;
    }
  };

  onkeydown = (e: KeyboardEvent) => {
    if (
      e.shiftKey ||
      e.ctrlKey ||
      e.altKey ||
      e.key == "AudioVolumeUp" ||
      e.key == "AudioVolumeDown" ||
      e.key == "AudioVolumeMute"
    ) {
      return;
    }

    this.handler({ key: e.key });
  };

  dispose() {
    document.removeEventListener("keydown", this.onkeydown);
    document.removeEventListener("mouseup", this.onmouse);
  }

  static waitForInput() {
    return new Promise<GameInput>((resolve) => {
      const i = new InputHandler((e) => {
        resolve(e);
        i.dispose();
      });
    });
  }
}
