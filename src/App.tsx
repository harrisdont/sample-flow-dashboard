import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SeasonalCollectionPlanning from "./pages/SeasonalCollectionPlanning";
import FabricInduction from "./pages/FabricInduction";
import Sampling from "./pages/Sampling";
import DirectorDashboard from "./pages/DirectorDashboard";
import DesignHub from "./pages/DesignHub";
import SourcingDashboard from "./pages/SourcingDashboard";
import SamplingFloorDashboard from "./pages/SamplingFloorDashboard";
import ProductionPage from "./pages/ProductionPage";
import ScanPage from "./pages/ScanPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/director" element={<DirectorDashboard />} />
            <Route path="/design-hub" element={<DesignHub />} />
            <Route path="/sourcing" element={<SourcingDashboard />} />
            <Route path="/sampling-floor" element={<SamplingFloorDashboard />} />
            <Route path="/seasonal-planning" element={<SeasonalCollectionPlanning />} />
            <Route path="/fabric-induction" element={<FabricInduction />} />
            <Route path="/sampling" element={<Sampling />} />
            <Route path="/production" element={<ProductionPage />} />
            <Route path="/scan" element={<ScanPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
