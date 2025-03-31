
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

// Function to play audio from blob - enhanced for mobile support
export const playAudio = (audioBlob: Blob): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a URL for the blob
      const audioUrl = URL.createObjectURL(audioBlob);
      
      console.log("Playing audio with URL:", audioUrl);
      
      // Try multiple approaches for compatibility
      playWithAudioElement(audioUrl)
        .then(() => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        })
        .catch(err => {
          console.error("Standard playback failed, trying alternative:", err);
          
          // If audio element fails, try WebAudio API as fallback for mobile
          playWithWebAudio(audioBlob)
            .then(() => {
              URL.revokeObjectURL(audioUrl);
              resolve();
            })
            .catch(fallbackErr => {
              console.error("All playback methods failed:", fallbackErr);
              URL.revokeObjectURL(audioUrl);
              reject(fallbackErr);
            });
        });
    } catch (error) {
      console.error('Error in playAudio:', error);
      reject(error);
    }
  });
};

// Helper method to play with standard Audio element
const playWithAudioElement = (audioUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Create an audio element specifically for this playback
    const audio = new Audio();
    
    // Add audio element to document for better mobile compatibility
    document.body.appendChild(audio);
    
    // Set up event listeners
    const handleCanPlay = () => {
      console.log('Audio can play through');
      tryPlayWithUnlock();
    };
    
    const tryPlayWithUnlock = () => {
      console.log('Trying to play audio with user action simulation');
      
      // This trick helps with autoplay restrictions on mobile
      const clickEvent = document.createEvent('MouseEvents');
      clickEvent.initEvent('click', true, true);
      document.body.dispatchEvent(clickEvent);
      
      const touchEvent = document.createEvent('TouchEvent');
      touchEvent.initEvent('touchend', true, true);
      document.body.dispatchEvent(touchEvent);
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Audio playback started successfully');
          })
          .catch(err => {
            console.error('Standard playback failed:', err);
            cleanup();
            reject(err);
          });
      }
    };
    
    const handleEnded = () => {
      console.log('Audio playback ended');
      cleanup();
      resolve();
    };
    
    const handleError = (e: Event) => {
      console.error('Audio playback error:', e);
      cleanup();
      reject(new Error(`Audio error: ${e}`));
    };
    
    // Clean up function to remove the audio element and event listeners
    const cleanup = () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      
      if (document.body.contains(audio)) {
        document.body.removeChild(audio);
      }
    };
    
    // Set up event listeners
    audio.addEventListener('canplaythrough', handleCanPlay, { once: true });
    audio.addEventListener('ended', handleEnded, { once: true });
    audio.addEventListener('error', handleError, { once: true });
    
    // Load the audio
    audio.src = audioUrl;
    audio.load();
    
    // Set a timeout to clean up in case events don't fire
    setTimeout(() => {
      if (document.body.contains(audio)) {
        cleanup();
        resolve();
      }
    }, 30000); // 30 second timeout
  });
};

// Helper method using WebAudio API for mobile
const playWithWebAudio = (audioBlob: Blob): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Create a new audio context
    try {
      // @ts-ignore - for older browser compatibility
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      
      // Create a file reader to read the blob
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          if (!e.target || !e.target.result) {
            throw new Error("FileReader result is null");
          }
          
          // Decode the audio data
          const audioArrayBuffer = e.target.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(audioArrayBuffer);
          
          // Create a source node
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          
          // Connect the source to the destination (speakers)
          source.connect(audioContext.destination);
          
          // Set up event handlers
          source.onended = () => {
            console.log("WebAudio playback ended");
            if (audioContext.state !== 'closed') {
              audioContext.close().catch(console.error);
            }
            resolve();
          };
          
          // Unlock audio context for iOS
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }
          
          // Start playback
          source.start(0);
          console.log("WebAudio playback started");
          
          // Set a timeout in case onended doesn't fire
          setTimeout(() => {
            if (audioContext.state !== 'closed') {
              audioContext.close().catch(console.error);
              resolve();
            }
          }, 30000);
          
        } catch (decodeErr) {
          console.error("WebAudio decode error:", decodeErr);
          reject(decodeErr);
        }
      };
      
      reader.onerror = (err) => {
        console.error("FileReader error:", err);
        reject(err);
      };
      
      // Read the blob as an array buffer
      reader.readAsArrayBuffer(audioBlob);
      
    } catch (contextErr) {
      console.error("WebAudio context error:", contextErr);
      reject(contextErr);
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
      
      // Set up voices
      const setVoice = () => {
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
      };
      
      // Try to set voice immediately
      setVoice();
      
      // If voices aren't loaded yet, wait for them
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = setVoice;
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
      
      // Try to unlock speech synthesis for mobile
      const unlockSpeechSynthesis = () => {
        // Remove event listeners
        document.body.removeEventListener('touchstart', unlockSpeechSynthesis);
        document.body.removeEventListener('click', unlockSpeechSynthesis);
        
        // Speak a short text to unlock
        const unlockUtterance = new SpeechSynthesisUtterance('.');
        unlockUtterance.volume = 0; // Silent
        
        unlockUtterance.onend = () => {
          // Now try to speak the actual text
          speechSynthesis.speak(utterance);
        };
        
        unlockUtterance.onerror = () => {
          // If unlock fails, try direct speech
          speechSynthesis.speak(utterance);
        };
        
        speechSynthesis.speak(unlockUtterance);
      };
      
      // Add event listeners for user interaction
      document.body.addEventListener('touchstart', unlockSpeechSynthesis, { once: true });
      document.body.addEventListener('click', unlockSpeechSynthesis, { once: true });
      
      // Try speaking directly (will work on desktop, might fail on mobile)
      speechSynthesis.speak(utterance);
      
      // Add a manual timeout in case events don't fire correctly
      setTimeout(() => {
        if (speechSynthesis.speaking) {
          speechSynthesis.cancel();
          resolve(utterance);
        }
      }, 10000);
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
