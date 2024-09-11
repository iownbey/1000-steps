import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import "./popIn.css";

export type TransitionedProperty = {
  property: keyof CSSProperties;
  inactive: string;
  active: string;
  duration?: number;
  easing?: string;
};

export const popInFromLeft = {
  property: "left",
  inactive: "-100%",
  active: "0%",
  duration: 500,
};

export const popInFromRight = {
  property: "right",
  inactive: "-100%",
  active: "0%",
  duration: 500,
};

export const fadeIn = {
  property: "opacity",
  inactive: "0",
  active: "1",
  duration: 1000,
};

export type PopInProps = {
  text: string;
  timeoutMs: number;
  forceHide?: boolean;
  transitionedProperties: TransitionedProperty[];
};

export const PopIn = ({
  text,
  timeoutMs,
  transitionedProperties,
  forceHide,
}: PopInProps) => {
  const [show, setShow] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    setShow(true);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      setShow(false);
    }, timeoutMs);
  }, [text]);

  const style = {} as CSSProperties;
  const transitions = [];
  transitionedProperties.forEach((a) => {
    style[a.property as any] = `${show && !forceHide ? a.active : a.inactive}%`;
    transitions.push(
      `${a.property} ${a.duration ?? 500}ms ${a.easing ?? "ease-in-out"}`
    );
  });
  style.transition = transitions.join(", ");

  return (
    <p
      id="health-pop-in"
      style={style}
      className="pop-in bordered big-text transition-position"
    >
      {text}
    </p>
  );
};
