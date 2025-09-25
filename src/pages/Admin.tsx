import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  studyHours: number;
  level: number;
  createdAt: string;
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Obter token do localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Você precisa estar logado para acessar esta página');
        return;
      }
      
      const response = await fetch('http://localhost:3001/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.users);
      } else {
        if (response.status === 403) {
          setError('Acesso negado. Apenas administradores podem acessar esta página.');
        } else if (response.status === 401) {
          setError('Sessão expirada. Faça login novamente.');
        } else {
          setError(data.message || 'Erro ao carregar usuários');
        }
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Erro</h1>
          <p className="text-text-secondary mb-4">{error}</p>
          <button 
            onClick={fetchUsers}
            className="btn-primary"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">👥 Administração</h1>
              <p className="text-text-secondary mt-2">Gerencie todos os usuários do StudyHub</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{users.length}</div>
              <div className="text-sm text-text-secondary">usuários cadastrados</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-2xl font-bold text-primary">{users.length}</div>
            <div className="text-sm text-text-secondary">Total de Usuários</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-2xl font-bold text-secondary">
              {users.reduce((sum, user) => sum + user.points, 0)}
            </div>
            <div className="text-sm text-text-secondary">Pontos Totais</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-2xl font-bold text-accent">
              {users.reduce((sum, user) => sum + user.studyHours, 0).toFixed(1)}h
            </div>
            <div className="text-sm text-text-secondary">Horas de Estudo</div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-text-primary">Lista de Usuários</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pontos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nível
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cadastro
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {user.points} pts
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.studyHours.toFixed(1)}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                        Nível {user.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button 
            onClick={fetchUsers}
            className="btn-primary"
          >
            🔄 Atualizar Lista
          </button>
        </div>
      </div>
    </div>
  );
}
