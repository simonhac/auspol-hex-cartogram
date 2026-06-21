import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Fonts (self-hosted so they ship under the GH Pages base path).
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/source-serif-4/400.css";
import "@fontsource/source-serif-4/600.css";
import "@fontsource/jetbrains-mono/400.css";

// Library chart styles, then gallery chrome.
import "auspoligraphs/charts.css";
import "./styles/gallery.css";

import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* basename mirrors Vite's `base` so routing works under /<repo>/. */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
