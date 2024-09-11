import { observable } from "@fobx/core";
import { Character, characterData } from "../../Character/Character";
import { Menu, MenuProps } from "../../Menu/Menu";
import { observer } from "@fobx/react";
import { DialogueBox } from "../../DialogueBox/DialogueBox";

export type MainGameData = {
  backgroundImage: string;
  foregroundImage?: string;
  menuStack: MenuProps[];
  upperText?: string;
  lowerText?: string;
  backgroundMode: "normal" | "battle";
};

export const mainGameData = observable({
  backgroundImage: "back",
  backgroundMode: "normal",
  menuStack: [],
} as MainGameData);

export const MainGame = observer(() => {
  return (
    <div id="main" className="box">
      {mainGameData.backgroundMode === "normal" && (
        <>
          <img
            className="background"
            src={`images/backgrounds/${mainGameData.backgroundImage}.png`}
          />
          {mainGameData.foregroundImage && (
            <img
              className="foreground"
              src={`images/backgrounds/${mainGameData.foregroundImage}.png`}
            />
          )}
        </>
      )}
      {mainGameData.backgroundMode === "battle" && (
        <div id="battle-back" className="box battle-background"></div>
      )}

      <DialogueBox targetText={mainGameData.upperText}></DialogueBox>
      <div id="dialogueBox1" class="dialogueBox bordered">
        <div id="face1"></div>
        <p id="output1" style="visibility: hidden"></p>
      </div>
      <div id="dialogueBox2" class="dialogueBox bordered" style="bottom: 0px">
        <div id="face2" style="height: 36vh; width: 36vh"></div>
        <p id="output2" style="visibility: hidden"></p>
      </div>

      <div id="env-wrapper" class="perspective box"></div>
      <Character {...characterData} />
      <div id="content"></div>

      <Menu {...mainGameData.menuStack.slice(-1)[0]} />
    </div>
  );
});
