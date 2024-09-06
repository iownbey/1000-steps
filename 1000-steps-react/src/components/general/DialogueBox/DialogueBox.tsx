import { ReactNode, useEffect, useRef, useState } from "react";
import { sound } from "../../../classes/SoundManager";

export type DialogueBoxProps = {
  targetText: string;
  charDelay: number;
  slowCharDelay: number;
  autoHideAfterMs?: number;
  letterSound?: number;
  textClass?: string;
};

const nl = "|";
const startInlineClass = "<";
const endInlineClass = ">";

type PrintState = {
  parsedText: string;
  displayItems: ReactNode[];
  currentClasses: Set<string>;
};

function getDefaultPrintState() {
  return {
    currentClasses: new Set(),
    parsedText: "",
    displayItems: [],
  } as PrintState;
}

function parseInlineClasses(
  nextText: string,
  parsedText: string,
  currentClasses: Set<string>
) {
  while (nextText.startsWith(startInlineClass)) {
    const end = nextText.indexOf(endInlineClass);
    const newClass = nextText.substring(startInlineClass.length + 1, end);
    parsedText += nextText.substring(0, end + endInlineClass.length);
    nextText = nextText.substring(end + endInlineClass.length);
    if (!currentClasses.delete(newClass)) {
      currentClasses.add(newClass);
    }
  }
  return { nextText, parsedText };
}

export const DialogueBox = ({
  targetText,
  letterSound,
  charDelay,
  slowCharDelay,
  autoHideAfterMs,
}: DialogueBoxProps) => {
  const [printState, setPrintState] = useState(getDefaultPrintState());
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    clearTimeout(timeout.current);

    let { parsedText, displayItems, currentClasses } = printState;

    if (parsedText !== targetText) {
      if (!targetText.startsWith(parsedText)) {
        // reset state
        setPrintState(getDefaultPrintState());
      } else {
        let nextText = targetText.substring(parsedText.length);

        ({ nextText, parsedText } = parseInlineClasses(
          nextText,
          parsedText,
          currentClasses
        ));

        if (nextText) {
          const nextChar = nextText[0];
          if (nextChar === nl) {
            displayItems.push(<br />);
          } else {
            displayItems.push(<span>{nextChar}</span>);
          }

          if (letterSound && nextChar.match(/[a-z]/i)) {
            sound.playPersistant(letterSound);
          }
          parsedText += nextChar;

          const timeoutMs = nextChar === "." ? charDelay : slowCharDelay;

          timeout.current = setTimeout(() => {
            setPrintState({
              parsedText,
              displayItems,
              currentClasses,
            });
          }, timeoutMs);
        } else {
          if (autoHideAfterMs) {
            timeout.current = setTimeout(() => {
              setPrintState(getDefaultPrintState());
            }, autoHideAfterMs);
          }
        }
      }
    }
  }, [targetText, printState]);

  return targetText ? (
    <div class="dialogueBox bordered" style="bottom: 0px">
      <div style="height: 36vh; width: 36vh"></div>
      <p>{printState.displayItems}</p>
    </div>
  ) : null;
};
