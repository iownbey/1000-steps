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

const { getRenderer, animations } = loadAsepriteSpritesheet(
  character,
  characterMeta
);

export const CharacterSelect = observer(() => {
  const [zoom, setZoom] = useState(1);
  const controller = useRef(new SpriteController(getRenderer()));
  useEffect(() => {
    controller.current.animate({ frames: animations["Idle"], loop: true });
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
        zoomMultiplier={1}
        zoomOffset={0.1}
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
        maxMouseShift={50}
        zoomMultiplier={1}
        zoomOffset={0.2}
      >
        <img
          src={foreground}
          style={{ width: "100%", height: "100%", position: "absolute" }}
        ></img>
      </ParralaxLayer>
    </>
  );
});
