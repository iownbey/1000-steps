import type { ReactNode } from "react";
import { sound } from "../SoundManager";

export interface IBattleEntity {
  turn(battle: Battle): Promise<void>;
  get isDead(): boolean;
  Component: () => ReactNode;
}

export class Battle {
  static playerTeam: IBattleEntity[];
  monsters: IBattleEntity[];
  music: string;

  constructor(music: string, monsters: IBattleEntity[]) {
    this.music = music;
    this.monsters = monsters;
  }

  async start() {
    sound.playMusic(this.music);
    while (!this.isBattleDone) {
      for (const e of [...Battle.playerTeam, ...this.monsters]) {
        if (!e.isDead) {
          await e.turn(this);
        }
        if (this.isBattleDone) {
          break;
        }
      }
    }
  }

  get isBattleDone() {
    return (
      Battle.playerTeam.every((e) => e.isDead) ||
      this.monsters.every((e) => e.isDead)
    );
  }
}
