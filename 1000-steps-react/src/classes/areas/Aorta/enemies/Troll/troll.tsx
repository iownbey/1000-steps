import { upperWrite } from "../../../../../components/screens/MainGame/mainGameHelpers";
import type { Battle, IMonster } from "../../../../battle/Battle";

import trollSprite from "./troll.png";
import trollSpriteMeta from "./troll.processed.json";
import { loadAsepriteSpritesheet } from "../../../../sprites/loadAseprite";
import { SpriteController } from "../../../../sprites/SpriteController";
import { TimingIndicator } from "../../../../battle/blockSystem/TimingIndicator";
import { EaseInOutPoint } from "../../../../battle/blockSystem/timingPoints/EaseInOutPoint";
import { Vector2D } from "../../../../Vector2D";
import { observer } from "@fobx/react";
import { observable } from "@fobx/core";

const { getRenderer, animations } = loadAsepriteSpritesheet(
  trollSprite,
  trollSpriteMeta
);

export class Troll implements IMonster {
  name = "Troll";
  spriteController = new SpriteController(getRenderer());
  animations = animations;
  charge = 0;

  onBattleStart(): void {
    this.spriteController.animate({
      frames: animations.Idle,
      loop: true,
    });
  }

  constructor() {
    this.spriteController.renderer.currentSprite = { x: 0, y: 0 };
    observable(this, {
      Component: "none",
    });
  }

  get isDead() {
    return false;
  }

  async turn() {
    this.charge++;
    switch (this.charge) {
      case 1: {
        await this.spriteController.animate({
          frames: animations.ToCharge1,
        });
        this.spriteController.animate({
          frames: animations.Charge1,
          loop: true,
        });
        await upperWrite("The Troll lifts his mallet");
        return;
      }

      case 2: {
        await this.spriteController.animate({
          frames: animations.ToCharge2,
        });
        this.spriteController.animate({
          frames: animations.Charge2,
          loop: true,
        });
        await upperWrite("The Troll revs up for a strong attack");
        return;
      }

      case 3:
        {
          this.charge = 0;

          var interaction = new TimingIndicator(
            document.getElementById("content-canvas") as HTMLCanvasElement
          );
          var point = new EaseInOutPoint(new Vector2D(0, 150), 2);
          point.strong();
          interaction.points.push(point);
          await interaction.getPromise();

          await this.spriteController.animate({
            frames: animations.Attack,
          });
          if (point.state !== 1) {
            // TODO: Damage Player
          }
          this.spriteController.animate({
            frames: animations.Idle,
            loop: true,
          });
        }
        break;
    }
  }

  Component = observer(() => {
    return (
      <div
        className="troll"
        style={{
          width: "200px",
          height: "200px",
          transformOrigin: "bottom center",
          transform: "scale(10) translateY(10px)",
          ...this.spriteController.renderer.style,
        }}
      ></div>
    );
  });
}
