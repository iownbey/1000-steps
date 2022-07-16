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
    var monster = null;
    // Generic instantiation via eval
    eval("monster = new " + getRandom(classes) + "();");
    return monster;
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

Area.getBackgroundChangeEvent = function (flavor, back, fore = null) {
  return function () {
    topWriter.show(flavor);
    changeBackground(back);
    changeForeground(fore);
  };
};

Area.emptyStep = function () {
  // Do Nothing
};

Area.fightEvent = function () {
  currentBattle = new Battle(area.battleTheme, [
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

Area.fightChain = function () {
  var input = { oninput: () => {} };
  currentDoer = Doer.ofPromise(
    (async function () {
      DialogueTypewriter.clearAll();
      contentManager.clear();
      var $wrapper = $('<div class="monster"></div>');
      var $virgil = $(
        '<canvas style="height:180%;width:180%;left:-40%;" id="chain"></canvas>'
      );
      $virgil.appendTo($wrapper);
      contentManager.add($wrapper);

      var renderer = new SpriteRenderer(
        $virgil[0],
        "./images/chain.png",
        64,
        64
      );
      renderer.onload = () => {
        renderer.setSprite(0, 0);
      };

      await contentManager.approach();

      await new Writer(bottomWriter, [
        "Hello, Harbinger.",
        "The name's Chain.",
        "Prepare to die.",
      ]).writeAllAsync();

      currentBattle = new Battle("chain", [new Chain()], false);
    })(),
    input
  );
};

Area.fightAragore = function () {
  mode = ModeEnum.final;
  currentBattle = new Battle("aragore", [new Aragore()]);
  topWriter.show("Aragore the dragon blocks the exit.");
};
