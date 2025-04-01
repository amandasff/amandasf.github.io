
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { initializePremadeLabels } from "@/utils/storage";

// Pages
import Index from "./pages/Index";
import CreateLabel from "./pages/CreateLabel";
import ScanLabel from "./pages/ScanLabel";
import MyLabels from "./pages/MyLabels";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Initialize pre-made labels on app start
  useEffect(() => {
    initializePremadeLabels();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/create" element={<CreateLabel />} />
              <Route path="/scan" element={<ScanLabel />} />
              <Route path="/labels" element={<MyLabels />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
