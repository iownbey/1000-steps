import type { ReactNode } from "react";
import { sound } from "../sound/SoundManager";
import { Button } from "../../components/general/Button/Button";
import { observable } from "@fobx/core";

export interface IBattleEntity {
  onBattleStart?(battle: Battle): void;
  turn(battle: Battle): Promise<void>;
  get isDead(): boolean;
  Component: () => ReactNode;
}

export interface IMonster extends IBattleEntity {
  name: string;
}

export class Battle {
  static playerTeam: IBattleEntity[];
  monsters: IMonster[];
  music: string;
  onPickedMonster?: (entity: IBattleEntity) => void;

  constructor(music: string, monsters: IMonster[]) {
    this.music = music;
    this.monsters = monsters;
    observable(this, {
      Component: "none",
      monsters: "observable.shallow",
      playerTeam: "observable.shallow",
    });
  }

  async start() {
    sound.playMusic(this.music);
    [...Battle.playerTeam, ...this.monsters].forEach((entity) =>
      entity.onBattleStart?.(this)
    );
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

  async getMonsterTarget() {
    return await new Promise<IBattleEntity>(
      (res) =>
        (this.onPickedMonster = (entity) => {
          this.onPickedMonster = undefined;
          res(entity);
        })
    );
  }

  Component = () => {
    console.log(this);
    let monsters = this.monsters.map((m, i) => <m.Component key={i} />);
    if (this.onPickedMonster) {
      monsters = monsters.map((m, i) => (
        <Button
          autoFocus={i === 0}
          onTrigger={() => {
            this.onPickedMonster?.(this.monsters[i]);
          }}
        >
          {m}
        </Button>
      ));
    }

    return (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          alignItems: "end",
          justifyContent: "space-around",
        }}
      >
        {monsters}
      </div>
    );
  };
}
