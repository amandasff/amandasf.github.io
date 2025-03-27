
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { PlusCircle, Search, LayoutList, FileText, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { initPremadeLabels, getPremadeLabels, Label } from "@/utils/storage";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [premadeLabels, setPremadeLabels] = React.useState<Label[]>([]);
  const { toast } = useToast();
  
  // Initialize premade labels when component mounts
  useEffect(() => {
    initPremadeLabels();
    setPremadeLabels(getPremadeLabels().slice(0, 3)); // Show only first 3 premade labels
  }, []);
  
  const handlePremadeLabelClick = (label: Label) => {
    // Let the user know a label was copied
    toast({
      title: "Label copied",
      description: `"${label.name}" has been added to your labels.`,
    });
  };
  
  return (
    <Layout>
      <Header />
      
      <motion.div 
        className="flex flex-col items-center justify-center gap-8 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              ease: "easeInOut" 
            }}
          >
            <svg 
              viewBox="0 0 24 24" 
              className="w-12 h-12 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </motion.div>
        </div>
        
        <div className="text-center max-w-sm">
          <h2 className="text-2xl font-bold mb-2">Audio Labels</h2>
          <p className="text-muted-foreground mb-8">
            Create and scan QR code labels that speak to you
          </p>
        </div>

        {premadeLabels.length > 0 && (
          <div className="w-full max-w-sm">
            <h3 className="font-semibold text-lg mb-3">Quick Start Labels</h3>
            <div className="grid grid-cols-1 gap-2 mb-6">
              {premadeLabels.map((label) => (
                <Link to={`/create`} key={label.id} state={{ premadeLabel: label }}>
                  <Card className="overflow-hidden">
                    <motion.div 
                      className="p-4 flex items-center gap-3"
                      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                      transition={{ duration: 0.2 }}
                      onClick={() => handlePremadeLabelClick(label)}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Tag className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{label.name}</p>
                      </div>
                    </motion.div>
                  </Card>
                </Link>
              ))}
              <Link to="/labels" className="text-sm text-primary hover:underline mt-1">
                View all premade labels
              </Link>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
          <Card className="overflow-hidden">
            <Link to="/create" className="block">
              <motion.div 
                className="p-6 flex items-center gap-4"
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <PlusCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-lg">Create Label</h3>
                  <p className="text-sm text-muted-foreground">Record or type a label and generate a QR code</p>
                </div>
              </motion.div>
            </Link>
          </Card>
          
          <Card className="overflow-hidden">
            <Link to="/scan" className="block">
              <motion.div 
                className="p-6 flex items-center gap-4"
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-lg">Scan Label</h3>
                  <p className="text-sm text-muted-foreground">Scan a QR code to hear its audio label</p>
                </div>
              </motion.div>
            </Link>
          </Card>
          
          <Card className="overflow-hidden">
            <Link to="/labels" className="block">
              <motion.div 
                className="p-6 flex items-center gap-4"
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <LayoutList className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-lg">My Labels</h3>
                  <p className="text-sm text-muted-foreground">View and manage your saved labels</p>
                </div>
              </motion.div>
            </Link>
          </Card>
          
          <Card className="overflow-hidden">
            <Link to="/flowchart" className="block">
              <motion.div 
                className="p-6 flex items-center gap-4"
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-lg">Flow Chart</h3>
                  <p className="text-sm text-muted-foreground">View the app's flow chart diagram</p>
                </div>
              </motion.div>
            </Link>
          </Card>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Index;
