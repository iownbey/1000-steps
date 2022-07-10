
/** @type {?Doer} */
var currentDoer = null;
var ModeEnum = Object.freeze({ walking: 1, fighting: 2, talking: 3, dead: 4, final: 5, won: 6, intro: 7 });
var mode = ModeEnum.intro;

var player;

var lastCalled = null;
var introWriter = null;

// Singletons:
/** @type {SoundManager} */
var sound = new SoundManager();
var speechByte = sound.loadPersistant("speechByte");
var normalByte = sound.loadPersistant("normalByte");
var attackBlip = sound.loadPersistant("blip");
var errorBlip = sound.loadPersistant("errorBlip");
/** @type {ContentManager} */
var contentManager;

// To be defined later:
/** @type {Typewriter} */
var topWriter;
/** @type {Typewriter} */
var bottomWriter;

var sparkHandler;
var healthDisplay;

var healthPopIn;
var stepsPopIn;

var introDoer;
var cover;
var file;
var battleMenu;
var notifier;
var hcursor;
var vcursor;
var contentCanvas;

/** @type {Area} */
var area;

/** @const {string} */
/** This string will be substituted for a new line in all dialogue. */
const nl = '|';

var fullscreen = false;
function toggleFullscreen() {
	if (fullscreen) {
		fullscreen = false;
		document.exitFullscreen();
	}
	else {
		$("html")[0].requestFullscreen().then(function () {
			fullscreen = true;
		}).catch(function (err) {
			console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
		});
	}
}

/** Loads a script into the dom
 * @param {string} script - the script to load 
 * @returns {Promise} a promise representing the load task
*/
async function loadScript(script) {
	if (loadScript.allLoaded.includes(script)) return new Promise(res => res());
	loadScript.allLoaded.push(script);
	var element = document.createElement('script');
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
}

Math.getPercentage = function (numerator, dividend) {
	return (((numerator - 1) / (dividend - 1)) || 0) * 100
}

function changeBackground(newImage) {
	$("#back").attr("src", Helper.imageURL("Backgrounds/" + newImage));
}

function changeForeground(newImage) {
	if (newImage) {
		$("#fore").css("display", "block").attr("src", Helper.imageURL("Backgrounds/" + newImage));
	}
	else {
		$("#fore").css("display", "none").removeAttr("src");
	}
}

function playBackgroundMusic() {
	sound.playMusic(area.getBackgroundMusic());
}

Object.defineProperty(Array.prototype, "remove", {
	value: function remove(element) {
		return this.filter(function (el) { return !(el == this); }, element);
	},
	writable: true,
	configurable: true
});

function getRandom(array) {
	return array[Math.floor(Math.random() * array.length)];
}

async function walk() {
	if (!area.busy) {
		CSSAnimation.trigger(player.$jobj, "walk");
		var stepsLeft = file.get("Steps-Left");
		if (stepsLeft == 0) {
			SaveData.changeBackground("outside");
			topWriter.show("Congratulations! You saved the world!");
			return;
		}
		stepsLeft--;
		file.set("Steps-Left", stepsLeft);
		stepsPopIn.$jobj.html("STEPS<br/>" + stepsLeft);
		stepsPopIn.show(3000);
		await area.walk();
	}
}

function die() {
	sound.stop(false);
	Player.sprites.setSprite(player.$jobj, 3, 2);
	sound.playFX("die");
	setTimeout(function () {
		sound.playFX("deathFX");
		player.$jobj.fadeOut(500);
	}, 600);
}

var chargeAmount = 0;
function charge() {
	var onFlash;
	var onFinish;
	switch (chargeAmount) {
		case 0:
			{
				onFinish = function () { topWriter.show("You focus your light into a spark."); };
				onFlash = function () { sparkHandler.showSpark(); };
			}; break;
		case 1:
			{
				onFinish = function () { topWriter.show("You strengthen your spark into a flame."); };
				onFlash = function () { sparkHandler.showFlame(); };
			}; break;
		case 2:
			{
				onFinish = function () { topWriter.show("You fan the flame into a glorious light!"); };
				onFlash = function () { sparkHandler.showAura(); };
			}; break;
	}
	sound.playFX("charge" + (chargeAmount + 1));
	cover.flash("white", onFlash, onFinish, 250);
	chargeAmount++;
	lastCalled = charge;
}

