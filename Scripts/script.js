
var currentDoer = null;
var ModeEnum = Object.freeze({walking:1,fighting:2,talking:3,dead:4,final:5,won:6,intro:7});
var mode = ModeEnum.intro;

var player;

var lastCalled = null;
var introWriter = null;

// Singletons:
var sound = new SoundManager();
var speechByte = sound.loadPersistant("speechByte");
var normalByte = sound.loadPersistant("normalByte");
var contentManager;

// To be defined later:
var topWriter;
var bottomWriter;

var sparkHandler;
var healthDisplay;

var introDoer;
var cover;
var file;
var battleMenu;
var notifier;
var hcursor;
var vcursor;

var area;

const nl = '|';

var fullscreen = false;
function toggleFullscreen()
{
	if (fullscreen)
	{
		fullscreen = false;
		document.exitFullscreen();
	}
	else
	{
		$("html")[0].requestFullscreen().then(function() 
		{ 
			fullscreen = true;
		}).catch(function(err) 
		{ 
			console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
		});
	}
}

Math.randomInt = function(min, max) 
{
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

Math.getPercentage = function(numerator,dividend)
{
	return (((numerator-1)/(dividend-1)) || 0) * 100
}

function changeBackground(newImage)
{
	$("#back").attr("src",Helper.imageURL("Backgrounds/" + newImage));
}

function changeForeground(newImage)
{
	if (newImage)
	{
		$("#fore").css("display","block").attr("src",Helper.imageURL("Backgrounds/" + newImage));
	}
	else
	{
		$("#fore").css("display","none").removeAttr("src");
	}
}

function playBackgroundMusic()
{
	sound.playMusic(area.getBackgroundMusic());
}

Object.defineProperty(Array.prototype, "remove", {
	value: function remove(element) {
		return this.filter(function(el) {return !( el == this);},element);
	},
	writable: true,
	configurable: true
});

function getRandom(array)
{
	return array[Math.floor(Math.random() * array.length)];
}

var talismanPicker = new NonrepeatingGetter([1,2,3]);
function walk()
{
	CSSAnimation.trigger(player.$jobj,"walk");
	var stepsLeft = file.get("Steps-Left");
	if (stepsLeft == 0)
	{
		SaveData.changeBackground("outside");
		topWriter.show("Congratulations! You saved the world!");
		return;
	}
	stepsLeft--;
	file.set("Steps-Left",stepsLeft);
	$("#stepsoutput").text(stepsLeft);

	area.walk();
}

function die()
{
	sound.stop(false);
	Player.sprites.setSprite(player.$jobj,3,2);
	sound.playFX("die");
	setTimeout(function () {
		sound.playFX("deathFX");
		player.$jobj.fadeOut(500);
	},600);
}

function oldwalk()
{
	switch(talismanPicker.get())
	{
		case 1:
		{
			player.attack+=2;
			topWriter.show("You found a magic attack talisman that increased your attack power by 2.");
		}; break;

		case 2:
		{
			player.maxHealth+=10;
			player.health+=10;
			$("#healthoutput").text(playerHealth + "/" + playerMaxHealth);
			topWriter.show("You found a magic defense talisman that increased your maximum health by 10.");
		}; break;

		case 3:
		{
			stepsLeft-=10;
			if (stepsLeft < 1) stepsLeft = 1;
			$("#stepsoutput").text(stepsLeft);
			topWriter.show("You found a magic lurching talisman that lurched you forward in time.");
		}; break;
	}
}

var chargeAmount = 0;
function charge()
{
	var onFlash;
	var onFinish;
	switch(chargeAmount)
	{
		case 0: 
		{
			onFinish = function () {topWriter.show("You focus your light into an spark.");};
			onFlash  = function () {sparkHandler.showSpark();};
		}; break;
		case 1: 
		{
			onFinish = function () {topWriter.show("You strengthen your spark into a flame.");};
			onFlash  = function () {sparkHandler.showFlame();};
		}; break;
		case 2: 
		{
			onFinish = function () {topWriter.show("You fan the flame into a glorious light!");};
			onFlash  = function () {sparkHandler.showAura();};
		}; break;
	}
	sound.playFX("charge" + (chargeAmount + 1));
	cover.flash("white",onFlash,onFinish,250);
	chargeAmount++;
	lastCalled = charge;
}

function attack(monster)
{
	lastCalled = attack;
	Player.sprites.animate(player.$jobj,Player.attackAnim,25);
	CSSAnimation.trigger(monster.jobj,"shake");
	
	var damage = player.attack * (3 ** chargeAmount);
	const basephrase = "You hit " + monster.myName + " and deal " + damage + " damage.";

	if (monster.hit(damage))
	{
		sound.playFX("deathfx");
		var add = nl + "You killed " + monster.myName + ".";
		currentBattle.kill(monster);
		topWriter.show(basephrase + add);
	}
	else
	{
		sound.playFX("attack");
		topWriter.show(basephrase);
	}    
}

function runAway(monsters)
{
	lastCalled = runAway;
	topWriter.show("You run...");
	currentBattle.recede();
	currentBattle.queueAction(function() 
	{  
		currentBattle.approach();

		var total = monsters.length;
		var ranfrom = 0;
		var ranfromName = monsters[0].myName;
		monsters.forEach(function(monster) 
		{
			if (monster.run())
			{
				ranfrom++;
				currentBattle.kill(monster);
				ranfromName = monster.myName;
			}
		});

		if (total == 1)
		{
			if (ranfrom == 1)
			{
				topWriter.show("You escape the clutches of " + ranfromName + ".");
			}
			else
			{
				topWriter.show("You couldn't get away from " + ranfromName + "!");
			}
		}
		else
		{
			if (ranfrom == 1)
			{
				topWriter.show("You only escaped " + ranfromName + "...");
			}
			else if (ranfrom == total)
			{
				topWriter.show("You escaped everybody!");
			}
			else if (ranfrom > 1)
			{
				topWriter.show("You escaped some of the monsters...")
			}
			else
			{
				topWriter.show("You couldn't get away from anybody!")
			}
		}


		currentBattle.finishAction();
	});
}

const turnBias = 3; //the amount the move is reduced per turn if stale.
const minimum = 10; //the amount before turn bias is applied.
const randomBias = 5; //the amount of "extra" health you can randomly get.
var offset = 0;
function heal ()
{
	if (lastCalled == heal)
	{
		offset--;
	}
	else
	{
		offset = 0;
	}
	lastCalled = heal;

	var amount = ((offset * turnBias) + minimum + Math.randomInt(0,randomBias)) * (chargeAmount + 1);
	if (amount < 0) amount = 0;
	player.changeHealth(amount);

	if (amount == 0)
	{
		topWriter.show("You have exhausted your healing power. Do something else!");
		return;
	}
	else
	{
		topWriter.show("You healed for " + amount + " health.");
		return;
	}
}

function magics (monster)
{
	lastCalled = magics;
	sound.playFX("magic");
	topWriter.show(monster.magic());
}

function defend ()
{
	if (lastCalled == defend)
	{
		topWriter.show("You could not defend again.");
		return;
	}
	lastCalled = (chargeAmount)? charge : defend;
	if (chargeAmount > 0)
	{
		chargeAmount--;
		topWriter.show("You brace for the next attack.|You can brace again!");  
	}
	else
	{
		topWriter.show("You brace for the next attack.");
	}

	player.defending = true;
	Player.sprites.setSprite(player.$jobj,2,2);
}

function talk(monster)
{
	lastCalled = talk;
	var response = monster.talk();
	topWriter.show("You attempt to communicate with " + monster.myName + ".");
	if ((typeof response) == "string")
	{
		currentBattle.queueAction(function()
		{
			topWriter.show(response);
			currentBattle.finishAction();
		});
	}
	else if (Array.isArray(response))
	{
		var w = new Writer(topWriter,response);
		currentBattle.queueAction(function() 
		{  
			w.write();
			if (w.complete) currentBattle.finishAction();
		});
	}
	else
	{
		currentBattle.queueAction(function() 
		{  
			console.log("Doer doing");
			response.do();
			if (response.complete) currentBattle.finishAction();
		});
	}
}

function inspect(monster)
{
	lastCalled = inspect;
	level = file.get("Inspect-Level",0);

	var w2 = new Writer(bottomWriter,monster.inspect())
	var doit2 = function() 
	{
		w2.write();
		if (w2.complete) currentBattle.finishAction();
	}

	switch(level)
	{
		case 2:
		case 0:
		{
			currentBattle.queueAction(doit2);
		}; break;

		case 1:
		{
			var w = new Writer(bottomWriter,text.emery.aboutInspect);
			var doit = function() 
			{  
				w.write();
				if (w.complete) 
				{
					file.set("Inspect-Level",2);
					currentBattle.changeAction(doit2);
				}
			}
			currentBattle.queueAction(doit);
		}; break;
	}
}

function getGameMenu(callbacks,names,cursor)
{
	var $buttons = [[$("#b1"),$("#b2"),$("#b3")],[$("#b4"),$("#b5"),$("#b6")]];
	var buttons = [];

	$buttons.forEach(function (element) {element.forEach(function (jobj) {jobj.css("display","none"); jobj.text("");})});

	callbacks.forEach(function (element,i)
	{
		var x = i;
		var column = []
		element.forEach(function (element,i)
		{
			var y = i;

			var $button = $buttons[x][y];
			var name = names[x][y];
			var callback = callbacks[x][y];
			$button.css("display","block");
			$button.text(name);
			column.push(new MenuButton($button,callback))
		});
		buttons.push(column);
	});

	var updateText = function(menu)
	{
		var buttons = menu.buttons;
		buttons.forEach(function (element,i)
		{
			var x = i;
			var column = []
			element.forEach(function (element,i)
			{
				var y = i;

				var $button = buttons[x][y].jobj();
				$button.text(names[x][y]);
			});
		});
	}

	var menu = new Menu(buttons,cursor);
	menu.onactivated = updateText;
	return menu;
}

function shiftKeys(event)
{
	switch (event.key)
	{
		case "S": file.save(); break;
		case "L": file.load(); break;
		case "F": toggleFullscreen(); break;
		case "N": 
		file.set("IntroComplete",true);
		StartMainGame(); 
		break;
	}
}

function introInput(event)
{
	introDoer.do();
}

function handleInput(event)
{
	if (event.ctrlKey || event.altKey || event.key=="AudioVolumeUp" || event.key=="AudioVolumeDown" || event.key=="AudioVolumeMute")
	{

	}
	else if (event.shiftKey === true)
	{
		shiftKeys(event);
	}
	else if ((event.key == "Backspace") || (event.repeat != true))
	{
		if (mode == ModeEnum.intro)
		{
			introInput(event);
		}
		else if (mode == ModeEnum.fighting)
		{
			currentBattle.handleInput(event);
		}
		else if (currentDoer != null)
		{
			currentDoer.do();
			if (currentDoer.complete) currentDoer = null;
		}
		else if (mode == ModeEnum.walking)
		{
			if (event.key==" " || event.key=="Backspace" || event.key=="Left Mouse Button")
			{     
				walk();
			}
		}
		else if ((mode == ModeEnum.dead) || (mode == ModeEnum.won)) 
		{

		}
	}
}

function handleClick(event)
{
	switch (event.which)
	{
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

function setCurrentScope(jobj)
{
	if (this.last != undefined)
	{
		this.last.css("visibility","hidden");
		this.last.find("*").css("visibility","hidden");
	}
	jobj.css("visibility","visible");
	jobj.find("*").css("visibility","visible");
	this.last = jobj;
}

function StartMainGame()
{

	mode = ModeEnum.walking;
	area.onStart();
	//sound.playMusic("back");
	setCurrentScope($("#main"));
}

var doc = $(document);

function initIntro()
{
	var firstWriter = new Writer(new Typewriter($("#introoutput"),50).setTextClass("introText"),text.emery.introText);
	firstWriter.write();
	var secondWriter = new Writer(new Typewriter($("#introoutput"),50),text.darknessIntroText);
	var wakeWriter   = new Writer(new Typewriter($("#i2_output")  ,50),text.wakeIntroText);

	var sitting = $("#i2_playerSitting");
	var standing = $("#i2_playerStanding");
	var walking = $("i2_playerWalking");
	var sword = $("#i2_sword");
	var shield = $("#i2_shield");
	var initgroup = $().add(sitting).add(sword).add(shield);
	standing.css("visibility","hidden");
	initgroup.css("visibility","hidden");
	var pickUp = function(jobj)
	{
		return new Doer([
			{action: function() {wakeWriter.clear();},time:2000,waitForInput:false},
			{action: function() {jobj.css("visibility","hidden")},time:2000,waitForInput:false},
			wakeWriter.getOnceThing(),
			wakeWriter.getOnceThing(),
			]).getThing();
	}

	var InitCut = function()
	{
		setCurrentScope($("#intro2"));
		standing.css("visibility","hidden");
		walking.css("visibility","hidden");
		initgroup.css("visibility","hidden");
	}

	introDoer = new Doer([
		{action: function () {firstWriter.write(); sound.playMusic("ambientNoise");}},
		firstWriter.getThing(),

		{action: function () {firstWriter.clear();}, time: 3000, waitForInput:false},
		secondWriter.getThing(),

		{action: function () {cover.flash("black",function() {InitCut();},null,3000);},time:5000,waitForInput:false},
		{action: function () {cover.flash("white",function() {initgroup.css("visibility","visible");},function() {wakeWriter.write();},300);},time:600,waitForInput:true},      
		{action: function() {wakeWriter.clear(); sitting.css("visibility","hidden"); standing.css("visibility","visible")},time:2000,waitForInput:false},
		wakeWriter.getOnceThing(),
		wakeWriter.getOnceThing(),
		wakeWriter.getOnceThing(),
		pickUp(sword),
		pickUp(shield),
		wakeWriter.getThing(),
		{action: function () {walking.css("visibility","visible")}, waitForInput:false},
		{action: function () {walking.css("visibility","hidden")}, waitForInput:false, time:400},
		{action: function () {file.set("IntroComplete",true); cover.flash("black",StartMainGame);}}
		]);
}

function initSave()
{
	area = new Area_Aorta();
	var events = file.get("events", null);
	if (events !== null) area.events = events;
	file.onSave = function ()
	{
		if (area.currentEvent != null)
		{
			file.set("Steps-Left",file.get("Steps-Left")+1);
			file.set("events", [area.currentEvent].concat(area.events));
		}
		else
		{
			file.set("events", area.events);
		}
	}
}

function init$()
{
	faceHandler.init($("#face1").add("#face2"), new SpriteSheet("Images/faces.png",16,16));

	contentManager 	= new ContentManager($("#content"));
	player 			= new Player($("#character"),50,5);
	notifier    	= new Notifier();
	file        	= new SaveData(notifier);
	hcursor     	= new Cursor($("#hcursor"),{x:-32,y:0  });
	vcursor     	= new Cursor($("#vcursor"),{x:0  ,y:-32});
	cover       	= new ScreenCover($("#cover"));

	sparkHandler = new SparkHandler(player.$jobj.find("#spark"), player.$jobj.find("#flame"), player.$jobj.find("#aura"));

	topWriter         = new DialogueTypewriter(new Typewriter($("#output1"),20,500) ,$("#dialogueBox1"),faceHandler,speechByte,normalByte);
	bottomWriter      = new DialogueTypewriter(new Typewriter($("#output2"),20,500) ,$("#dialogueBox2"),faceHandler,speechByte,normalByte);
	DialogueTypewriter.clearAll();

	$("#endflavor").text(getRandom(text.gameOverFlavorText));
	Player.sprites.setSprite($("#gameover_player"),1,8);

	healthDisplay = new HealthDisplay($("#healthoutput"));
	$("#healthoutput").text(player.health + "/" + player.maxHealth);
	$("#stepsoutput").text(file.get("Steps-Left",1000));
}

doc.ready(function()
{
	doc.keydown(handleInput);
	doc.click(handleClick);

	init$();
	
	initSave();

	initIntro();

	setCurrentScope($("#intro1"));
	if (file.get("IntroComplete") === true) StartMainGame();
});