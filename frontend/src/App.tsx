import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/layout/AppLayout";

const LandingPage = lazy(() => import("@/pages/LandingPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));
const MoodTrackerPage = lazy(() => import("@/pages/MoodTrackerPage"));
const JournalPage = lazy(() => import("@/pages/JournalPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const BreathingPage = lazy(() => import("@/pages/BreathingPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center wellness-gradient">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
        <p className="text-white/90 font-serif text-lg tracking-wide">Preparing your calm space...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, requireOnboarding = true }: { children: React.ReactNode, requireOnboarding?: boolean }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center wellness-gradient">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <p className="text-white/90 font-serif text-lg tracking-wide">Preparing your calm space...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (requireOnboarding && !user.onboardingCompleted) return <Navigate to="/onboarding" replace />;
  
  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute requireOnboarding={false}>
                <OnboardingPage />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="mood" element={<MoodTrackerPage />} />
            <Route path="journal" element={<JournalPage />} />
            <Route path="breathing" element={<BreathingPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
