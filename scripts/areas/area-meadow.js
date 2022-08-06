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

  get music() {
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
