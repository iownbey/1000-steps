import { useEffect } from "react";
import { Initialize, Particles } from "../ScreenParticles/ScreenParticles";
import { ScreenCoverComponent } from "../ScreenCover/ScreenCover";
import { screenRouter } from "../ScreenRouter/ScreenRouter";

function App() {
  useEffect(() => {
    Initialize();
  }, []);

  return (
    <>
      <div id="gamewindow">{screenRouter.activeScreenNode}</div>
      <canvas id="content-canvas"></canvas>
      <ScreenCoverComponent />
      <Particles />
    </>
  );
}

export default App;
