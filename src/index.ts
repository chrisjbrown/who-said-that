import "../styles/base.scss";

function getContainer() {
   const container = new PIXI.Container();
   container.name = "speaking-indicator";
   const img = "modules/who-said-that/assets/tolkien_marker.png";
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
   sprite.anchor.set(0.5, 0.5);
   sprite.width = canvas.dimensions.size * 1.4;
   sprite.height = canvas.dimensions.size * 1.4;
   container.addChild(sprite);
   return container;
}

export function addSpeakingIndicator(tokenId: string) {
   const token = canvas.tokens.get(tokenId);
   const container = getContainer();
   container.x = token.w / 2;
   container.y = token.h / 2;
   token.addChildAt(container, 0);
}

export function removeSpeakingIndicator(tokenId: string) {
   const token = canvas.tokens.get(tokenId);
   const indicator = token.children.find((c) => c.name === "speaking-indicator");
   if (!indicator) return;
   indicator.destroy({ children: true, texture: true });
   token.removeChild(indicator);
}

let speakingSocket = null;
Hooks.once("socketlib.ready", () => {
   speakingSocket = socketlib.registerModule("who-said-that");
   speakingSocket.register("addSpeakingIndicator", addSpeakingIndicator);
   speakingSocket.register("removeSpeakingIndicator", removeSpeakingIndicator);
   startMicrophoneMonitor();
});

function isUserSpeaking(analyser) {
   const bufferLength = analyser.frequencyBinCount;
   const dataArray = new Uint8Array(bufferLength);
   analyser.getByteFrequencyData(dataArray);

   // Calculate the average sound level
   let sum = 0;
   for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
   }

   // Calculate the average volume
   const average = sum / bufferLength;

   // Threshold for detecting speech (you can adjust this value)
   if (average > 100) {
      return true;
   } else {
      return false;
   }
}

function monitorAudioStream(stream) {
   const audioContext = new AudioContext();
   const analyser = audioContext.createAnalyser();
   const microphone = audioContext.createMediaStreamSource(stream);

   // Connect the microphone to the analyser
   microphone.connect(analyser);

   // Set up the analyser
   analyser.fftSize = 256;

   // Start monitoring the sound
   console.warn("isUserSpeaking");

   let isSpeaking = false;
   let stopSpeakingTimeout: null | NodeJS.Timeout = null;

   function processUpdate() {
      const wasSpeaking = isSpeaking;
      isSpeaking = isUserSpeaking(analyser);

      if (!canvas.tokens || !game.user.character.getActiveTokens()[0]?.id) {
         return requestAnimationFrame(processUpdate);
      }

      const tokenId = game.user.character.getActiveTokens()[0].id;
      if (isSpeaking && !wasSpeaking) {
         console.warn("User started speaking");
         speakingSocket.executeForEveryone(addSpeakingIndicator, tokenId);
         // Clear any existing timeout to reset the "stop speaking" timer
         if (stopSpeakingTimeout) {
            clearTimeout(stopSpeakingTimeout);
            stopSpeakingTimeout = null;
         }
      } else if (wasSpeaking && !stopSpeakingTimeout) {
         stopSpeakingTimeout = setTimeout(() => {
            console.warn("User stopped speaking");
            speakingSocket.executeForEveryone(removeSpeakingIndicator, tokenId);
            isSpeaking = false;
         }, 500); // Wait for 300ms of silence
      }
      requestAnimationFrame(processUpdate);
   }

   processUpdate();
}

function startMicrophoneMonitor() {
   navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
         console.warn("start monitorAudioStream");
         monitorAudioStream(stream);
      })
      .catch(function (error) {
         console.error("Error accessing the microphone:", error);
      });
}
