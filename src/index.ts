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
         max: 100,
         step: 1,
      },
      default: 50,
      onChange: function (t) {
         Hooks.call('WSTThresholdChange', t)
      },
   });

   game.settings.register("who-said-that", "indicatorStyle", {
      name: "wst.settings.indicator.name",
      hint: "",
      scope: "client",
      config: true,
      requiresReload: false,
      type: String,
      choices: {
         "modules/who-said-that/assets/dark-bubble.webm": "wst.settings.indicator.choices.dark",
         "modules/who-said-that/assets/blue-bubble.webm": "wst.settings.indicator.choices.blue"
      },
      default: "modules/who-said-that/assets/dark-bubble.webm",
   });

})