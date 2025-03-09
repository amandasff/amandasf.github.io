
import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { getLabelById } from '@/utils/storage';
import { playAudio, base64ToBlob, textToSpeech } from '@/utils/audio';
import { announceToScreenReader, provideHapticFeedback } from '@/utils/accessibility';

const QRCodeScanner: React.FC = () => {
  const [scanning, setScanning] = useState<boolean>(true);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [labelName, setLabelName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Reset state when starting a new scan
  const startNewScan = () => {
    setScanResult(null);
    setError(null);
    setLabelName(null);
    setIsPlaying(false);
    setScanning(true);
    announceToScreenReader('Scanner activated, ready to scan QR codes');
  };

  // Handle successful scan
  const handleScan = async (data: string | null) => {
    if (!data || !scanning) return;
    
    // Parse the data from the QR code
    try {
      const parsedData = JSON.parse(data);
      
      if (!parsedData.labelId) {
        setError('Invalid QR code format');
        setScanning(false);
        announceToScreenReader('Invalid QR code format', 'assertive');
        return;
      }
      
      setScanResult(parsedData.labelId);
      setScanning(false);
      provideHapticFeedback();
      
      // Get label from storage
      await fetchAndPlayLabel(parsedData.labelId);
    } catch (err) {
      console.error('Error parsing QR code data:', err);
      setError('Could not read QR code data');
      setScanning(false);
      announceToScreenReader('Could not read QR code data', 'assertive');
    }
  };

  // Fetch and play the label audio
  const fetchAndPlayLabel = async (labelId: string) => {
    try {
      setIsLoading(true);
      
      const label = getLabelById(labelId);
      if (!label) {
        setError('Label not found');
        announceToScreenReader('Label not found', 'assertive');
        return;
      }
      
      setLabelName(label.name);
      announceToScreenReader(`Found label: ${label.name}`);
      
      if (!isMuted) {
        setIsPlaying(true);
        
        if (label.audioData) {
          // Play recorded audio
          const audioBlob = base64ToBlob(label.audioData);
          await playAudio(audioBlob);
        } else if (label.content) {
          // Use text-to-speech
          await textToSpeech(label.content);
        }
        
        setIsPlaying(false);
      }
    } catch (err) {
      console.error('Error playing label audio:', err);
      setError('Failed to play audio');
      announceToScreenReader('Failed to play audio', 'assertive');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle scanning errors
  const handleError = (err: Error) => {
    console.error('QR scanner error:', err);
    setError('Scanner error. Please try again.');
    setScanning(false);
    announceToScreenReader('Scanner error. Please try again.', 'assertive');
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    announceToScreenReader(isMuted ? 'Audio enabled' : 'Audio muted');
  };

  // Play the label again
  const playLabelAgain = async () => {
    if (scanResult) {
      await fetchAndPlayLabel(scanResult);
    }
  };

  // Auto-restart scanning after a delay when error occurs
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        startNewScan();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="w-full max-w-sm mx-auto">
      <Card className="overflow-hidden shadow-sm">
        {scanning ? (
          <div className="relative">
            <QrReader
              onResult={(result) => {
                if (result) {
                  handleScan(result.getText());
                }
              }}
              constraints={{ facingMode: 'environment' }}
              videoStyle={{ width: '100%' }}
              containerStyle={{ width: '100%' }}
              scanDelay={500}
              ViewFinder={() => (
                <div className="absolute inset-0 border-2 border-primary-500 opacity-70 rounded-lg" />
              )}
            />
            <div className="absolute inset-0 border-[3px] border-white/70 rounded-lg pointer-events-none" />
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader className="h-12 w-12 text-primary animate-spin" />
                <p className="text-center font-medium">Loading label data...</p>
              </div>
            ) : error ? (
              <div className="text-center space-y-4">
                <p className="text-destructive font-semibold">{error}</p>
                <Button onClick={startNewScan}>Try Again</Button>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Label Found</h3>
                  <p className="text-2xl font-bold text-primary">{labelName}</p>
                </div>
                
                <div className="flex justify-center space-x-4">
                  {isPlaying ? (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full"
                      disabled
                    >
                      <Pause className="h-6 w-6" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full"
                      onClick={playLabelAgain}
                    >
                      <Play className="h-6 w-6" />
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                  </Button>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  onClick={startNewScan}
                >
                  Scan Another Code
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default QRCodeScanner;
