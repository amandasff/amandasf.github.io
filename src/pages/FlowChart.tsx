
import React from "react";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import AppFlowChart from "@/components/AppFlowChart";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FlowChart = () => {
  return (
    <Layout>
      <Header title="App Flow Chart" />
      
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-4">
          <p className="text-muted-foreground">
            Visual representation of the Audio Labels app flow
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-2 overflow-hidden">
          <AppFlowChart />
        </div>
        
        <div className="flex justify-center">
          <Button asChild variant="outline">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </motion.div>
    </Layout>
  );
};

export default FlowChart;
