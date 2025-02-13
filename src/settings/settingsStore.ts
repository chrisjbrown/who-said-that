import { TJSGameSettings, type GameSetting } from "#runtime/svelte/store/fvtt/settings";

import { constants, settings } from "../constants";

class WSTGameSetting extends TJSGameSettings {
   public settingsData: any;

   constructor() {
      super(constants.moduleId);
      this.settingsData = null;
   }

   init(): void {
      const namespace = constants.moduleId;
      const allSettings: GameSetting[] = [];

      this.registerAll(allSettings, false);
   }
}

export const gameSettings = new WSTGameSetting();
