import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Trash2, Play, Edit, ArrowRight, FileDown } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { generatePrintablePDF } from "@/utils/pdf";

const MyLabels = () => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState<Label | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const storedLabels = getAllLabels();
    
    // Sort labels numerically by their ID if they're premade
    const sortedLabels = storedLabels.sort((a, b) => {
      // First prioritize premade vs custom
      if (a.isPremade && !b.isPremade) return -1;
      if (!a.isPremade && b.isPremade) return 1;
      
      // Then sort premade labels numerically by their ID
      if (a.isPremade && b.isPremade) {
        const aMatch = a.id.match(/premade-(\d+)/);
        const bMatch = b.id.match(/premade-(\d+)/);
        
        if (aMatch && bMatch) {
          return parseInt(aMatch[1]) - parseInt(bMatch[1]);
        }
      }
      
      // Otherwise sort by creation date (newest first)
      return b.createdAt - a.createdAt;
    });
    
    setLabels(sortedLabels);
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
      toast({
        title: "Playback Error",
        description: "Could not play audio. Please try again.",
        variant: "destructive"
      });
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
      toast({
        title: "Label Deleted",
        description: `${labelToDelete.name} has been deleted.`
      });
    }
    setDeleteDialogOpen(false);
    setLabelToDelete(null);
    
    // If we were viewing the deleted label, go back to the list
    if (selectedLabel && labelToDelete && selectedLabel.id === labelToDelete.id) {
      setSelectedLabel(null);
    }
  };

  const handleEditLabel = (label: Label) => {
    navigate(`/create?edit=${label.id}`);
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
  
  // Generate a printable PDF of all labels
  const handleGeneratePDF = async () => {
    try {
      setIsPdfGenerating(true);
      await generatePrintablePDF(labels);
      setIsPdfGenerating(false);
      
      toast({
        title: "PDF Generated",
        description: "Your labels PDF has been downloaded",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      setIsPdfGenerating(false);
      
      toast({
        title: "PDF Generation Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive"
      });
    }
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
                  <Badge variant={selectedLabel.isPremade ? "secondary" : "outline"}>
                    {selectedLabel.isPremade ? "Pre-made" : "Custom"}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="flex justify-center p-4">
                  <QRCodeGenerator label={selectedLabel} size={200} />
                </div>
                
                <div className="flex flex-col gap-4 mt-4">
                  <div className="flex justify-between gap-4">
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
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEditLabel(selectedLabel)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Label
                    </Button>
                  </div>
                  
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteClick(selectedLabel)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Label
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
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Your Labels</h2>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleGeneratePDF}
                    disabled={isPdfGenerating}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    {isPdfGenerating ? "Generating PDF..." : "Print All Labels"}
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
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
                        <TableCell>
                          <Badge variant={label.isPremade ? "secondary" : "outline"} className="text-xs">
                            {label.isPremade ? "Pre-made" : "Custom"}
                          </Badge>
                        </TableCell>
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
                                handleEditLabel(label);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                showLabelDetails(label);
                              }}
                            >
                              <ArrowRight className="h-4 w-4" />
                              <span className="sr-only">View</span>
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
