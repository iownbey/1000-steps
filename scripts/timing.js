class TimingFunctions {
  static easeInOut(t) {
    return t * t * (3.0 - 2.0 * t);
  }

  static convertToFlip(t) {
    return 2 * t - 1;
  }

  static semicircle(t) {
    t = TimingFunctions.convertToFlip(t);
    return Math.sqrt(t * t);
  }

  static linear(t) {
    return t;
  }

  static inverseLinear(t) {
    return 1 - t;
  }

  static cosBlend(t) {
    return (Math.cos(t * Math.PI) + 1) / 2;
  }
}

class TimingIndicator {
  #canvas;
  #ctx;
  #renderFlag;
  #d;
  #timestamp;
  #onstop;
  #pressedKeys;
  #origin;

  static current;
  static burstPool;

  constructor(canvas) {
    console.log("Init timing");
    TimingIndicator.current = this;
    this.displayRadius = 30;
    this.logicalRadius = 50;
    this.#canvas = canvas;
    this.#ctx = canvas.getContext("2d");
    this.points = [];
    this.#renderFlag = true;
    this.#d = $(document);
    this.#onstop = () => {};
    this.#origin = new Vector2D(
      this.#canvas.width / 2,
      this.#canvas.height / 2
    );

    this.originOffset = new Vector2D(0, 0);
    this.originOffsetSpeedPerSecond = 200;
    this.#pressedKeys = {};

    this.start();
  }

  #isPressed(key) {
    return this.#pressedKeys.hasOwnProperty(key)
      ? this.#pressedKeys[key] > 0
      : false;
  }

  getPromise() {
    var _this = this;
    return new Promise((resolve) => {
      _this.#onstop = resolve;
    });
  }

  start() {
    this.#renderFlag = true;
    var _this = this;
    this.#timestamp = performance.now();
    requestAnimationFrame((t) => {
      _this.#renderLoop(t);
    });

    this.#d.on("keydown.timingIndicator", (e) => {
      if (!e.repeat) {
        if (!_this.#pressedKeys.hasOwnProperty(e.key))
          _this.#pressedKeys[e.key] = 1;
        else _this.#pressedKeys[e.key]++;
      }

      _this.press(e);
    });
    this.#d.on("mousedown.timingIndicator", (e) => {
      _this.press(e);
    });
    this.#d.on("keyup.timingIndicator", (e) => {
      if (!_this.#pressedKeys.hasOwnProperty(e.key))
        _this.#pressedKeys[e.key] = 0;
      else _this.#pressedKeys[e.key]--;
    });
  }

  stop() {
    console.log("stopping");
    this.points = [];
    this.#renderFlag = false;
    this.#d.off(".timingIndicator");
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    this.#onstop();
  }

  #render(context) {
    var center = this.#origin.add(this.originOffset);
    context.globalAlpha = 1;
    context.beginPath();
    context.arc(center.x, center.y, this.displayRadius, 0, 2 * Math.PI, false);
    context.lineWidth = 2;
    context.strokeStyle = "#ffffff";
    context.stroke();
  }

  #handleOrigin(delta) {
    var horizontal = 0;
    var vertical = 0;

    if (this.#isPressed("ArrowLeft") || this.#isPressed("a")) horizontal = -1;
    if (this.#isPressed("ArrowRight") || this.#isPressed("d")) horizontal = 1;

    if (this.#isPressed("ArrowDown") || this.#isPressed("s")) vertical = 1;
    if (this.#isPressed("ArrowUp") || this.#isPressed("w")) vertical = -1;

    this.originOffset = this.originOffset.add(
      new Vector2D(horizontal, vertical)
        .scale(this.originOffsetSpeedPerSecond)
        .scale(delta)
    );
  }

  #checkAndUpdateCanvasSize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    if (this.#canvas.width != width || this.#canvas.height != height) {
      this.#canvas.width = width;
      this.#canvas.height = height;
      //recalculate center
      this.#origin = new Vector2D(width / 2, height / 2);
    }
  }

  #refreshCanvas() {
    //clear for drawing
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    //Darken background
    this.#ctx.fillStyle = "#00000055";
    this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
  }

  #updatePoint(point, delta) {
    var center = this.#origin.add(this.originOffset);
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
    this.#ctx.globalAlpha = 1;
    point.update(delta, this.#ctx);
  }

  #renderLoop(timestamp) {
    var delta = (timestamp - this.#timestamp) / 1000;
    this.#timestamp = timestamp;
    //Update
    if (this.points.length > 0) {
      this.#checkAndUpdateCanvasSize();
      this.#handleOrigin(delta);
      this.#refreshCanvas();

      //update points
      for (let point of this.points) this.#updatePoint(point, delta);

      this.#render(this.#ctx);
    } else {
      //stop automatically when the canvas is empty
      this.stop();
    }

    if (this.#renderFlag) {
      var _this = this;
      requestAnimationFrame((t) => {
        _this.#renderLoop(t);
      });
    }
  }

  press(e) {
    //abort if there are no timing points
    if (this.points.length == 0) return;

    //validate input
    if (!(e.key === " " || e.type === "mousedown")) return;

    this.#triggerBlock();
  }

  #handlePointFinish(point) {
    let burst = TimingIndicator.burstPool.get();

    if (point.contacting === false) {
      if (!point.isLure) {
        //too far away
        point.state = -1;
        point.onfail();
        sound.playPersistant(fx.errorBlip);

        // mo.js
        burst.tune({ x: point.x, y: point.y, children: { fill: "red" } });
        burst.replay();
      }
    } else {
      //in range!
      if (point.isLure) {
        point.state = -1;
        point.onfail();
        sound.playPersistant(fx.errorBlip);

        // mo.js
        burst.tune({ x: point.x, y: point.y, children: { fill: "red" } });
        burst.replay();
      } else {
        point.state = 1;
        point.onsuccess();
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

  #triggerBlock() {
    //Check for collisions

    //the closest TimingPoint
    var closest = null;
    //It's distance, squared
    var closestSqrDist = this.logicalRadius ** 2 * 2;
    var center = this.#origin;
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
      this.#handlePointFinish(closest);
    }
  }

  static MarkDone(point) {
    var i = TimingIndicator.current.points.indexOf(point);
    if (i > -1) {
      TimingIndicator.current.points.splice(i, 1);
    }
  }

  getOrigin() {
    return this.#origin;
  }
}

