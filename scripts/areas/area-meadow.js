class Area_Meadow extends Area {
  constructor() {
    super();
    this.flowerWrapper = $(
      "<div style='position:absolute;inset: 0 0 0 0; z-index:0;'></div>"
    );
    this.flowerWrapper.insertAfter("#content");
  }

  getEvents() {
    var events = Array(100).fill(Area.emptyStep);
    events[49] = Area_Meadow.abigail;
    events[76] = Area_Meadow.virgilsSword;
    events[99] = Area_Meadow.virgilsRegret;
    return events;
  }

  get music() {
    return "meadow";
  }

  shiftFlowers() {
    this.flowers.forEach((f) => {
      var newY = f.y - 0.05;
      var newX = f.x;
      if (newY < -0.15) {
        newY += 1.15;
        newX = Math.random();
        f.randomizeColor();
        f.$jobj.css("transition", "");
      } else {
        f.$jobj.css("transition", "width 0.3s, bottom 0.3s, left 0.3s");
      }
      f.updateValues(newX, newY);
    });
  }

  generateFlowerPoints(n, minY) {
    let flowers = [];
    for (let i = 0; i < n; i++) {
      let y = minY + Math.random() * (1 - minY);
      let x = Math.random();

      flowers.push(new FlowerPoint(x, y));
    }
    return flowers.sort((a, b) => a.value - b.value);
  }

  onWalk() {
    this.shiftFlowers();
  }

  onStart() {
    this.flowers = this.generateFlowerPoints(1000, 0);
    this.flowerWrapper.append(this.flowers.map((f) => f.$jobj[0]));

    changeBackground("meadow");
    sound.playMusic(this.music);
  }

  static async abigail() {
    Area.attachImageToContent("meadow/abigail.png", 64, 64, 0, 0, 1);
    await contentManager.approach();

    await Area.writeBottom([
      ["Well hi there!", expr.abigail.happy],
      ["I didn't expect to see another living soul here."],
      ["Do you...|Do you like my meadow?"],
      ["I've been creating it for years now..."],
      [
        "Ever since the darkness took over the surface. I was one of the few humans who escaped.",
        expr.abigail.sad,
      ],
      ["We... ummm... kept track of those who were corrupted..."],
      ["I've been planting a flower for every corrupted soul."],
      ["..."],
      ["If they ever come out of it, I want to give one to each of them"],
      ["I want to remind them that there was someone who cared about them"],
      [
        "That even when they were trapped inside their worst selves, there was someone who saw the best in them.",
      ],
      [
        "Please, if you free the surface, come back and tell me so I can pass out the flowers.",
        expr.abigail.sadEyeContact,
      ],
    ]);
  }

  static async virgilsSword() {
    Area.attachImageToContent("meadow/virgil-sword.png", 64, 64, 0, 0, 1);
    await contentManager.approach();

    await Area.writeTop(["Virgil's sword has been struck into the dirt."]);
  }

  static async virgilsRegret() {
    Area.attachImageToContent("meadow/virgil-meadow.png", 64, 64, 0, 0, 1.8);
    await contentManager.approach();
    sound.stop();

    await Area.writeBottom([
      "Hello, Harbinger.",
      "I can't go on like this.",
      "You've seen the path of destruction I've left behind me.",
      "I was prepared for it. I justified the killings because I thought it would eventually stop.",
      "But it keeps going...",
      "And going...",
      "...",
      "How am I any different than the devil who inspired this garden?",
      "No more killing.",
      "I am unforgivable.",
      "Please, Harbinger...",
      "Give me a death fitting for a murderer.",
    ]);

    await Battle.start("virgil-battle", new VirgilRegret(), false);

    if (VirgilRegret.goodEnding) {
      await Area.writeBottom([
        "...",
        "You're right.",
        "I was killing to save the world, and I was only doing what was necessary for you to end evil.",
        "I'm sorry, it's...",
        "it's just...",
        "so hard.",
        "You're right that killing myself wouldn't fix anything; I'd just carry my regret through all eternity, but still...",
        "I can't kill any more.",
        "...",
        "Surely, though, there must be a way I can still help.",
        "... ... ... ...",
        "Let me teach you the final pillar of the art of blade & sorrow.",
      ]);
      //unlock sorrow (woe, maybe?)
    }
  }
}

class FlowerPoint {
  static sprites = new SpriteSheet(
    "images/backgrounds/meadow-flowers.png",
    4,
    4
  );

  constructor(x, y) {
    this.$jobj = $(
      "<div style='transition: left 0.5s, bottom 0.5s, width 0.5s;position:absolute;aspect-ratio:1;'></div>"
    );
    this.updateValues(x, y);
    this.randomizeColor();
  }

