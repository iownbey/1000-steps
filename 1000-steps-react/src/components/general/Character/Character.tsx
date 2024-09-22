import { CSSAnimationController } from "../../../classes/CSSAnimator";
import { CssSpriteRenderer } from "../../../classes/sprites/CssSpriteRenderer";
import { SpriteController } from "../../../classes/sprites/SpriteController";
import "./character.css";
import characterSprite from "./character.png";
import { Spark } from "./Spark/Spark";
import { ChargeLevel, SparkHandler } from "./Spark/SparkHandler";

export const characterData: CharacterData = {};

export const spark = new SparkHandler();

export type CharacterData = {
  chargeLevel?: ChargeLevel;
};

export const playerSprite = new SpriteController(
  new CssSpriteRenderer(characterSprite, 64, 32)
);

export const Character = () => {
  return (
    <div className="character" style={playerSprite.renderer.style}>
      <Spark sparkHandler={spark} />
    </div>
  );
};
