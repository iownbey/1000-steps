import { InputHandler } from "../../../classes/InputHandler";
import { mainGameData } from "./MainGame";

export async function upperWrite(write: string) {
  mainGameData.upperText = write;
  await InputHandler.waitForInput();
  mainGameData.upperText = undefined;
}

export async function lowerWrite(write: string) {
  mainGameData.lowerText = write;
  await InputHandler.waitForInput();
  mainGameData.lowerText = undefined;
}
