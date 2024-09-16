import { useEffect } from "react";
import { Initialize, Particles } from "../ScreenParticles/ScreenParticles";
import { ScreenCoverComponent } from "../ScreenCover/ScreenCover";
import { screenRouter } from "../ScreenRouter/ScreenRouter";
import { observable } from "@fobx/core";
import { Cursor, CursorProps } from "../Cursor/Cursor";

export type GlobalData = {
  cursor: CursorProps;
};

export const globalControl = observable({
  cursor: {
    show: false,
  } as any as CursorProps,
} as GlobalData);

function App() {
  useEffect(() => {
    Initialize();
  }, []);

  return (
    <>
      <div id="gamewindow">{screenRouter.activeScreenNode}</div>
      <canvas id="content-canvas"></canvas>
      <Particles />
      <Cursor {...globalControl.cursor} />
      <ScreenCoverComponent />
    </>
  );
}

export default App;
