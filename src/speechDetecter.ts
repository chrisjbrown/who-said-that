import { addSpeakingIndicator, removeSpeakingIndicator, getTokenIds } from "./helpers"
export default class SpeechDetector {
    readonly debounceTime: number;
    readonly speakingSocket: any;
    private threshold: number;
    private isSpeaking: boolean;
    private speakingTimer: NodeJS.Timeout | null;
    private stopSpeakingTimeout: NodeJS.Timeout | null;
    private audioContext: AudioContext | null;
    private analyser: AnalyserNode | null;
    private microphone: MediaStreamAudioSourceNode | null;
    private dataArray: Uint8Array;

    constructor(threshold: number = 50, debounceTime: number = 700) {
        this.threshold = threshold;
        this.debounceTime = debounceTime;
        this.isSpeaking = false;
        this.speakingTimer = null;
        this.stopSpeakingTimeout = null;
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.dataArray = new Uint8Array(0);
        this.speakingSocket = socketlib.registerModule("who-said-that");
        this.speakingSocket.register("addSpeakingIndicator", addSpeakingIndicator);
        this.speakingSocket.register("removeSpeakingIndicator", removeSpeakingIndicator);

        Hooks.on('WSTThresholdChange', (threshold: number) => {
            this.setThreshold(threshold)
        })
    }

    // Starts monitoring the microphone
    async start(): Promise<void> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            this.audioContext = new window.AudioContext();
            this.analyser = this.audioContext.createAnalyser();
            this.microphone = this.audioContext.createMediaStreamSource(stream);

            this.microphone.connect(this.analyser);

            this.analyser.fftSize = 256;
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);

            this.checkIfUserIsSpeaking();
        } catch (error) {
            console.error("WST - Error accessing the microphone:", error);
        }
    }

    // Continuously checks if the user is speaking
    private checkIfUserIsSpeaking(): void {
        if (!this.analyser) return;

        this.analyser.getByteFrequencyData(this.dataArray);

        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        const average = sum / this.dataArray.length;


        const tokenIds = getTokenIds()
        if (tokenIds.length > 0) {
            if (average > this.threshold) {
                if (!this.isSpeaking && !this.speakingTimer) {
                    // Start a timer to detect sustained speaking for 500ms
                    this.speakingTimer = setTimeout(() => {
                        console.log("WST - User started speaking");
                        this.isSpeaking = true;
                        this.speakingSocket.executeForEveryone(addSpeakingIndicator, tokenIds);
                    }, 300); // Delay detection for 300ms
                }

                if (this.stopSpeakingTimeout) {
                    clearTimeout(this.stopSpeakingTimeout);
                    this.stopSpeakingTimeout = null;
                }
            } else {
                if (this.isSpeaking && !this.stopSpeakingTimeout) {
                    this.stopSpeakingTimeout = setTimeout(() => {
                        console.log("WST - User stopped speaking");
                        this.isSpeaking = false;
                        this.speakingSocket.executeForEveryone(removeSpeakingIndicator, tokenIds);
                    }, this.debounceTime);
                }

                // Reset the speaking timer if user stops speaking
                if (this.speakingTimer) {
                    clearTimeout(this.speakingTimer);
                    this.speakingTimer = null;
                }
            }
        }
        requestAnimationFrame(this.checkIfUserIsSpeaking.bind(this));
    }

    // Sets a new threshold value dynamically
    setThreshold(newThreshold: number): void {
        console.log(`WST - Threshold updated to: ${newThreshold}`);
        this.threshold = newThreshold;
    }

    // Stops the speech detection and cleans up resources
    stop(): void {
        if (this.stopSpeakingTimeout) {
            clearTimeout(this.stopSpeakingTimeout);
            this.stopSpeakingTimeout = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}
