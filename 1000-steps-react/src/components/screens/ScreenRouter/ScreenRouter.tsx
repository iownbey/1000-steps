import { observable } from "@fobx/core";
import { type ReactNode } from "react";
import { MainMenu } from "../MainMenu/MainMenu";
import { CharacterSelect } from "../CharacterSelect/CharacterSelect";
import { MainGame } from "../MainGame/MainGame";

class ScreenRouter<T extends Record<string, ReactNode>> {
  screens: T;
  activeScreen: keyof T;

  switch(activeScreen: keyof T) {
    this.activeScreen = activeScreen;
  }

  constructor(screens: T, initialScreen: keyof T) {
    this.screens = screens;
    this.activeScreen = initialScreen;
    observable(this, { screens: "none" });
  }

  get activeScreenNode() {
    return this.screens[this.activeScreen];
  }
}

export const screenRouter = new ScreenRouter(
  {
    "main menu": <MainMenu />,
    "character select": <CharacterSelect />,
    main: <MainGame />,
  },
  "main"
);
