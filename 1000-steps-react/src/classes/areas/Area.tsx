import { observable } from "@fobx/core";
import { observer } from "@fobx/react";
import { ContentLayer } from "../../components/screens/MainGame/ContentLayer/ContentLayer";
import { sound } from "../SoundManager";
import type { ReactNode } from "react";

export interface IEvent {
  Component(): ReactNode;
  happen(): Promise<void>;
}

export abstract class Area {
  events: IEvent[];
  eventPos = 0;

  constructor() {
    this.events = this.generateEvents();
    observable(this);
  }

  abstract generateEvents(): IEvent[];
  abstract get music(): string;

  get remainingEvents() {
    return this.events.slice(this.eventPos);
  }

  async startEvent(index: number) {
    await this.events[index].happen();
    sound.playMusic(this.music);
  }

  Component = observer(() => {
    return (
      <>
        {this.remainingEvents.map((e, i) => (
          <ContentLayer key={i} stepPos={this.eventPos + i}>
            <e.Component />
          </ContentLayer>
        ))}
      </>
    );
  });
}
