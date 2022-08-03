var ModeEnum = Object.freeze({
  walking: 1,
  fighting: 2,
  talking: 3,
  dead: 4,
  final: 5,
  won: 6,
  intro: 7,
});
var mode = null;

var player;

var lastCalled = null;

// Singletons:
/** @type {SoundManager} */
var sound = new SoundManager();
var fx = {};
fx.speechByte = sound.loadPersistant("speechByte");
fx.normalByte = sound.loadPersistant("normalByte");
fx.attack = sound.loadPersistant("blip");
fx.errorBlip = sound.loadPersistant("errorBlip");
fx.footstep = sound.loadPersistant("footstep");
/** @type {ContentManager} */
var contentManager;

// To be defined later:
/** @type {Typewriter} */
var topWriter;
/** @type {Typewriter} */
var bottomWriter;

var sparkHandler;
var healthDisplay;

/** @type {InfoWindow} */
var infoWindow;

/** @type {PopIn} */
var healthPopIn;
/** @type {PopIn} */
var stepsPopIn;

/** @type {ScreenCover} */
var cover;
/** @type {SaveData} */
var file;
var battleMenu;
var notifier;
var hcursor;
var vcursor;
var contentCanvas;

var stepsLeft = 1000;

/** @type {Area} */
var area;

/** @const {string} */
/** This string will be substituted for a new line in all dialogue. */
const nl = "|";

var fullscreen = false;
function toggleFullscreen() {
  if (fullscreen) {
    fullscreen = false;
    document.exitFullscreen();
  } else {
    $("html")[0]
      .requestFullscreen()
      .then(function () {
        fullscreen = true;
      })
      .catch(function (err) {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
        );
      });
  }
}

/** Loads a script into the dom
 * @param {string} script - the script to load
 * @returns {Promise} a promise representing the load task
 */
async function loadScript(script) {
  if (loadScript.allLoaded.includes(script)) return new Promise((res) => res());
  loadScript.allLoaded.push(script);
  var element = document.createElement("script");
  var promise = new Promise((res) => {
    element.onload = res;
  });
  element.src = `scripts/${script}`;
  document.head.appendChild(element);
  return promise;
}
loadScript.allLoaded = [];

Math.randomInt = function (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
};

Math.getPercentage = function (numerator, dividend) {
  return ((numerator - 1) / (dividend - 1) || 0) * 100;
};

Object.defineProperty(Array.prototype, "remove", {
  value: function remove(element) {
    return this.filter(function (el) {
      return !(el == this);
    }, element);
  },
  writable: true,
  configurable: true,
});

function changeBackground(newImage) {
  $("#back").attr("src", Helper.imageURL("backgrounds/" + newImage));
}

function changeForeground(newImage) {
  if (newImage) {
    $("#fore")
      .css("display", "block")
      .attr("src", Helper.imageURL("backgrounds/" + newImage));
  } else {
    $("#fore").css("display", "none").removeAttr("src");
  }
}

function playBackgroundMusic() {
  sound.playMusic(area.getBackgroundMusic());
}

function getRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function walk() {
  if (!area.busy) {
    CSSAnimationController.trigger(player.$jobj, "walk");
    stepsLeft--;
    sound.playPersistant(fx.footstep);
    Player.sprites.setSprite(player.$jobj, 4, 2);
    contentManager.clear();
    DialogueTypewriter.clearAll();
    stepsPopIn.$jobj.html("STEPS<br/>" + stepsLeft);
    stepsPopIn.show(3000);
    await area.walk();
  }
}

function getGameMenu(callbacks, names, cursor) {
  var $buttons = [
    [$("#b1"), $("#b2"), $("#b3")],
    [$("#b4"), $("#b5"), $("#b6")],
  ];
  var buttons = [];

  $buttons.forEach(function (element) {
    element.forEach(function (jobj) {
      jobj.css("display", "none");
      jobj.text("");
    });
  });

  callbacks.forEach(function (element, i) {
    var x = i;
    var column = [];
    element.forEach(function (element, i) {
      var y = i;

      var $button = $buttons[x][y];
      var name = names[x][y];
      var callback = callbacks[x][y];
      $button.css("display", "block");
      $button.text(name);
      column.push(new MenuButton($button, callback));
    });
    buttons.push(column);
  });

  var updateText = function (menu) {
    var buttons = menu.buttons;
    buttons.forEach(function (element, i) {
      var x = i;
      var column = [];
      element.forEach(function (element, i) {
        var y = i;

        var $button = buttons[x][y].jobj();
        $button.text(names[x][y]);
      });
    });
  };

  var menu = new Menu(buttons, cursor);
  menu.onactivated = updateText;
  return menu;
}

