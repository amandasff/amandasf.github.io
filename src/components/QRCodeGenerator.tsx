
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, RefreshCw } from 'lucide-react';
import { Label, saveLabel } from '@/utils/storage';
import { announceToScreenReader } from '@/utils/accessibility';

interface QRCodeGeneratorProps {
  label: Label;
  size?: number;
  onRegenerate?: () => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  label, 
  size = 200,
  onRegenerate 
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to generate QR code
  const generateQRCode = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create a data object with the label ID for scanning
      const data = JSON.stringify({ labelId: label.id });
      
      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(data, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      
      setQrCodeUrl(qrCodeDataUrl);
      
      // Save the QR code to the label if it doesn't have one
      if (!label.qrCode) {
        label.qrCode = qrCodeDataUrl;
        saveLabel(label);
      }
      
      announceToScreenReader('QR code generated');
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code');
      announceToScreenReader('Failed to generate QR code', 'assertive');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate QR code on component mount
  useEffect(() => {
    if (label.qrCode) {
      setQrCodeUrl(label.qrCode);
      setIsLoading(false);
    } else {
      generateQRCode();
    }
  }, [label.id]);

  // Function to download the QR code
  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qr-code-${label.id}-${label.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    announceToScreenReader('QR code downloaded');
  };

  // Function to regenerate the QR code
  const handleRegenerate = () => {
    generateQRCode();
    if (onRegenerate) onRegenerate();
  };

  return (
    <Card className="p-4 flex flex-col items-center justify-center bg-white shadow-sm">
      <div 
        className="relative mb-4 bg-white rounded-lg overflow-hidden"
        style={{ width: size, height: size }}
      >
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center text-destructive text-center text-sm p-4">
            {error}
          </div>
        ) : (
          <img 
            src={qrCodeUrl} 
            alt={`QR code for ${label.name}`}
            className="w-full h-full object-contain"
          />
        )}
      </div>
      
      {label.isPremade && (
        <div className="mb-4 text-center text-xs text-muted-foreground">
          <p className="font-medium">Pre-made Label ID: {label.id}</p>
          <p>This QR code has a fixed ID and will always work with this label.</p>
        </div>
      )}
      
      <div className="flex gap-3 w-full">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleRegenerate}
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerate
        </Button>
        
        <Button
          variant="default"
          size="sm"
          className="flex-1"
          onClick={downloadQRCode}
          disabled={isLoading || !!error}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    </Card>
  );
};

export default QRCodeGenerator;
