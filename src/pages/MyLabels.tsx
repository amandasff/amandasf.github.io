
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { Label, getAllLabels, deleteLabel } from "@/utils/storage";
import { playAudio, base64ToBlob, textToSpeech } from "@/utils/audio";
import { announceToScreenReader } from "@/utils/accessibility";
import { Trash2, Play, Download, QrCode } from "lucide-react";
import { motion } from "framer-motion";

const MyLabels = () => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState<Label | null>(null);

  // Load labels from storage
  useEffect(() => {
    const storedLabels = getAllLabels();
    setLabels(storedLabels);
  }, []);

  // Play a label
  const playLabel = async (label: Label) => {
    try {
      setIsPlaying(label.id);
      
      if (label.audioData) {
        // Play recorded audio
        const audioBlob = base64ToBlob(label.audioData);
        await playAudio(audioBlob);
      } else if (label.content) {
        // Use text-to-speech
        await textToSpeech(label.content);
      }
      
      setIsPlaying(null);
    } catch (error) {
      console.error("Error playing label:", error);
      announceToScreenReader("Could not play label", "assertive");
      setIsPlaying(null);
    }
  };

  // Download QR code as image
  const downloadQRCode = (label: Label) => {
    if (!label.qrCode) return;
    
    const link = document.createElement("a");
    link.href = label.qrCode;
    link.download = `qr-code-${label.name.replace(/\s+/g, "-").toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    announceToScreenReader("QR code downloaded");
  };

  // Handle label deletion
  const handleDeleteClick = (label: Label) => {
    setLabelToDelete(label);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (labelToDelete) {
      deleteLabel(labelToDelete.id);
      setLabels(labels.filter((l) => l.id !== labelToDelete.id));
      announceToScreenReader("Label deleted");
    }
    setDeleteDialogOpen(false);
    setLabelToDelete(null);
  };

  // Format date
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <Header />
      
      <div className="space-y-6">
        {labels.length === 0 ? (
          <motion.div 
            className="text-center py-12 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-muted-foreground">
              You haven't created any labels yet
            </p>
            <Button asChild>
              <Link to="/create">Create Your First Label</Link>
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {labels.map((label) => (
              <motion.div key={label.id} variants={item}>
                <Card className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{label.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(label.createdAt)}
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteClick(label)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => playLabel(label)}
                        disabled={isPlaying === label.id}
                      >
                        <Play className="h-3.5 w-3.5" />
                        {isPlaying === label.id ? "Playing..." : "Play"}
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <Link to={`/create?edit=${label.id}`}>
                            <QrCode className="h-4 w-4" />
                            <span className="sr-only">Show QR Code</span>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the label
              "{labelToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default MyLabels;
