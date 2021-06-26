
const allMonsters = Object.freeze(["Troll","Sponge","IntrovertedGhost","Door","Decoy","Skeleton","Reaper"]);

class Area
{
	constructor(flavor,monsters,battleTheme = "fight")
	{
		this.stepsTaken = 0;
		this.flavor = new NonrepeatingGetter(flavor);
		this.battleTheme = battleTheme;
		this.events = this.getEvents();
		this.currentEvent = null;
		this.monsters = this.toInts(monsters);
		this.doer = null;
		console.log(this.monsters);
	}

	static addPossibleEvent(element)
	{
		return Area.possibleEvents.push(element) - 1;
	}

	getEvents()
	{
		return [];
	}

	getNextArea()
	{
		console.error("Area Engine has nowhere to go.");
		return {};
	}

	getBackgroundMusic()
	{
		return "back";
	}

	onEnd()
	{

	}

	onStart()
	{

	}

	toMonsters(ints)
	{
		var monsters = [];
		ints.forEach(function (element) {
			monsters.push(allMonsters[element]);
		});
		return monsters;
	}

	toInts(monsters)
	{
		var ints = [];
		monsters.forEach(function (element) {
			var i = allMonsters.indexOf(element);
			if (i != -1) ints.push(i);
		});
		return ints;
	}

	getRandomMonster()
	{
		var classes = this.toMonsters(this.monsters);
		var monster = null;
		eval("monster = new " + getRandom(classes) + "();");
		return monster;
	}

	walk()
	{
		if (this.doer)
		{
			this.doer.do();
			if (this.doer.complete) this.doer = null;
		}
		else
		{
			this.stepsTaken++;
			this.onWalk();
			var event = this.events.shift();
			var _this = this;
			var handleEvent = function(event)
			{
				_this.currentEvent = event;
				var r = Area.possibleEvents[event].call(_this);
				if (!((r == undefined) || (r == null))) _this.doer = r;
			}
			if (Array.isArray(event))
			{
				event.foreach(handleEvent);
			}
			else
			{
				handleEvent(event);
			}
		}
	}

	onWalk()
	{

	}
}
Area.possibleEvents = [];
Area.getBackgroundChangeEvent = function(flavor,back,fore=null)
{
	return Area.addPossibleEvent(function ()
	{
		topWriter.show(flavor);
		changeBackground(back);
		changeForeground(fore);
	});
}

Area.fightEvent = Area.addPossibleEvent(function ()
{
	currentBattle = new Battle(this.battleTheme,[this.getRandomMonster(),this.getRandomMonster(),this.getRandomMonster()]);
});
Area.flavorEvent  = Area.addPossibleEvent(function ()
{
	topWriter.show(this.flavor.get());
});
Area.nextAreaEvent = Area.addPossibleEvent(function ()
{
	this.onEnd();
	area = this.getNextArea();
	sound.playMusic(area.getBackgroundMusic());
	area.onStart();
});

class Area_Aorta extends Area
{
	constructor()
	{
		super(text.area1WalkFlavorText,["Troll","Sponge","Door","Decoy"],"fight");
	}

	getEvents()
	{

		var events = [].concat(
			[Area.meetTroll1],
			this.fillGrabBagThing(9),
			this.fillGrabBagThing(),
			this.fillGrabBagThing(),
			[Area.meetAmadeus],
			this.fillGrabBagThing(9),
			this.fillGrabBagThing(),
			this.fillGrabBagThing(),
			[Area.talkAmadeus],
			this.fillGrabBagThing(9),
			this.fillGrabBagThing(),
			this.fillGrabBagThing(9),
			this.fillGrabBagThing(9),
			[Area.fightAmadeus,
			Area.nextAreaEvent]
			);
		return events;
	}

	getNextArea()
	{
		return new Area_Underworld();
	}

	getBackgroundMusic()
	{
		return "back";
	}

	onStart()
	{
		changeBackground("back");
		topWriter.show("Press \"Space\" to walk forward.");
		sound.playMusic(this.getBackgroundMusic());
	}

	fillGrabBagThing(length = 10)
	{
		var _this = this;
		var a = [
		Area.fightEvent
		];

		while (a.length < length)
		{
			a.push(Area.flavorEvent);
		}

		return GrabBag.shuffle(a);
	}
}

