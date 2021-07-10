
const allMonsters = Object.freeze(["Troll", "Sponge", "IntrovertedGhost", "Door", "Decoy", "Skeleton", "Reaper", "Troldier"]);

class Area {
	constructor(flavor, monsters, battleTheme = "fight") {
		this.stepsTaken = 0;
		this.flavor = new NonrepeatingGetter(flavor);
		this.battleTheme = battleTheme;
		this.events = this.getEvents();
		this.currentEvent = null;
		this.monsters = this.toInts(monsters);
		this.doer = null;
		console.log(this.monsters);
	}

	static addPossibleEvent(element) {
		return Area.possibleEvents.push(element) - 1;
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

	onEnd() {

	}

	onStart() {

	}

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
		eval("monster = new " + getRandom(classes) + "();");
		return monster;
	}

	walk() {
		if (this.doer) {
			this.doer.do();
			if (this.doer.complete) this.doer = null;
		}
		else {
			this.stepsTaken++;
			this.onWalk();
			var event = this.events.shift();
			var _this = this;
			var handleEvent = function (event) {
				_this.currentEvent = event;
				var r = Area.possibleEvents[event].call(_this);
				if (!((r == undefined) || (r == null))) _this.doer = r;
			}
			if (Array.isArray(event)) {
				event.foreach(handleEvent);
			}
			else {
				handleEvent(event);
			}
		}
	}

	onWalk() {

	}
}
Area.possibleEvents = [];
Area.getBackgroundChangeEvent = function (flavor, back, fore = null) {
	return Area.addPossibleEvent(function () {
		topWriter.show(flavor);
		changeBackground(back);
		changeForeground(fore);
	});
}

Area.fightEvent = Area.addPossibleEvent(function () {
	currentBattle = new Battle(this.battleTheme, [this.getRandomMonster(), this.getRandomMonster(), this.getRandomMonster()]);
});
Area.flavorEvent = Area.addPossibleEvent(function () {
	topWriter.show(this.flavor.get());
});
Area.nextAreaEvent = Area.addPossibleEvent(function () {
	this.onEnd();
	area = this.getNextArea();
	sound.playMusic(area.getBackgroundMusic());
	area.onStart();
});

class Area_Aorta extends Area {
	constructor() {
		super(text.area1WalkFlavorText, ["Troll", "Sponge", "Door", "Decoy"], "fight");
	}

