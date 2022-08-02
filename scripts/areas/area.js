/**
 * A whitelist for the code that allows generics in monster creation.
 * This list should contain every monster involved in random encounters
 */
const allMonsters = Object.freeze([
  "Troll",
  "Sponge",
  "IntrovertedGhost",
  "Door",
  "Decoy",
  "Skeleton",
  "Reaper",
  "Troldier",
]);

/**
 * The base class for areas.
 */
class Area {
  constructor(flavor, monsters, battleTheme = "fight") {
    this.stepsTaken = 0;
    this.flavor = new SequenceGetter(flavor);
    this.battleTheme = battleTheme;
    this.events = this.getEvents();
    this.currentEvent = null;
    this.monsters = this.toInts(monsters);
    this.busy = false;
    this.offset = 0;
    console.log(this.monsters);
  }

  static getStepsFromOffsetAndArea(area, offset) {
    var i = 10 - Area.allAreas.indexOf(area);
    var steps = i * 100;
    return steps - offset + 1;
  }

  setOffset(offset) {
    offset--;
    if (offset > 0) {
      this.offset = offset;
      this.events.splice(0, offset);
    }
  }

  getEvents() {
    return [];
  }

  getNextArea() {
    console.error("Area Engine has nowhere to go.");
    return {};
  }

  getBackgroundMusic() {
    return "back";
  }

  onEnd() {}

  onStart() {}

  toMonsters(ints) {
    var monsters = [];
    ints.forEach(function (element) {
      monsters.push(allMonsters[element]);
    });
    return monsters;
  }

  toInts(monsters) {
    var ints = [];
    monsters.forEach(function (element) {
      var i = allMonsters.indexOf(element);
      if (i != -1) ints.push(i);
    });
    return ints;
  }

  getRandomMonster() {
    var classes = this.toMonsters(this.monsters);
    // Generic instantiation via eval
    return eval("new " + getRandom(classes) + "();");
  }

  static getEmptySteps(n) {
    return Array(n).fill(Area.emptyStep);
  }

  async walk() {
    if (this.busy) return;
    this.busy = true;
    this.stepsTaken++;
    this.onWalk();
    var event = this.events.shift();
    this.offset++;
    if (!Array.isArray(event)) event = [event];
    for (var subEvent of event) await subEvent();
    this.busy = false;
  }

  onWalk() {}

  static async load(area) {
    var i = Area.allAreas.indexOf(area);
    if (i == -1) {
      console.error("Invalid Area");
      return null;
    } else {
      await loadScript("areas/" + Area.allScripts[i]);
      return eval(`new ${area}()`);
    }
  }
}
Area.allAreas = Object.freeze(["Area_Aorta", "Area_Underworld", "Area_Ocean"]);
Area.allScripts = Object.freeze([
  "area-aorta.js",
  "area-underworld.js",
  "area-ocean.js",
]);

//Utility

Area.attachImageToContent = function (
  imageUrl,
  width = 64,
  height = 64,
  x = 0,
  y = 0,
  sizeMultiplier = 1
) {
  let size = 100 * sizeMultiplier;
  let offset = (100 - size) / 2;

  var $wrapper = $('<div class="monster"></div>');
  var $innerWrapper = $(
    `<canvas style="height:${size}%;width:${size}%;left:${offset}%;"></canvas>`
  );
  $innerWrapper.appendTo($wrapper);
  contentManager.add($wrapper);

  var renderer = new SpriteRenderer(
    $innerWrapper[0],
    "./images/" + imageUrl,
    width,
    height
  );
  renderer.onload = () => {
    renderer.setSprite(x, y);
  };

  return $innerWrapper;
};

Area.writeTop = async function (messages) {
  await new Writer(topWriter, messages).writeAllAsync();
};

Area.writeBottom = async function (messages) {
  await new Writer(bottomWriter, messages).writeAllAsync();
};

