import { Howl } from "howler";

class SoundManager {
  persistants;

  constructor() {
    this.persistants = [{}];
  }

  getFileName(song: string) {
    return "sounds/" + song;
  }

  playMusic(song, crossFade = true) {
    console.log("SOUND: Playing " + song);
    song = this.getFileName(song);

    var _this = this;
    var startSong = () => {
      //this.job = new buzz.sound(song).loop().play().fadeIn(500);
      _this.job = new Howl({
        src: [song + ".wav", song + ".mp3"],
        loop: true,
        volume: 0,
      });
      _this.job.play();
      if (crossFade) _this.job.fade(0, 1, 500);
      else _this.job.volume(1);
    };

    if (this.job != null) {
      if (crossFade) {
        var _job = this.job;
        //this.job.unloop().fadeWith(this.job = new buzz.sound(song).loop(), 500);
        this.job.fade(1, 0, 500);
        this.job.onfade = () => {
          _job.stop();
        };
        startSong();
      } else {
        this.job.stop();
        startSong();
      }
    } else startSong();
  }

  loadPersistant(song) {
    song = this.getFileName(song);
    var i =
      this.persistants.push(new Howl({ src: [song + ".wav", song + ".mp3"] })) -
      1;
    return i;
  }

  playPersistant(persistant, force = true) {
    var b = this.persistants[persistant];
    if (force || !b.playing()) b.stop().play();
  }

  stop(fade = true) {
    if (this.job) {
      this.job.loop = false;

      if (fade) {
        var j = this.job;
        j.fade(1, 0, 500);
        j.onfade = () => {
          j.stop();
        };
      } else this.job.stop();
      this.job = null;
    }
  }

  pause() {
    if (this.job) this.job.pause();
  }

  unpause() {
    if (this.job && !this.job.playing()) {
      let sk = this.job.seek();
      this.job.play();
      this.job.seek(sk);
    }
  }

  playFX(effect) {
    effect = this.getFileName(effect);
    new H({
      src: [effect + ".wav", effect + ".mp3"],
    }).play();
  }
}
