import React, { useState, useEffect } from 'react';
import { pomodoroApi, PomodoroSession, PomodoroStats } from '../lib/pomodoroApi';

export default function PomodoroTest() {
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [stats, setStats] = useState<PomodoroStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const startSession = async () => {
    setLoading(true);
    try {
      console.log('Iniciando sessão Pomodoro...');
      const response = await pomodoroApi.startSession({ duration: 25 });
      console.log('Sessão iniciada:', response);
      setResult(response);
      loadSessions();
    } catch (error: any) {
      console.error('Erro ao iniciar sessão:', error);
      setResult({ 
        error: error.message,
        details: error.toString(),
        stack: error.stack 
      });
    } finally {
      setLoading(false);
    }
  };

  const completeSession = async (sessionId: string) => {
    setLoading(true);
    try {
      console.log('Finalizando sessão:', sessionId);
      const response = await pomodoroApi.completeSession(sessionId);
      console.log('Sessão finalizada:', response);
      setResult(response);
      loadSessions();
      loadStats();
    } catch (error: any) {
      console.error('Erro ao finalizar sessão:', error);
      setResult({ 
        error: error.message,
        details: error.toString(),
        stack: error.stack 
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      console.log('Carregando sessões...');
      const response = await pomodoroApi.getSessions();
      console.log('Sessões carregadas:', response);
      setSessions(response.data.sessions);
    } catch (error: any) {
      console.error('Erro ao carregar sessões:', error);
    }
  };

  const loadStats = async () => {
    try {
      console.log('Carregando estatísticas...');
      const response = await pomodoroApi.getStats();
      console.log('Estatísticas carregadas:', response);
      setStats(response.data);
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  useEffect(() => {
    loadSessions();
    loadStats();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🍅 Teste do Pomodoro</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Ações</h3>
          
          <button
            onClick={startSession}
            disabled={loading}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sessão (25min)'}
          </button>

          <button
            onClick={loadSessions}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Carregando...' : 'Recarregar Sessões'}
          </button>

          <button
            onClick={loadStats}
            disabled={loading}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Carregando...' : 'Recarregar Estatísticas'}
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Estatísticas</h3>
          {stats && (
            <div className="bg-gray-50 p-4 rounded">
              <p><strong>Total de Sessões:</strong> {stats.totalSessions}</p>
              <p><strong>Total de Minutos:</strong> {stats.totalMinutes}</p>
              <p><strong>Total de Horas:</strong> {stats.totalHours}</p>
              <p><strong>Hoje:</strong> {stats.todaySessions} sessões</p>
              <p><strong>Esta Semana:</strong> {stats.thisWeekSessions} sessões</p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Sessões Recentes</h3>
        <div className="space-y-2">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">
                  {session.duration} minutos - {session.completed ? '✅ Concluída' : '⏳ Em andamento'}
                </p>
                <p className="text-sm text-gray-600">
                  Iniciada: {new Date(session.startedAt).toLocaleString()}
                </p>
              </div>
              {!session.completed && (
                <button
                  onClick={() => completeSession(session.id)}
                  disabled={loading}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
                >
                  Finalizar
                </button>
              )}
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-gray-500 text-center py-4">Nenhuma sessão encontrada</p>
          )}
        </div>
      </div>

      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Resultado da Última Ação</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
