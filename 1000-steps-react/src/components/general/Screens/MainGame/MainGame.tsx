import { Character, characterData } from "../../Character/Character";
import { Menu } from "../../Menu/Menu";

export const MainGame = () => {
  return (
    <div id="main" class="box" style="visibility: hidden">
      <div id="dialogueBox1" class="dialogueBox bordered">
        <div id="face1"></div>
        <p id="output1" style="visibility: hidden"></p>
      </div>
      <div id="dialogueBox2" class="dialogueBox bordered" style="bottom: 0px">
        <div id="face2" style="height: 36vh; width: 36vh"></div>
        <p id="output2" style="visibility: hidden"></p>
      </div>
      <img id="back" alt src="images/backgrounds/back.png" />
      <div id="env-wrapper" class="perspective box"></div>
      <Character {...characterData} />
      <div id="content"></div>
      <img id="fore" alt style="display: none" />
      <Menu buttons={[[]]} selected="" onNewButtonSelected={() => {}} />
    </div>
  );
};
