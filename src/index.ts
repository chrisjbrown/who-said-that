import "../styles/base.scss";

import SpeechDetector from "./speechDetecter";

Hooks.once("socketlib.ready", () => {
   const sd = new SpeechDetector();
   sd.start();
});
