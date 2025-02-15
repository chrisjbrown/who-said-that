function getContainer() {
   const container = new PIXI.Container();
   container.name = "speaking-indicator";
   const img = game.settings.get('who-said-that', 'indicatorStyle');
   const alpha = 1;
   let video = img.endsWith("webm") ? document.createElement("video") : null;
   if (video) {
      video.muted = true;
      video.src = img;
      video.loop = true;
      video.muted = true;
   }
   const sprite = PIXI.Sprite.from(video ?? img);
   sprite.alpha = alpha;
   sprite.width = 400;
   sprite.height = 400;
   sprite.anchor.set(0.2, 0.8);
   sprite.width = canvas.dimensions.size * 1.4;
   sprite.height = canvas.dimensions.size * 1.4;
   container.addChild(sprite);
   return container;
}

export function addSpeakingIndicator(tokenIds: string[]) {
   tokenIds.forEach((tokenId) => {
      try {
         const token = canvas.tokens.get(tokenId);
         const container = getContainer();
         container.x = token.w / 2;
         container.y = token.h / 2;
         token.addChild(container);
      } catch (error) {
         console.error("WST - error adding indicator", error);
      }
   })
}

export function removeSpeakingIndicator(tokenIds: string[]) {
   tokenIds.forEach((tokenId) => {
      try {
         const token = canvas.tokens.get(tokenId);
         const indicator = token.children.find((c) => c.name === "speaking-indicator");
         if (!indicator) return;
         indicator.destroy({ children: true, texture: true });
         token.removeChild(indicator);
      } catch (error) {
         console.error("WST - error removing indicator", error);
      }
   })
}

export function getTokenIds(): string[] {
   if (game?.user?.isGM) {
      return canvas?.tokens?.controlled.map(t => t.id) ?? []
   }
   return game.user?.character?.getActiveTokens().map(t => t.id) ?? []
}