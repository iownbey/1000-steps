import { observable } from "@fobx/core";
import { ReactNode } from "react";
import { MainMenu } from "../Screens/MainMenu/MainMenu";
import { MainGame } from "../Screens/MainGame/MainGame";
import { CharacterSelect } from "../Screens/CharacterSelect/CharacterSelect";

class ScreenRouter<T extends Record<string, ReactNode>> {
  screens: T;
  activeScreen: keyof T;

  switch(activeScreen: keyof T) {
    this.activeScreen = activeScreen;
  }

  constructor(screens: T, initialScreen: keyof T) {
    this.screens = screens;
    this.activeScreen = initialScreen;
    observable(this);
  }

  get activeScreenNode() {
    return this.screens[this.activeScreen];
  }
}

export const screenRouter = new ScreenRouter(
  {
    "main menu": <MainMenu />,
    main: <MainGame />,
    "character select": <CharacterSelect />,
  },
  "main"
);
