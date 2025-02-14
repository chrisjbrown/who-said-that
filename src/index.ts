import "../styles/base.scss";

import SpeechDetector from "./speechDetecter";

Hooks.once("socketlib.ready", () => {
   const sd = new SpeechDetector();
   sd.start();
});

Hooks.once("init", () => {
   game.settings.register("who-said-that", "threshold", {
      name: "wst.settings.threshold.name",
      hint: "wst.settings.threshold.hint",
      scope: "client",
      config: true,
      type: Number,
      range: {
         min: 0,
         max: 200,
         step: 1,
      },
      default: 100,
      onChange: function (t) {
         Hooks.call('WSTThresholdChange', t)
      },
   });
})