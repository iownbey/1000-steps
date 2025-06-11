import { sound } from "./SoundManager";
import speechByte from "../../../sounds/speechByte.mp3";
import normalByte from "../../../sounds/normalByte.mp3";
import blip from "../../../sounds/blip.mp3";
import errorBlip from "../../../sounds/errorBlip.wav";
import footstep from "../../../sounds/footstep.mp3";

export const fx = {
  speechByte: sound.loadPersistant(speechByte),
  normalByte: sound.loadPersistant(normalByte),
  attack: sound.loadPersistant(blip),
  errorBlip: sound.loadPersistant(errorBlip),
  footstep: sound.loadPersistant(footstep),
};