async function getChoice(options, cursor) {
  var selected = await new Promise((resolve) => {
    var text = [[], []];
    var callbacks = [[], []];

    var x = 0;
    var y = 0;
    var menu;
    options.forEach((option) => {
      text[x][y] = option;
      callbacks[x][y] = () => {
        resolve(option);
        menu.setDisplay(false);
      };
      x++;
      if (x == 2) {
        x = 0;
        y++;
      }
    });

    menu = getGameMenu(callbacks, text, cursor);

    doc.on("keydown.choiceInput", (e) => {
      menu.handleInput(e);
    });
    menu.setDisplay(true);
  });

  bottomWriter.clear();
  doc.off("keydown.choiceInput");
  return selected;
}

async function shiftKeys(event) {
  switch (event.key) {
    case "S":
      file.save();
      break;
    case "L":
      file.quickLoad();
      break; //quick load
    case "F":
      toggleFullscreen();
      break;
    case "N":
      {
        file.setFlag("IntroComplete");
        MainMenu.removeEventListeners();
        StartMainGame();
        //await loadScript("monsters/darkness.js");
        //Battle.start("darkness-fight", [new Darkness()], false);
      }
      break;
  }
}

function handleInput(event) {
  if (
    event.ctrlKey ||
    event.altKey ||
    event.key == "AudioVolumeUp" ||
    event.key == "AudioVolumeDown" ||
    event.key == "AudioVolumeMute"
  ) {
  } else if (event.shiftKey === true) {
    shiftKeys(event);
  } else if (event.key == "Backspace" || event.repeat != true) {
    if (mode == ModeEnum.fighting) {
      Battle.current.handleInput(event);
    } else if (mode == ModeEnum.walking) {
      if (
        event.key == " " ||
        event.key == "Backspace" ||
        event.key == "Left Mouse Button"
      ) {
        walk();
      }
    } else if (mode == ModeEnum.dead || mode == ModeEnum.won) {
    }
  }
}

function handleClick(event) {
  switch (event.which) {
    case 1:
      {
        event.key = "Left Mouse Button";
        handleInput(event);
      }
      break;
    case 2:
      {
        event.key = "Middle Mouse Button";
        handleInput(event);
      }
      break;
    case 3:
      {
        event.key = "Right Mouse Button";
        handleInput(event);
      }
      break;
  }
}

function handleTap(event) {
  event.key = "Tap";
  handleInput(event);
}

function setCurrentScope(jobj) {
  if (this.last != undefined) {
    this.last.css("visibility", "hidden");
    this.last.find("*").css("visibility", "hidden");
  }
  jobj.css("visibility", "visible");
  jobj.find("*").css("visibility", "visible");
  this.last = jobj;
}

async function StartMainGame() {
  mode = ModeEnum.walking;
  area = await Area.load("Area_Aorta");
  area.onStart();
  setCurrentScope($("#main"));
}

var doc = $(document);

async function startIntro() {
  var firstWriter = new Writer(
    new Typewriter($("#introoutput"), 50).setTextClass("introText"),
    text.intro.emerySpeak
  );
  firstWriter.write();
  var secondWriter = new Writer(
    new Typewriter($("#introoutput"), 50),
    text.intro.darknessIntroText
  );
  var wakeWriter = new Writer(
    new Typewriter($("#i2_output"), 50),
    text.intro.wakeIntroText
  );

  var sitting = $("#i2_playerSitting");
  var standing = $("#i2_playerStanding");
  var walking = $("i2_playerWalking");
  var sword = $("#i2_sword");
  var shield = $("#i2_shield");
  var initgroup = $().add(sitting).add(sword).add(shield);
  standing.css("visibility", "hidden");
  initgroup.css("visibility", "hidden");

  var pickUp = async function (jobj) {
    wakeWriter.clear();
    await Helper.delay(1000);
    jobj.css("visibility", "hidden");
    await Helper.delay(1000);
    await wakeWriter.writeOnceAsync();
    await wakeWriter.writeOnceAsync();
  };

  var InitCut = function () {
    setCurrentScope($("#intro2"));
    standing.css("visibility", "hidden");
    walking.css("visibility", "hidden");
    initgroup.css("visibility", "hidden");
  };

  setCurrentScope($("#intro1"));
  sound.playMusic("ambientNoise");

  await firstWriter.writeAllAsync();
  firstWriter.clear();
  await Helper.delay(3000);
  await secondWriter.writeAllAsync();

  cover.color = "black";
  await cover.fadeTo(1, 1500);
  InitCut();
  await cover.fadeTo(0, 1500);
  await Helper.delay(2000);

  cover.color = "white";
  await cover.fadeTo(1, 150);
  initgroup.css("visibility", "visible");
  await cover.fadeTo(0, 150);

  await wakeWriter.writeOnceAsync();
  wakeWriter.clear();

  sitting.css("visibility", "hidden");
  standing.css("visibility", "visible");
  await Helper.delay(2000);

  await wakeWriter.writeOnceAsync();
  await wakeWriter.writeOnceAsync();
  await wakeWriter.writeOnceAsync();

  await pickUp(sword);
  await pickUp(shield);

  await wakeWriter.writeOnceAsync();

  walking.css("visibility", "visible");
  await Helper.delay(400);

  walking.css("visibility", "hidden");
  await Helper.delay(400);

  file.setFlag("IntroComplete");
  cover.color = "black";
  await cover.fadeTo(1, 2000);
  await StartMainGame();
  await cover.fadeTo(0, 2000);
}

