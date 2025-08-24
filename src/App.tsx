import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SkipLink } from "@/components/accessibility/SkipLink";
import Index from "./pages/Index";
import TournamentsPage from "./pages/TournamentsPage";
import NewTournamentPage from "./pages/NewTournamentPage";
import TeamsPage from "./pages/TeamsPage";
import PlanningPage from "./pages/PlanningPage";
import SettingsPage from "./pages/SettingsPage";
import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";
import NotFound from "./pages/NotFound";
import TournamentDetailPage from "./pages/TournamentDetailPage";
import AuthPage from "./pages/AuthPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SkipLink />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <main id="main-content">
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/tournaments" element={<TournamentsPage />} />
            <Route path="/tournaments/new" element={<NewTournamentPage />} />
            <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/planning" element={<PlanningPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
