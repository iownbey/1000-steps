import type { Ability } from "./Character";

export const strike = {
  name: "Strike",
  description: "Strike your opponent, dealing 10 damage",
  happen() {},
} satisfies Ability;
