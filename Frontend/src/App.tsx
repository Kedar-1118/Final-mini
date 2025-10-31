import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Auth/Login';
import { Signup } from './pages/Auth/Signup';
import { Home } from './pages/Home';
import { YouTubeDashboard } from './pages/YouTubeDashboard';
import { InstagramDashboard } from './pages/InstagramDashboard';
import { Trendings } from './pages/Trendings';
import { Recommendations } from './pages/Recommendations';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Navbar />
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              {/* <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              /> */}
              <Route path="/home" element={<Home />} />
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
            </Routes>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
