import { screenCover } from "../../general/ScreenCover/ScreenCover";
import { sound } from "../../../classes/sound/SoundManager";
import { VersionInfo } from "./VersionInfo/VersionInfo";
import "./mainMenu.css";
import gameStartFX from "./game-start-effect.mp3";
import { screenRouter } from "../ScreenRouter/ScreenRouter";
import { Button } from "../../general/Button/Button";

async function startNewGame() {
  console.log("starting game.");
  sound.playFX(gameStartFX);
  screenCover.setColor("black");
  await screenCover.fadeTo(1, 2000);
  screenRouter.switch("character select");
  await screenCover.fadeTo(0, 1000);
}

async function continueGame() {
  console.log("loading game.");
  screenCover.setColor("black");
  await screenCover.fadeTo(1, 2000);
  //await loadGame();
  await screenCover.fadeTo(0, 2000);
}

export const MainMenu = () => {
  return (
    <div className="main-menu box flexcenterer">
      <h1 className="main-heading">1000 STEPS</h1>
      <Button autoFocus onTrigger={() => continueGame()} variant="main-menu">
        CONTINUE
      </Button>
      <Button onTrigger={() => startNewGame()} variant="main-menu">
        START ANEW
      </Button>
      <Button variant="main-menu">SETTINGS</Button>

      <VersionInfo />
    </div>
  );
};
