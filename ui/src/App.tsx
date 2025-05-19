import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CreateOrganizationPage from "./pages/CreateOrganizationPage";
import OrganizationStatus from "./pages/OrganizationStatus";
import OrganizationProfilePage from "./pages/OrganizationProfilePage";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ClerkProvider 
      signInForceRedirectUrl="/create-organization" 
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
    >
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/create-organization"
              element={
                <CreateOrganizationPage />
              }
            />
            <Route path="/org/:slug" element={<OrganizationStatus />} />
            <Route path="/org/:slug/settings" element={<OrganizationProfilePage />} />
            <Route path="/org/:slug/admin-dashboard" element={<AdminDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </ClerkProvider>
  </QueryClientProvider>
);

export default App;
