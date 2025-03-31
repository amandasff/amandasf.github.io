
import { base64ToBlob, textToSpeech } from '@/utils/audio';

/**
 * Play audio from a label object, handling both recorded audio and text-to-speech
 */
export async function playLabelAudio(label: any, onComplete?: () => void): Promise<void> {
  console.log("playLabelAudio called for label:", label.name);
  
  // For iOS, we need a user interaction to play audio
  // This function should be called directly from a user interaction (button click)
  // or very soon after a user interaction (like scanning a QR code)
  
  try {
    if (label.audioData) {
      await playAudioFromBase64(label.audioData, onComplete);
    } else if (label.content) {
      await speakText(label.content, onComplete);
    } else {
      console.error("No audio data or content found in label");
      throw new Error("No audio content available");
    }
  } catch (error) {
    console.error("Error in playLabelAudio:", error);
    throw error;
  }
}

/**
 * Play audio from base64-encoded audio data
 */
async function playAudioFromBase64(base64AudioData: string, onComplete?: () => void): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      console.log("Converting base64 to blob");
      const audioBlob = base64ToBlob(base64AudioData);
      console.log("Created audio blob:", audioBlob.size, "bytes, type:", audioBlob.type);
      
      // Create audio element
      const audio = new Audio();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Set up event listeners
      audio.onended = () => {
        console.log("Audio playback ended successfully");
        URL.revokeObjectURL(audioUrl);
        onComplete?.();
        resolve();
      };
      
      audio.onerror = (event) => {
        console.error("Audio playback error:", event);
        URL.revokeObjectURL(audioUrl);
        reject(new Error("Audio playback failed"));
      };
      
      // Load and play
      audio.src = audioUrl;
      audio.load();
      
      // Try to play immediately
      console.log("Attempting to play audio");
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Play promise rejected:", error);
          
          // On mobile, we might need a workaround
          console.log("Trying alternative playback method");
          
          // Clean up the previous attempt
          URL.revokeObjectURL(audioUrl);
          
          // Create a new audio context (works better on Safari/iOS)
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          const audioContext = new AudioContext();
          
          // Convert blob to arraybuffer
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              // Decode the audio data
              const arrayBuffer = event.target?.result as ArrayBuffer;
              const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
              
              // Create source node
              const source = audioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioContext.destination);
              
              // Play the audio
              source.onended = () => {
                console.log("Audio buffer source ended");
                onComplete?.();
                resolve();
              };
              
              // Start playing
              source.start(0);
              console.log("Started audio buffer source");
            } catch (decodeError) {
              console.error("Error decoding audio data:", decodeError);
              reject(decodeError);
            }
          };
          
          reader.onerror = () => {
            reject(new Error("Error reading audio file"));
          };
          
          reader.readAsArrayBuffer(audioBlob);
        });
      }
    } catch (error) {
      console.error("Error in playAudioFromBase64:", error);
      reject(error);
    }
  });
}

/**
 * Use speech synthesis to speak text
 */
async function speakText(text: string, onComplete?: () => void): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      console.log("Speaking text using speech synthesis:", text);
      
      // Cancel any ongoing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set up voices
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Try to find an English voice
        const englishVoice = voices.find(voice => 
          voice.lang.includes('en') && voice.localService
        ) || voices[0];
        
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }
      
      // Configure the utterance
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Set up event listeners
      utterance.onend = () => {
        console.log("Speech synthesis ended");
        onComplete?.();
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        reject(new Error("Speech synthesis failed"));
      };
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
      
      // Safety timeout in case events don't fire correctly
      setTimeout(() => {
        if (window.speechSynthesis.speaking) {
          console.log("Speech timeout reached, forcing completion");
          window.speechSynthesis.cancel();
          onComplete?.();
          resolve();
        }
      }, 10000);
    } catch (error) {
      console.error("Error in speakText:", error);
      reject(error);
    }
  });
}
