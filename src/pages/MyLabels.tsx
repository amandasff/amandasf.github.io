
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Trash2, Play, QrCode, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const MyLabels = () => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState<Label | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);

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

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Show label details including QR code
  const showLabelDetails = (label: Label) => {
    setSelectedLabel(label);
  };

  return (
    <Layout>
      <Header />
      
      <div className="space-y-6">
        {selectedLabel ? (
          // Label detail view with QR code
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button 
              variant="outline" 
              className="mb-4"
              onClick={() => setSelectedLabel(null)}
            >
              Back to all labels
            </Button>
            
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">{selectedLabel.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      Created on {formatDate(selectedLabel.createdAt)}
                    </p>
                  </div>
                  <Badge variant="outline">#{selectedLabel.id}</Badge>
                </div>
                
                <Separator />
                
                <div className="flex justify-center p-4">
                  <QRCodeGenerator label={selectedLabel} size={200} />
                </div>
                
                <div className="flex justify-between gap-4 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => playLabel(selectedLabel)}
                    disabled={isPlaying === selectedLabel.id}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {isPlaying === selectedLabel.id ? "Playing..." : "Play Audio"}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDeleteClick(selectedLabel)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          // Labels list view
          <div>
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold mb-4">Your Labels</h2>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {labels.map((label) => (
                      <TableRow 
                        key={label.id}
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() => showLabelDetails(label)}
                      >
                        <TableCell className="font-medium">{label.name}</TableCell>
                        <TableCell>{formatDate(label.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                playLabel(label);
                              }}
                              disabled={isPlaying === label.id}
                            >
                              <Play className="h-4 w-4" />
                              <span className="sr-only">Play</span>
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                showLabelDetails(label);
                              }}
                            >
                              <ArrowRight className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="mt-6">
                  <Button asChild className="w-full">
                    <Link to="/create">Create New Label</Link>
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
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
