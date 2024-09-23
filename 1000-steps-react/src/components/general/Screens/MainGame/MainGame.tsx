import { observable } from "@fobx/core";
import {
  Character,
  characterAnim,
  characterData,
  characterSprite,
} from "../../Character/Character";
import { Menu, MenuProps } from "../../Menu/Menu";
import { observer } from "@fobx/react";
import { DialogueBox, Face } from "../../DialogueBox/DialogueBox";
import { ReactNode, useEffect, useRef, useState } from "react";
import { GameInput, InputHandler } from "../../../../classes/InputHandler";
import { Ground } from "./Ground/Ground";

import back from "../../../../../images/backgrounds/back.png";
import floor from "../../../../../images/floors/aorta.png";

export type AreaEvent = {
  setDistance: (distance: number) => void;
  run: () => Promise<void>;
  render: () => ReactNode;
};

export type MainGameData = {
  backgroundImage: string;
  foregroundImage?: string;
  groundImage?: string;
  groundColor?: string;
  menuStack: MenuProps[];
  upperText?: string;
  lowerText?: string;
  face?: Face;
  backgroundMode: "normal" | "battle";
  events: AreaEvent[];
  totalSteps: number;
};

export const mainGameData = observable({
  backgroundImage: back,
  backgroundMode: "normal",
  groundImage: floor,
  groundColor: "#0B0B0B",
  totalSteps: 0,
  menuStack: [],
  events: [],
} as MainGameData);

const charDelay = 0.02;
const slowCharDelay = 0.05;

const handleInput = (e: GameInput) => {};

function withBack(img: string) {
  return {
    backgroundImage: `url(${img})`,
  };
}

export const MainGame = observer(() => {
  const runningEvent = useState;
  const animTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const input = new InputHandler((e) => {
      console.log(e);
      if (e.key === "lmb") {
        mainGameData.totalSteps++;
        characterSprite.animate({ frames: characterAnim["Run"], loop: true });
        animTimeout.current = setTimeout(() => {
          characterSprite.animate({
            frames: characterAnim["Idle"],
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
      {mainGameData.backgroundMode === "normal" && (
        <>
          <div className="box" style={withBack(mainGameData.backgroundImage)} />
          {mainGameData.foregroundImage && (
            <div
              className="box"
              style={withBack(mainGameData.foregroundImage)}
            />
          )}
        </>
      )}
      {mainGameData.backgroundMode === "battle" && (
        <div className="box battle-background" />
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
        <Character />
        {mainGameData.events.map((e) => e.render())}
      </Ground>

      <Menu {...mainGameData.menuStack.slice(-1)[0]} />
    </div>
  );
});
