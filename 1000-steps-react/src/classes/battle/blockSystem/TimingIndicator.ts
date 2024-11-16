import type { KeyboardEvent } from "react";
import { Vector2D } from "../../Vector2D";
import type { TimingPoint } from "./timingPoints/TimingPoint";
import { SequenceGetter } from "../../SequenceGetter";
import { sound } from "../../SoundManager";

const burstPool = new SequenceGetter(
  (() => {
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
        } as any)
      );
    }
    return burstPool;
  })()
);

export class TimingIndicator {
  canvas;
  ctx;
  renderFlag;
  timestamp?: DOMHighResTimeStamp;
  #onstop?: () => void;
  pressedKeys = new Map<string, number>();
  origin;
  originOffset = new Vector2D(0, 0);
  displayRadius = 30;
  logicalRadius = 50;
  originOffsetSpeedPerSecond = 200;
  points: TimingPoint[] = [];

  abortController?: AbortController;

  unlockedMovement = true;

  static current: TimingIndicator;

  constructor(canvas: HTMLCanvasElement) {
    TimingIndicator.current = this;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.renderFlag = true;
    this.origin = new Vector2D(this.canvas.width / 2, this.canvas.height / 2);

    this.start();
  }

  isKeyPressed(key: string) {
    return this.pressedKeys.get(key) ?? 0 > 0;
  }

  getPromise() {
    return new Promise<void>((resolve) => {
      this.#onstop = resolve;
    });
  }

  start() {
    this.renderFlag = true;
    this.timestamp = performance.now();
    this.abortController?.abort();
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    requestAnimationFrame((t) => this.renderLoop(t));

    document.addEventListener(
      "keydown",
      (e) => {
        this.pressedKeys.set(e.key, (this.pressedKeys.get(e.key) ?? 0) + 1);
        this.press(e);
      },
      { signal }
    );
    document.addEventListener(
      "mousedown",
      (e) => {
        this.press(e);
      },
      { signal }
    );
    document.addEventListener(
      "keyup",
      (e) => {
        this.pressedKeys.set(
          e.key,
          Math.max((this.pressedKeys.get(e.key) ?? 0) - 1, 0)
        );
      },
      { signal }
    );
  }

  stop() {
    console.log("stopping");
    this.points = [];
    this.renderFlag = false;
    this.abortController?.abort();
    delete this.abortController;
    this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.#onstop?.();
  }

  renderLoop(timestamp: DOMHighResTimeStamp) {
    if (!this.timestamp) {
      return;
    }
    var delta = (timestamp - this.timestamp) / 1000;
    this.timestamp = timestamp;
    //Update
    if (this.points.length > 0) {
      this.checkAndUpdateCanvasSize();
      if (this.unlockedMovement) this.handleOriginOffset(delta);
      this.refreshCanvas();

      //update points
      for (let point of this.points) this.updatePoint(point, delta);

      this.render(this.ctx);
    } else {
      //stop automatically when the canvas is empty
      this.stop();
    }

    if (this.renderFlag) {
      requestAnimationFrame((t) => {
        this.renderLoop(t);
      });
    }
  }

  render(context: CanvasRenderingContext2D | null) {
    if (!context) {
      return;
    }
    var center = this.origin.add(this.originOffset);
    context.globalAlpha = 1;
    context.beginPath();
    context.arc(center.x, center.y, this.displayRadius, 0, 2 * Math.PI, false);
    context.lineWidth = 2;
    context.strokeStyle = "#ffffff";
    context.stroke();
  }

  handleOriginOffset(delta: number) {
    var horizontal = 0;
    var vertical = 0;

    if (this.isKeyPressed("ArrowLeft") || this.isKeyPressed("a"))
      horizontal = -1;
    if (this.isKeyPressed("ArrowRight") || this.isKeyPressed("d"))
      horizontal = 1;

    if (this.isKeyPressed("ArrowDown") || this.isKeyPressed("s")) vertical = 1;
    if (this.isKeyPressed("ArrowUp") || this.isKeyPressed("w")) vertical = -1;

    this.originOffset = this.originOffset.add(
      new Vector2D(horizontal, vertical)
        .scale(this.originOffsetSpeedPerSecond)
        .scale(delta)
    );
  }

  checkAndUpdateCanvasSize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    if (this.canvas.width != width || this.canvas.height != height) {
      this.canvas.width = width;
      this.canvas.height = height;
      //recalculate center
      this.origin = new Vector2D(width / 2, height / 2);
    }
  }

  refreshCanvas() {
    if (!this.ctx) {
      return;
    }
    //clear for drawing
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    //Darken background
    this.ctx.fillStyle = "#00000055";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  updatePoint(point: TimingPoint, delta: number) {
    var center = this.origin.add(this.originOffset);
    var distSqr = (point.x - center.x) ** 2 + (point.y - center.y) ** 2;
    //update collisions
    if ((this.logicalRadius + point.radius) ** 2 < distSqr) {
      //too far away
      if (point.contacting === true) {
        point.contacting = false;
        point.onexit();
      }
    } else {
      if (point.contacting === false) {
        point.contacting = true;
        point.onenter();
      }
    }
    if (this.ctx) {
      this.ctx.globalAlpha = 1;
      point.update(delta, this.ctx);
    }
  }

  press(e: globalThis.KeyboardEvent | MouseEvent) {
    //abort if there are no timing points
    if (this.points.length == 0) return;

    //validate input
    if (
      !((e as globalThis.KeyboardEvent).key === " " || e.type === "mousedown")
    )
      return;

    this.triggerBlock();
  }

  handlePointFinish(point: TimingPoint) {
    let burst = burstPool.get();

    if (point.contacting === false) {
      if (!point.isLure) {
        //too far away
        point.state = -1;
        point.onFail?.();
        sound.playPersistant(fx.errorBlip);

        // mo.js
        burst.tune({ x: point.x, y: point.y, children: { fill: "red" } });
        burst.replay();
      }
    } else {
      //in range!
      if (point.isLure) {
        point.state = -1;
        point.onFail?.();
        sound.playPersistant(fx.errorBlip);

        // mo.js
        burst.tune({ x: point.x, y: point.y, children: { fill: "red" } });
        burst.replay();
      } else {
        point.state = 1;
        point.onSuccess?.();
        sound.playPersistant(fx.attack);

        // mo.js
        burst.tune({
          x: point.x,
          y: point.y,
          children: { fill: "blue" },
        });
        burst.replay();
      }
    }
  }

  triggerBlock() {
    //Check for collisions

    //the closest TimingPoint
    var closest = null;
    //It's distance, squared
    var closestSqrDist = this.logicalRadius ** 2 * 2;
    var center = this.origin;
    for (let renderer of this.points) {
      //Only block hits that are strong if the player is defending
      if (
        renderer.timeAlive > renderer.delayTime &&
        renderer.state === 0 &&
        (!renderer.isStrong || player.defending)
      ) {
        var distSqr =
          (renderer.x - center.x) ** 2 + (renderer.y - center.y) ** 2;
        if (distSqr < closestSqrDist) {
          closest = renderer;
          closestSqrDist = distSqr;
        }
      }
    }

    if (closest) {
      this.handlePointFinish(closest);
    }
  }

  static MarkDone(point: TimingPoint) {
    var i = TimingIndicator.current.points.indexOf(point);
    if (i > -1) {
      TimingIndicator.current.points.splice(i, 1);
    }
  }

  getOrigin() {
    return this.origin;
  }
}
