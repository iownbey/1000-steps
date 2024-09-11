class Darkness extends Monster {
  constructor() {
    super("THE DARKNESS", 1000, 0, 0);

    this.rushGetter1 = new NonrepeatingGetter([2, 2.5, 3, 3.5]);
    this.rushGetter2 = new NonrepeatingGetter([4, 4.5, 5, 5]);
    this.rushSound = sound.loadPersistant("darkness/attack-choir");

    this.flashFrameGetter = new NonrepeatingGetter([
      [2, 0],
      [3, 0],
      [2, 1],
      [3, 1],
    ]);
    this.flashAttackSound = sound.loadPersistant("darkness/attack-slash");

    this.attackGetter = new NonrepeatingGetter([
      this.attack1,
      this.attack2,
      this.attack3,
    ]);

    this.dialogue = new SequenceGetter(
      [
        "I HAVEN'T HAD A FIGHT LIKE THIS IN LIFETIMES",
        "WE'VE HAD MANY NAMES...|LIGHT & DARK, YIN & YANG, LIFE & DEATH",
        "BROTHER, WHY DON'T YOU GIVE IN?",
        "YOU CAN GO BACK TO RESTING ONCE AGAIN. PERFECT PEACE...",
        "LET ME RULE THE WORLD",
        "WHY CAN'T I HAVE MY WAY?|ARE YOU AFRAID OF THE DARK?",
        "BROTHER, YOU ARE WEAK FROM YOUR TIME IN THE HEART OF THE EARTH",
      ],
      false
    );
  }

  // Small Waves
  async attack1() {
    var points = [];
    var pointQuantity = 5;
    var delay = 0;
    for (let i = 0; i < pointQuantity; i++) {
      delay += 0.4 + Math.random() * 0.4;
      points.push(getPoint(delay));
    }

    function getPoint(delay) {
      var lifetime = 3;
      const sign = Math.sign(Math.random() - 0.5);
      const xmag = 400 * sign;
      return new DarknessSwordSwingPoint(
        (
          t //x
        ) => {
          t = TimingFunctions.convertToFlip(t);
          return (-4 * t ** 2 + 4 * Math.abs(t)) * xmag;
        },
        (
          t //y
        ) => {
          t = TimingFunctions.convertToFlip(t);
          return t < 0 ? TimingFunctions.linear(t) * 200 : 0;
        },
        (
          t //rot
        ) => {
          return TimingFunctions.cosBlend(t) * sign * Math.PI * 6;
        },
        lifetime,
        delay
      );
    }

    this.shiverAnim.start();
    //this.renderer.setSprite(1, 0);

    var interaction = new TimingIndicator(
      document.getElementById("content-canvas")
    );
    interaction.points = points.slice(0);
    await interaction.getPromise();

    //this.renderer.setSprite(0, 0);
    this.shiverAnim.end();

    if (
      points.some((p) => {
        return p.state === -1;
      })
    ) {
      this.shakeAnim.trigger();
      return {
        damage: 20,
        text: "The DARKNESS hurts you deep inside.|You took {$d} damage.",
      };
    } else {
      return { damage: 0, text: "Virtue protected your heart" };
    }
  }

  // Giant Rush
  async attack2() {
    var points = [];
    var delay = 0;

    var pointLoc1 = this.rushGetter1.get();
    var pointLoc2 = this.rushGetter1.get();
    var pointLoc3 = this.rushGetter2.get();
    var pointLoc4 = this.rushGetter2.get();
    var offset = Vector2D.getNormalVector().scale(-750);

    function distance(d, point) {
      return Math.abs(d + 1.5 - point) > 0.1;
    }

    for (let i = 0; i < 80; i++) {
      delay += 0.05;
      if (
        distance(delay, pointLoc1) &&
        distance(delay, pointLoc2) &&
        distance(delay, pointLoc3) &&
        distance(delay, pointLoc4)
      )
        points.push(new SpinPoint(offset, 3, i * 0.05).lure());
    }

    points.push(new SpinPoint(offset.scale(0.5), 3, pointLoc1 - 1.5));
    points.push(new SpinPoint(offset.scale(0.5), 3, pointLoc2 - 1.5));
    points.push(new SpinPoint(offset.scale(0.5), 3, pointLoc3 - 1.5));
    points.push(new SpinPoint(offset.scale(0.5), 3, pointLoc4 - 1.5));

    this.floatUpdate = false;
    CSSAnimationController.trigger(this.jobj, "shake");
    this.renderer.setSprite(2, 0);
    var _this = this;
    setTimeout(() => {
      CSSAnimationController.trigger(_this.jobj, "shake");
      _this.shiverAnim.start();
      _this.renderer.setSprite(2, 1);
      sound.playPersistant(this.rushSound);
    }, 1000);

    var interaction = new TimingIndicator(
      document.getElementById("content-canvas")
    );
    interaction.points = points.slice(0);
    await interaction.getPromise();

    this.floatUpdate = true;
    this.renderer.setSprite(0, 0);
    this.shiverAnim.end();

    if (
      points.some((p) => {
        return p.state === -1;
      })
    ) {
      this.shakeAnim.trigger();
      return {
        damage: 20,
        text: "The DARKNESS hurts you deep inside.|You took {$d} damage.",
      };
    } else {
      return { damage: 0, text: "Virtue protected your heart" };
    }
  }

  // Quick Rush
  async attack3() {
    var _this = this;
    function shake() {
      CSSAnimationController.trigger(_this.jobj, "shake");
      _this.jobj.css(`transform","scaleX(${Math.sign(Math.random() - 0.5)})`);
      const frame = _this.flashFrameGetter.get();
      _this.renderer.setSprite(frame[0], frame[1]);
      sound.playPersistant(_this.flashAttackSound);
    }

    const intervals = [1, 0.95, 0.9, 0.8, 0.7, 0.65, 0.6, 0.6, 0.6, 0.6, 0.5];

    var points = [];
    var delay = 0;
    for (var i = 0; i < 10; i++) {
      delay += intervals[i];
      setTimeout(shake, delay * 1000);
      points.push(
        new DarknessSwordFlashPoint(
          0,
          0,
          Math.random() * Math.PI * 2,
          intervals[i + 1],
          delay
        )
      );
    }

    this.floatUpdate = false;

    var interaction = new TimingIndicator(
      document.getElementById("content-canvas")
    );
    interaction.points = points.slice(0);
    await interaction.getPromise();

    this.floatUpdate = true;

    if (
      points.some((p) => {
        return p.state === -1;
      })
    ) {
      this.shakeAnim.trigger();
      return {
        damage: 20,
        text: "The DARKNESS hurts you deep inside.|You took {$d} damage.",
      };
    } else {
      return { damage: 0, text: "Virtue protected your heart" };
    }
  }

  async attack() {
    return await this.attackGetter.get().apply(this);
  }

  html(root) {
    var $content = $(
      '<canvas style="height:150%;width:150%;left:-25%;position=absolute;" id="darkness"></canvas>'
    );
    this.jobj = $content;
    this.canvas = $content[0];
    $content.appendTo(root);

    this.renderer = new CanvasSpriteRenderer(
      $content[0],
      "./images/darkness.png",
      64,
      64
    );
    this.floatUpdate = true;

    var _this = this;
    this.renderer.onload = () => {
      _this.renderer.setSprite(0, 0);
    };

    this.renderHandle = requestAnimationFrame(renderLoop);
    function renderLoop(ml) {
      const seconds = ml / 1000;
      const rate = 1 / 3;
      const amplitude = 5;
      var x = seconds * (2 * Math.PI * rate);
      var y = Math.sin(x);
      var yprime = Math.cos(x);

      if (_this.floatUpdate) {
        //animate Y position
        $content.css("bottom", y * amplitude + "%");
        if (y > 0.9 || y < -0.9) {
          _this.renderer.setSprite(0, 0);
        } else {
          if (yprime < 0) {
            _this.renderer.setSprite(1, 0);
          } else {
            _this.renderer.setSprite(1, 1);
          }
        }
      } else $content.css("bottom", "0%");
      _this.renderHandle = requestAnimationFrame(renderLoop);
    }

    this.shakeAnim = new CSSAnimationController($content, "shake");
    this.shiverAnim = new CSSAnimationController($content, "shiver");
  }

  talk() {
    return this.dialogue.get();
  }

  magic() {
    return [
      "IDIOT.",
      "I AM THE DARKNESS.",
      "LIGHT BECOMES LOST IN MY VERY FORM.",
    ];
  }

  inspect() {
    return [
      "The DARKNESS, a near omnipotent pseudo-deity ruling over Earth with an iron fist.",
    ];
  }
}
Darkness.swordPath =
  "m 0 -320 l 40 40 l 0 260 l 60 0 l -20 40 l -40 0 l -20 20 l 0 60 l -20 20 l -20 -20 l 0 -60 l -20 -20 l -40 0 l -20 -40 l 60 0 l 0 -260 l 40 -40 z m 0 290 a 10 10 90 0 0 0 60 a 10 10 90 0 0 0 -60 z m -90 50 l -20 -40 l -10 0 l 20 40 z m 180 0 l 20 -40 l 10 0 l -20 40 z";

