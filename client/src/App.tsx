import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { AppLayout } from "@/components/AppLayout";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import ClientsPage from "@/pages/clients";
import ClientDetailPage from "@/pages/client-detail";
import SearchesPage from "@/pages/searches";
import SearchWizardPage from "@/pages/search-wizard";
import SearchResultsPage from "@/pages/search-results";
import AllResultsPage from "@/pages/all-results";
import ResultDetailPage from "@/pages/result-detail";
import RulesPage from "@/pages/rules";
import ExportsPage from "@/pages/exports";
import SettingsPage from "@/pages/settings";

function AuthenticatedRoutes() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/clients" component={ClientsPage} />
        <Route path="/clients/:id" component={ClientDetailPage} />
        <Route path="/searches" component={SearchesPage} />
        <Route path="/searches/new" component={SearchWizardPage} />
        <Route path="/searches/:id" component={SearchResultsPage} />
        <Route path="/results" component={AllResultsPage} />
        <Route path="/results/:id" component={ResultDetailPage} />
        <Route path="/rules" component={RulesPage} />
        <Route path="/exports" component={ExportsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function AppRouter() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return <AuthenticatedRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <Toaster />
            <Router hook={useHashLocation}>
              <AppRouter />
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
