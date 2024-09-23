import { CSSAnimationController } from "../../../classes/CSSAnimator";
import { CssSpriteRenderer } from "../../../classes/sprites/CssSpriteRenderer";
import { SpriteController } from "../../../classes/sprites/SpriteController";
import "./character.css";
import characterSpritesheet from "./character.png";
import characterSpriteMeta from "./character.json";
import { Spark } from "./Spark/Spark";
import { ChargeLevel, SparkHandler } from "./Spark/SparkHandler";
import { loadAsepriteSpritesheet } from "../../../classes/sprites/loadAseprite";
import { observer } from "@fobx/react";

export const characterData: CharacterData = {};

export const spark = new SparkHandler();

export type CharacterData = {
  chargeLevel?: ChargeLevel;
};

const { getRenderer, animations } = loadAsepriteSpritesheet(
  characterSpritesheet,
  characterSpriteMeta
);

export const characterSprite = new SpriteController(getRenderer());
export const characterAnim = animations;
characterSprite.animate({ frames: animations["Idle"], loop: true });

export const Character = observer(() => {
  return (
    <div className="character" style={characterSprite.renderer.style}>
      <Spark sparkHandler={spark} />
    </div>
  );
});
