import { ParralaxLayer } from "./ParralaxLayer/ParralaxLayer";
import farBack from "./images/far-back.png";
import back from "./images/back.png";
import foreground from "./images/foreground.png";
import character from "./images/intro.png";
import characterMeta from "./images/intro.json";
import { useEffect, useMemo, useRef, useState } from "react";
import { observer } from "@fobx/react";
import { SpriteController } from "../../../../classes/sprites/SpriteController";
import { loadAsepriteSpritesheet } from "../../../../classes/sprites/loadAseprite";
import { InputHandler } from "../../../../classes/InputHandler";
import { MessageBox } from "../../MessageBox/MessageBox";
import { screenCover } from "../../ScreenCover/ScreenCover";

const { getRenderer, animations } = loadAsepriteSpritesheet(
  character,
  characterMeta
);

export const CharacterSelect = observer(() => {
  const [zoom, setZoom] = useState(1);
  const controller = useRef(new SpriteController(getRenderer()));
  useEffect(() => {
    controller.current.animate({ frames: animations["Idle"], loop: true });

    const input = new InputHandler((e) => {
      console.log(e);
      if (e.key === "lmb") {
        controller.current.animate({
          frames: animations["Pull"],
          loop: false,
          onEnd: () => {
            setZoom(10);
            screenCover.setColor("black");
            screenCover.fadeTo(1, 2000);
          },
        });
      }
    });

    return () => {
      console.log("dispose");
      input.dispose();
    };
  }, []);

  return (
    <>
      <ParralaxLayer
        zoom={zoom}
        maxMouseShift={5}
        zoomMultiplier={1}
        zoomOffset={0}
      >
        <img
          src={farBack}
          style={{ width: "100%", height: "100%", position: "absolute" }}
        ></img>
      </ParralaxLayer>
      <ParralaxLayer
        zoom={zoom}
        maxMouseShift={20}
        zoomMultiplier={6.1}
        zoomOffset={-5}
      >
        <img
          src={back}
          style={{ width: "100%", height: "100%", position: "absolute" }}
        ></img>
        <div
          style={{
            width: "100%",
            height: "100%",
            ...controller.current.renderer.style,
          }}
        />
      </ParralaxLayer>
      <ParralaxLayer
        zoom={zoom}
        maxMouseShift={35}
        zoomMultiplier={4.15}
        zoomOffset={-3}
      >
        <MessageBox
          style={{
            position: "absolute",
            left: "10%",
            top: "20%",
            width: "20%",
            height: "40%",
          }}
        >
          <h1>The Regretful</h1>
          <div className="divider"></div>
          <p>
            Kill Enemies to gain remorse, and spend remorse to upgrade your
            abilities
          </p>
        </MessageBox>
      </ParralaxLayer>
      <ParralaxLayer
        zoom={zoom}
        maxMouseShift={50}
        zoomMultiplier={11.2}
        zoomOffset={-10}
      >
        <img
          src={foreground}
          style={{ width: "100%", height: "100%", position: "absolute" }}
        ></img>
      </ParralaxLayer>
    </>
  );
});