async function attack(monster) {
	lastCalled = attack;
	Player.sprites.animate(player.$jobj, Player.attackAnim, 25);
	CSSAnimation.trigger(monster.jobj, "shake");

	var damage = player.attack * (3 ** chargeAmount);
	const basephrase = "You hit " + monster.myName + " and deal " + damage + " damage.";

	if (await monster.hit(damage)) {
		sound.playFX("deathfx");
		var add = nl + "You killed " + monster.myName + ".";
		Battle.current.kill(monster);
		topWriter.show(basephrase + add);
	}
	else {
		sound.playFX("attack");
		topWriter.show(basephrase);
	}
}

function runAway(monsters) {
	lastCalled = runAway;
	topWriter.show("You run...");
	Battle.current.recede();
	Battle.current.queueAction(function () {
		Battle.current.approach();

		var total = monsters.length;
		var ranfrom = 0;
		var ranfromName = monsters[0].myName;
		monsters.forEach(function (monster) {
			if (monster.run()) {
				ranfrom++;
				Battle.current.kill(monster);
				ranfromName = monster.myName;
			}
		});

		if (total == 1) {
			if (ranfrom == 1) {
				topWriter.show("You escape the clutches of " + ranfromName + ".");
			}
			else {
				topWriter.show("You couldn't get away from " + ranfromName + "!");
			}
		}
		else {
			if (ranfrom == 1) {
				topWriter.show("You only escaped " + ranfromName + "...");
			}
			else if (ranfrom == total) {
				topWriter.show("You escaped everybody!");
			}
			else if (ranfrom > 1) {
				topWriter.show("You escaped some of the monsters...")
			}
			else {
				topWriter.show("You couldn't get away from anybody!")
			}
		}


		Battle.current.finishAction();
	});
}

const turnBias = 3; //the amount the move is reduced per turn if stale.
const minimum = 10; //the amount before turn bias is applied.
const randomBias = 5; //the amount of "extra" health you can randomly get.
var offset = 0;
function heal() {
	if (lastCalled == heal) {
		offset--;
	}
	else {
		offset = 0;
	}
	lastCalled = heal;

	var amount = ((offset * turnBias) + minimum + Math.randomInt(0, randomBias)) * (chargeAmount + 1);
	if (amount < 0) amount = 0;
	player.changeHealth(amount);

	if (amount == 0) {
		topWriter.show("You have exhausted your healing power. Do something else!");
		return;
	}
	else {
		topWriter.show("You healed for " + amount + " health.");
		return;
	}
}

function magics(monster) {
	lastCalled = magics;
	sound.playFX("magic");
	topWriter.show(monster.magic());
}

function defend() {
	if (lastCalled == defend) {
		topWriter.show("You could not defend again.");
		return;
	}
	lastCalled = (chargeAmount) ? charge : defend;
	if (chargeAmount > 0) {
		chargeAmount--;
		topWriter.show("You brace for the next attack.|You can brace again!");
	}
	else {
		topWriter.show("You brace for the next attack.");
	}

	player.defending = true;
	Player.sprites.setSprite(player.$jobj, 2, 2);
}

function talk(monster) {
	lastCalled = talk;
	var response = monster.talk();
	topWriter.show("You attempt to communicate with " + monster.myName + ".");
	if ((typeof response) == "string") {
		Battle.current.queueAction(function () {
			topWriter.show(response);
			Battle.current.finishAction();
		});
	}
	else if (Array.isArray(response)) {
		var w = new Writer(topWriter, response);
		Battle.current.queueAction(function () {
			w.write();
			if (w.complete) Battle.current.finishAction();
		});
	}
	else {
		Battle.current.queueAction(function () {
			console.log("Doer doing");
			response.do();
			if (response.complete) Battle.current.finishAction();
		});
	}
}

function inspect(monster) {
	lastCalled = inspect;
	level = file.get("Inspect-Level", 0);

	var w2 = new Writer(bottomWriter, monster.inspect())
	var doit2 = function () {
		w2.write();
		if (w2.complete) Battle.current.finishAction();
	}

	switch (level) {
		case 2:
		case 0:
			{
				Battle.current.queueAction(doit2);
			}; break;

		case 1:
			{
				var w = new Writer(bottomWriter, text.other.aboutInspect);
				var doit = function () {
					w.write();
					if (w.complete) {
						file.set("Inspect-Level", 2);
						Battle.current.changeAction(doit2);
					}
				}
				Battle.current.queueAction(doit);
			}; break;
	}
}

