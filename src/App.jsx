import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { BusinessHoursProvider } from './contexts/BusinessHoursContext';
import { BusinessInfoProvider } from './contexts/BusinessInfoContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';

// Lazy load non-critical components
const AppleCalendarDashboard = React.lazy(() => import('./components/AppleCalendarDashboard'));
const PricingPage = React.lazy(() => import('./pages/PricingPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const TenantManagement = React.lazy(() => import('./pages/TenantManagement'));
const AIAnalyticsDashboard = React.lazy(() => import('./components/AIAnalyticsDashboard'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const BlogPage = React.lazy(() => import('./pages/BlogPage'));
const HelpCenterPage = React.lazy(() => import('./pages/HelpCenterPage'));
const StatusPage = React.lazy(() => import('./pages/StatusPage'));
const APIPage = React.lazy(() => import('./pages/APIPage'));
const CareersPage = React.lazy(() => import('./pages/CareersPage'));
const SupportPage = React.lazy(() => import('./pages/SupportPage'));
const DocumentationPage = React.lazy(() => import('./pages/DocumentationPage'));
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminTenantManagement = React.lazy(() => import('./pages/AdminTenantManagement'));
const AdminUserManagement = React.lazy(() => import('./pages/AdminUserManagement'));
const AdminFormManagement = React.lazy(() => import('./pages/AdminFormManagement'));
const AdminAnalytics = React.lazy(() => import('./pages/AdminAnalytics'));
const AdminBilling = React.lazy(() => import('./pages/AdminBilling'));
const AdminSystemSettings = React.lazy(() => import('./pages/AdminSystemSettings'));
const ApiTest = React.lazy(() => import('./components/ApiTest'));
const AuthTest = React.lazy(() => import('./components/AuthTest'));
const LoginTest = React.lazy(() => import('./components/LoginTest'));
const SubdomainAccess = React.lazy(() => import('./components/SubdomainAccess'));
const SubdomainUrlHandler = React.lazy(() => import('./components/SubdomainUrlHandler'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);
import './index.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Error logging removed for clean version
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center max-w-md p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">The application encountered an error. Please refresh the page to try again.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500">Error Details</summary>
              <pre className="mt-2 text-xs text-gray-400 bg-gray-50 p-2 rounded overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error.response?.status === 401) return false;
        return failureCount < 3;
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  console.log('🔒 ProtectedRoute check:', { user: user ? 'Present' : 'Missing', loading });
  
  if (loading) {
    console.log('⏳ ProtectedRoute: Loading state, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    console.log('❌ ProtectedRoute: No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ ProtectedRoute: User authenticated, rendering children');
  return children;
};

const AppContent = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <TenantProvider>
        <AuthProvider>
          <WebSocketProvider>
            <SettingsProvider>
              <BusinessHoursProvider>
              <BusinessInfoProvider>
                <ScrollToTop />
                <SubdomainUrlHandler />
                <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={
          <Suspense fallback={<LoadingSpinner />}>
            <PricingPage />
          </Suspense>
        } />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/about" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AboutPage />
          </Suspense>
        } />
        <Route path="/contact" element={
          <Suspense fallback={<LoadingSpinner />}>
            <ContactPage />
          </Suspense>
        } />
        <Route path="/blog" element={
          <Suspense fallback={<LoadingSpinner />}>
            <BlogPage />
          </Suspense>
        } />
        <Route path="/help" element={
          <Suspense fallback={<LoadingSpinner />}>
            <HelpCenterPage />
          </Suspense>
        } />
        <Route path="/docs" element={
          <Suspense fallback={<LoadingSpinner />}>
            <DocumentationPage />
          </Suspense>
        } />
        <Route path="/status" element={
          <Suspense fallback={<LoadingSpinner />}>
            <StatusPage />
          </Suspense>
        } />
        <Route path="/api" element={
          <Suspense fallback={<LoadingSpinner />}>
            <APIPage />
          </Suspense>
        } />
        <Route path="/careers" element={
          <Suspense fallback={<LoadingSpinner />}>
            <CareersPage />
          </Suspense>
        } />
        <Route path="/support" element={
          <Suspense fallback={<LoadingSpinner />}>
            <SupportPage />
          </Suspense>
        } />
        <Route path="/privacy" element={
          <Suspense fallback={<LoadingSpinner />}>
            <PrivacyPage />
          </Suspense>
        } />
        <Route path="/api-test" element={
          <Suspense fallback={<LoadingSpinner />}>
            <ApiTest />
          </Suspense>
        } />
        <Route path="/auth-test" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AuthTest />
          </Suspense>
        } />
        <Route path="/login-test" element={
          <Suspense fallback={<LoadingSpinner />}>
            <LoginTest />
          </Suspense>
        } />
        <Route path="/venue" element={
          <Suspense fallback={<LoadingSpinner />}>
            <SubdomainAccess />
          </Suspense>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AdminDashboard />
          </Suspense>
        } />
        <Route path="/admin/tenants" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AdminTenantManagement />
          </Suspense>
        } />
        <Route path="/admin/users" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AdminUserManagement />
          </Suspense>
        } />
        <Route path="/admin/forms" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AdminFormManagement />
          </Suspense>
        } />
        <Route path="/admin/analytics" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AdminAnalytics />
          </Suspense>
        } />
        <Route path="/admin/billing" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AdminBilling />
          </Suspense>
        } />
        <Route path="/admin/system" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AdminSystemSettings />
          </Suspense>
        } />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AppleCalendarDashboard />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/ai-analytics" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AIAnalyticsDashboard />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <SettingsPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/tenants" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <TenantManagement />
            </Suspense>
          </ProtectedRoute>
        } />
                  </Routes>
                </BusinessInfoProvider>
              </BusinessHoursProvider>
            </SettingsProvider>
          </WebSocketProvider>
        </AuthProvider>
      </TenantProvider>
    </Router>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className="App">
          <AppContent />
          <ScrollToTopButton />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#34C759',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#FF3B30',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
        {/* React Query Devtools hidden for demo */}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;