class TimingPoint {
  constructor(x, y) {
    this.radius = 20;
    this.x = x;
    this.y = y;
    this.contacting = false;
    this.state = 0;
    this.isStrong = false;
    this.isLure = false;
    this.onsuccess = () => {};
    this.onfail = () => {};
  }

  update(timeDelta, ctx) {}

  strong() {
    this.isStrong = true;
    return this;
  }

  lure() {
    this.isLure = true;
    return this;
  }

  standardDraw(context, blend) {
    context.globalAlpha = 1 - TimingFunctions.semicircle(blend);

    if (this.isStrong && !player.defending) context.fillStyle = "yellow";
    else
      switch (this.state) {
        case -1:
          context.fillStyle = "#FF000033";
          break;
        case 0:
          {
            context.fillStyle = this.contacting ? "blue" : "white";
          }
          break;
        case 1:
          context.fillStyle = "#00000000";
          break;
        default:
          context.fillStyle = "orange";
          break;
      }

    if (this.isLure) {
      var cross = new Path2D(
        `M ${this.x} ${this.y} m 0 -6 l 12 -12 l 6 6 l -12 12 l 12 12 l -6 6 l -12 -12 l -12 12 l -6 -6 l 12 -12 l -12 -12 l 6 -6 z`
      );
      context.fill(cross);
    } else {
      context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
      context.fill();
    }
  }

  onenter() {}

  onexit() {
    if (!this.isLure && this.state === 0) {
      sound.playPersistant(fx.errorBlip);
      this.state = -1;
    }
  }
}

class EaseInOutPoint extends TimingPoint {
  constructor(offset, activeTime, delayTime = 0) {
    super(offset.x, offset.y);
    this.offset = offset;
    this.timeAlive = 0;
    this.lifetime = activeTime + delayTime;
    this.delayTime = delayTime;
  }

  update(timeDelta, context) {
    this.timeAlive += timeDelta;

    if (this.timeAlive > this.delayTime) {
      if (this.timeAlive < this.lifetime) {
        var blend =
          (this.timeAlive - this.delayTime) / (this.lifetime - this.delayTime);
        var pos = TimingIndicator.current
          .getOrigin()
          .add(this.offset.scale(TimingFunctions.convertToFlip(blend)));
        this.x = pos.x;
        this.y = pos.y;
        this.standardDraw(context, blend);
      } else TimingIndicator.MarkDone(this);
    }
  }
}

class SpinPoint extends TimingPoint {
  constructor(offset, activeTime, delayTime = 0) {
    super(offset.x, offset.y);
    this.offset = offset;
    this.timeAlive = 0;
    this.lifetime = activeTime + delayTime;
    this.delayTime = delayTime;
  }

