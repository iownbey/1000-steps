import { Howl } from "howler";

class SoundManager {
  persistants: Howl[];
  job: Howl;

  constructor() {
    this.persistants = [];
  }

  playMusic(song: string, crossFade = true) {
    console.log("SOUND: Playing " + song);

    var startSong = () => {
      this.job = new Howl({
        src: [song],
        loop: true,
        volume: 0,
      });
      this.job.play();
      if (crossFade) this.job.fade(0, 1, 500);
      else this.job.volume(1);
    };

    if (this.job) {
      if (crossFade) {
        this.job.fade(1, 0, 500);
        const oldJob = this.job;
        this.job.once("fade", () => {
          oldJob.stop();
        });
        startSong();
      } else {
        this.job.stop();
        startSong();
      }
    } else startSong();
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
    if (this.job) {
      if (fade) {
        var j = this.job;
        j.fade(1, 0, 500);
        j.once("fade", () => {
          j.stop();
        });
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

  playFX(effect: string) {
    new Howl({
      src: [effect],
    }).play();
  }
}

export const sound = new SoundManager();
