import { Howl } from "howler";

class SoundManager {
  persistants: Howl[];
  currentMusic: Howl | null = null;

  constructor() {
    this.persistants = [];
  }

  playMusic(song: string, crossFade = true) {
    console.log("SOUND: Playing " + song);

    if (this.currentMusic) {
      if (crossFade) {
        this.currentMusic.fade(1, 0, 500);
        const oldJob = this.currentMusic;
        this.currentMusic.once("fade", () => {
          oldJob.stop();
        });
      } else {
        this.currentMusic.stop();
      }
    }

    this.currentMusic = new Howl({
      src: [song],
      loop: true,
      volume: 0,
    });
    this.currentMusic.play();
    if (crossFade) this.currentMusic.fade(0, 1, 500);
    else this.currentMusic.volume(1);
  }

  loadPersistant(song: string) {
    var i = this.persistants.push(new Howl({ src: [song] })) - 1;
    return i;
  }

  playPersistant(persistant: number, force = true) {
    var b = this.persistants[persistant];
    if (force || !b.playing()) b.stop().play();
  }

  stop(fade = true) {
    if (this.currentMusic) {
      if (fade) {
        var j = this.currentMusic;
        j.fade(1, 0, 500);
        j.once("fade", () => {
          j.stop();
        });
      } else this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  pause() {
    if (this.currentMusic) this.currentMusic.pause();
  }

  unpause() {
    if (this.currentMusic && !this.currentMusic.playing()) {
      let sk = this.currentMusic.seek();
      this.currentMusic.play();
      this.currentMusic.seek(sk);
    }
  }

  playFX(effect: string) {
    new Howl({
      src: [effect],
    }).play();
  }
}

export const sound = new SoundManager();
