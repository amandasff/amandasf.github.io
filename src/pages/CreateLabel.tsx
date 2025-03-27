
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import AudioRecorder from "@/components/AudioRecorder";
import TextToSpeech from "@/components/TextToSpeech";
import { saveLabel, generateId, Label, getLabelById } from "@/utils/storage";
import { announceToScreenReader } from "@/utils/accessibility";
import { motion } from "framer-motion";

const CreateLabel = () => {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [audioData, setAudioData] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("voice");
  const [label, setLabel] = useState<Label | null>(null);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check if we're editing an existing label
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const editId = searchParams.get("edit");
    
    if (editId) {
      const existingLabel = getLabelById(editId);
      if (existingLabel) {
        setEditingLabel(existingLabel);
        setName(existingLabel.name);
        
        if (existingLabel.audioData) {
          setActiveTab("voice");
          setAudioData(existingLabel.audioData);
        } else if (existingLabel.content) {
          setActiveTab("text");
          setText(existingLabel.content);
        }
        
        toast({
          title: "Editing Label",
          description: `You are now editing ${existingLabel.name}`,
        });
      }
    }
  }, [location.search]);

  // Handle creating or updating the label
  const handleCreateLabel = () => {
    if (!name.trim()) {
      toast({
        title: "Label name required",
        description: "Please enter a name for your label",
        variant: "destructive",
      });
      announceToScreenReader("Label name required", "assertive");
      return;
    }
    
    if (activeTab === "voice" && !audioData) {
      toast({
        title: "Recording required",
        description: "Please record audio for your label",
        variant: "destructive",
      });
      announceToScreenReader("Recording required", "assertive");
      return;
    }
    
    if (activeTab === "text" && !text.trim()) {
      toast({
        title: "Text required",
        description: "Please enter text for your label",
        variant: "destructive",
      });
      announceToScreenReader("Text required", "assertive");
      return;
    }
    
    // Create new label or update existing
    const updatedLabel: Label = {
      id: editingLabel ? editingLabel.id : generateId(),
      name: name.trim(),
      content: activeTab === "text" ? text.trim() : "",
      audioData: activeTab === "voice" ? audioData : undefined,
      createdAt: Date.now(),
      isPremade: editingLabel?.isPremade || false
    };
    
    // Save label
    saveLabel(updatedLabel);
    
    // Update state
    setLabel(updatedLabel);
    
    toast({
      title: editingLabel ? "Label updated" : "Label created",
      description: editingLabel ? 
        "Your label has been updated successfully" : 
        "Your label has been created successfully",
    });
    announceToScreenReader(
      editingLabel ? "Label updated successfully" : "Label created successfully"
    );
  };

  // Handle audio recorded
  const handleAudioRecorded = (audioData: string) => {
    setAudioData(audioData);
  };

  // Handle text changed
  const handleTextChanged = (text: string) => {
    setText(text);
  };

  // Handle viewing all labels
  const handleViewAllLabels = () => {
    navigate("/labels");
  };

  return (
    <Layout>
      <Header title={editingLabel ? `Edit ${editingLabel.name}` : undefined} />
      
      <div className="space-y-6">
        {!label ? (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-2">
              <label htmlFor="name" className="font-medium">
                Label Name
              </label>
              <Input 
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a name for this label"
                className="w-full"
              />
            </div>
            
            {editingLabel && editingLabel.isPremade && (
              <div className="p-3 bg-muted/50 rounded-md text-sm">
                <p className="font-medium">Pre-made Label ID: {editingLabel.id}</p>
                <p className="text-muted-foreground mt-1">
                  This is a pre-made label with a fixed ID. The QR code will remain the same even after editing.
                </p>
              </div>
            )}
            
            <Tabs 
              defaultValue="voice" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full">
                <TabsTrigger value="voice" className="flex-1">Voice Recording</TabsTrigger>
                <TabsTrigger value="text" className="flex-1">Text to Speech</TabsTrigger>
              </TabsList>
              
              <TabsContent value="voice" className="mt-4">
                <AudioRecorder 
                  onAudioRecorded={handleAudioRecorded} 
                  initialAudioData={activeTab === "voice" ? audioData : undefined}
                />
              </TabsContent>
              
              <TabsContent value="text" className="mt-4">
                <TextToSpeech
                  initialText={text}
                  onTextChange={handleTextChanged}
                />
              </TabsContent>
            </Tabs>
            
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleCreateLabel}
            >
              {editingLabel ? "Update Label" : "Create Label"}
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-xl font-semibold">
                {editingLabel ? "Label Updated!" : "Label Created!"}
              </h2>
              <p className="text-muted-foreground">
                Print this QR code and attach it to your item
              </p>
            </div>
            
            <div className="flex justify-center">
              <QRCodeGenerator label={label} />
            </div>
            
            <div className="pt-6 space-y-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setLabel(null);
                  if (!editingLabel) {
                    setName("");
                    setText("");
                    setAudioData(undefined);
                  }
                }}
              >
                {editingLabel ? "Edit Again" : "Create Another Label"}
              </Button>
              
              <Button 
                className="w-full"
                onClick={handleViewAllLabels}
              >
                View All Labels
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default CreateLabel;
