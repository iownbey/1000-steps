import { MessageBox } from "../../../components/general/MessageBox/MessageBox";
import { Area, type IEvent } from "../Area";

export class Aorta extends Area {
  generateEvents(): IEvent[] {
    return [
      {
        Component: () => {
          return (
            <MessageBox style={{ width: "100%", height: "100%" }}>
              Testing
            </MessageBox>
          );
        },
        happen: async () => {
          await new Promise(() => {});
          console.log("activated");
        },
      },
    ];
  }
  get music(): string {
    return "back";
  }
}
