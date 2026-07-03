import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Intro from './components/Intro';
import MarketingPage from './components/MarketingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import { MainLayout } from './components/MainLayout';
import { AdminPanel } from './components/AdminPanel';
import { SupportPage } from './components/SupportPage';
import { PasscodeModal } from './components/PasscodeModal';

// Tracks whether this browser has already seen the intro
const hasSeenIntro = () => localStorage.getItem('hasSeenIntro') === 'true';

function PasscodeGate({ children }: { children: React.ReactNode }) {
  const { user, hasPasscode, passcodeVerified } = useApp();
  if (!user || !hasPasscode() || passcodeVerified) {
    return <>{children}</>;
  }
  return (
    <PasscodeModal
      mode="verify"
      onSuccess={() => {}}
    />
  );
}

function AppContent() {
  const { user, token } = useApp();

  if (token && !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <span className="text-white/50 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  const isAuthenticated = !!token && !!user;
  const isAdmin = isAuthenticated && user?.role === 'admin';

  // Where an unauthenticated visitor should land depends on whether
  // they've seen the intro yet.
  const loggedOutDestination = hasSeenIntro() ? '/marketing' : '/intro';

  return (
    <Routes>
      <Route path="/intro" element={<Intro />} />

      <Route path="/marketing" element={<MarketingPage />} />

      <Route path="/login" element={
        isAuthenticated
          ? <Navigate to={isAdmin ? '/admin' : '/'} replace />
          : !hasSeenIntro()
          ? <Navigate to="/intro" replace />
          : <Login />
      } />

      <Route path="/signup" element={
        isAuthenticated
          ? <Navigate to="/" replace />
          : !hasSeenIntro()
          ? <Navigate to="/intro" replace />
          : <Signup />
      } />

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/support" element={
        isAuthenticated ? <PasscodeGate><SupportPage /></PasscodeGate> : <Navigate to="/login" replace />
      } />

      <Route path="/admin" element={
        isAdmin
          ? <AdminPanel />
          : isAuthenticated
          ? <Navigate to="/" replace />
          : <Navigate to="/login" replace />
      } />

      <Route path="/" element={
        isAuthenticated
          ? <PasscodeGate><MainLayout /></PasscodeGate>
          : <Navigate to={loggedOutDestination} replace />
      } />

      <Route path="*" element={
        <Navigate to={isAuthenticated ? '/' : loggedOutDestination} replace />
      } />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
