class Area_Meadow extends Area {
  constructor() {
    super();
  }

  getEvents() {
    return [].concat();
  }

  get music() {
    return "back";
  }

  onStart() {
    changeBackground("back");
    sound.playMusic(this.music());
  }
}
