class Area_Ocean extends Area {
  constructor() {
    super(
      Area_Ocean.text.flavor,
      ["Sponge", "Shark", "ManglerFish"],
      "ocean-fight"
    );
  }

  getEvents() {
    var events = [].concat(
      [Area_Ocean.firstStep],
      [Area_Ocean.meetMortimer],
      this.fillGrabBagThing(9),
      [Area_Aorta.meetOscar],
      this.fillGrabBagThing(9),
      this.fillGrabBagThing(9),
      [Area_Aorta.meetAmadeus],
      this.fillGrabBagThing(9, [Area.fightEvent]),
      this.fillGrabBagThing(10, [Area.meetTroldiers]),
      this.fillGrabBagThing(),
      [Area.talkAmadeus],
      this.fillGrabBagThing(9),
      this.fillGrabBagThing(),
      this.fillGrabBagThing(9),
      this.fillGrabBagThing(9),
      [Area.fightAmadeus, Area.nextAreaEvent]
    );
    return events;
  }

  get music() {
    return "ocean";
  }

  onStart() {
    changeBackground("ocean");
    topWriter.show("You have entered the great Ocean.");
    sound.playMusic(this.getBackgroundMusic());
    loadScript("monsters/ocean-monsters.js");
  }

  fillGrabBagThing(length = 10, a = [Area.fightEvent]) {
    var _this = this;

    a.push(Area.flavorEvent);

    while (a.length < length) {
      a.push(Area.emptyStep);
    }

    return GrabBag.shuffle(a);
  }
}

Area_Ocean.text = {
  flavor: [
    "Somehow you can breathe in this water.",
    "Even though you cannot see very far, this is some of the clearest water you have ever seen.",
  ],
};

Area_Ocean.firstStep = async function () {
  await new Writer(bottomWriter, [
    "You have just walked into an ocean.",
    "You clutch at your throat, gasping for breath...",
    "Except...",
    "You can breathe.",
    ["Hey, I forgot to tell you.", expr.emery.happy],
    ["You can breathe the water!"],
    "...",
    ["This is the vast underground ocean."],
    ["It's full of dolphins!!!"],
    ["and sharks", expr.emery.annoyed],
    ["and they don't like eachother"],
    ["The shark king Alcore has been fighting for the exile of all dolphins"],
    ["Maybe there's something we can do to help them?"],
    "You push onward.",
  ]).writeAllAsync();
  DialogueTypewriter.clearAll();
};

Area_Ocean.meetMortimer = async function () {
  new Writer(topWriter, ["HEEEEEELLLLLLPPP!!!!"]).write();

  contentManager.clear();

  var $a = $('<div class="monster"></div>');
  var $marty = $(
    '<canvas style="height:150%;width:150%;left:-25%;" id="marty"></canvas>'
  );
  $marty.appendTo($a);
  var renderer = new CanvasSpriteRenderer(
    $marty[0],
    "./images/Ocean/dolphin.png",
    64,
    64
  );
  renderer.onload = () => {
    renderer.setSprite(0, 0);
  };

  contentManager.add($a);
  await contentManager.approach(true);

  await new Writer(bottomWriter, [
    ["They're afterrr meee!", expr.martimer.sad],
    "!?!?!?",
    ["The SHARKS!!!"],
  ]).writeAllAsync();

  await Battle.start(
    "ocean-fight",
    [new Shark(), new Shark(), new Shark()],
    true
  );
};
