import clsx from "clsx";
import React, { useEffect } from "react";
import { useAndForwardRef } from "../../../hooks/useAndForwardRef";
import "./fancy.css";
import "./shrinkBorder.css";
import "./mainMenu.css";

type ButtonData = Map<
  string | null,
  {
    refs: Set<React.RefObject<HTMLElement | null>>;
    lastActive?: React.RefObject<HTMLElement>;
  }
>;

const buttonData: ButtonData = new Map();
let activeLayer: string | null = null;

// Switches the active layer and focuses the last active button if it still exists
export function setActiveLayer(layer: string | null) {
  activeLayer = layer;
  if (buttonData.has(activeLayer)) {
    buttonData.get(activeLayer)?.lastActive?.current?.focus();
  }
}

function getRefsForActiveLayer() {
  if (activeLayer === null) {
    return Array.from(
      buttonData.values().flatMap((dataObj) => {
        return Array.from(dataObj.refs);
      })
    ) as React.RefObject<HTMLElement>[];
  }
  return buttonData.get(activeLayer)?.refs.values() || [];
}

function addRefToLayer(
  ref: React.RefObject<HTMLElement | null>,
  layer: string | null
) {
  if (!buttonData.has(layer)) {
    buttonData.set(layer, { refs: new Set() });
  }
  buttonData.get(layer)?.refs.add(ref);
}

function removeRefFromLayer(
  ref: React.RefObject<HTMLElement | null>,
  layer: string | null
) {
  if (buttonData.has(layer)) {
    buttonData.get(layer)?.refs.delete(ref);
    if (buttonData.get(layer)?.refs.size === 0) {
      buttonData.delete(layer);
    }
  }
}

function centerOfRect(rect: DOMRect) {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

type RefWithPoint = {
  ref: { current: HTMLElement };
  point: { x: number; y: number };
};

function onKeyDown(e: React.KeyboardEvent<HTMLElement>) {
  if (!e.target) {
    return;
  }

  if (e.key === "Enter" || e.key === " ") {
    e.currentTarget?.click();
    return;
  }

  if (
    e.key !== "ArrowDown" &&
    e.key !== "ArrowUp" &&
    e.key !== "ArrowLeft" &&
    e.key !== "ArrowRight"
  ) {
    return;
  }

  const myPoint = centerOfRect(e.currentTarget.getBoundingClientRect());

  const targetRects = getRefsForActiveLayer()
    .filter((ref) => ref?.current)
    .map((ref) => {
      return {
        ref,
        point: centerOfRect(ref.current!.getBoundingClientRect()),
      };
    }) as RefWithPoint[];

  const mainAxis = e.key === "ArrowDown" || e.key === "ArrowUp" ? "y" : "x";
  const crossAxis = mainAxis === "y" ? "x" : "y";
  const mainComparator =
    e.key === "ArrowDown" || e.key === "ArrowRight"
      ? (original: number, current: number, check: number) =>
          check > original && check < current
      : (original: number, current: number, check: number) =>
          check < original && check > current;
  const defaultCaseValue =
    e.key === "ArrowDown" || e.key === "ArrowRight" ? Infinity : -Infinity;

  let result: RefWithPoint | null = null;

  for (const target of targetRects) {
    if (
      target.ref.current !== e.currentTarget &&
      mainComparator(
        myPoint[mainAxis],
        result?.point[mainAxis] ?? defaultCaseValue,
        target.point[mainAxis]
      )
    ) {
      console.log(target);
      if (Math.abs(myPoint[crossAxis] - target.point[crossAxis]) < 25) {
        result = target;
      }
    }
  }

  result?.ref.current?.focus();
}

export type ButtonProps = {
  autoFocus?: boolean;
  onTrigger?: (e: React.MouseEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
  layer?: string | null;
  ref?: React.Ref<HTMLDivElement>;
  variant?: "fancy" | "shrink-border" | "main-menu";
} & React.HTMLAttributes<HTMLDivElement>;

export const Button = ({
  autoFocus,
  onTrigger,
  children,
  layer,
  ref,
  variant,
  className,
  ...divAttr
}: ButtonProps) => {
  const buttonRef = useAndForwardRef<HTMLDivElement>(ref);
  const [activated, setActivated] = React.useState(false);

  useEffect(() => {
    addRefToLayer(buttonRef, layer ?? null);
    return () => {
      removeRefFromLayer(buttonRef, layer ?? null);
    };
  }, []);

  useEffect(() => {
    if (autoFocus) {
      buttonRef.current?.focus();
    }
  }, []);

  const isActive = activeLayer === layer || activeLayer === null;

  return (
    <div
      className={clsx("button", activated && "activated", variant, className)}
      tabIndex={isActive ? 0 : -1}
      ref={buttonRef}
      onKeyDown={onKeyDown}
      onClick={(e) => {
        if (!isActive) {
          return;
        }
        setActivated(true);
        onTrigger?.(e);
      }}
      role="button"
      {...divAttr}
    >
      {children}
      {variant === "fancy" && (
        <>
          <div className="button__horizontal" />
          <div className="button__vertical" />
        </>
      )}
    </div>
  );
};
