import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStore } from './store/useStore';
import Layout from './components/Layout'; 
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import FocusSession from './pages/FocusSession';
import Community from './pages/Community';
import Stats from './pages/Stats';
import Profile from './pages/Profile';
import AIQuestions from './pages/AIQuestions';
import Admin from './pages/Admin';
import ToastProvider from './components/ToastProvider';

// Create a client
const queryClient = new QueryClient();

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

            {/* Protected Routes */}
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
              path="/pomodoro" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <FocusSession />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/community" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Community />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/stats" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Stats />
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
              path="/ai-questions" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <AIQuestions />
                  </Layout>
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
    </QueryClientProvider>
  );
}

export default App;