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
  events: (IEvent | null)[];
  eventPos = 0;

  constructor() {
    this.events = this.generateEvents();
    observable(this);
  }

  abstract generateEvents(): (IEvent | null)[];
  abstract get music(): string;

  get remainingEvents() {
    return this.events.slice(this.eventPos);
  }

  async startEvent(index: number) {
    const next = this.events[index];
    if (next) {
      await next.happen();
    }
    sound.playMusic(this.music);
  }

  Component = observer(() => {
    return (
      <>
        {this.remainingEvents.map(
          (e, i) =>
            e && (
              <ContentLayer key={i} stepPos={this.eventPos + i}>
                <e.Component />
              </ContentLayer>
            )
        )}
      </>
    );
  });
}
