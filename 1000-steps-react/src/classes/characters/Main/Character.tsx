import { observer } from "@fobx/react";
import type { ReactNode } from "react";
import { Spark } from "./Spark/Spark";
import { SparkHandler } from "./Spark/SparkHandler";
import { SpriteController } from "../../sprites/SpriteController";
import type { CssSpriteRenderer } from "../../sprites/CssSpriteRenderer";
import {
  loadAsepriteSpritesheet,
  type AsepriteAnimations,
} from "../../sprites/loadAseprite";

import characterSpriteJson from "./character.processed.json";
import characterSprite from "./character.png";
import "./character.css";
import { Battle, type IBattleEntity } from "../../battle/Battle";
import { strike } from "./Abilities";
import { observable } from "@fobx/core";
import { Button } from "../../../components/general/Button/Button";
import { mainGameData } from "../../../components/screens/MainGame/MainGame";

export interface ICharacter<T> {
  Component(): ReactNode;
  UIComponent(): ReactNode;
  isDefending: boolean;
  spriteController: SpriteController<CssSpriteRenderer>;
  animations: T;
}

export type Ability = {
  name: string;
  description: string;
  happen(battle: Battle): Promise<void> | void;
};

export class Character
  implements
    ICharacter<AsepriteAnimations<typeof characterSpriteJson>>,
    IBattleEntity
{
  spark = new SparkHandler();
  spriteController: SpriteController<CssSpriteRenderer>;
  animations;
  isDefending = false;
  endTurn?: () => void;
  currentBattle?: Battle;
  abilities: Ability[] = [strike];

  constructor() {
    const { getRenderer, animations } = loadAsepriteSpritesheet(
      characterSprite,
      characterSpriteJson
    );
    this.spriteController = new SpriteController(getRenderer());
    this.animations = animations;
    this.spriteController.animate({ frames: animations.Idle, loop: true });
    Battle.playerTeam = [this];

    observable(this, {
      Component: "none",
      UIComponent: "none",
    });
  }

  async turn(battle: Battle): Promise<void> {
    this.currentBattle = battle;
    console.log("turn started");
    mainGameData.ui = <this.UIComponent />;
    await new Promise<void>((res) => {
      this.endTurn = res;
    });
    mainGameData.ui = null;
  }

  get isDead(): boolean {
    return false;
  }

  Component = observer(() => {
    return (
      <div className="character" style={this.spriteController.renderer.style}>
        <Spark sparkHandler={this.spark} />
      </div>
    );
  });

  UIComponent = observer(() => {
    console.log(this.abilities);
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "200px",
          top: 0,
          padding: "32px",
          gap: "16px",
        }}
      >
        {this.abilities.map((a) => (
          <Button
            key={a.name}
            onClick={() => {
              a.happen(this.currentBattle!);
              this.endTurn?.();
            }}
            variant="fancy"
          >
            {a.name}
          </Button>
        ))}
      </div>
    );
  });
}