function getGameMenu(callbacks, names, cursor) {
	var $buttons = [[$("#b1"), $("#b2"), $("#b3")], [$("#b4"), $("#b5"), $("#b6")]];
	var buttons = [];

	$buttons.forEach(function (element) { element.forEach(function (jobj) { jobj.css("display", "none"); jobj.text(""); }) });

	callbacks.forEach(function (element, i) {
		var x = i;
		var column = []
		element.forEach(function (element, i) {
			var y = i;

			var $button = $buttons[x][y];
			var name = names[x][y];
			var callback = callbacks[x][y];
			$button.css("display", "block");
			$button.text(name);
			column.push(new MenuButton($button, callback))
		});
		buttons.push(column);
	});

	var updateText = function (menu) {
		var buttons = menu.buttons;
		buttons.forEach(function (element, i) {
			var x = i;
			var column = []
			element.forEach(function (element, i) {
				var y = i;

				var $button = buttons[x][y].jobj();
				$button.text(names[x][y]);
			});
		});
	}

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
			}
			x++;
			if (x == 2) {
				x = 0;
				y++;
			}
		});

		menu = getGameMenu(callbacks, text, cursor);

		doc.on("keydown.choiceInput", (e) => { menu.handleInput(e) });
		menu.setDisplay(true);
	});

	bottomWriter.clear();
	doc.off("keydown.choiceInput");
	return selected;
}

async function shiftKeys(event) {
	switch (event.key) {
		case "S": /*file.save();*/ break;
		case "L": /*file.load();*/ break;
		case "F": toggleFullscreen(); break;
		case "N": {
			file.set("IntroComplete", true);
			StartMainGame();
			await loadScript("monsters/darkness.js");
			Battle.current = new Battle("darkness-fight", [new Darkness()], false);
		}; break;
	}
}

function introInput(event) {
	introDoer.do();
}

function handleInput(event) {
	if (event.ctrlKey || event.altKey || event.key == "AudioVolumeUp" || event.key == "AudioVolumeDown" || event.key == "AudioVolumeMute") {

	}
	else if (event.shiftKey === true) {
		shiftKeys(event);
	}
	else if ((event.key == "Backspace") || (event.repeat != true)) {
		if (mode == ModeEnum.intro) {
			introInput(event);
		}
		else if (mode == ModeEnum.fighting) {
			Battle.current.handleInput(event);
		}
		else if (currentDoer != null) {
			currentDoer.do();
			if (currentDoer.complete) currentDoer = null;
		}
		else if (mode == ModeEnum.walking) {
			if (event.key == " " || event.key == "Backspace" || event.key == "Left Mouse Button") {
				walk();
			}
		}
		else if ((mode == ModeEnum.dead) || (mode == ModeEnum.won)) {

		}
	}
}

