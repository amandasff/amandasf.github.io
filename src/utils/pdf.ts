
import QRCode from 'qrcode';
import { Label } from './storage';

// Add jspdf for PDF generation
interface LabelWithQRCode extends Label {
  qrCodeDataUrl?: string;
}

// Generate QR code as data URL for a label
const generateQRCodeDataUrl = async (label: Label): Promise<string> => {
  try {
    // If the label already has a QR code, use it
    if (label.qrCode) {
      return label.qrCode;
    }
    
    // Otherwise generate a new one
    const data = JSON.stringify({ labelId: label.id });
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code for PDF:', error);
    throw error;
  }
};

// Generate and download a printable PDF of labels
export const generatePrintablePDF = async (labels: Label[]): Promise<void> => {
  try {
    // Dynamic import of jspdf to avoid issues with SSR
    const { jsPDF } = await import('jspdf');
    
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Label dimensions and spacing
    const labelsPerRow = 2;
    const labelsPerColumn = 4;
    const labelWidth = 90;
    const labelHeight = 70;
    const startX = (pageWidth - (labelsPerRow * labelWidth)) / 2 + 5;
    const startY = 20;
    const horizontalSpacing = labelWidth;
    const verticalSpacing = labelHeight;
    
    // Add a title to the first page
    doc.setFontSize(16);
    doc.text('Audio Labels - QR Codes', pageWidth / 2, 10, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Scan these codes with your Audio Labels app', pageWidth / 2, 15, { align: 'center' });
    
    // Get all labels with their QR codes
    const labelsWithQRCodes: LabelWithQRCode[] = await Promise.all(
      labels.map(async (label) => {
        try {
          const qrCodeDataUrl = await generateQRCodeDataUrl(label);
          return { ...label, qrCodeDataUrl };
        } catch (error) {
          console.error(`Error preparing label ${label.id}:`, error);
          return label;
        }
      })
    );
    
    // Filter out labels without QR codes
    const validLabels = labelsWithQRCodes.filter(label => !!label.qrCodeDataUrl);
    
    // Add labels to the PDF
    let currentPage = 1;
    let labelsOnCurrentPage = 0;
    
    for (let i = 0; i < validLabels.length; i++) {
      const label = validLabels[i];
      
      // Calculate position
      const row = Math.floor(labelsOnCurrentPage / labelsPerRow);
      const col = labelsOnCurrentPage % labelsPerRow;
      const x = startX + (col * horizontalSpacing);
      const y = startY + (row * verticalSpacing);
      
      // Check if we need a new page
      if (labelsOnCurrentPage >= (labelsPerRow * labelsPerColumn)) {
        doc.addPage();
        currentPage++;
        labelsOnCurrentPage = 0;
        
        // Reset position calculation
        const newRow = Math.floor(labelsOnCurrentPage / labelsPerRow);
        const newCol = labelsOnCurrentPage % labelsPerRow;
        const newX = startX + (newCol * horizontalSpacing);
        const newY = startY + (newRow * verticalSpacing);
        
        // Add QR code
        if (label.qrCodeDataUrl) {
          doc.addImage(label.qrCodeDataUrl, 'PNG', newX, newY, 40, 40);
        }
        
        // Add label name
        doc.setFontSize(12);
        doc.text(label.name, newX, newY + 45, { maxWidth: 80 });
        
        // Add label content if it's a text label
        if (label.content) {
          doc.setFontSize(9);
          doc.text(`"${label.content}"`, newX, newY + 50, { maxWidth: 80 });
        }
        
        // Add audio indicator if it has audio
        if (label.audioData) {
          doc.setFontSize(9);
          doc.text('[Audio recording]', newX, newY + 50);
        }
        
        // Add page number at the bottom
        doc.setFontSize(8);
        doc.text(`Page ${currentPage}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
      } else {
        // Add QR code
        if (label.qrCodeDataUrl) {
          doc.addImage(label.qrCodeDataUrl, 'PNG', x, y, 40, 40);
        }
        
        // Add label name
        doc.setFontSize(12);
        doc.text(label.name, x, y + 45, { maxWidth: 80 });
        
        // Add label content if it's a text label
        if (label.content) {
          doc.setFontSize(9);
          doc.text(`"${label.content}"`, x, y + 50, { maxWidth: 80 });
        }
        
        // Add audio indicator if it has audio
        if (label.audioData) {
          doc.setFontSize(9);
          doc.text('[Audio recording]', x, y + 50);
        }
        
        // Add page number at the bottom (for the first page)
        if (i === 0) {
          doc.setFontSize(8);
          doc.text(`Page ${currentPage}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
        }
      }
      
      labelsOnCurrentPage++;
    }
    
    // Add a guide page at the end
    doc.addPage();
    doc.setFontSize(16);
    doc.text('How to Use Audio Labels', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    let guideY = 30;
    const lineHeight = 7;
    
    doc.text('1. Print this document and cut out the labels', 20, guideY);
    guideY += lineHeight;
    
    doc.text('2. Attach the labels to your items using tape or adhesive', 20, guideY);
    guideY += lineHeight;
    
    doc.text('3. Open the Audio Labels app on your mobile device', 20, guideY);
    guideY += lineHeight;
    
    doc.text('4. Tap "Scan Label" in the app', 20, guideY);
    guideY += lineHeight;
    
    doc.text('5. Point your camera at the QR code', 20, guideY);
    guideY += lineHeight;
    
    doc.text('6. The app will scan the code and play the associated audio', 20, guideY);
    guideY += lineHeight * 2;
    
    // Fixed the fontStyle error by removing it
    doc.text('For best results:', 20, guideY);
    guideY += lineHeight;
    
    doc.text('• Ensure good lighting when scanning codes', 20, guideY);
    guideY += lineHeight;
    
    doc.text('• Hold your device approximately 6-8 inches from the code', 20, guideY);
    guideY += lineHeight;
    
    doc.text('• If you have trouble scanning, try again with the code in focus', 20, guideY);
    
    // Save the PDF and trigger download
    doc.save('audio-labels.pdf');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
