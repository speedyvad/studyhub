import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Pomodoro from './pages/Pomodoro';
import Community from './pages/Community';
import Stats from './pages/Stats';
import Profile from './pages/Profile';
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
              element={<Login />}
            />
            <Route 
              path="/register" 
              element={<Register />}
            />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              } 
            />
            <Route 
              path="/tasks" 
              element={
                <Layout>
                  <Tasks />
                </Layout>
              } 
            />
            <Route 
              path="/pomodoro" 
              element={
                <Layout>
                  <Pomodoro />
                </Layout>
              } 
            />
            <Route 
              path="/community" 
              element={
                <Layout>
                  <Community />
                </Layout>
              } 
            />
            <Route 
              path="/stats" 
              element={
                <Layout>
                  <Stats />
                </Layout>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <Layout>
                  <Profile />
                </Layout>
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