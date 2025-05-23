import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider, useOrganization } from "@clerk/clerk-react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CreateOrganizationPage from "./pages/CreateOrganizationPage";
import OrganizationStatus from "./pages/OrganizationStatus";
import OrganizationProfilePage from "./pages/OrganizationProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import InvitationHandler from "./pages/InvitationHandler";
import TestRoute from "./pages/TestRoute";

const queryClient = new QueryClient();

const AppContent = () => {
  return (
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
        <Route path="/invitation" element={<InvitationHandler />} />
        <Route path="/test-route" element={<TestRoute />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ClerkProvider 
        publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
        appearance={{
          baseTheme: undefined
        }}
      >
        <AppContent />
      </ClerkProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
