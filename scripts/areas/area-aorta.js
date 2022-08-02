class Area_Aorta extends Area {
  constructor() {
    super(text.aorta.walkFlavor, ["Troll", "Door", "Decoy"], "fight");
  }

  getEvents() {
    return [].concat(
      [Area_Aorta.meetVirgil], //1
      Area.getEmptySteps(3), //4
      [Area_Aorta.meetTroll], //5
      Area.getEmptySteps(6), //11
      [Area_Aorta.virgilKillScene], //12
      Area.getEmptySteps(7), //19
      [Area_Aorta.UnlockStun],
      Area.getEmptySteps(7), //27
      [Area.fightEvent], //28
      Area.getEmptySteps(10), //38
      [Area_Aorta.meetOscar], //39
      Area.getEmptySteps(9), //48
      [Area_Aorta.UnlockCharge], //49
      Area.getEmptySteps(2), //51
      [Area_Aorta.meetAmadeus], //52
      Area.getEmptySteps(9), //61
      [Area.fightEvent], //62
      Area.getEmptySteps(10), //72
      [Area_Aorta.meetTroldiers], //73
      Area.getEmptySteps(5), //78
      [Area.fightEvent], //79
      Area.getEmptySteps(5), //84
      [Area_Aorta.talkAmadeus], //85
      Area.getEmptySteps(14), //99
      [Area_Aorta.fightAmadeus, Area.nextAreaEvent] //100
    );
  }

  async getNextArea() {
    return await Area.load("Area_Underworld");
  }

  getBackgroundMusic() {
    return "back";
  }

  onStart() {
    changeBackground("back");
    topWriter.show('Press "Space" to walk forward.');
    sound.playMusic(this.getBackgroundMusic());
  }

  fillGrabBagThing(length = 10, a = [Area.fightEvent]) {
    a.push(Area.flavorEvent);

    while (a.length < length) {
      a.push(Area.emptyStep);
    }

    return GrabBag.shuffle(a);
  }
}

Area_Aorta.meetVirgil = async function () {
  Area.attachImageToContent("virgil.png", 64, 64, 0, 0, 1.8);
  await contentManager.approach();

  await Area.writeBottom([
    "Hello, Harbinger.",
    "I am Virgil.",
    "I am here to teach you how to fight your way to the surface.",
    "Or do you already know how to fight?",
  ]);

  var pick = await getChoice(["Yes", "No"], hcursor);

  switch (pick) {
    case "Yes":
      {
        await Area.writeBottom([
          "But you have only existed for a short time!",
          "There is no possible way you could have learned.",
          "You must prove this if you are to continue.",
        ]);

        var pick2 = await getChoice(["Fine then", "Nevermind"], hcursor);
        switch (pick2) {
          case "Fine then":
            {
              await Area.writeBottom([
                "If you insist.",
                "I will not kill you, but I will wound you.",
                "If this happens, The fight will be over, and you must accept my training.",
                "Prepare to combat with the master of blade and sorrow.",
              ]);
              Battle.start("virgil-theme", new Virgil(), false);
              await Battle.current.getPromise();
            }
            break;
          case "Nevermind":
            {
              await Area.writeBottom([
                "Silly Harbinger...",
                "You know I must teach you the way of blade and sorrow.",
              ]);
              await tutorial();
            }
            break;
        }
      }
      break;
    case "No":
      {
        await tutorial();
      }
      break;
  }

  async function tutorial() {
    await Area.writeBottom([
      "Even now, humans continue to be abducted by the darkness's haze of malice.",
      "You must be prepared to fight your way to the surface, so let's begin.",
      "Just like in a dance, fighting is a dialogue.",
      "It involves TURNS, which are taken by each being in the fight.",
      "You take your turn first, followed by each monster from left to right.",
      "When monsters attack, a hollow circle will appear in the center of the screen, representing the point of contact.",
      "If you press space right when their attack enters the center, you can block it.",
      "But beware: too early or too late and your block will fail.",
      "Let's practice. Block my swing.",
    ]);

    do {
      var timing = new TimingIndicator(contentCanvas);
      var point = new EaseInOutPoint(new Vector2D(200, 0), 2);
      timing.points.push(point);
      await timing.getPromise();
      if (point.state === -1) {
        await Area.writeBottom([
          "Remember, you must hit space when the attack enters the center.",
          "The attack will turn blue when you can block it.",
        ]);
      }
    } while (point.state !== 1);

    await Area.writeBottom([
      "Good job, Harbinger.",
      "I think this is enough training for now.",
      "Be aware that I was holding back just now. Most monsters won't.",
      "I have one more thing to teach you.",
      "Some monsters can have STRONG attacks.",
      "When they do, you must prepare to block their attacks by first DEFENDing with your shield.",
      "If you don't, these attacks will appear yellow and be unblockable.",
      "Good luck, Harbinger.",
      "We will meet again.",
    ]);
  }

  await Area.transitionForLeavingCharacter();
};

Area_Aorta.meetTroll = async function () {
  contentManager.clear();
  contentManager.add($('<div class="monster"><div class="troll"></div></div>'));
  contentManager.approach();
  await new Writer(bottomWriter, text.aorta.trollFoundText).writeAllAsync();

  Battle.start("fight", new Troll(), false);
  await Battle.current.getPromise();
};

