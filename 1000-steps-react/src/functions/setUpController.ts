import { KeyboardEvent } from "react";
import { Controller } from "../libraries/Controller";
import { toggleFullscreen } from "../Utils";

export function setUpController() {
  Controller.search({
    settings: {
      useAnalogAsDpad: "both",
    },
  });

  window.addEventListener("gc.controller.found", (q) => {
    //notifier.show("Controller Connected");
    pulses(
      { strong: 0.7, weak: 0, duration: 200 },
      { strong: 1, weak: 0.1, duration: 50 }
    );
    function forwardEvent(button, eventType) {
      var event = { cancelable: true } as KeyboardEventInit;
      switch (button.name) {
        case "DPAD_UP":
          event.key = "w";
          break;
        case "DPAD_LEFT":
          event.key = "a";
          break;
        case "DPAD_DOWN":
          event.key = "s";
          break;
        case "DPAD_RIGHT":
          event.key = "d";
          break;
        case "FACE_2":
          event.key = " ";
          break; // a
        case "FACE_1":
          event.key = "Backspace";
          break; // b
        case "FACE_3": //y
        case "FACE_4":
          event.key = " ";
          break; //x
        case "MISCBUTTON_1":
          toggleFullscreen();
          break;
        case "HOME": {
          event.key = "S";
          event.shiftKey = true;
        }
      }
      document.dispatchEvent(new window.KeyboardEvent(eventType, event));
    }
    window.addEventListener("gc.button.press", (b: any) => {
      console.log("pressed", b.detail.name);
      forwardEvent(b.detail, "keydown");
    });
    window.addEventListener("gc.button.release", (b: any) => {
      console.log("released", b.detail.name);
      forwardEvent(b.detail, "keyup");
    });
  });
}

export type Pulse = {
  strong?: number;
  weak?: number;
  duration: number;
};

export async function pulse(pulse: Pulse) {
  var promises = [];
  for (let id in (Controller as any).controllers) {
    let c = (Controller as any).controllers[id];
    if (c) {
      let gp = window.navigator.getGamepads()[c.index];
      if (gp.vibrationActuator) {
        promises.push(
          gp.vibrationActuator.playEffect("dual-rumble", {
            duration: pulse.duration,
            strongMagnitude: pulse.strong,
            weakMagnitude: pulse.weak,
          })
        );
      }
    }
  }
  await Promise.all(promises);
}

export async function pulses(...pulses: Pulse[]) {
  for (const p of pulses) {
    await pulse(p);
  }
}
