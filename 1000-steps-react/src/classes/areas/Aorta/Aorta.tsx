import { MessageBox } from "../../../components/general/MessageBox/MessageBox";
import { mainGameData } from "../../../components/screens/MainGame/MainGame";
import { InputHandler } from "../../InputHandler";
import { Area, type IEvent } from "../Area";

import onceMore from "../../../../sounds/Once More.mp3";
import fight from "../../../../sounds/fight.mp3";
import { Troll } from "./enemies/Troll/troll";
import { Battle } from "../../battle/Battle";

function createMeetTrollEvent() {
  const troll = new Troll();
  const battle = new Battle(fight, [troll]);
  return {
    Component: () => {
      return <battle.Component />;
    },
    happen: async () => {
      mainGameData.upperText =
        "You idiot. What were you doing in a restricted zone?";
      await InputHandler.waitForInput();
      await battle.start();
    },
  };
}

export class Aorta extends Area {
  generateEvents(): (IEvent | null)[] {
    return [
      null,
      createMeetTrollEvent(),
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

          await InputHandler.waitForInput();
        },
      },
    ];
  }
  get music(): string {
    return onceMore;
  }
}