  update(timeDelta, context) {
    this.timeAlive += timeDelta;

    if (this.timeAlive > this.delayTime) {
      if (this.timeAlive < this.lifetime) {
        var blend =
          (this.timeAlive - this.delayTime) / (this.lifetime - this.delayTime);
        var spun = this.offset.rotate(blend * 2 * Math.PI);
        var pos = TimingIndicator.current
          .getOrigin()
          .add(this.offset)
          .add(spun);
        this.x = pos.x;
        this.y = pos.y;
        this.standardDraw(context, blend);
      } else TimingIndicator.MarkDone(this);
    }
  }
}

class ParametricPoint extends TimingPoint {
  /**
   * @typedef {(time: number) => number} easingFunction
   * @param {easingFunction} xfunc - Easing for x
   * @param {easingFunction} yfunc - Easing for y
   * @param {number} activeTime - Length of time the point will be active after the delay
   * @param {delayTime} delayTime - Length of time the point will be inactive after the TimingIndicator is activated
   */
  constructor(xfunc, yfunc, activeTime, delayTime = 0) {
    super(xfunc(0), yfunc(0));
    this.xfunc = xfunc;
    this.yfunc = yfunc;

    this.timeAlive = 0;
    this.lifetime = activeTime + delayTime;
    this.delayTime = delayTime;
  }

  update(timeDelta, context) {
    this.timeAlive += timeDelta;

    if (this.timeAlive > this.delayTime) {
      if (this.timeAlive < this.lifetime) {
        var blend =
          (this.timeAlive - this.delayTime) / (this.lifetime - this.delayTime);
        var pos = TimingIndicator.current
          .getOrigin()
          .add(new Vector2D(this.xfunc(blend), this.yfunc(blend)));
        this.x = pos.x;
        this.y = pos.y;
        this.standardDraw(context, blend);
      } else TimingIndicator.MarkDone(this);
    }
  }
}

class SinePoint extends TimingPoint {
  /**
   * @param {Vector2D} offset - offset from the center that the point will start at
   * @param {number} phase - sinusoidal wave offset
   * @param {number} amplitude - sinusoidal wave amplitude
   * @param {number} period - sinusoidal wave period
   * @param {number} activeTime - Length of time the point will be active after the delay
   * @param {delayTime} delayTime - Length of time the point will be inactive after the TimingIndicator is activated
   */
  constructor(offset, phase, amplitude, period, activeTime, delayTime = 0) {
    super(offset.x, offset.y);
    this.period = period;
    this.amplitude = amplitude;
    this.phase = phase;
    this.offset = offset;
    this.offsetN = offset.normalize().getNormal();
    this.timeAlive = 0;
    this.lifetime = activeTime + delayTime;
    this.delayTime = delayTime;
  }

  update(timeDelta, context) {
    this.timeAlive += timeDelta;

    if (this.timeAlive > this.delayTime) {
      if (this.timeAlive < this.lifetime) {
        var blend =
          (this.timeAlive - this.delayTime) / (this.lifetime - this.delayTime);
        var movement = TimingFunctions.convertToFlip(
          TimingFunctions.easeInOut(blend)
        );
        var pos = TimingIndicator.current
          .getOrigin()
          .add(this.offset.scale(movement))
          .add(
            this.offsetN.scale(
              this.amplitude *
                Math.sin(
                  (movement + this.phase) * ((2 * Math.PI) / this.period)
                )
            )
          );
        this.x = pos.x;
        this.y = pos.y;
        this.standardDraw(context, blend);
      } else TimingIndicator.MarkDone(this);
    }
  }
}

class FlashPoint extends TimingPoint {
  constructor(x, y, activeTime, delayTime = 0) {
    super(x, y);

    this.offset = new Vector2D(x, y);

    this.timeAlive = 0;
    this.lifetime = activeTime + delayTime;
    this.delayTime = delayTime;
  }

  update(timeDelta, context) {
    this.timeAlive += timeDelta;

    if (this.timeAlive > this.delayTime) {
      if (this.timeAlive < this.lifetime) {
        var blend =
          (this.timeAlive - this.delayTime) / (this.lifetime - this.delayTime);
        var pos = TimingIndicator.current.getOrigin().add(this.offset);
        this.x = pos.x;
        this.y = pos.y;
        this.standardDraw(context, 0.5);
      } else TimingIndicator.MarkDone(this);
    }
  }
}
