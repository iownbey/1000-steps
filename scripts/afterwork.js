"use strict";
Controller.search({
  settings: {
    useAnalogAsDpad: "both",
  },
});

window.addEventListener("gc.controller.found", (q) => {
  notifier.show("Controller Connected");
  ControllerInput.pulse(0.333, 100);
  function forwardEvent(button, eventType) {
    var event = { cancelable: true };
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
    document.dispatchEvent(new KeyboardEvent(eventType, event));
  }
  window.addEventListener("gc.button.press", (b) => {
    console.log("pressed", b.detail.name);
    forwardEvent(b.detail, "keydown");
  });
  window.addEventListener("gc.button.release", (b) => {
    console.log("released", b.detail.name);
    forwardEvent(b.detail, "keyup");
  });
});

class ControllerInput {
  static async pulse(intensity, duration) {
    var promises = [];
    for (let id in Controller.controllers) {
      let c = Controller.controllers[id];
      if (c) {
        let gp = window.navigator.getGamepads()[c.index];
        if (gp.hapticActuators) {
          gp.hapticActuators.forEach((ha) => {
            promises.push(ha.pulse(intensity, duration));
          });
        } else if (gp.vibrationActuator) {
          promises.push(
            gp.vibrationActuator.playEffect("dual-rumble", {
              duration: duration,
              strongMagnitude: intensity,
              weakMagnitude: intensity,
            })
          );
        }
      }
    }
    await Promise.all(promises);
  }
}
var backgroundCanvas = new Granim({
  element: "#back-canvas",
  direction: "custom",
  customDirection: {
    x0: "0%",
    x1: "100%",
    y0: "100%",
    y1: "0%",
  },
  isPausedWhenNotInView: true,
  stateTransitionSpeed: 500,
  states: {
    "default-state": {
      gradients: [
        ["#000000", "#1F1F1F"],
        ["#1F1F1F", "#000000"],
      ],
    },
    "battle-state": {
      gradients: [
        ["#50cc7f", "#f5d100"],
        ["#007adf", "#00ecbc"],
        ["#20e2d7", "#f9fea5"],
        ["#00dbde", "#fc00ff"],
        ["#f9d423", "#ff4e50"],
        ["#cc208e", "#6713d2"],
        ["#4facfe", "#00f2fe"],
      ],
      transitionSpeed: 2000,
    },
  },
});

function spinGradient(timestamp) {
  const radiansPerMilliecond = 0.00005;
  let yOff = Math.sin(timestamp * radiansPerMilliecond);
  let xOff = Math.cos(timestamp * radiansPerMilliecond);
  var dir = {};
  dir.x0 = 50 + xOff * 50 + "%";
  dir.x1 = 50 - xOff * 50 + "%";
  dir.y0 = 50 + yOff * 50 + "%";
  dir.y1 = 50 - yOff * 50 + "%";
  backgroundCanvas.customDirection = dir;
  requestAnimationFrame(spinGradient);
}
requestAnimationFrame(spinGradient);

backgroundCanvas.triggerDefault = () => {
  $("#back").css("visibility", "visible");
  $("#fore").css("visibility", "visible");
  backgroundCanvas.changeState("default-state");
};
backgroundCanvas.triggerBattle = () => {
  $("#back").css("visibility", "hidden");
  $("#fore").css("visibility", "hidden");
  backgroundCanvas.changeState("battle-state");
};

// register the service worker
// Handles manual caching and allows for PWA
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

// register tsParticles.js
tsParticles.load("particles-js", {
  background: {},
  fullScreen: {
    zIndex: 9995,
  },
  fpsLimit: 30,
  particles: {
    move: {
      speed: 0.25,
      direction: "bottom",
      enable: true,
      outModes: {
        bottom: "out",
        left: "out",
        right: "out",
        top: "out",
      },
    },
    number: {
      density: {
        enable: true,
      },
      value: 10,
    },
    opacity: {
      random: {
        enable: true,
      },
      value: {
        min: 0.1,
        max: 0.5,
      },
    },
    size: {
      random: {
        enable: true,
      },
      value: {
        min: 1,
        max: 5,
      },
    },
  },
});

// register mo.js objects
let burstPool = [];
for (let i = 0; i < 5; i++) {
  burstPool.push(
    new mojs.Burst({
      left: 0,
      top: 0,
      radius: { 0: 100 },
      angle: 45,
      count: 20,
      children: {
        shape: "circle",
        radius: 10,
        scale: { 1: "0" },
        duration: 700,
        easing: "sin.out",
        fill: "blue",
      },
    })
  );
}
TimingIndicator.burstPool = new SequenceGetter(burstPool);