Area_Aorta.virgilKillScene = async function () {
  Area.attachImageToContent("virgil/virgil-killed.png", 64, 64, 0, 0, 1.8);
  await contentManager.approach();

  await Helper.delay(2);

  await Area.writeBottom([
    "It's ugly, isn't it.",
    "The price we must pay to fight for what we believe in.",
    "This troll probably had no idea why he had to fight me",
    "And yet, he fought the same.",
    "I had to give up my innocence to protect our future.",
  ]);

  bottomWriter.clear();
  await Helper.delay(2);

  await Area.writeBottom([
    "We both paid our prices.",
    "...",
    "Harbinger, please don't think less of me.",
    "I will cut my way through this wilderness so that you may run.",
    "It is my destiny to bear the burden of evil so that you may bear the burden of the world.",
    "All the same, I wish neither of us had to bear these burdens",
    "I might rest for a second, don't feel like you have to stay.",
  ]);
};

Area_Aorta.UnlockCharge = Area.getUnlockEvent(
  1,
  "CHARGE",
  'Your maximum charge has been increased from zero to one. Use "CHARGE" in battle to increase your charge, and spend charge to power up your attacks. You can now "STRIKE" which deals immense damage to one target, and you can "BLOCK" which can be used more than one turn in a row, or followed by "QUICK BLOCK". Healing is more potent when you are charged as well.',
  "unlocked-charge"
);

Area_Aorta.UnlockStun = Area.getUnlockEvent(
  1,
  "STUN",
  'Concentrate the light that makes up your form into a burst, stunning an enemy. Every monster reacts to "STUN" differently, but it is almost always beneficial. The light within you once again comes to aid in your quest to defeat the scourge of existence known as the DARKNESS. Your powers are beginning to resurge in your physical form.',
  "unlocked-stun"
);

Area_Aorta.meetTroldiers = async function () {
  sound.stop();
  contentManager.clear();
  contentManager.add(
    $(
      '<div class="monster"><div class="troll-soldier"></div></div><div class="monster"><div class="troll-soldier"></div></div><div class="monster"><div class="troll-soldier"></div></div>'
    )
  );
  contentManager.approach();
  sound.playFX("troll-fanfare");
  await Helper.delay(2);

  await new Writer(bottomWriter, text.aorta.meetTroldiersText).writeAllAsync();
  Battle.start(
    "fight",
    [new Troldier(), new Troldier(), new Troldier()],
    false
  );
  await Battle.current.getPromise();
};

Area_Aorta.meetAmadeus = async function () {
  sound.pause();
  var $a = $('<div class="monster"></div>');
  var $b = $('<div id="amadeus"></div>');
  contentManager.add($a);
  $a.html($b);
  Amadeus.sprites.setSprite($b, 1, 1);
  await contentManager.approach();
  await Area.writeBottom(text.aorta.meetAmadeusText);
  await Area.transitionForLeavingCharacter();
  sound.unpause();
};

Area_Aorta.talkAmadeus = async function () {
  sound.pause();
  var $a = $('<div class="monster"></div>');
  var $b = $('<div id="amadeus"></div>');
  contentManager.add($a);
  $a.html($b);
  Amadeus.sprites.setSprite($b, 1, 1);
  await contentManager.approach();
  await Area.writeBottom(text.aorta.talkToAmadeusText);
  await Area.transitionForLeavingCharacter();
  sound.unpause();
};

Area_Aorta.fightAmadeus = async function () {
  changeBackground("bigDoor");
  sound.stop();
  contentManager.clear();
  var $a = $('<div class="monster"></div>');
  var $b = $('<div id="amadeus"></div>');
  contentManager.add($a);
  $a.html($b);
  Amadeus.sprites.setSprite($b, 1, 1);
  await contentManager.approachFromLeft();
  await Area.writeBottom(text.aorta.prefightAmadeusText);
  Battle.start("amadeus", new Amadeus(), false);
  await Battle.current.getPromise();
};

Area_Aorta.meetOscar = async function () {
  var $wrapper = $('<div class="monster"></div>');
  var $oscar = $(
    '<canvas style="height:80%;width:80%;left:10%;" id="oscar"></canvas>'
  );
  $oscar.appendTo($wrapper);
  contentManager.add($wrapper);

  var animHandle;
  var renderer = new SpriteRenderer($oscar[0], "./images/oscar.png", 32, 32);
  await new Promise((resolve) => {
    renderer.onload = () => {
      var fs = new SequenceGetter(
        [
          { x: 1, y: 0 },
          { x: 2, y: 0 },
        ],
        true
      );
      function animLoop() {
        let f = fs.get();
        renderer.setSprite(f.x, f.y);
      }
      animHandle = setInterval(animLoop, 480);
      setTimeout(resolve, 480);
    };
  });
  sound.playMusic("accordion", true);

  await contentManager.approach();
  clearInterval(animHandle);
  await Helper.delay(1);
  sound.pause();
  await Helper.delay(1);
  renderer.setSprite(0, 0);

  let textBlob = text.aorta.meetOscar;
  await new Writer(bottomWriter, textBlob.intro).writeAllAsync();
  bottomWriter.show(textBlob.choice.prompt);
  let chose = await getChoice(
    [textBlob.choice.yes.button, textBlob.choice.no.button],
    hcursor
  );
  if (chose == textBlob.choice.yes.button) {
    await new Writer(bottomWriter, textBlob.choice.yes.result).writeAllAsync();
  } else {
    await new Writer(bottomWriter, textBlob.choice.no.result).writeAllAsync();
  }
  contentManager.clear();
};
