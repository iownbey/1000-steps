import { observable } from "@fobx/core";
import { Menu, type MenuProps } from "../../general/Menu/Menu";
import { observer } from "@fobx/react";
import { DialogueBox, type Face } from "../../general/DialogueBox/DialogueBox";
import { type ReactNode, useEffect, useRef } from "react";
import { InputHandler } from "../../../classes/InputHandler";
import { Ground } from "./Ground/Ground";

import back from "../../../../images/backgrounds/back.png";
import floor from "../../../../images/floors/aorta.png";
import { pulse } from "../../../functions/setUpController";
import {
  Character,
  type ICharacter,
} from "../../../classes/characters/Main/Character";
import type { SpriteAnimationFrame } from "../../../classes/sprites/SpriteController";
import type { Area } from "../../../classes/areas/Area";
import { Aorta } from "../../../classes/areas/Aorta/Aorta";

export type AreaEvent = {
  setDistance: (distance: number) => void;
  run: () => Promise<void>;
  render: () => ReactNode;
};

export type MainGameData = {
  backgroundImage: string;
  foregroundImage?: string;
  groundImage: string;
  groundColor: string;
  menuStack: MenuProps[];
  upperText?: string;
  lowerText?: string;
  face?: Face;
  totalSteps: number;
  currentArea: Area;
  character: ICharacter<{
    Run: SpriteAnimationFrame[];
    Idle: SpriteAnimationFrame[];
  }>;
};

export const mainGameData = observable({
  backgroundImage: back,
  backgroundMode: "normal",
  groundImage: floor,
  groundColor: "#0B0B0B",
  totalSteps: 0,
  menuStack: [],
  character: new Character(),
  currentArea: new Aorta(),
} as MainGameData);

const charDelay = 0.02;
const slowCharDelay = 0.05;

function withBack(img: string) {
  return {
    backgroundImage: `url(${img})`,
  };
}

export const MainGame = observer(() => {
  const animTimeout = useRef<ReturnType<typeof setTimeout>>();
  const busy = useRef(false);

  useEffect(() => {
    const input = new InputHandler((e) => {
      console.log(e);
      if ((!busy.current && e.key === "lmb") || e.key === "Backspace") {
        busy.current = true;
        pulse({ weak: 1, duration: 50 });
        mainGameData.totalSteps++;
        mainGameData.currentArea
          .startEvent((mainGameData.totalSteps - 1) % 100)
          .then(() => {
            busy.current = false;
          });

        clearTimeout(animTimeout.current);
        mainGameData.character.spriteController.animate({
          frames: mainGameData.character.animations.Run,
          loop: true,
        });
        animTimeout.current = setTimeout(() => {
          mainGameData.character.spriteController.animate({
            frames: mainGameData.character.animations.Idle,
            loop: true,
          });
        }, 500);
      }
    });

    return () => {
      input.dispose();
    };
  }, []);

  return (
    <div className="box">
      <div className="box" style={withBack(mainGameData.backgroundImage)} />
      {mainGameData.foregroundImage && (
        <div className="box" style={withBack(mainGameData.foregroundImage)} />
      )}

      <DialogueBox
        face={mainGameData.face}
        targetText={mainGameData.upperText}
        charDelay={charDelay}
        slowCharDelay={slowCharDelay}
      ></DialogueBox>
      <DialogueBox
        face={mainGameData.face}
        targetText={mainGameData.upperText}
        charDelay={charDelay}
        slowCharDelay={slowCharDelay}
      ></DialogueBox>

      <Ground
        image={mainGameData.groundImage}
        steps={mainGameData.totalSteps}
        color={mainGameData.groundColor}
      >
        <mainGameData.character.Component />
        <mainGameData.currentArea.Component />
      </Ground>

      <Menu {...mainGameData.menuStack.slice(-1)[0]} />
    </div>
  );
});