Area.meetTroll1 = Area.addPossibleEvent(function ()
{
	contentManager.clear();
	contentManager.add($('<div class="monster"><div class="troll"></div></div>'));
	contentManager.approach();
	var w = new Writer(bottomWriter,text.trollFoundText);
	currentDoer = new Doer([
		w.getThing(),
		{action: function() {currentBattle = new Battle("fight",[new Troll()],false)}}
		]);
	currentDoer.do();
});

Area.meetAmadeus = Area.addPossibleEvent(function ()
{
	sound.pause();
	contentManager.clear();
	var $a = $('<div class="monster"></div>');
	var $b = $('<div id="amadeus"></div>');
	contentManager.add($a);
	$a.html($b);
	Amadeus.sprites.setSprite($b,1,1);
	contentManager.approach();
	var w = new Writer(bottomWriter,text.meetAmadeusText);
	currentDoer = new Doer([
		w.getThing(),
		{action: function () {contentManager.recede()},time:1000,waitForInput:false},
		{action: function () {contentManager.clear(); sound.unpause(); DialogueTypewriter.clearAll();}},
		]);
	currentDoer.do();
});

Area.talkAmadeus = Area.addPossibleEvent(function ()
{
	sound.pause();
	contentManager.clear();
	var $a = $('<div class="monster"></div>');
	var $b = $('<div id="amadeus"></div>');
	contentManager.add($a);
	$a.html($b);
	Amadeus.sprites.setSprite($b,1,1);
	contentManager.approach();
	var w = new Writer(bottomWriter,text.talkToAmadeusText);
	currentDoer = new Doer([
		w.getThing(),
		{action: function () {contentManager.recede()},time:1000,waitForInput:false},
		{action: function () {contentManager.clear(); sound.unpause(); DialogueTypewriter.clearAll();}},
		]);
	currentDoer.do();
});

Area.fightAmadeus = Area.addPossibleEvent(function ()
{
	changeBackground("bigDoor");
	sound.stop();
	contentManager.clear();
	var $a = $('<div class="monster"></div>');
	var $b = $('<div id="amadeus"></div>');
	contentManager.add($a);
	$a.html($b);
	Amadeus.sprites.setSprite($b,1,1);
	contentManager.approachFromLeft();
	var w = new Writer(bottomWriter,text.prefightAmadeusText);
	currentDoer = new Doer([
		w.getThing(),
		{action: function() {currentBattle = new Battle("amadeus",[new Amadeus()],false)}}
		]);
	currentDoer.do();
});

class Area_Underworld extends Area
{
	constructor()
	{
		super(text.underworldWalkFlavorText,["IntrovertedGhost","Skeleton","Reaper"],"fight");
	}

	getEvents()
	{

		var events = [].concat(
			[Area.talkEmery1,
			Area.flavorEvent,
			Area.flavorEvent,
			Area.flavorEvent,
			Area.meetSkeletons],			
			this.fillGrabBagThing(8),
			this.fillGrabBagThing(8),
			this.fillGrabBagThing(9),
			[Area.talkSkeletons],
			this.fillGrabBagThing(9),
			this.fillGrabBagThing(),
			this.fillGrabBagThing(),
			[Area.talkArnold],
			this.fillGrabBagThing(9),
			[Area.enterThaddeusDungeon],
			this.fillGrabBagThing(9),
			this.fillGrabBagThing(),
			this.fillGrabBagThing(9),
			[Area.fightThaddeus]
			);
		return events;
	}

	onStart()
	{
		changeBackground("back2");
		changeForeground("deadTrees");
		sound.playMusic(this.getBackgroundMusic());
		topWriter.show("You have exited the Aorta, and entered the underworld...");
	}

	fillGrabBagThing(length = 10)
	{
		var _this = this;
		var a = [
		Area.fightEvent
		];

		while (a.length < length)
		{
			a.push(Area.flavorEvent);
		}

		return GrabBag.shuffle(a);
	}

	getBackgroundMusic()
	{
		return "underworld";
	}
}

Area.talkEmery1 = Area.addPossibleEvent(function ()
{
	file.set("Inspect-Level",1); //flag for dialogue in-fight.
	sound.pause();
	var w = new Writer(bottomWriter,text.emery.talk1);
	currentDoer = new Doer([
		w.getThing(),
		{action: function () {sound.unpause(); DialogueTypewriter.clearAll();}},
		]);
	currentDoer.do();
});

