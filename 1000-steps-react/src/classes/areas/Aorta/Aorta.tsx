import { MessageBox } from "../../../components/general/MessageBox/MessageBox";
import { mainGameData } from "../../../components/screens/MainGame/MainGame";
import { InputHandler } from "../../InputHandler";
import { Area, type IEvent } from "../Area";

import onceMore from "../../../../sounds/Once More.mp3";

export class Aorta extends Area {
  generateEvents(): (IEvent | null)[] {
    return [
      null,
      {
        Component: () => {
          return (
            <MessageBox style={{ width: "100%", height: "100%" }}>
              Testing
            </MessageBox>
          );
        },
        happen: async () => {
          console.log("activated");
          await InputHandler.waitForInput();
          console.log("setting text");
          mainGameData.upperText = "Wow, does this work at all?";
          await InputHandler.waitForInput();
          mainGameData.upperText =
            "Wow, does this work at all?|It sure appears to!";
          await InputHandler.waitForInput();
          mainGameData.upperText = "And one more message";
          mainGameData.lowerText = "This is neat";

          await new Promise(() => {});
        },
      },
    ];
  }
  get music(): string {
    return onceMore;
  }
}
