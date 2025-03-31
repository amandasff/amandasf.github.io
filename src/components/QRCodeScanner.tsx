
import React, { useState, useEffect, useRef } from 'react';
import { QrReader } from 'react-qr-reader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, Play, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { getLabelById } from '@/utils/storage';
import { playLabelAudio } from '@/utils/audio';
import { announceToScreenReader, provideHapticFeedback } from '@/utils/accessibility';
import { useIsMobile } from '@/hooks/use-mobile';

const QRCodeScanner: React.FC = () => {
  const [scanning, setScanning] = useState<boolean>(true);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [labelName, setLabelName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentLabel, setCurrentLabel] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Reset state when starting a new scan
  const startNewScan = () => {
    setScanResult(null);
    setError(null);
    setLabelName(null);
    setIsPlaying(false);
    setCurrentLabel(null);
    setScanning(true);
    announceToScreenReader('Scanner activated, ready to scan QR codes');
  };

  // Handle successful scan
  const handleScan = async (data: string | null) => {
    if (!data || !scanning) return;
    
    // Parse the data from the QR code
    try {
      console.log("QR code data received:", data);
      let parsedData;
      
      try {
        parsedData = JSON.parse(data);
      } catch (parseErr) {
        console.error("Failed to parse as JSON, trying alternative format");
        
        // Handle potential string format differences
        const match = data.match(/labelId[":=\s]+([^",}\s]+)/i);
        if (match && match[1]) {
          parsedData = { labelId: match[1] };
        } else {
          throw new Error("Could not extract labelId");
        }
      }
      
      if (!parsedData.labelId) {
        setError('Invalid QR code format');
        setScanning(false);
        announceToScreenReader('Invalid QR code format', 'assertive');
        return;
      }
      
      console.log("Parsed label ID:", parsedData.labelId);
      setScanResult(parsedData.labelId);
      setScanning(false);
      provideHapticFeedback();
      
      // Get label from storage
      await fetchLabel(parsedData.labelId);
    } catch (err) {
      console.error('Error parsing QR code data:', err);
      setError('Could not read QR code data');
      setScanning(false);
      announceToScreenReader('Could not read QR code data', 'assertive');
    }
  };

  // Fetch the label without playing
  const fetchLabel = async (labelId: string) => {
    try {
      setIsLoading(true);
      
      const label = getLabelById(labelId);
      if (!label) {
        console.error(`Label not found with ID: ${labelId}`);
        setError('Label not found');
        announceToScreenReader('Label not found', 'assertive');
        return;
      }
      
      setLabelName(label.name);
      setCurrentLabel(label);
      announceToScreenReader(`Found label: ${label.name}`);
      toast({
        title: "Label found",
        description: label.name,
      });
      
      // Automatically play the audio
      handlePlayAudio(label);
    } catch (err) {
      console.error('Error fetching label:', err);
      setError('Failed to fetch label');
      announceToScreenReader('Failed to fetch label', 'assertive');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle playing audio for a label
  const handlePlayAudio = async (label: any) => {
    try {
      console.log("Attempting to play audio for label:", label.name);
      setIsPlaying(true);
      
      await playLabelAudio(label, () => {
        console.log("Audio playback completed");
        setIsPlaying(false);
      });
    } catch (error) {
      console.error("Audio playback error:", error);
      setIsPlaying(false);
      setError('Tap the play button to try again');
      announceToScreenReader('Audio playback failed. Please try again.', 'assertive');
    }
  };

  // Handle scanning errors
  const handleError = (err: Error) => {
    console.error('QR scanner error:', err);
    setError('Scanner error. Please try again.');
    setScanning(false);
    announceToScreenReader('Scanner error. Please try again.', 'assertive');
  };

  // Navigate home
  const goHome = () => {
    navigate('/');
  };

  // Auto-restart scanning after a delay when error occurs
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        startNewScan();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="w-full max-w-md mx-auto">
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
                <div className="flex flex-col gap-3 w-full">
                  <Button onClick={startNewScan}>Try Again</Button>
                  <Button variant="outline" onClick={goHome}>Go Home</Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 w-full">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Label Found</h3>
                  <p className="text-2xl font-bold text-primary">{labelName}</p>
                </div>
                
                <div className="flex flex-col gap-4 w-full">
                  {isPlaying ? (
                    <p className="text-primary font-medium animate-pulse">
                      Playing audio...
                    </p>
                  ) : (
                    <Button
                      className="mx-auto"
                      onClick={() => currentLabel && handlePlayAudio(currentLabel)}
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Play Audio
                    </Button>
                  )}
                  
                  <div className="flex flex-col gap-3 w-full mt-4">
                    <Button onClick={startNewScan}>
                      Scan Another Code
                    </Button>
                    <Button variant="outline" onClick={goHome}>
                      <Home className="h-4 w-4 mr-2" />
                      Go Home
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default QRCodeScanner;
