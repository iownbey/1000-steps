import { observable, observableBox } from "@fobx/core";
import { observer } from "@fobx/react";
import { useEffect } from "react";
import "./versionInfo.css";

async function updateVersionInfo() {
  const resp = await fetch(
    "https://api.github.com/repos/iownbey/1000-steps/commits?sha=main&per_page=1"
  );
  const resp_json = await resp.json();
  newestCommit = resp_json[0].commit;
}

let newestCommit = observable({ author: { date: "", name: "" }, message: "" });
const loaded = observableBox(false);

export const VersionInfo = observer(() => {
  useEffect(() => {
    updateVersionInfo();
  }, []);

  const message = `-1000 Steps-
    Last Commit on ${new Date(newestCommit.author.date).toDateString()} by ${
    newestCommit.author.name
  }: ${newestCommit.message}
    Shift+F to toggle fullscreen // Shift+S to save // Shift+L to Quick-Load the most recent save.`;

  return (
    <p className="version-info" style={{ opacity: loaded.value ? 1 : 0 }}>
      {message}
    </p>
  );
});
