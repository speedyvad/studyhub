import { useState } from 'react';
import { api } from '../lib/api';
import PomodoroTest from './PomodoroTest';
import CommunityTest from './CommunityTest';

export default function ApiTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testHealth = async () => {
    setLoading(true);
    try {
      console.log('Testando health check...');
      const response = await api.healthCheck();
      console.log('Resposta do health check:', response);
      setResult(response);
    } catch (error: any) {
      console.error('Erro no health check:', error);
      setResult({ 
        error: error.message,
        details: error.toString(),
        stack: error.stack 
      });
    } finally {
      setLoading(false);
    }
  };


  const testDirect = async () => {
    setLoading(true);
    try {
      console.log('Testando conexão direta...');
      const response = await fetch('http://localhost:3001/api/health');
      const data = await response.json();
      console.log('Resposta direta:', data);
      setResult({ 
        success: true,
        message: 'Conexão direta funcionando!',
        data: data,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      });
    } catch (error: any) {
      console.error('Erro na conexão direta:', error);
      setResult({ 
        error: error.message,
        details: error.toString(),
        stack: error.stack 
      });
    } finally {
      setLoading(false);
    }
  };

  const listUsers = async () => {
    setLoading(true);
    try {
      console.log('Listando usuários...');
      const response = await fetch('http://localhost:3001/api/users');
      const data = await response.json();
      console.log('Usuários encontrados:', data);
      setResult(data);
    } catch (error: any) {
      console.error('Erro ao listar usuários:', error);
      setResult({ 
        error: error.message,
        details: error.toString(),
        stack: error.stack 
      });
    } finally {
      setLoading(false);
    }
  };

  const testRegister = async () => {
    setLoading(true);
    try {
      console.log('Testando registro...');
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Teste User',
          email: 'teste@example.com',
          password: '123456'
        })
      });
      const data = await response.json();
      console.log('Resposta do registro:', data);
      setResult({ 
        success: true,
        message: 'Registro funcionando!',
        data: data
      });
    } catch (error: any) {
      console.error('Erro no registro:', error);
      setResult({ 
        error: error.message,
        details: error.toString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      console.log('Testando login...');
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'teste@example.com',
          password: '123456'
        })
      });
      const data = await response.json();
      console.log('Resposta do login:', data);
      setResult({ 
        success: true,
        message: 'Login funcionando!',
        data: data
      });
    } catch (error: any) {
      console.error('Erro no login:', error);
      setResult({ 
        error: error.message,
        details: error.toString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🧪 Teste de API</h2>
      
      <div className="space-y-4">
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={testHealth}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Testando...' : 'Health Check'}
          </button>
          
          <button
            onClick={testDirect}
            disabled={loading}
            className="btn-secondary"
          >
            {loading ? 'Testando...' : 'Teste Direto'}
          </button>

          <button
            onClick={testRegister}
            disabled={loading}
            className="btn-accent"
          >
            {loading ? 'Testando...' : 'Testar Registro'}
          </button>

          <button
            onClick={testLogin}
            disabled={loading}
            className="btn-success"
          >
            {loading ? 'Testando...' : 'Testar Login'}
          </button>

          <button
            onClick={listUsers}
            disabled={loading}
            className="btn-info"
          >
            {loading ? 'Carregando...' : 'Listar Usuários'}
          </button>
        </div>

        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Resultado:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

          <div className="mt-8">
            <PomodoroTest />
          </div>

          <div className="mt-8">
            <CommunityTest />
          </div>
    </div>
  );
}
