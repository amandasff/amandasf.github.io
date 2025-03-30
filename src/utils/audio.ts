
// Audio recording and playback utilities

// Function to record audio
export const startRecording = async (): Promise<MediaRecorder> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: BlobPart[] = [];

    mediaRecorder.addEventListener('dataavailable', (event) => {
      audioChunks.push(event.data);
    });

    mediaRecorder.start();
    return mediaRecorder;
  } catch (error) {
    console.error('Error accessing microphone:', error);
    throw new Error('Could not access microphone');
  }
};

// Function to stop recording and get audio blob
export const stopRecording = (mediaRecorder: MediaRecorder): Promise<Blob> => {
  return new Promise((resolve) => {
    const audioChunks: BlobPart[] = [];
    
    // Add event listener for 'dataavailable' if needed
    mediaRecorder.addEventListener('dataavailable', (event) => {
      audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener('stop', () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' }); // More widely supported format
      resolve(audioBlob);
    });

    mediaRecorder.stop();
    
    // Stop each track in the stream
    if (mediaRecorder.stream) {
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  });
};

// Function to play audio from blob - improved for more reliable mobile playback
export const playAudio = (audioBlob: Blob): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a URL for the blob
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create an audio element specifically for this playback
      const audio = new Audio();
      
      // Set up event listeners
      audio.addEventListener('canplaythrough', () => {
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio playback started successfully on mobile');
            })
            .catch(err => {
              console.error('Mobile playback failed:', err);
              reject(new Error(`Playback error: ${err.message}`));
            });
        }
      }, { once: true });
      
      audio.addEventListener('ended', () => {
        console.log('Audio playback ended');
        URL.revokeObjectURL(audioUrl);
        resolve();
      }, { once: true });
      
      audio.addEventListener('error', (error) => {
        console.error('Audio playback error:', error);
        URL.revokeObjectURL(audioUrl);
        reject(new Error(`Audio error: ${error}`));
      }, { once: true });
      
      // Load and play the audio
      audio.src = audioUrl;
      audio.load();
      
      // Additional mobile support
      document.body.appendChild(audio);
      
      // Set a timeout to clean up in case events don't fire
      setTimeout(() => {
        if (document.body.contains(audio)) {
          document.body.removeChild(audio);
          URL.revokeObjectURL(audioUrl);
          resolve();
        }
      }, 10000); // 10 second timeout
      
    } catch (error) {
      console.error('Error in playAudio:', error);
      reject(error);
    }
  });
};

// Function to convert text to speech with enhanced mobile support
export const textToSpeech = (text: string): Promise<SpeechSynthesisUtterance> => {
  return new Promise((resolve, reject) => {
    try {
      // Cancel any ongoing speech synthesis
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set a voice if available to improve consistency
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Try to find a native voice or use the first one
        const englishVoice = voices.find(voice => 
          voice.lang.includes('en') && voice.localService
        ) || voices[0];
        
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }
      
      utterance.rate = 0.9; // Slightly slower for better clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        resolve(utterance);
      };
      
      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        reject(error);
      };
      
      // Add a manual timeout in case events don't fire correctly
      setTimeout(() => {
        if (speechSynthesis.speaking) {
          speechSynthesis.cancel();
          resolve(utterance);
        }
      }, 10000);
      
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Text to speech error:', error);
      reject(error);
    }
  });
};

// Function to convert audio blob to base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(',')[1]); // Remove the data URL prefix
    };
    reader.onerror = (error) => {
      console.error('Blob to base64 error:', error);
      reject(error);
    };
    reader.readAsDataURL(blob);
  });
};

// Function to convert base64 to audio blob - updated for better compatibility
export const base64ToBlob = (base64: string, type = 'audio/mpeg'): Blob => {
  try {
    const binary = atob(base64);
    const arrayBuffer = new ArrayBuffer(binary.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < binary.length; i++) {
      uint8Array[i] = binary.charCodeAt(i);
    }
    
    return new Blob([uint8Array], { type });
  } catch (error) {
    console.error('Base64 to blob error:', error);
    throw error;
  }
};

// Force voices to load - helps with mobile device voice selection
export const preloadVoices = (): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof speechSynthesis !== 'undefined') {
      // Try to load voices synchronously first
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve();
        return;
      }
      
      // If no voices available, try the async approach
      speechSynthesis.onvoiceschanged = () => {
        resolve();
      };
      
      // Trigger voice loading
      speechSynthesis.getVoices();
      
      // Fallback if onvoiceschanged doesn't fire
      setTimeout(resolve, 1000);
    } else {
      resolve();
    }
  });
};

// Helper function to check audio compatibility
export const checkAudioCompatibility = (): {supported: boolean, issues: string[]} => {
  const issues: string[] = [];
  let supported = true;
  
  // Check for basic Audio support
  if (typeof Audio === 'undefined') {
    issues.push('Audio API not supported');
    supported = false;
  }
  
  // Check for MediaRecorder support
  if (typeof MediaRecorder === 'undefined') {
    issues.push('MediaRecorder not supported');
    supported = false;
  }
  
  // Check for Speech Synthesis support
  if (typeof speechSynthesis === 'undefined') {
    issues.push('Speech Synthesis not supported');
    // Not a critical failure, can still play recorded audio
  }
  
  // Check for getUserMedia support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    issues.push('Media devices API not supported');
    supported = false;
  }
  
  return { supported, issues };
};
