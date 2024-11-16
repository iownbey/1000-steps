import type { ReactNode } from "react";
import { mainGameData } from "../../../../../components/screens/MainGame/MainGame";
import { upperWrite } from "../../../../../components/screens/MainGame/mainGameHelpers";
import type { IMonster } from "../../../../battle/Battle";
import { NonrepeatingGetter } from "../../../../NonrepeatingGetter";

import trollSprite from "./troll.png";
import trollSpriteMeta from "./troll.processed.json";
import { loadAsepriteSpritesheet } from "../../../../sprites/loadAseprite";
import { SpriteController } from "../../../../sprites/SpriteController";

const { getRenderer, animations } = loadAsepriteSpritesheet(
  trollSprite,
  trollSpriteMeta
);

export class Troll implements IMonster {
  flavorer = new NonrepeatingGetter([
    "No, I have not considered a different vocation.",
    "Yes, I am a troll.",
    "No, I am not going to quit!",
    "Yes, I like my hammer.",
    "No, I am not in a relationship.",
    "Yes, my stone tunic is in style.",
  ]);
  charge = 0;
  name = "Troll";
  spriteController = new SpriteController(getRenderer());

  async turn(battle) {
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

          var interaction = new (document.getElementById("content-canvas"))();
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
          });
        }
        break;
    }
  }

  Component() {
    return <div className="troll"></div>;
  }

  html(root) {
    var $html = $('<div class="troll"></div>');
    root.append($html);
    this.jobj = $html;
    this.shiverAnim = new CSSAnimationController($html, "shiver");
    this.breatheAnim = new CSSAnimationController($html, "trollPose").start();
  }

  setPicture(image) {
    var width = -30;
    this.jobj.css(
      "background-position",
      "bottom left " + width * (image - 1) + "vh"
    );
  }

  magic() {
    if (this.charge == 3) stopAnimation(this.jobj, "shiver");
    this.setPicture(1);
    this.charge = 0;
    return "You stunned the troll!";
  }

  async talk() {
    topWriter.show(this.flavorer.get(), expr.troll.default);
    await InputHandler.waitForInput();
  }

  inspect() {
    var _this = this;
    return [
      "It's a green troll.",
      "It deals a lot of damage every three turns.",
      "It has some health.",
    ];
  }
}
