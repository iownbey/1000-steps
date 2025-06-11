import type { ReactNode } from "react";
import { sound } from "../sound/SoundManager";
import { Menu } from "../../components/general/ui/Menu/Menu";
import { MenuButton } from "../../components/general/ui/MenuButton/MenuButton";
import React, { useEffect } from "react";

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
    const firstOptionRef = React.useRef<HTMLDivElement>(null);
    console.log(this);
    let monsters = this.monsters.map((m, i) => <m.Component key={i} />);
    if (this.onPickedMonster) {
      monsters = monsters.map((m, i) => (
        <MenuButton
          ref={i === 0 ? firstOptionRef : undefined}
          onActivate={() => {
            this.onPickedMonster?.(this.monsters[i]);
          }}
        ></MenuButton>
      ));
    }

    useEffect(() => {
      if (this.onPickedMonster && !document.activeElement) {
        // If we have a monster to pick, focus the first option
        firstOptionRef.current?.focus();
      }
    }, [this.onPickedMonster]);

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