Area.meetSkeletons = Area.addPossibleEvent(function ()
{
	contentManager.clear();
	var franklin = $('<div style="height: 140%; width:  70%;"></div>').css("transform-origin","bottom").css("transform","scale(0.9,1.1)");
	var arnold   = $('<div style="height: 140%; width:  70%;"></div>').css("transform-origin","bottom").css("transform","scale(1.1,0.7)");
	Skeleton.sprites.setSprite(arnold,1,2);
	Skeleton.sprites.setSprite(franklin,1,2);
	contentManager.add($('<div class="monster"></div>').html(arnold));
	contentManager.add($('<div class="monster"></div>').html(franklin));
	contentManager.approach();
	var w = new Writer(bottomWriter,text.underworld.meetSkeletonsText);
	currentDoer = new Doer([
		w.getThing(),
		{action: function () {contentManager.recede()},time:1000,waitForInput:false},
		{action: function () {contentManager.clear(); sound.unpause(); DialogueTypewriter.clearAll();}},
		]);
	currentDoer.do();
});

Area.talkSkeletons = Area.addPossibleEvent(function ()
{
	sound.pause();
	contentManager.clear();
	var franklin = $('<div style="height: 140%; width:  70%;"></div>').css("transform-origin","bottom").css("transform","scale(0.9,1.1)");
	var arnold   = $('<div style="height: 140%; width:  70%;"></div>').css("transform-origin","bottom").css("transform","scale(1.1,0.7)");
	Skeleton.sprites.setSprite(arnold,2,2);
	Skeleton.sprites.setSprite(franklin,1,2);
	contentManager.add($('<div class="monster"></div>').html(franklin));
	contentManager.add($('<div class="monster"></div>').html(arnold));
	contentManager.approach();
	var w = new Writer(bottomWriter,text.underworld.meetSkeletons2Text);
	currentDoer = new Doer([
		w.getOnceThing(),
		w.getOnceThing(),
		w.getOnceThing(),
		w.getOnceThing(),
		w.getOnceThing(),
		w.getOnceThing(),
		w.getOnceThing(),
		w.getOnceThing(),
		w.getOnceThing(),
		w.getOnceThing(),
		{action: function () {Skeleton.sprites.setSprite(arnold,1,2);},waitForInput:false},
		w.getThing(),
		{action: function () {contentManager.recede()},time:1000,waitForInput:false},
		{action: function () {contentManager.clear(); sound.unpause(); DialogueTypewriter.clearAll();}},
		]);
	currentDoer.do();
});

Area.talkArnold = Area.addPossibleEvent(function () 
{
	sound.pause();
	contentManager.clear();
	var arnold   = $('<div style="height: 140%; width:  70%;"></div>').css("transform-origin","bottom").css("transform","scale(1.1,0.7)");
	Skeleton.sprites.setSprite(arnold,1,1);
	contentManager.add($('<div class="monster"></div>').html(arnold));
	contentManager.approach();
	var w = new Writer(bottomWriter,text.underworld.talkArnoldText);
	currentDoer = new Doer([
		w.getThing(),
		{action: function () {contentManager.clear(); sound.unpause(); DialogueTypewriter.clearAll();}},
		]);
	currentDoer.do();
});

Area.enterThaddeusDungeon = Area.getBackgroundChangeEvent("You enter Thaddeus' dungeon.","wideTunnel");

Area.fightThaddeus = Area.addPossibleEvent(function ()
{
	changeBackground("bigDoor");
	sound.stop();
	contentManager.clear();
	var $a = $('<div class="monster"></div>');
	var $b = $('<div id="thaddeus"></div>');
	contentManager.add($a);
	$a.html($b);
	Thaddeus.sprites.setSprite($b,1,1);
	contentManager.approachFromLeft();
	var w = new Writer(bottomWriter,text.underworld.prefightThaddeusText);
	currentDoer = new Doer([
		w.getThing(),
		{action: function() {currentBattle = new Battle("fight",[new Thaddeus()],false)}}
		]);
	currentDoer.do();
});


Area.fightAragore = Area.addPossibleEvent(function () 
{    
	mode = ModeEnum.final;
	currentBattle = new Battle("aragore", [new Aragore()]);
	topWriter.show("Aragore the dragon blocks the exit.");
});