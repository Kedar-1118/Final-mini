import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { ThemeProvider } from "./context/ThemeContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { LandingPage } from "./pages/LandingPage";
import { Login } from "./pages/Auth/Login";
import { Signup } from "./pages/Auth/Signup";
import { Home } from "./pages/Home";
import { YouTubeDashboard } from "./pages/YouTubeDashboard";
import { InstagramDashboard } from "./pages/InstagramDashboard";
import { Trendings } from "./pages/Trendings";
import { Recommendations } from "./pages/Recommendations";
import Settings from "./pages/Settings";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "react-hot-toast";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route
                    path="/home"
                    element={
                      <ProtectedRoute>
                        <Home />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/youtube"
                    element={
                      <ProtectedRoute>
                        <YouTubeDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instagram"
                    element={
                      <ProtectedRoute>
                        <InstagramDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/dashboard" element={<Navigate to="/home" replace />} />
                  <Route
                    path="/trendings"
                    element={
                      <ProtectedRoute>
                        <Trendings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/recommendations"
                    element={
                      <ProtectedRoute>
                        <Recommendations />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
              <Footer />
              <Toaster position="top-right" toastOptions={{
                style: {
                  background: '#333',
                  color: '#fff',
                },
              }} />
            </div>
          </ErrorBoundary>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
