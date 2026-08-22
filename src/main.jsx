import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import "./analytics";

import App from "./App.jsx";
import { StudentProvider } from "./context/StudentContext";

if ("requestIdleCallback" in window) {
  window.requestIdleCallback(() => {
    import("aos").then(({ default: AOS }) => {
      import("aos/dist/aos.css");
      AOS.init({ duration: 1000, once: true });
    });
  });
} else {
  setTimeout(() => import("aos").then(({ default: AOS }) => {
    import("aos/dist/aos.css");
    AOS.init({ duration: 1000, once: true });
  }), 1000);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <StudentProvider>
        <App />
      </StudentProvider>
    </BrowserRouter>
  </StrictMode>
);