	getEvents() {

		var events = [].concat(
			[Area.meetVirgil],
			[Area.meetTroll1],
			this.fillGrabBagThing(9),
			this.fillGrabBagThing(9),
			this.fillGrabBagThing(),
			[Area.meetAmadeus],
			this.fillGrabBagThing(9, [Area.fightEvent]),
			this.fillGrabBagThing(10, [Area.meetTroldiers]),
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

	getNextArea() {
		return new Area_Underworld();
	}

	getBackgroundMusic() {
		return "back";
	}

	onStart() {
		changeBackground("back");
		topWriter.show("Press \"Space\" to walk forward.");
		sound.playMusic(this.getBackgroundMusic());
	}

	fillGrabBagThing(length = 10, a = [Area.fightEvent])
	{
		var _this = this;

		while (a.length < length)
		{
			a.push(Area.flavorEvent);
		}

		return GrabBag.shuffle(a);
	}
}

Area.meetVirgil = Area.addPossibleEvent(function () {

	var input = {oninput: () => { }};
	currentDoer = Doer.ofPromise(scene(), input);
	async function scene() {
		DialogueTypewriter.clearAll();
		contentManager.clear();
		var $wrapper = $('<div class="monster"></div>');
		var $virgil = $('<canvas style="height:180%;width:180%;left:-40%;" id="virgil"></canvas>');
		$virgil.appendTo($wrapper);
		contentManager.add($wrapper);
		contentManager.approach();

		var renderer = new SpriteRenderer($virgil[0],"./Images/virgil.png",64,64);
		renderer.onload = () => {
			renderer.setSprite(0,0);
		}

		await new Promise((r) => setTimeout(r, 1000));

		await new Writer(bottomWriter, [
			"Hello, Harbinger.",
			"I am Virgil.",
			"I am here to teach you how to fight your way to the surface.",
			"Or do you already know how to fight?"
		]).writeAllAsync();

		var pick = await getChoice(["Yes","No"],hcursor);

		switch (pick)
		{
			case "Yes":
				{
					await new Writer(bottomWriter, [
						"But you have only existed for a short time!",
						"There is no possible way you could have learned.",
						"You must prove this if you are to continue."
					]).writeAllAsync();

					var pick2 = await getChoice(["Fine then","Nevermind"], hcursor);
					switch (pick2)
					{
						case "Fine then":
							{
								await new Writer(bottomWriter, [
									"If you insist.",
									"I will not kill you, but I will wound you.",
									"If this happens, The fight will be over, and you must accept my training.",
									"Prepare to combat with the master of blade and sorrow."
								]).writeAllAsync();
								currentBattle = new Battle("virgil-theme",[new Virgil()],false);
								await currentBattle.getPromise();
							}; break;
						case "Nevermind":
							{
								await new Writer(bottomWriter, [
									"Silly Harbinger...",
									"You know I must teach you the way of blade and sorrow."
								]).writeAllAsync();
								await tutorial();
							}; break;
					}
				}; break;
			case "No":
				{
					await tutorial();
				}; break;
		}

		async function tutorial()
		{
			await new Writer(bottomWriter, [
				"Good.",
				"Even now, humans continue to be abducted by the darkness's haze of malice.",
				"You must be prepared to fight your way to the surface, so let's begin.",
				"Just like in a dance, fighting is a dialogue.",
				"It involves TURNS, which are taken by each being in the fight.",
				"You take your turn first, followed by each monster from left to right.",
				"When monsters attack, a hollow circle will appear in the center of the screen, representing the point of contact.",
				"If you press space right when their attack enters the center, you can block it.",
				"But beware: too early or too late and your block will fail.",
				"Let's practice. Block my swing."
			]).writeAllAsync();

			do
			{
			var timing = new TimingIndicator(contentCanvas);
			var point = new EaseInOutPoint(new Vector2D(200,0),2);
			timing.renderers.push(point);
			await timing.getPromise();
				if (point.state === -1)
				{
					await new Writer(bottomWriter, [
						"Remember, you must hit space when the attack enters the center.",
						"The attack will turn blue when you can block it.",
					]).writeAllAsync();
				}
			}
			while (point.state !== 1)

			await new Writer(bottomWriter, [
				"Good job, Harbinger.",
				"I think this is enough training for now.",
				"Be aware that I was holding back just now. Most monsters won't.",
				"I have one more thing to teach you.",
				"Some monsters can have STRONG attacks.",
				"When they do, you must prepare to block their attacks by first DEFENDing with your shield.",
				"If you don't, these attacks will appear yellow and be unblockable.",
				"Good luck, Harbinger.",
				"May we meet again."
			]).writeAllAsync();
		}

		DialogueTypewriter.clearAll();
		contentManager.recede();
		//sleep for 1 second
		await new Promise((r) => setTimeout(r, 1000));
		contentManager.clear();
		console.log("done");
	}
});

Area.meetTroll1 = Area.addPossibleEvent(function () {
	contentManager.clear();
	contentManager.add($('<div class="monster"><div class="troll"></div></div>'));
	contentManager.approach();
	var w = new Writer(bottomWriter, text.trollFoundText);

	currentDoer = new Doer([
		w.getThing(),
		{ action: function () { currentBattle = new Battle("fight", [new Troll()], false) } }
	]);
	currentDoer.do();
});

Area.meetTroldiers = Area.addPossibleEvent(function () {
	sound.stop();
	contentManager.clear();
	contentManager.add($('<div class="monster"><div class="troll-soldier"></div></div><div class="monster"><div class="troll-soldier"></div></div><div class="monster"><div class="troll-soldier"></div></div>'));
	contentManager.approach();
	var w = new Writer(bottomWriter, text.meetTroldiersText);
	currentDoer = new Doer([
		{ action: function () { sound.playFX("troll-fanfare") }, time: 2000, waitForInput: false },
		w.getThing(),
		{ action: function () { currentBattle = new Battle("fight", [new Troldier(), new Troldier(), new Troldier()], false) } }
	]);
	currentDoer.do();
});

Area.meetAmadeus = Area.addPossibleEvent(function () {
	sound.pause();
	contentManager.clear();
	var $a = $('<div class="monster"></div>');
	var $b = $('<div id="amadeus"></div>');
	contentManager.add($a);
	$a.html($b);
	Amadeus.sprites.setSprite($b, 1, 1);
	contentManager.approach();
	var w = new Writer(bottomWriter, text.meetAmadeusText);
	currentDoer = new Doer([
		w.getThing(),
		{ action: function () { contentManager.recede() }, time: 1000, waitForInput: false },
		{ action: function () { contentManager.clear(); sound.unpause(); DialogueTypewriter.clearAll(); } },
	]);
	currentDoer.do();
});

Area.talkAmadeus = Area.addPossibleEvent(function () {
	sound.pause();
	contentManager.clear();
	var $a = $('<div class="monster"></div>');
	var $b = $('<div id="amadeus"></div>');
	contentManager.add($a);
	$a.html($b);
	Amadeus.sprites.setSprite($b, 1, 1);
	contentManager.approach();
	var w = new Writer(bottomWriter, text.talkToAmadeusText);
	currentDoer = new Doer([
		w.getThing(),
		{ action: function () { contentManager.recede() }, time: 1000, waitForInput: false },
		{ action: function () { contentManager.clear(); sound.unpause(); DialogueTypewriter.clearAll(); } },
	]);
	currentDoer.do();
});

Area.fightAmadeus = Area.addPossibleEvent(function () {
	changeBackground("bigDoor");
	sound.stop();
	contentManager.clear();
	var $a = $('<div class="monster"></div>');
	var $b = $('<div id="amadeus"></div>');
	contentManager.add($a);
	$a.html($b);
	Amadeus.sprites.setSprite($b, 1, 1);
	contentManager.approachFromLeft();
	var w = new Writer(bottomWriter, text.prefightAmadeusText);
	currentDoer = new Doer([
		w.getThing(),
		{ action: function () { currentBattle = new Battle("amadeus", [new Amadeus()], false) } }
	]);
	currentDoer.do();
});

class Area_Underworld extends Area {
	constructor() {
		super(text.underworldWalkFlavorText, ["IntrovertedGhost", "Skeleton", "Reaper"], "underworld-fight");
	}

	getEvents() {

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

	onStart() {
		changeBackground("back2");
		changeForeground("deadTrees");
		sound.playMusic(this.getBackgroundMusic());
		topWriter.show("You have exited the Aorta, and entered the underworld...");
	}

	fillGrabBagThing(length = 10) {
		var _this = this;
		var a = [
			Area.fightEvent
		];

		while (a.length < length) {
			a.push(Area.flavorEvent);
		}

		return GrabBag.shuffle(a);
	}

	getBackgroundMusic() {
		return "underworld";
	}
}

Area.talkEmery1 = Area.addPossibleEvent(function () {
	file.set("Inspect-Level", 1); //flag for dialogue in-fight.
	sound.pause();
	var w = new Writer(bottomWriter, text.emery.talk1);
	currentDoer = new Doer([
		w.getThing(),
		{ action: function () { sound.unpause(); DialogueTypewriter.clearAll(); } },
	]);
	currentDoer.do();
});

Area.meetSkeletons = Area.addPossibleEvent(function () {
	contentManager.clear();
	var franklin = $('<div style="height: 140%; width:  70%;"></div>').css("transform-origin", "bottom").css("transform", "scale(0.9,1.1)");
	var arnold = $('<div style="height: 140%; width:  70%;"></div>').css("transform-origin", "bottom").css("transform", "scale(1.1,0.7)");
	Skeleton.sprites.setSprite(arnold, 1, 2);
	Skeleton.sprites.setSprite(franklin, 1, 2);
	contentManager.add($('<div class="monster"></div>').html(arnold));
	contentManager.add($('<div class="monster"></div>').html(franklin));
	contentManager.approach();
	var w = new Writer(bottomWriter, text.underworld.meetSkeletonsText);
	currentDoer = new Doer([
		w.getThing(),
		{ action: function () { contentManager.recede() }, time: 1000, waitForInput: false },
		{ action: function () { contentManager.clear(); sound.unpause(); DialogueTypewriter.clearAll(); } },
	]);
	currentDoer.do();
});

Area.talkSkeletons = Area.addPossibleEvent(function () {
	sound.pause();
	contentManager.clear();
	var franklin = $('<div style="height: 140%; width:  70%;"></div>').css("transform-origin", "bottom").css("transform", "scale(0.9,1.1)");
	var arnold = $('<div style="height: 140%; width:  70%;"></div>').css("transform-origin", "bottom").css("transform", "scale(1.1,0.7)");
	Skeleton.sprites.setSprite(arnold, 2, 2);
	Skeleton.sprites.setSprite(franklin, 1, 2);
	contentManager.add($('<div class="monster"></div>').html(franklin));
	contentManager.add($('<div class="monster"></div>').html(arnold));
	contentManager.approach();
	var w = new Writer(bottomWriter, text.underworld.meetSkeletons2Text);
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
		{ action: function () { Skeleton.sprites.setSprite(arnold, 1, 2); }, waitForInput: false },
		w.getThing(),
		{ action: function () { contentManager.recede() }, time: 1000, waitForInput: false },
		{ action: function () { contentManager.clear(); sound.unpause(); DialogueTypewriter.clearAll(); } },
	]);
	currentDoer.do();
});

Area.talkArnold = Area.addPossibleEvent(function () {
	sound.pause();
	contentManager.clear();
	var arnold = $('<div style="height: 140%; width:  70%;"></div>').css("transform-origin", "bottom").css("transform", "scale(1.1,0.7)");
	Skeleton.sprites.setSprite(arnold, 1, 1);
	contentManager.add($('<div class="monster"></div>').html(arnold));
	contentManager.approach();
	var w = new Writer(bottomWriter, text.underworld.talkArnoldText);
	currentDoer = new Doer([
		w.getThing(),
		{ action: function () { contentManager.clear(); sound.unpause(); DialogueTypewriter.clearAll(); } },
	]);
	currentDoer.do();
});

Area.enterThaddeusDungeon = Area.getBackgroundChangeEvent("You enter Thaddeus' dungeon.", "wideTunnel");

Area.fightThaddeus = Area.addPossibleEvent(function () {
	changeBackground("bigDoor");
	sound.stop();
	contentManager.clear();
	var $a = $('<div class="monster"></div>');
	var $b = $('<div id="thaddeus"></div>');
	contentManager.add($a);
	$a.html($b);
	Thaddeus.sprites.setSprite($b, 1, 1);
	contentManager.approachFromLeft();
	var w = new Writer(bottomWriter, text.underworld.prefightThaddeusText);
	currentDoer = new Doer([
		w.getThing(),
		{ action: function () { currentBattle = new Battle("fight", [new Thaddeus()], false) } }
	]);
	currentDoer.do();
});


Area.fightAragore = Area.addPossibleEvent(function () {
	mode = ModeEnum.final;
	currentBattle = new Battle("aragore", [new Aragore()]);
	topWriter.show("Aragore the dragon blocks the exit.");
});