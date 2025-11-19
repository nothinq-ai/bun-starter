/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { createRoot } from "react-dom/client";
import { App } from "./app";

let root: ReturnType<typeof createRoot> | null = null;

function start() {
  const container = document.getElementById("root")!;
  if (!root) {
    root = createRoot(container);
  }
  root.render(<App />);
}

if (process.env.NODE_ENV === "development") {
  const script = document.createElement("script");
  script.src = "https://www.nothinq.ai/preload-script.js";
  script.async = true;
  script.id = "nothinq-preload-script";
  if (!document.getElementById("nothinq-preload-script")) {
    document.head.appendChild(script);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
