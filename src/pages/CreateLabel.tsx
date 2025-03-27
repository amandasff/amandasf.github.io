
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import AudioRecorder from "@/components/AudioRecorder";
import TextToSpeech from "@/components/TextToSpeech";
import { saveLabel, generateId, Label } from "@/utils/storage";
import { announceToScreenReader } from "@/utils/accessibility";
import { motion } from "framer-motion";

const CreateLabel = () => {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [audioData, setAudioData] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("voice");
  const [label, setLabel] = useState<Label | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle creating the label
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
    
    // Create new label
    const newLabel: Label = {
      id: generateId(),
      name: name.trim(),
      content: activeTab === "text" ? text.trim() : "",
      audioData: activeTab === "voice" ? audioData : undefined,
      createdAt: Date.now(),
    };
    
    // Save label
    saveLabel(newLabel);
    
    // Update state
    setLabel(newLabel);
    
    toast({
      title: "Label created",
      description: "Your label has been created successfully",
    });
    announceToScreenReader("Label created successfully");
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
      <Header />
      
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
                <AudioRecorder onAudioRecorded={handleAudioRecorded} />
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
              Create Label
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
              <h2 className="text-xl font-semibold">Label Created!</h2>
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
                  setName("");
                  setText("");
                  setAudioData(undefined);
                }}
              >
                Create Another Label
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
