import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PageTransition } from './components/PageTransition';
import { Login } from './pages/Auth/Login';
import { LandingPage } from './pages/LandingPage';
import { Signup } from './pages/Auth/Signup';
import { Home } from './pages/Home';
import { YouTubeDashboard } from './pages/YouTubeDashboard';
import { InstagramDashboard } from './pages/InstagramDashboard';
import { Trendings } from './pages/Trendings';
import { Recommendations } from './pages/Recommendations';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/home" element={<PageTransition><Home /></PageTransition>} />
        <Route
          path="/youtube"
          element={
            <ProtectedRoute>
              <PageTransition><YouTubeDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/instagram"
          element={
            <ProtectedRoute>
              <PageTransition><InstagramDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trendings"
          element={
            <ProtectedRoute>
              <PageTransition><Trendings /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <PageTransition><Recommendations /></PageTransition>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Navbar />
            <AnimatedRoutes />
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
