import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStore } from './store/useStore'; // Corrigido
import { useEffect, useState } from 'react'; // Importado
import LoadingSpinner from './components/LoadingSpinner'; // Corrigido

// Componentes
import Layout from './components/Layout'; // Corrigido
import Login from './pages/Login'; // Corrigido
import Register from './pages/Register'; // Corrigido
import Dashboard from './pages/Dashboard'; // Corrigido
import Tasks from './pages/Tasks'; // Corrigido
import FocusSession from './pages/FocusSession'; // Corrigido
import Pomodoro from './pages/Pomodoro'; // <-- IMPORT FALTANDO ADICIONADO E CORRIGIDO
import Community from './pages/Community'; // Corrigido
import Calendar from './pages/Calendar'; // Importado
import Profile from './pages/Profile'; // Corrigido
import Admin from './pages/Admin'; // Corrigido
import ToastProvider from './components/ToastProvider'; // Corrigido
import ErrorBoundary from './components/ErrorBoundary'; // Corrigido

// Create a client
const queryClient = new QueryClient();

// --- AppInitializer (ADICIONADO DE VOLTA) ---
// Isso corrige o chat e os posts anônimos
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
// --- FIM DO AppInitializer ---


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
      <AppInitializer> {/* <--- ADICIONADO O WRAPPER */}
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
                    {/* <Layout> REMOVIDO DAQUI */}
                    <Pomodoro /> {/* <--- COMPONENTE CORRIGIDO */}
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/focus-session" 
                element={
                  <ProtectedRoute>
                    {/* O <Layout> já estava removido (correto) */}
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
      </AppInitializer> {/* <--- FIM DO WRAPPER */}
    </QueryClientProvider>
  );
}

export default App;