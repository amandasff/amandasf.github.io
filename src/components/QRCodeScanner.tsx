import React, { useState, useEffect, useRef } from 'react';
import { QrReader } from 'react-qr-reader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, Pause, Play, Volume2, VolumeX, ZoomIn, ZoomOut, Check, RefreshCw } from 'lucide-react';
import { getLabelById } from '@/utils/storage';
import { playAudio, base64ToBlob, textToSpeech } from '@/utils/audio';
import { announceToScreenReader, provideHapticFeedback } from '@/utils/accessibility';
import { Slider } from '@/components/ui/slider';

const QRCodeScanner: React.FC = () => {
  const [scanning, setScanning] = useState<boolean>(true);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [labelName, setLabelName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Reset state when starting a new scan
  const startNewScan = () => {
    setScanResult(null);
    setError(null);
    setLabelName(null);
    setIsPlaying(false);
    setScanning(true);
    announceToScreenReader('Scanner activated, ready to scan QR codes');
  };

  // Handle zoom level changes
  const handleZoomChange = (value: number[]) => {
    const newZoom = value[0];
    setZoomLevel(newZoom);
    
    // Attempt to change video zoom if the browser supports it
    if (videoRef.current) {
      try {
        // @ts-ignore - MediaTrackConstraints.advanced is not yet in TypeScript
        const videoTrack = videoRef.current.srcObject?.getVideoTracks()[0];
        if (videoTrack && 'applyConstraints' in videoTrack) {
          const capabilities = videoTrack.getCapabilities?.();
          if (capabilities && capabilities.zoom) {
            const min = capabilities.zoom.min || 1;
            const max = capabilities.zoom.max || 5;
            const scaledZoom = min + (newZoom * (max - min));
            videoTrack.applyConstraints({
              advanced: [{ zoom: scaledZoom }]
            }).catch(e => console.error('Could not apply zoom constraint', e));
          }
        }
      } catch (err) {
        console.error('Error adjusting camera zoom:', err);
      }
    }
    
    announceToScreenReader(`Zoom level set to ${newZoom}`, 'polite');
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

  // Save reference to video element for zoom control
  const handleVideoRef = (node: HTMLVideoElement | null) => {
    if (node) {
      videoRef.current = node;
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
      <Card className="overflow-hidden shadow-lg border-2 border-primary/30">
        {scanning ? (
          <div className="relative">
            <QrReader
              onResult={(result) => {
                if (result) {
                  handleScan(result.getText());
                }
              }}
              constraints={{ 
                facingMode: 'environment',
                width: { min: 640, ideal: 1280 },
                height: { min: 480, ideal: 720 }
              }}
              videoStyle={{ width: '100%', transform: `scale(${zoomLevel})` }}
              containerStyle={{ width: '100%', overflow: 'hidden' }}
              scanDelay={500}
              videoContainerStyle={{ 
                position: 'relative', 
                overflow: 'hidden'
              }}
              ViewFinder={() => (
                <div className="absolute inset-0 border-4 border-primary opacity-70 rounded-lg" />
              )}
            />
            
            {/* Camera zoom controls */}
            <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center bg-black/30 backdrop-blur-sm p-2 rounded-md mx-4">
              <div className="flex items-center justify-center w-full mb-1">
                <ZoomOut className="h-5 w-5 text-white mr-2" />
                <Slider
                  value={[zoomLevel]}
                  min={1}
                  max={5}
                  step={0.1}
                  onValueChange={handleZoomChange}
                  className="w-full h-4"
                  aria-label="Zoom Level"
                />
                <ZoomIn className="h-5 w-5 text-white ml-2" />
              </div>
              <div className="text-white text-sm font-bold">
                {zoomLevel.toFixed(1)}x
              </div>
            </div>
            
            <div className="absolute inset-0 border-[4px] border-white/70 rounded-lg pointer-events-none" />
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center justify-center min-h-[300px] space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader className="h-16 w-16 text-primary animate-spin" />
                <p className="text-center font-bold text-xl">Loading label data...</p>
              </div>
            ) : error ? (
              <div className="text-center space-y-6">
                <p className="text-destructive font-bold text-xl">{error}</p>
                <Button onClick={startNewScan} size="lg" className="text-lg font-bold px-8 py-6 h-auto">
                  <RefreshCw className="h-6 w-6 mr-2" /> Try Again
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-8 w-full">
                <div className="space-y-3 bg-primary/10 p-4 rounded-xl">
                  <div className="bg-primary/10 rounded-full p-2 inline-block mb-2">
                    <Check className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Label Found</h3>
                  <p className="text-2xl font-bold text-primary">{labelName}</p>
                </div>
                
                <div className="flex justify-center gap-6">
                  {isPlaying ? (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-16 w-16 rounded-full"
                      disabled
                    >
                      <Pause className="h-8 w-8" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-16 w-16 rounded-full border-2"
                      onClick={playLabelAgain}
                    >
                      <Play className="h-8 w-8" />
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-16 w-16 rounded-full border-2"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="h-8 w-8" /> : <Volume2 className="h-8 w-8" />}
                  </Button>
                </div>
                
                <Button 
                  className="w-full mt-6 text-lg font-bold py-6 h-auto" 
                  onClick={startNewScan}
                >
                  <RefreshCw className="h-6 w-6 mr-2" />
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