function handleClick(event) {
	switch (event.which) {
		case 1:
			{
				event.key = "Left Mouse Button"
				handleInput(event);
			}; break;
		case 2:
			{
				event.key = "Middle Mouse Button"
				handleInput(event);
			}; break;
		case 3:
			{
				event.key = "Right Mouse Button"
				handleInput(event);
			}; break;
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

function StartMainGame() {

	mode = ModeEnum.walking;
	area.onStart();
	//sound.playMusic("back");
	setCurrentScope($("#main"));
}

var doc = $(document);

function initIntro() {
	var firstWriter = new Writer(new Typewriter($("#introoutput"), 50).setTextClass("introText"), text.intro.emerySpeak);
	firstWriter.write();
	var secondWriter = new Writer(new Typewriter($("#introoutput"), 50), text.intro.darknessIntroText);
	var wakeWriter = new Writer(new Typewriter($("#i2_output"), 50), text.intro.wakeIntroText);

	var sitting = $("#i2_playerSitting");
	var standing = $("#i2_playerStanding");
	var walking = $("i2_playerWalking");
	var sword = $("#i2_sword");
	var shield = $("#i2_shield");
	var initgroup = $().add(sitting).add(sword).add(shield);
	standing.css("visibility", "hidden");
	initgroup.css("visibility", "hidden");
	var pickUp = function (jobj) {
		return new Doer([
			{ action: function () { wakeWriter.clear(); }, time: 2000, waitForInput: false },
			{ action: function () { jobj.css("visibility", "hidden") }, time: 2000, waitForInput: false },
			wakeWriter.getOnceThing(),
			wakeWriter.getOnceThing(),
		]).getThing();
	}

	var InitCut = function () {
		setCurrentScope($("#intro2"));
		standing.css("visibility", "hidden");
		walking.css("visibility", "hidden");
		initgroup.css("visibility", "hidden");
	}

	introDoer = new Doer([
		{ action: function () { firstWriter.write(); sound.playMusic("ambientNoise"); } },
		firstWriter.getThing(),

		{ action: function () { firstWriter.clear(); }, time: 3000, waitForInput: false },
		secondWriter.getThing(),

		{ action: function () { cover.flash("black", function () { InitCut(); }, null, 3000); }, time: 5000, waitForInput: false },
		{ action: function () { cover.flash("white", function () { initgroup.css("visibility", "visible"); }, function () { wakeWriter.write(); }, 300); }, time: 600, waitForInput: true },
		{ action: function () { wakeWriter.clear(); sitting.css("visibility", "hidden"); standing.css("visibility", "visible") }, time: 2000, waitForInput: false },
		wakeWriter.getOnceThing(),
		wakeWriter.getOnceThing(),
		wakeWriter.getOnceThing(),
		pickUp(sword),
		pickUp(shield),
		wakeWriter.getThing(),
		{ action: function () { walking.css("visibility", "visible") }, waitForInput: false },
		{ action: function () { walking.css("visibility", "hidden") }, waitForInput: false, time: 400 },
		{ action: function () { file.set("IntroComplete", true); cover.flash("black", StartMainGame); } }
	]);
}

/*function initSave() {
	area = file.get("area", new Area_Aorta());
	var events = file.get("events", null);
	if (events !== null) area.events = events;
	file.beforeSave = function () {
		if (area.currentEvent != null) {
			file.set("Steps-Left", file.get("Steps-Left") + 1);
			file.set("events", [area.currentEvent].concat(area.events));
		}
		else {
			file.set("events", area.events);
		}
	}
}*/

function init$() {
	faceHandler.init($("#face1").add("#face2"), new SpriteSheet("Images/faces.png", 16, 16));

	contentManager = new ContentManager($("#content"));
	player = new Player($("#character"), 50, 5);
	notifier = new Notifier();
	file = new SaveData(notifier);
	hcursor = new Cursor($("#hcursor"), { x: -32, y: 0 });
	vcursor = new Cursor($("#vcursor"), { x: 0, y: -32 });
	cover = new ScreenCover($("#cover"));

	sparkHandler = new SparkHandler(player.$jobj.find("#spark"), player.$jobj.find("#flame"), player.$jobj.find("#aura"));

	topWriter = new DialogueTypewriter(new Typewriter($("#output1"), 20, 500), $("#dialogueBox1"), faceHandler, speechByte, normalByte);
	bottomWriter = new DialogueTypewriter(new Typewriter($("#output2"), 20, 500), $("#dialogueBox2"), faceHandler, speechByte, normalByte);
	DialogueTypewriter.clearAll();

	contentCanvas = $("#content-canvas")[0];

	$("#endflavor").text(getRandom(text.other.gameOverFlavorText));
	Player.sprites.setSprite($("#gameover_player"), 1, 8);

	let $health = $("#health-pop-in");
	let $steps = $("#steps-pop-in");
	
	fetch("https://api.github.com/repos/iownbey/1000-steps/commits?sha=main&per_page=1").then(resp => resp.json())
	.then((resp) => {
		let commit = resp[0].commit;
		let $info = $("#information");
		$info.html(
`-1000 Steps-
Shift+F to toggle fullscreen.
Last Commit on ${new Date(commit.author.date).toDateString()} by ${commit.author.name}: ${commit.message}`
);
		$info.css("opacity","1");
		setTimeout(()=>{$info.css("transition","default")},2000);
	})

	healthPopIn = new PopIn($health);
	healthPopIn.setAnchor("top", "0vh");
	healthPopIn.addActiveAnchor("left");
	healthDisplay = new HealthDisplay(healthPopIn);
	healthPopIn.$jobj.html("HP:<br/>" + player.health + "/" + player.maxHealth);

	stepsPopIn = new PopIn($steps);
	stepsPopIn.setAnchor("top", "0vh");
	stepsPopIn.addActiveAnchor("right");
	stepsPopIn.$jobj.html("STEPS:<br/>" + file.get("Steps-Left", 1000));
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

	//initSave();

	initIntro();

	setCurrentScope($("#intro1"));
	if (file.get("IntroComplete") === true) StartMainGame();
});