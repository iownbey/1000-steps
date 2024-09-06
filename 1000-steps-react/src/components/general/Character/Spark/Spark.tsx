import { SpriteRenderer } from "../../../../classes/SpriteRenderer";
import { observer } from "@fobx/react";
import { SparkHandler } from "./SparkHandler";

export type SparkProps = {
  sparkHandler: SparkHandler;
};

export const Spark = observer(({ sparkHandler }: SparkProps) => {
  return sparkHandler.chargeLevel ? <div {...sparkHandler.attributes} /> : null;
});
