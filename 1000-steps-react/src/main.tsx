import { createRoot } from "react-dom/client";
import App from "./components/general/App/App";
import "./main.css";
import { setUpController } from "./functions/setUpController";

new EventSource("/esbuild").addEventListener("change", (e) => {
  const { added, removed, updated } = JSON.parse(e.data);

  if (!added.length && !removed.length && updated.length === 1) {
    for (const link of Array.from(document.getElementsByTagName("link"))) {
      const url = new URL(link.href);

      if (url.host === location.host && url.pathname === updated[0]) {
        const next = link.cloneNode() as typeof link;
        next.href = updated[0] + "?" + Math.random().toString(36).slice(2);
        next.onload = () => link.remove();
        link.parentNode?.insertBefore(next, link.nextSibling);
        return;
      }
    }
  }

  location.reload();
});

setUpController();

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