  updateValues(x, y) {
    this.x = x;
    this.y = y;

    let easedY = 1 - (1 - y) ** 4;
    let sizePercent = 1 + ((1 - easedY) / 2) * 15;

    let minPathWidth = 0.15;
    let maxPathWidth = 0.55;
    let pathWidth = minPathWidth + (1 - easedY) * (maxPathWidth - minPathWidth);
    let gardenBankWidth = (1 - minPathWidth) / 2;

    let smallestWidth = 1;
    let totalGardenWidth = gardenBankWidth * 2;
    let width = totalGardenWidth + pathWidth;
    let xOffset = (width - smallestWidth) / 2;

    let easedX = x * totalGardenWidth;
    if (x > 0.5) easedX += pathWidth;
    easedX -= xOffset;

    let xPercent = easedX * 100 - sizePercent / 2;
    let yPercent = easedY * 100 * 0.78;

    let z = -Math.floor(easedY * 1000);

    this.$jobj.css("bottom", yPercent + "%");
    this.$jobj.css("left", xPercent + "%");
    this.$jobj.css("z-index", z);
    this.$jobj.css("width", sizePercent + "%");
  }

  randomizeColor() {
    FlowerPoint.sprites.setSprite(
      this.$jobj,
      Math.randomInt(0, 5),
      Math.randomInt(0, 5)
    );
  }
}

class VirgilRegret extends Monster {
  static goodEnding = false;

  constructor() {
    super("Virgil", 1, 0, 0);
    this.turn = -1;
    this.suicideAttempt = false;
    this.encouragable = false;
    this.encouraged = false;
  }

  async attack() {
    this.turn++;
    var attackObj = {};
    switch (this.turn) {
      case 0:
        {
          attackObj.text = "Please kill me...";
        }
        break;
      case 1:
        {
          attackObj.text = "KILL ME, HARBINGER";
        }
        break;
      case 2:
        {
          attackObj.text =
            "YOU KNOW HOW MANY LIVES I'VE TAKEN? HOW MANY FAMILIES I'VE RUPTURED? FAR MORE THAN THIS ENDLESS SEA OF FLOWERS COULD JUSTIFY. I HATH WROUGHT MY OWN GARDEN IN A DAY.";
        }
        break;
      case 3:
        {
          attackObj.text = "I'll just... do it myself then.";
          this.suicideAttempt = true;
          this.renderer.setSprite(0, 1);
          this.shiverAnim.start();
        }
        break;
      case 4:
        {
          if (this.suicideAttempt) {
            this.shiverAnim.end();
            this.renderer.setSprite(1, 1);
            this.shakeAnim.trigger();
            sound.stop();
            sound.playFX("deathfx");
            await Helper.delaySeconds(2);
            this.breatheAnim.end(true);
            await topWriter.showAsync(
              "So THIS is what it feels like to be murdered."
            );
            topWriter.clear();
            Battle.current.killMonster(this);
            await Helper.delaySeconds(2);
            attackObj.text = "Virgil stopped the endless killings.";
          } else {
            attackObj.text = "I don't want to keep on.";
          }
        }
        break;
      default:
        {
          attackObj.text = "Do you think I'm worth saving?";
          this.encouragable = true;
        }
        break;
    }
    return attackObj;
  }

  html(root) {
    var $virgil = $(
      '<canvas style="height:180%;width:180%;left:-40%;" id="virgil"></canvas>'
    );
    this.jobj = $virgil;
    this.canvas = $virgil[0];
    $virgil.appendTo(root);

    this.renderer = new SpriteRenderer(
      $virgil[0],
      "./images/meadow/virgil-meadow.png",
      64,
      64
    );

    var _this = this;
    this.renderer.onload = () => {
      _this.renderer.setSprite(1, 0);
    };

    this.breatheAnim = new CSSAnimationController($virgil, "trollPose").start();
    this.shiverAnim = new CSSAnimationController($virgil, "shiver");
    this.shakeAnim = new CSSAnimationController($virgil, "shake");
  }

  talk() {
    if (this.encouragable) {
      VirgilRegret.goodEnding = true;
      Battle.current.endNow();
      return "";
    } else {
      return "Virgil wasn't ready to hear the truth yet.";
    }
  }

  magic() {
    if (this.suicideAttempt) {
      this.suicideAttempt = false;
      this.shiverAnim.end();
      this.renderer.setSprite(1, 0);
    }
    return "You stunned Virgil.";
  }

  inspect() {
    return [
      "While you may not remember Virgil, the master of blade & sorrow, he is still your friend, and has proven himself so by fighting your battles for you.",
      "He regrets the pain he has caused, however necessary, causing turmoil in his being",
      "Don't let him become a murderer by killing something he hates!",
    ];
  }
}
