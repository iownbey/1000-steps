import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import "./ground.css";
import { observer } from "@fobx/react";

const stepsPerTile = 20;

function normalize(value: number, max: number) {
  return (value / max) * -2 + 1;
}

export const Ground = observer(
  ({
    image,
    steps,
    color,
    children,
  }: PropsWithChildren<{ image: string; steps: number; color: string }>) => {
    const [blend, setBlend] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const handleMouse = useCallback((e: MouseEvent) => {
      setBlend(1);
      setMousePos({
        x: normalize(e.screenX, window.innerWidth),
        y: normalize(e.screenY, window.innerHeight),
      });
    }, []);

    const handleMouseOut = useCallback((e: MouseEvent) => {
      setBlend(0);
    }, []);

    useEffect(() => {
      window.addEventListener("mouseout", handleMouseOut);
      window.addEventListener("mousemove", handleMouse);
      return () => {
        window.removeEventListener("mouseout", handleMouseOut);
        window.removeEventListener("mousemove", handleMouse);
      };
    });

    return (
      <div className="perspective box">
        <div
          className="floor-plane"
          style={{
            transform: `rotateX(90deg) rotateZ(${mousePos.x * 3}deg) rotateX(${
              mousePos.y * 3
            }deg)`,
          }}
        >
          <div
            className="ground"
            style={{
              backgroundColor: color,
            }}
          />
          <div
            className="path"
            style={{
              backgroundImage: `url(${image})`,
              backgroundPositionY: `${(steps / stepsPerTile) * 100}%`,
            }}
          />
          {children}
        </div>
      </div>
    );
  }
);
