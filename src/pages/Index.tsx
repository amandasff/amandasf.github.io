
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [premadeLabels, setPremadeLabels] = useState<Label[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Get pre-made labels and sort them numerically by ID
    const labels = getPremadeLabels().sort((a, b) => {
      const aNum = parseInt(a.id.replace('premade-', ''));
      const bNum = parseInt(b.id.replace('premade-', ''));
      return aNum - bNum;
    });
    setPremadeLabels(labels);
  }, []);

  // Group labels by category for better organization
  const categorizedLabels = {
    kitchen: premadeLabels.filter(label => 
      ['Kitchen', 'Refrigerator', 'Freezer', 'Pantry', 'Spice', 'Food', 'Baking'].some(
        term => label.name.includes(term)
      )
    ),
    household: premadeLabels.filter(label => 
      ['Bathroom', 'Bedroom', 'Laundry', 'Cleaning', 'Towels', 'Linens'].some(
        term => label.name.includes(term)
      )
    ),
    office: premadeLabels.filter(label => 
      ['Office', 'Documents', 'Files', 'Computer'].some(
        term => label.name.includes(term)
      )
    ),
    other: premadeLabels.filter(label => 
      !['Kitchen', 'Refrigerator', 'Freezer', 'Pantry', 'Spice', 'Food', 'Baking',
        'Bathroom', 'Bedroom', 'Laundry', 'Cleaning', 'Towels', 'Linens',
        'Office', 'Documents', 'Files', 'Computer'].some(
        term => label.name.includes(term)
      )
    )
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
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="kitchen">Kitchen</TabsTrigger>
                <TabsTrigger value="household">Home</TabsTrigger>
                <TabsTrigger value="office">Office</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <Card className="overflow-hidden">
                  <div className={`p-4 ${isMobile ? "max-h-[300px]" : "max-h-[400px]"} overflow-y-auto space-y-0`}>
                    {premadeLabels.map((label, index) => (
                      <React.Fragment key={label.id}>
                        <Link 
                          to={`/create?edit=${label.id}`}
                          className="block hover:bg-muted/30 rounded p-2 transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{label.name}</span>
                            <span className="text-xs text-muted-foreground">#{parseInt(label.id.replace('premade-', ''))}</span>
                          </div>
                        </Link>
                        {index < premadeLabels.length - 1 && <Separator className="my-1" />}
                      </React.Fragment>
                    ))}
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="kitchen">
                <Card className="overflow-hidden">
                  <div className={`p-4 ${isMobile ? "max-h-[300px]" : "max-h-[400px]"} overflow-y-auto space-y-0`}>
                    {categorizedLabels.kitchen.length > 0 ? (
                      categorizedLabels.kitchen.map((label, index) => (
                        <React.Fragment key={label.id}>
                          <Link 
                            to={`/create?edit=${label.id}`}
                            className="block hover:bg-muted/30 rounded p-2 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{label.name}</span>
                              <span className="text-xs text-muted-foreground">#{parseInt(label.id.replace('premade-', ''))}</span>
                            </div>
                          </Link>
                          {index < categorizedLabels.kitchen.length - 1 && <Separator className="my-1" />}
                        </React.Fragment>
                      ))
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">No kitchen labels found</p>
                    )}
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="household">
                <Card className="overflow-hidden">
                  <div className={`p-4 ${isMobile ? "max-h-[300px]" : "max-h-[400px]"} overflow-y-auto space-y-0`}>
                    {categorizedLabels.household.length > 0 ? (
                      categorizedLabels.household.map((label, index) => (
                        <React.Fragment key={label.id}>
                          <Link 
                            to={`/create?edit=${label.id}`}
                            className="block hover:bg-muted/30 rounded p-2 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{label.name}</span>
                              <span className="text-xs text-muted-foreground">#{parseInt(label.id.replace('premade-', ''))}</span>
                            </div>
                          </Link>
                          {index < categorizedLabels.household.length - 1 && <Separator className="my-1" />}
                        </React.Fragment>
                      ))
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">No household labels found</p>
                    )}
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="office">
                <Card className="overflow-hidden">
                  <div className={`p-4 ${isMobile ? "max-h-[300px]" : "max-h-[400px]"} overflow-y-auto space-y-0`}>
                    {categorizedLabels.office.length > 0 ? (
                      categorizedLabels.office.map((label, index) => (
                        <React.Fragment key={label.id}>
                          <Link 
                            to={`/create?edit=${label.id}`}
                            className="block hover:bg-muted/30 rounded p-2 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{label.name}</span>
                              <span className="text-xs text-muted-foreground">#{parseInt(label.id.replace('premade-', ''))}</span>
                            </div>
                          </Link>
                          {index < categorizedLabels.office.length - 1 && <Separator className="my-1" />}
                        </React.Fragment>
                      ))
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">No office labels found</p>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default Index;
