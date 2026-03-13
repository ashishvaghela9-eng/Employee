import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import BranchFileStation from "./pages/BranchFileStation";
import AssetCuez from "./pages/AssetCuez";
import Vpn from "./pages/Vpn";
import Jira from "./pages/Jira";
import MailVault from "./pages/MailVault";
import Ftp from "./pages/Ftp";
import Acronis from "./pages/Acronis";
import TataTele from "./pages/TataTele";
import SystemUsers from "./pages/SystemUsers";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

// Intercept fetch to add auth token automatically
const originalFetch = window.fetch;
window.fetch = async (input, init = {}) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    init.headers = {
      ...init.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return originalFetch(input, init);
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: any }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (!user) {
    window.location.href = `${import.meta.env.BASE_URL}login`;
    return null;
  }
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/employees" component={() => <ProtectedRoute component={Employees} />} />
      <Route path="/branch-file-station" component={() => <ProtectedRoute component={BranchFileStation} />} />
      <Route path="/assetcuez" component={() => <ProtectedRoute component={AssetCuez} />} />
      <Route path="/system-users" component={() => <ProtectedRoute component={SystemUsers} />} />
      <Route path="/reports" component={() => <ProtectedRoute component={Reports} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route path="/vpn" component={() => <ProtectedRoute component={Vpn} />} />
      <Route path="/jira" component={() => <ProtectedRoute component={Jira} />} />
      <Route path="/mailvault" component={() => <ProtectedRoute component={MailVault} />} />
      <Route path="/ftp" component={() => <ProtectedRoute component={Ftp} />} />
      <Route path="/acronis" component={() => <ProtectedRoute component={Acronis} />} />
      <Route path="/tata-tele" component={() => <ProtectedRoute component={TataTele} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