class DarknessSwordSwingPoint extends ParametricPoint {
  /**
   * @typedef {(time: number) => number} easingFunction
   * @param {easingFunction} xfunc - Easing for x
   * @param {easingFunction} yfunc - Easing for y
   * @param {easingFunction} rotFunc - Easing for sword rotation
   * @param {number} activeTime - Length of time the point will be active after the delay
   * @param {delayTime} delayTime - Length of time the point will be inactive after the TimingIndicator is activated
   */
  constructor(xFunc, yFunc, rotFunc, activeTime, delayTime = 0) {
    super(xFunc, yFunc, activeTime, delayTime);
    this.rotFunc = rotFunc;
  }

  standardDraw(context, blend) {
    super.standardDraw(context, blend);

    // Draw Sword
    context.translate(this.x, this.y);
    context.rotate(this.rotFunc(blend));
    context.fillStyle = "#000000FF";
    context.fill(new Path2D(Darkness.swordPath));
    // Reset transform matrix
    context.setTransform(1, 0, 0, 1, 0, 0);
  }
}

class DarknessSwordFlashPoint extends FlashPoint {
  constructor(x, y, rot, activeTime, delayTime = 0) {
    super(x, y, activeTime, delayTime);
    this.rot = rot;
  }

  standardDraw(context, blend) {
    super.standardDraw(context, blend);

    // Draw Sword
    context.translate(this.x, this.y);
    context.rotate(this.rot);
    context.fillStyle = "#000000FF";
    context.fill(new Path2D(Darkness.swordPath));
    // Reset transform matrix
    context.setTransform(1, 0, 0, 1, 0, 0);
  }
}
