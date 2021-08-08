
class Area_Aorta extends Area {
	constructor() {
		super(text.aorta.walkFlavor, ["Troll", "Sponge", "Door", "Decoy"], "fight");
	}

	getEvents() {

		return [].concat(
			[Area_Aorta.meetVirgil],
			[Area_Aorta.meetTroll1],
			this.fillGrabBagThing(9),
			[Area_Aorta.meetOscar],
			this.fillGrabBagThing(9),
			this.fillGrabBagThing(9),
			[Area_Aorta.meetAmadeus],
			this.fillGrabBagThing(9, [Area.fightEvent]),
			this.fillGrabBagThing(10, [Area_Aorta.meetTroldiers]),
			this.fillGrabBagThing(),
			[Area_Aorta.talkAmadeus],
			this.fillGrabBagThing(9),
			this.fillGrabBagThing(),
			this.fillGrabBagThing(9),
			this.fillGrabBagThing(9),
			[Area_Aorta.fightAmadeus,
			Area.nextAreaEvent]
		);
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

	fillGrabBagThing(length = 10, a = [Area.fightEvent]) {
		var _this = this;

		a.push(Area.flavorEvent);

		while (a.length < length) {
			a.push(Area.emptyStep);
		}

		return GrabBag.shuffle(a);
	}
}

Area_Aorta.meetVirgil    = Area.addPossibleEvent(async function () {

	DialogueTypewriter.clearAll();
	contentManager.clear();
	var $wrapper = $('<div class="monster"></div>');
	var $virgil = $('<canvas style="height:180%;width:180%;left:-40%;" id="virgil"></canvas>');
	$virgil.appendTo($wrapper);
	contentManager.add($wrapper);
	contentManager.approach();

	var renderer = new SpriteRenderer($virgil[0], "./Images/virgil.png", 64, 64);
	await renderer.waitForLoad();
	renderer.setSprite(0, 0);

	await Helper.delay(1);

	await new Writer(bottomWriter, [
		"Hello, Harbinger.",
		"I am Virgil.",
		"I am here to teach you how to fight your way to the surface.",
		"Or do you already know how to fight?"
	]).writeAllAsync();

	var pick = await getChoice(["Yes", "No"], hcursor);

	switch (pick) {
		case "Yes":
			{
				await new Writer(bottomWriter, [
					"But you have only existed for a short time!",
					"There is no possible way you could have learned.",
					"You must prove this if you are to continue."
				]).writeAllAsync();

				var pick2 = await getChoice(["Fine then", "Nevermind"], hcursor);
				switch (pick2) {
					case "Fine then":
						{
							await new Writer(bottomWriter, [
								"If you insist.",
								"I will not kill you, but I will wound you.",
								"If this happens, The fight will be over, and you must accept my training.",
								"Prepare to combat with the master of blade and sorrow."
							]).writeAllAsync();
							currentBattle = new Battle("virgil-theme", [new Virgil()], false);
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

	async function tutorial() {
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

		do {
			var timing = new TimingIndicator(contentCanvas);
			var point = new EaseInOutPoint(new Vector2D(200, 0), 2);
			timing.renderers.push(point);
			await timing.getPromise();
			if (point.state === -1) {
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
	await Helper.delay(1);
	contentManager.clear();
	console.log("done");
});

Area_Aorta.meetTroll1    = Area.addPossibleEvent(async function () {
	contentManager.clear();
	contentManager.add($('<div class="monster"><div class="troll"></div></div>'));
	contentManager.approach();
	await new Writer(bottomWriter, text.aorta.trollFoundText).writeAllAsync();

	currentBattle = new Battle("fight", [new Troll()], false);
	await currentBattle.getPromise();
});

Area_Aorta.meetTroldiers = Area.addPossibleEvent(async function () {
	sound.stop();
	contentManager.clear();
	contentManager.add($('<div class="monster"><div class="troll-soldier"></div></div><div class="monster"><div class="troll-soldier"></div></div><div class="monster"><div class="troll-soldier"></div></div>'));
	contentManager.approach();
	sound.playFX("troll-fanfare");
	await Helper.delay(2);

	await new Writer(bottomWriter, text.aorta.meetTroldiersText).writeAllAsync();
	currentBattle = new Battle("fight", [new Troldier(), new Troldier(), new Troldier()], false);
	await currentBattle.getPromise();
});

Area_Aorta.meetAmadeus   = Area.addPossibleEvent(async function () {
	sound.pause();
	contentManager.clear();
	var $a = $('<div class="monster"></div>');
	var $b = $('<div id="amadeus"></div>');
	contentManager.add($a);
	$a.html($b);
	Amadeus.sprites.setSprite($b, 1, 1);
	await contentManager.approach();
	await new Writer(bottomWriter, text.aorta.meetAmadeusText).writeAllAsync();
	await contentManager.recede();
	contentManager.clear();
	sound.unpause();
	DialogueTypewriter.clearAll();
});

Area_Aorta.talkAmadeus   = Area.addPossibleEvent(async function () {
	sound.pause();
	contentManager.clear();
	var $a = $('<div class="monster"></div>');
	var $b = $('<div id="amadeus"></div>');
	contentManager.add($a);
	$a.html($b);
	Amadeus.sprites.setSprite($b, 1, 1);
	await contentManager.approach();
	await new Writer(bottomWriter, text.aorta.talkToAmadeusText).writeAllAsync();
	await contentManager.recede();
	contentManager.clear();
	sound.unpause();
	DialogueTypewriter.clearAll();
});

Area_Aorta.fightAmadeus  = Area.addPossibleEvent(async function () {
	changeBackground("bigDoor");
	sound.stop();
	contentManager.clear();
	var $a = $('<div class="monster"></div>');
	var $b = $('<div id="amadeus"></div>');
	contentManager.add($a);
	$a.html($b);
	Amadeus.sprites.setSprite($b, 1, 1);
	await contentManager.approachFromLeft();
	await new Writer(bottomWriter, text.aorta.prefightAmadeusText).writeAllAsync();
	currentBattle = new Battle("amadeus", [new Amadeus()], false);
	await currentBattle.getPromise();
});