import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStore } from './store/useStore';
import { useEffect, useState } from 'react';
import LoadingSpinner from './components/LoadingSpinner';

// Componentes
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import FocusSession from './pages/FocusSession';
import Pomodoro from './pages/Pomodoro';
import Community from './pages/Community';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import ToastProvider from './components/ToastProvider';
import ErrorBoundary from './components/ErrorBoundary';

// Create a client
const queryClient = new QueryClient();

function AppInitializer({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error("Falha ao inicializar app", error);
      } finally {
        setIsInitializing(false);
      }
    };
    initializeApp();
  }, [checkAuth]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
}


// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

// Public Route Component (redirect if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInitializer>
        <Router>
          <div className="App">
            <ToastProvider />
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              {/* Protected Routes (Dentro do Layout) */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tasks" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Tasks />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/calendar" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Calendar />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/community" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ErrorBoundary>
                        <Community />
                      </ErrorBoundary>
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Protected Routes (Tela Cheia) */}
              <Route 
                path="/pomodoro" 
                element={
                  <ProtectedRoute>
                    <Pomodoro />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/focus-session" 
                element={
                  <ProtectedRoute>
                    <FocusSession />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                } 
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </Router>
      </AppInitializer>
    </QueryClientProvider>
  );
}

export default App;