Area.transitionForLeavingCharacter = async function () {
  DialogueTypewriter.clearAll();
  await contentManager.recede(true);
  contentManager.clear();
};

// Step generation helpers

Area.getUnlockEvent = function (imageX, name, description, saveKey) {
  return async function () {
    $column = Area.attachImageToContent("props/item-column.png");
    var $item = $(
      '<canvas style="left: 35%; bottom: 90%; width: 30%; height: 30%;"></canvas>'
    );
    var hover = new CSSAnimationController($item, "slowHover");
    hover.start();
    $item.insertAfter($column);
    var items = new SpriteRenderer(
      $item[0],
      "images/props/item-column-items.png",
      32,
      32
    );

    items.onload = () => {
      items.setSprite(imageX, 0);
    };

    await contentManager.approach();

    Area.writeBottom(["Will you accept the offering of light?"]);

    async function collect() {
      cover.color = "white";
      await cover.fadeTo(1, 200);
      hover.end();
      $item.remove();
      await cover.fadeTo(0, 3000);
      infoWindow.setToItemContent(1, name, description);
      file.setFlag(saveKey);

      await infoWindow.show();
      sound.playFX("item-get");
      await InputHandler.waitForInput();
      infoWindow.hide();
    }

    var choice = await getChoice(["Accept", "Decline"], hcursor);
    if (choice == "Accept") {
      await collect();
    } else {
      await Area.writeBottom([
        "If you reject the offering, your journey will be much more difficult—|Possibly impossible.",
        "Are you sure you want to decline the offering?",
      ]);
      var check = await getChoice(["Accept", "Reject"], hcursor);
      if (check == "Accept") {
        await collect();
      } else {
        Area.writeBottom([
          "So be it.",
          "You bear the weight of your own will.",
        ]);
      }
    }
  };
};

Area.getBackgroundChangeEvent = function (flavor, back, fore = null) {
  return function () {
    topWriter.show(flavor);
    changeBackground(back);
    changeForeground(fore);
  };
};

// Universal steps

Area.emptyStep = function () {
  // Do Nothing
};

Area.fightEvent = function () {
  Battle.start(area.battleTheme, [
    area.getRandomMonster(),
    area.getRandomMonster(),
    area.getRandomMonster(),
  ]);
};

Area.flavorEvent = function () {
  topWriter.show(area.flavor.get());
};
Area.nextAreaEvent = async function () {
  this.onEnd();
  area = await this.getNextArea();
  sound.playMusic(area.getBackgroundMusic());
  area.onStart();
};

// Prototype Events

Area.fightChain = async function () {
  DialogueTypewriter.clearAll();
  contentManager.clear();
  var $wrapper = $('<div class="monster"></div>');
  var $virgil = $(
    '<canvas style="height:180%;width:180%;left:-40%;" id="chain"></canvas>'
  );
  $virgil.appendTo($wrapper);
  contentManager.add($wrapper);

  var renderer = new SpriteRenderer($virgil[0], "./images/chain.png", 64, 64);
  renderer.onload = () => {
    renderer.setSprite(0, 0);
  };

  await contentManager.approach();

  await new Writer(bottomWriter, [
    "Hello, Harbinger.",
    "Perhaps you've heard of me...|Chain.",
    "...",
    "No?",
    "I guess you were born yesterday.",
    "Whatever.",
    "Regardless, I've been itching at a chance to fight a deity.",
    "The big dark was defintiely out of the question, given that he's gained so much power",
    "But you on the other hand...",
    "Also, The big dark promised whoever imprisons you control over their own world when he completes his design.",
    "Finally I'll get the true recognition I deserve; not as an assassin, but as a king!",
    "Get ready to taste steel!",
  ]).writeAllAsync();

  Battle.start("chain", [new Chain()], false);
};

Area.fightAragore = function () {
  mode = ModeEnum.final;
  Battle.start("aragore", [new Aragore()]);
  topWriter.show("Aragore the dragon blocks the exit.");
};
