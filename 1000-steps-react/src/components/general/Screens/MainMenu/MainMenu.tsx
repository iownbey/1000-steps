import { useRef } from "react";
import { MainMenuButton } from "./MainMenuButton/MainMenuButton";
import { screenCover } from "../../ScreenCover/ScreenCover";
import { sound } from "../../../../classes/SoundManager";
import { VersionInfo } from "./VersionInfo/VersionInfo";
import "./mainMenu.css";
import gameStartFX from "./game-start-effect.mp3";

async function startNewGame() {
  console.log("starting game.");
  sound.playFX(gameStartFX);
  screenCover.setColor("black");
  await screenCover.fadeTo(1, 6000);
  //startIntro();
  await screenCover.fadeTo(0, 1000);
}

async function continueGame() {
  console.log("loading game.");
  screenCover.setColor("black");
  await screenCover.fadeTo(1, 2000);
  //await loadGame();
  await screenCover.fadeTo(0, 2000);
}

export const selected = { value: 0 };

export const MainMenu = () => {
  const newGameRef = useRef(null);
  const continueGameRef = useRef(null);
  const settingsRef = useRef(null);

  return (
    <div className="main-menu box flexcenterer">
      <h1 className="main-heading">1000 STEPS</h1>
      <MainMenuButton
        ref={continueGameRef}
        lowerRef={newGameRef}
        onClick={() => continueGame()}
      >
        CONTINUE
      </MainMenuButton>
      <MainMenuButton
        ref={newGameRef}
        upperRef={continueGameRef}
        lowerRef={newGameRef}
        onClick={() => startNewGame()}
      >
        START ANEW
      </MainMenuButton>
      <MainMenuButton ref={settingsRef} upperRef={newGameRef}>
        SETTINGS
      </MainMenuButton>

      <VersionInfo />
    </div>
  );
};
