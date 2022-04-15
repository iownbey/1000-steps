
class Area_Ocean extends Area {
	constructor() {
		super(Area_Ocean.text.flavor, ["Troll", "Sponge", "Door", "Decoy"], "fight");
	}

	getEvents() {

		var events = [].concat(
			[Area.fightChain],
			[Area_Aorta.meetTroll1],
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
		changeBackground("ocean");
		topWriter.show("You have entered the great Ocean.");
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

Area_Ocean.text = {
    flavor: [
        "Somehow you can breathe in this water.",
        "Even though you cannot see very far, this is some of the clearest water you have ever seen."
    ],

    intro: [
        "You have just walked into an ocean.",
        "You clutch at your throat, gasping for breath...",
        "Except...",
        "You can breathe.",
        ["Hey, I forgot to tell you.",expr.emery.happy],
        ["You can breathe the water."],
        [""]
    ]
}

Area_Ocean.firstStep = Area.registerEvent(async function() {
    
});