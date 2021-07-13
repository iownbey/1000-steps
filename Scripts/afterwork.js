"use strict";
Controller.search({
    settings: {
        useAnalogAsDpad: "both"
    }
});

window.addEventListener("gc.controller.found", (q) => {
    notifier.show("Controller Connected");
    ControllerInput.pulse(0.333, 100);
    window.addEventListener("gc.button.press", (b) => {
        console.log("pressed", b.detail.name);
        if (b.detail.pressed) {
            var event = { cancelable: true };
            switch (b.detail.name) {
                case "DPAD_UP": event.key = "w"; break;
                case "DPAD_LEFT": event.key = "a"; break;
                case "DPAD_DOWN": event.key = "s"; break;
                case "DPAD_RIGHT": event.key = "d"; break;
                case "FACE_2": event.key = " "; break; // a
                case "FACE_1": event.key = "Backspace"; break; // b
                case "FACE_3": //y
                case "FACE_4": event.key = " "; break; //x
                case "MISCBUTTON_1": toggleFullscreen(); break;
                case "HOME":
                    {
                        event.key = "S";
                        event.shiftKey = true;
                    }
            }
            document.dispatchEvent(new KeyboardEvent("keydown", event));
        }
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
                    gp.hapticActuators.forEach(ha => {
                        promises.push(ha.pulse(intensity, duration));
                    });
                }
                else if (gp.vibrationActuator)
                {
                    promises.push(gp.vibrationActuator.playEffect("dual-rumble",{
                        duration: duration,
                        strongMagnitude: intensity,
                        weakMagnitude: intensity,
                    }));
                }
            }
        }
        await Promise.all(promises);
    }
}
var backgroundCanvas = new Granim({
    element: '#back-canvas',
    direction: 'custom',
    customDirection: {
        x0: "0%",   x1: "100%",
        y0: "100%", y1: "0%"
    },
    isPausedWhenNotInView: true,
    stateTransitionSpeed: 500,
    states : {
        "default-state": {
            gradients: [
                ['#000000', '#1F1F1F'],
                ['#1F1F1F', '#000000'],
            ]
        },
        "battle-state": {
            gradients: [
                ["#fe86ff","#1905d9"],
                ["#34fd50","#be0457"],
                ["#fe3218","#e100f5"],
                ["#387dfc","#d5014c"],
                ["#06f984","#ff00f9"],
                ["#b4dafc","#7f51fd"]
            ],
            transitionSpeed: 500
        }
    }
});

function spinGradient(timestamp)
{
    const radiansPerMilliecond = 0.00005;
    let yOff = Math.sin(timestamp * radiansPerMilliecond);
    let xOff = Math.cos(timestamp * radiansPerMilliecond);
    var dir = {};
    dir.x0 = (50 + xOff * 50) + "%";
    dir.x1 = (50 - xOff * 50) + "%";
    dir.y0 = (50 + yOff * 50) + "%";
    dir.y1 = (50 - yOff * 50) + "%";
    backgroundCanvas.customDirection = dir;
    requestAnimationFrame(spinGradient);
}
requestAnimationFrame(spinGradient);

backgroundCanvas.triggerDefault = () => {
    $("#back").css("visibility","visible");
    $("#fore").css("visibility","visible");
    backgroundCanvas.changeState("default-state")
};
backgroundCanvas.triggerBattle  = () => {
    $("#back").css("visibility","hidden");
    $("#fore").css("visibility","hidden");
    backgroundCanvas.changeState("battle-state")
};