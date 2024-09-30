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
import type { Battle, IBattleEntity } from "../../battle/Battle";
import { InputHandler } from "../../InputHandler";

export interface ICharacter<T> {
  Component(): ReactNode;
  spriteController: SpriteController<CssSpriteRenderer>;
  animations: T;
}

export type Ability = {
  name: string;
  description: string;
  happen(): Promise<void>;
};

export class Character
  implements
    ICharacter<AsepriteAnimations<typeof characterSpriteJson>>,
    IBattleEntity
{
  spark = new SparkHandler();
  spriteController: SpriteController<CssSpriteRenderer>;
  animations;

  constructor() {
    const { getRenderer, animations } = loadAsepriteSpritesheet(
      characterSprite,
      characterSpriteJson
    );
    this.spriteController = new SpriteController(getRenderer());
    this.animations = animations;
    this.spriteController.animate({ frames: animations.Idle, loop: true });
  }

  turn(battle: Battle): Promise<void> {
    return new Promise((res) => {
      console.log("Player turn Started");
    });
    const input = new InputHandler((e) => {});
  }

  get isDead(): boolean {
    throw new Error("Method not implemented.");
  }

  Component = observer(() => {
    return (
      <div className="character" style={this.spriteController.renderer.style}>
        <Spark sparkHandler={this.spark} />
      </div>
    );
  });
}
