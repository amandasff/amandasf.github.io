
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { PlusCircle, Search, LayoutList, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { Label, getPremadeLabels } from "@/utils/storage";

const Index = () => {
  const [premadeLabels, setPremadeLabels] = useState<Label[]>([]);

  useEffect(() => {
    // Get pre-made labels and sort them numerically by ID
    const labels = getPremadeLabels();
    const sortedLabels = [...labels].sort((a, b) => {
      // Extract the numeric part from the "premade-X" id format
      const numA = parseInt(a.id.split('-')[1]);
      const numB = parseInt(b.id.split('-')[1]);
      return numA - numB;
    });
    setPremadeLabels(sortedLabels);
  }, []);

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
        </div>
        
        {premadeLabels.length > 0 && (
          <div className="w-full max-w-sm mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Pre-made Labels</h3>
            </div>
            <Card className="overflow-hidden">
              <div className="p-4 space-y-2">
                {premadeLabels.map((label, index) => (
                  <React.Fragment key={label.id}>
                    <Link 
                      to={`/create?edit=${label.id}`}
                      className="block hover:bg-muted/30 rounded p-2 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{label.name}</span>
                        <span className="text-xs text-muted-foreground">{`#${label.id.split('-')[1]}`}</span>
                      </div>
                    </Link>
                    {index < premadeLabels.length - 1 && <Separator className="my-1" />}
                  </React.Fragment>
                ))}
              </div>
            </Card>
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default Index;
