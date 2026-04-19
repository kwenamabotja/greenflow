import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { Switch, Route, Redirect, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";

import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import RoutePlanner from "@/pages/route-planner";
import TransitFeed from "@/pages/transit";
import CarbonLedger from "@/pages/carbon";
import GreenWallet from "@/pages/green-wallet";
import Hubs from "@/pages/hubs";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: (failureCount, error: any) => {
        if (error?.status === 401 || error?.status === 403 || error?.status === 404) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

// Check if we have valid Clerk credentials (not placeholder/empty)
const hasValidClerkKey = clerkPubKey && !clerkPubKey.includes("placeholder") && clerkPubKey.startsWith("pk_");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

// Skip Clerk requirement for local development without real credentials
if (!hasValidClerkKey) {
  console.warn("⚠️ Clerk is not configured with real credentials. Running in development mode without authentication.");
}

function SignInPage() {
  if (!hasValidClerkKey) {
    return <Redirect to="/dashboard" />;
  }
  return (
    <div className="min-h-screen bg-background dark flex items-center justify-center">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  if (!hasValidClerkKey) {
    return <Redirect to="/dashboard" />;
  }
  return (
    <div className="min-h-screen bg-background dark flex items-center justify-center">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function HomeRedirect() {
  // If Clerk is not configured, just show the landing page and let users access pages
  if (!hasValidClerkKey) {
    return <Redirect to="/dashboard" />;
  }

  // Otherwise use Clerk's Show component
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <Landing />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  // If Clerk is not configured, render without authentication protection
  if (!hasValidClerkKey) {
    return (
      <Layout>
        <Component />
      </Layout>
    );
  }

  // Otherwise use Clerk's Show component for auth protection
  return (
    <>
      <Show when="signed-in">
        <Layout>
          <Component />
        </Layout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  // Create the router configuration
  const routerConfig = {
    routerPush: (to: string) => setLocation(stripBase(to)),
    routerReplace: (to: string) => setLocation(stripBase(to), { replace: true }),
  };

  // If Clerk is not configured, skip ClerkProvider for development
  const content = (
    <QueryClientProvider client={queryClient}>
      {hasValidClerkKey && <ClerkQueryClientCacheInvalidator />}
      <TooltipProvider>
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
          <Route path="/route-planner" component={() => <ProtectedRoute component={RoutePlanner} />} />
          <Route path="/transit" component={() => <ProtectedRoute component={TransitFeed} />} />
          <Route path="/carbon" component={() => <ProtectedRoute component={CarbonLedger} />} />
          <Route path="/green-wallet" component={() => <ProtectedRoute component={GreenWallet} />} />
          <Route path="/hubs" component={() => <ProtectedRoute component={Hubs} />} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );

  // Wrap with ClerkProvider only if we have valid credentials
  if (hasValidClerkKey) {
    return (
      <ClerkProvider
        publishableKey={clerkPubKey}
        proxyUrl={clerkProxyUrl}
        {...routerConfig}
      >
        {content}
      </ClerkProvider>
    );
  }

  // For development without Clerk, just return the content directly
  return content;
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
