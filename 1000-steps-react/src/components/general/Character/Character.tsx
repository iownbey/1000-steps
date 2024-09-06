import "./character.css";

export const characterData: CharacterData = {};

export type CharacterData = {
  chargeLevel?: 0 | 1 | 2 | 3;
};

export const Character = ({ chargeLevel }: CharacterData) => {
  return (
    <div className="character">
      {chargeLevel && (
        <div className="charge" data-charge-level={chargeLevel} />
      )}
    </div>
  );
};
