
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
import QRCodeGenerator from "@/components/QRCodeGenerator";
import { Label, getAllLabels, deleteLabel } from "@/utils/storage";
import { playAudio, base64ToBlob, textToSpeech } from "@/utils/audio";
import { announceToScreenReader } from "@/utils/accessibility";
import { Trash2, Play, QrCode, Tag, Pencil, LayoutList, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

const MyLabels = () => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState<Label | null>(null);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);

  useEffect(() => {
    const storedLabels = getAllLabels();
    setLabels(storedLabels);
  }, []);

  const playLabel = async (label: Label) => {
    try {
      setIsPlaying(label.id);
      
      if (label.audioData) {
        const audioBlob = base64ToBlob(label.audioData);
        await playAudio(audioBlob);
      } else if (label.content) {
        await textToSpeech(label.content);
      }
      
      setIsPlaying(null);
    } catch (error) {
      console.error("Error playing label:", error);
      announceToScreenReader("Could not play label", "assertive");
      setIsPlaying(null);
    }
  };

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

  const toggleLabelSelection = (labelId: string) => {
    if (selectedLabelId === labelId) {
      setSelectedLabelId(null);
    } else {
      setSelectedLabelId(labelId);
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const premadeLabels = labels.filter(label => label.isPremade);
  const customLabels = labels.filter(label => !label.isPremade);

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

  // Render a label list item
  const renderLabelItem = (label: Label) => (
    <motion.div key={label.id} variants={item}>
      <Card className="overflow-hidden">
        <div 
          className="p-4 cursor-pointer"
          onClick={() => toggleLabelSelection(label.id)}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{label.name}</h3>
                <Badge variant="outline" className="text-xs">
                  #{label.id}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDate(label.createdAt)}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(label);
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                playLabel(label);
              }}
              disabled={isPlaying === label.id}
            >
              <Play className="h-3.5 w-3.5" />
              {isPlaying === label.id ? "Playing..." : "Play"}
            </Button>
            
            <div className="flex gap-2">
              {label.isPremade && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  asChild
                >
                  <Link to={`/create?edit=${label.id}`}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit Label</span>
                  </Link>
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                {selectedLabelId === label.id ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <QrCode className="h-4 w-4" />
                )}
                <span className="sr-only">Show QR Code</span>
              </Button>
            </div>
          </div>
          
          {selectedLabelId === label.id && (
            <motion.div 
              className="mt-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-center py-4">
                {label.qrCode ? (
                  <img 
                    src={label.qrCode} 
                    alt={`QR code for ${label.name}`}
                    className="w-48 h-48 object-contain"
                  />
                ) : (
                  <QRCodeGenerator label={label} size={160} />
                )}
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );

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
            className="space-y-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {premadeLabels.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Pre-made Labels</h3>
                </div>
                
                <div className="space-y-4">
                  {premadeLabels.map(renderLabelItem)}
                </div>
              </div>
            )}
            
            {customLabels.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <LayoutList className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Custom Labels</h3>
                </div>
                
                <div className="space-y-4">
                  {customLabels.map(renderLabelItem)}
                </div>
              </div>
            )}
            
            <div className="pt-4">
              <Button asChild className="w-full">
                <Link to="/create">Create New Label</Link>
              </Button>
            </div>
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
