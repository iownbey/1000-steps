
class Area_Ocean extends Area {
	constructor() {
		super(Area_Ocean.flavor, ["Troll", "Sponge", "Door", "Decoy"], "fight");
	}

	getEvents() {

		var events = [].concat(
			[Area.meetVirgil],
			[Area.meetTroll1],
			this.fillGrabBagThing(9),
			[Area.meetOscar],
			this.fillGrabBagThing(9),
			this.fillGrabBagThing(9),
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
    flavor
}