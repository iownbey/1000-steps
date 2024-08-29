import { useRef } from "react";
import { MainMenuButton } from "./MainMenuButton/MainMenuButton";
import { screenCover } from "../../../classes/ScreenCover/ScreenCover";

async function startNewGame() {
  console.log("starting game.");
  cover.color = "black";
  sound.playFX("game-start-effect");
  await screenCover.fadeTo(1, 6000);
  startIntro();
  await screenCover.fadeTo(0, 1000);
}

async function continueGame() {
  console.log("loading game.");
  cover.color = "black";
  await cover.fadeTo(1, 2000);
  await loadGame();
  await cover.fadeTo(0, 2000);
}

export const selected = { value: 0 };

export const MainMenu = () => {
  const newGameRef = useRef(null);
  const continueGameRef = useRef(null);
  const settingsRef = useRef(null);

  return (
    <div
      className="main-menu box flexcenterer"
      style={{ visibility: "hidden" }}
    >
      <h1 id="main-heading">1000 STEPS</h1>
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

      <p id="information" style={{ whiteSpace: "pre-wrap" }}></p>
    </div>
  );
};
