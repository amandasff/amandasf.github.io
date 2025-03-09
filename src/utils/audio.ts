
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
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      resolve(audioBlob);
    });

    mediaRecorder.stop();
    
    // Stop each track in the stream
    if (mediaRecorder.stream) {
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  });
};

// Function to play audio from blob
export const playAudio = (audioBlob: Blob): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      
      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };
      
      audio.play();
    } catch (error) {
      reject(error);
    }
  });
};

// Function to convert text to speech
export const textToSpeech = (text: string): Promise<SpeechSynthesisUtterance> => {
  return new Promise((resolve, reject) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onend = () => {
        resolve(utterance);
      };
      
      utterance.onerror = (error) => {
        reject(error);
      };
      
      speechSynthesis.speak(utterance);
    } catch (error) {
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
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Function to convert base64 to audio blob
export const base64ToBlob = (base64: string, type = 'audio/wav'): Blob => {
  const binary = atob(base64);
  const arrayBuffer = new ArrayBuffer(binary.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  
  for (let i = 0; i < binary.length; i++) {
    uint8Array[i] = binary.charCodeAt(i);
  }
  
  return new Blob([uint8Array], { type });
};
