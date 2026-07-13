import { useEffect, useRef } from "react";
import { ClerkProvider, Show, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/contexts/ThemeContext';
import NotFound from '@/pages/not-found';
import PlannerPage from '@/pages/PlannerPage';
import SignInPage from '@/pages/SignInPage';
import SignUpPage from '@/pages/SignUpPage';
import OnboardingPage from '@/pages/OnboardingPage';
import DashboardPage from '@/pages/DashboardPage';
import ProfilePage from '@/pages/ProfilePage';
import CalculatorsPage from '@/pages/CalculatorsPage';
import WorkoutPage from '@/pages/WorkoutPage';
import DietPage from '@/pages/DietPage';
import PlansPage from '@/pages/PlansPage';

import ProgressPage from '@/pages/ProgressPage';
import CoachPage from '@/pages/CoachPage';
import ReportsPage from '@/pages/ReportsPage';
import { CoachWidget } from '@/components/CoachWidget';
import { useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";

import { AdminLayout } from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminLeads from '@/pages/admin/AdminLeads';
import AdminNewsletter from '@/pages/admin/AdminNewsletter';
import AdminTemplates from '@/pages/admin/AdminTemplates';
import AdminBlogs from '@/pages/admin/AdminBlogs';
import AdminSettings from '@/pages/admin/AdminSettings';
import BlogPostPage from '@/pages/BlogPostPage';
import BlogListPage from '@/pages/BlogListPage';

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY');

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#FFD700",
    colorForeground: "#FFFFFF",
    colorMutedForeground: "#9CA3AF",
    colorDanger: "#EF4444",
    colorBackground: "#0A0A0A",
    colorInput: "#1A1A1A",
    colorInputForeground: "#FFFFFF",
    colorNeutral: "#374151",
    fontFamily: "Inter, sans-serif",
    borderRadius: "1rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#0A0A0A] border border-white/10 rounded-2xl w-[440px] max-w-full overflow-hidden shadow-2xl shadow-black/60",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white font-display text-2xl font-bold",
    headerSubtitle: "text-gray-400",
    socialButtonsBlockButtonText: "text-white",
    formFieldLabel: "text-gray-300 text-sm font-medium",
    footerActionLink: "text-[#FFD700] hover:text-yellow-400",
    footerActionText: "text-gray-500",
    dividerText: "text-gray-600",
    identityPreviewEditButton: "text-[#FFD700]",
    formFieldSuccessText: "text-green-400",
    alertText: "text-white",
    logoBox: "flex justify-center py-2",
    logoImage: "h-10 w-auto",
    socialButtonsBlockButton: "bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl",
    formButtonPrimary: "bg-[#FFD700] hover:bg-yellow-500 text-black font-bold rounded-xl",
    formFieldInput: "bg-[#1A1A1A] border border-white/10 text-white rounded-xl placeholder:text-gray-600",
    footerAction: "bg-transparent",
    dividerLine: "bg-white/10",
    alert: "bg-red-950/40 border border-red-800/30 rounded-xl",
    otpCodeFieldInput: "bg-[#1A1A1A] border border-white/10 text-white",
    formFieldRow: "mb-4",
    main: "p-2",
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);
  return null;
}

// At `/`, signed-in users go to /dashboard; signed-out users see the planner.
function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <PlannerPage />
      </Show>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  return (
    <>
      <Show when="signed-in">
        <Component />
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

function ProtectedDashboardRoute() {
  const { isSignedIn } = useUser();
  const { data: profile, isLoading, isError } = useGetProfile({
    query: {
      enabled: !!isSignedIn,
      queryKey: getGetProfileQueryKey(),
      retry: false,
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !profile || profile.onboardingCompleted !== true) {
    return <Redirect to="/onboarding" />;
  }

  return <DashboardPage />;
}

function ProtectedOnboardingRoute() {
  const { isSignedIn } = useUser();
  const { data: profile, isLoading } = useGetProfile({
    query: {
      enabled: !!isSignedIn,
      queryKey: getGetProfileQueryKey(),
      retry: false,
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (profile?.onboardingCompleted === true) {
    return <Redirect to="/dashboard" />;
  }

  return <OnboardingPage />;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            {/* Root: planner for signed-out users, dashboard redirect for signed-in */}
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />

            {/* Protected Routes */}
            <Route path="/onboarding">
              <Show when="signed-in">
                <ProtectedOnboardingRoute />
              </Show>
              <Show when="signed-out">
                <Redirect to="/sign-in" />
              </Show>
            </Route>

            <Route path="/dashboard">
              <Show when="signed-in">
                <ProtectedDashboardRoute />
              </Show>
              <Show when="signed-out">
                <Redirect to="/sign-in" />
              </Show>
            </Route>

            <Route path="/profile">
              <ProtectedRoute component={ProfilePage} />
            </Route>
            
            <Route path="/calculators" component={CalculatorsPage} />

            <Route path="/workout">
              <ProtectedRoute component={WorkoutPage} />
            </Route>

            <Route path="/diet">
              <ProtectedRoute component={DietPage} />
            </Route>

            <Route path="/plans">
              <ProtectedRoute component={PlansPage} />
            </Route>

            <Route path="/progress">
              <ProtectedRoute component={ProgressPage} />
            </Route>

            <Route path="/coach">
              <ProtectedRoute component={CoachPage} />
            </Route>

            <Route path="/reports">
              <ProtectedRoute component={ReportsPage} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin">
              <Show when="signed-in">
                <AdminLayout><AdminDashboard /></AdminLayout>
              </Show>
              <Show when="signed-out"><Redirect to="/sign-in" /></Show>
            </Route>
            <Route path="/admin/users">
              <Show when="signed-in">
                <AdminLayout><AdminUsers /></AdminLayout>
              </Show>
              <Show when="signed-out"><Redirect to="/sign-in" /></Show>
            </Route>
            <Route path="/admin/leads">
              <Show when="signed-in">
                <AdminLayout><AdminLeads /></AdminLayout>
              </Show>
              <Show when="signed-out"><Redirect to="/sign-in" /></Show>
            </Route>
            <Route path="/admin/newsletter">
              <Show when="signed-in">
                <AdminLayout><AdminNewsletter /></AdminLayout>
              </Show>
              <Show when="signed-out"><Redirect to="/sign-in" /></Show>
            </Route>
            <Route path="/admin/templates">
              <Show when="signed-in">
                <AdminLayout><AdminTemplates /></AdminLayout>
              </Show>
              <Show when="signed-out"><Redirect to="/sign-in" /></Show>
            </Route>
            <Route path="/admin/blogs">
              <Show when="signed-in">
                <AdminLayout><AdminBlogs /></AdminLayout>
              </Show>
              <Show when="signed-out"><Redirect to="/sign-in" /></Show>
            </Route>
            <Route path="/admin/settings">
              <Show when="signed-in">
                <AdminLayout><AdminSettings /></AdminLayout>
              </Show>
              <Show when="signed-out"><Redirect to="/sign-in" /></Show>
            </Route>

            {/* Public Blog */}
            <Route path="/blog" component={BlogListPage} />
            <Route path="/blog/:slug" component={BlogPostPage} />

            <Route component={NotFound} />
          </Switch>
          <Show when="signed-in">
            <CoachWidget />
          </Show>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
