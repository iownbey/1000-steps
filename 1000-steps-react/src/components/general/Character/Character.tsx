import "./character.css";
import { Spark } from "./Spark/Spark";
import { ChargeLevel, SparkHandler } from "./Spark/SparkHandler";

export const characterData: CharacterData = {};

export const spark = new SparkHandler();

export type CharacterData = {
  chargeLevel?: ChargeLevel;
};

export const Character = ({ chargeLevel }: CharacterData) => {
  return (
    <div className="character">
      <Spark sparkHandler={spark} />
    </div>
  );
};
