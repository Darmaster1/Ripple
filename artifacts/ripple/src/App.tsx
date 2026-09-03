import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { RippleShell } from '@/components/ripple-shell';
import { HomePage, SimulatePage, CriticalityPage, WhatIfPage, OptimizePage, CopilotPage } from '@/pages/ripple-pages';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <RippleShell>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/simulate" component={SimulatePage} />
          <Route path="/criticality" component={CriticalityPage} />
          <Route path="/what-if" component={WhatIfPage} />
          <Route path="/optimize" component={OptimizePage} />
          <Route path="/copilot" component={CopilotPage} />
          <Route component={NotFound} />
        </Switch>
      </RippleShell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