async function loadGame() {
  console.log("Loading game");
  area_name = file.get("current-area", "Area_Aorta");
  offset = file.get("area-offset", 0);
  stepsLeft = Area.getStepsFromOffsetAndArea(area_name, offset);
  area = await Area.load(area_name);
  area.setOffset(offset);
  area.onStart();
  setCurrentScope($("#main"));
  mode = ModeEnum.walking;
}

function init$() {
  faceHandler.init(
    $("#face1").add("#face2"),
    new SpriteSheet("images/faces.png", 16, 16)
  );

  contentManager = new ContentManager($("#content"));
  player = new Player($("#character"), 50, 5);
  notifier = new Notifier();
  file = new SaveData(notifier);
  hcursor = new Cursor($("#hcursor"), { x: -32, y: 0 });
  vcursor = new Cursor($("#vcursor"), { x: 0, y: -32 });
  cover = new ScreenCover($("#cover"));
  cover.fadeTo(0, 1000);

  sparkHandler = new SparkHandler(
    player.$jobj.find("#spark"),
    player.$jobj.find("#flame"),
    player.$jobj.find("#aura")
  );

  topWriter = new DialogueTypewriter(
    new Typewriter($("#output1"), 20, 500),
    $("#dialogueBox1"),
    faceHandler,
    fx.speechByte,
    fx.normalByte
  );
  bottomWriter = new DialogueTypewriter(
    new Typewriter($("#output2"), 20, 500),
    $("#dialogueBox2"),
    faceHandler,
    fx.speechByte,
    fx.normalByte
  );
  DialogueTypewriter.clearAll();

  contentCanvas = $("#content-canvas")[0];

  $("#endflavor").text(getRandom(text.other.gameOverFlavorText));
  Player.sprites.setSprite($("#gameover_player"), 1, 8);

  let $health = $("#health-pop-in");
  let $steps = $("#steps-pop-in");

  fetch(
    "https://api.github.com/repos/iownbey/1000-steps/commits?sha=main&per_page=1"
  )
    .then((resp) => resp.json())
    .then((resp) => {
      let commit = resp[0].commit;
      let $info = $("#information");
      $info.html(
        `-1000 Steps-
Last Commit on ${new Date(commit.author.date).toDateString()} by ${
          commit.author.name
        }: ${commit.message}
Shift+F to toggle fullscreen // Shift+S to save // Shift+L to Quick-Load the most recent save.`
      );
      $info.css("opacity", "1");
      setTimeout(() => {
        $info.css("transition", "default");
      }, 2000);
    });

  healthPopIn = new PopIn($health);
  healthPopIn.setAnchor("top", "0vh");
  healthPopIn.addActiveAnchor("left");
  healthDisplay = new HealthDisplay(healthPopIn);
  healthPopIn.$jobj.html("HP:<br/>" + player.health + "/" + player.maxHealth);

  stepsPopIn = new PopIn($steps);
  stepsPopIn.setAnchor("top", "0vh");
  stepsPopIn.addActiveAnchor("right");
  stepsPopIn.$jobj.html("STEPS:<br/>" + stepsLeft);

  infoWindow = new InfoWindow($("#innerInfoWindowBox"));

  $("#main-heading").text(
    `${Area.getStepsFromOffsetAndArea(
      file.get("current-area", "Area_Aorta"),
      file.get("area-offset", 0)
    )} STEPS`
  );
}

doc.ready(function () {
  if (screen && screen.orientation && screen.orientation.lock) {
    screen.orientation.lock("landscape").then(
      () => console.log("Locked Orientation"),
      () => console.warn("Orientation lock failed")
    );
  }

  doc.keydown(handleInput);
  doc.on("pointerup", (e) => {
    handleClick(e);
    e.preventDefault();
  });
  doc.contextmenu((e) => e.preventDefault());

  init$();

  file.beforeSave = function () {
    file.set("area-offset", area.offset);
    file.set("current-area", area.constructor.name);
  };

  if (file.checkQuickLoad()) {
    loadGame();
  } else {
    setCurrentScope($("#main-menu"));
  }
});
