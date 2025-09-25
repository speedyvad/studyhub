import { useStore } from '../store/useStore';
import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Trophy, 
  Calendar,
  BookOpen,
  Star,
  Award
} from 'lucide-react';
import tasksApi from '../lib/tasksApi';
import pomodoroApi from '../lib/pomodoroApi';

export default function Stats() {
  const { user } = useStore();
  const [tasks, setTasks] = useState([]);
  const [pomodoroStats, setPomodoroStats] = useState({ totalSessions: 0, totalHours: 0, todaySessions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatsData = async () => {
      try {
        setLoading(true);
        const [tasksResponse, pomodoroStatsResponse] = await Promise.all([
          tasksApi.getTasks(),
          pomodoroApi.getStats()
        ]);
        
        setTasks(tasksResponse.data.tasks || []);
        setPomodoroStats(pomodoroStatsResponse.data);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadStatsData();
    }
  }, [user]);

  // Dados para gráficos (simulados por enquanto)
  const weeklyData = [
    { day: 'Seg', hours: 2.5, sessions: 6, points: 150 },
    { day: 'Ter', hours: 3.2, sessions: 8, points: 200 },
    { day: 'Qua', hours: 1.8, sessions: 4, points: 100 },
    { day: 'Qui', hours: 4.1, sessions: 10, points: 250 },
    { day: 'Sex', hours: 2.9, sessions: 7, points: 175 },
    { day: 'Sáb', hours: 3.5, sessions: 8, points: 200 },
    { day: 'Dom', hours: 2.1, sessions: 5, points: 125 }
  ];

  const subjectData = tasks.reduce((acc, task) => {
    const existing = acc.find(item => item.subject === task.subject);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ subject: task.subject, value: 1 });
    }
    return acc;
  }, [] as { subject: string; value: number }[]);

  const COLORS = ['#0EA5E9', '#22C55E', '#FACC15', '#F97316', '#8B5CF6', '#EC4899'];

  const stats = {
    totalHours: pomodoroStats.totalHours,
    totalSessions: pomodoroStats.totalSessions,
    streak: 0 // Por enquanto, sem streak
  };

  // Dados de progresso mensal
  const monthlyProgress = [
    { week: 'Sem 1', hours: 8.5, goal: 10 },
    { week: 'Sem 2', hours: 12.3, goal: 10 },
    { week: 'Sem 3', hours: 9.8, goal: 10 },
    { week: 'Sem 4', hours: 15.2, goal: 10 }
  ];

  // Ranking simulado
  const ranking = [
    { position: 1, name: 'João Silva', points: 1250, avatar: user?.avatar },
    { position: 2, name: 'Maria Santos', points: 1180, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face' },
    { position: 3, name: 'Pedro Costa', points: 1100, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
    { position: 4, name: 'Ana Oliveira', points: 980, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face' },
    { position: 5, name: 'Carlos Lima', points: 920, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Estatísticas</h1>
        <p className="text-text-secondary">Acompanhe seu progresso e performance nos estudos</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.totalHours.toFixed(1)}h</p>
              <p className="text-sm text-text-secondary">Horas estudadas</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.totalSessions}</p>
              <p className="text-sm text-text-secondary">Sessões completas</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gamification-100 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-gamification" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{user?.points}</p>
              <p className="text-sm text-text-secondary">Pontos totais</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.streak}</p>
              <p className="text-sm text-text-secondary">Sequência atual</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Study Hours */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Horas de Estudo - Semana</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="hours" 
                stroke="#0EA5E9" 
                fill="#0EA5E9" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Distribuição por Matéria</h3>
            <BookOpen className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={subjectData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ subject, percent }) => `${subject} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {subjectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Progresso Mensal</h3>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="goal" fill="#e2e8f0" name="Meta" />
              <Bar dataKey="hours" fill="#22C55E" name="Realizado" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Study Sessions Trend */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Sessões de Estudo</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="sessions" 
                stroke="#FACC15" 
                strokeWidth={3}
                dot={{ fill: '#FACC15', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ranking */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Ranking de Pontos</h3>
          <Award className="w-5 h-5 text-gamification" />
        </div>
        <div className="space-y-4">
          {ranking.map((user, index) => (
            <div 
              key={user.position} 
              className={`flex items-center space-x-4 p-4 rounded-lg ${
                user.position === 1 ? 'bg-gamification-50 border border-gamification-200' :
                user.position === 2 ? 'bg-gray-50 border border-gray-200' :
                user.position === 3 ? 'bg-orange-50 border border-orange-200' :
                'bg-white border border-gray-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                user.position === 1 ? 'bg-gamification text-text-primary' :
                user.position === 2 ? 'bg-gray-400 text-white' :
                user.position === 3 ? 'bg-orange-400 text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                {user.position === 1 ? '🥇' : user.position === 2 ? '🥈' : user.position === 3 ? '🥉' : user.position}
              </div>
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-text-primary">{user.name}</h4>
                <p className="text-sm text-text-secondary">
                  {user.points.toLocaleString()} pontos
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 text-gamification">
                  <Star className="w-4 h-4" />
                  <span className="font-semibold">{user.points}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Resumo de Conquistas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <h4 className="font-semibold text-text-primary mb-1">Conquistas Desbloqueadas</h4>
            <p className="text-2xl font-bold text-primary">3</p>
            <p className="text-sm text-text-secondary">de 12 disponíveis</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Target className="w-8 h-8 text-secondary" />
            </div>
            <h4 className="font-semibold text-text-primary mb-1">Meta Semanal</h4>
            <p className="text-2xl font-bold text-secondary">75%</p>
            <p className="text-sm text-text-secondary">15h de 20h</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gamification-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Star className="w-8 h-8 text-gamification" />
            </div>
            <h4 className="font-semibold text-text-primary mb-1">Nível Atual</h4>
            <p className="text-2xl font-bold text-gamification">7</p>
            <p className="text-sm text-text-secondary">Estudante Dedicado</p>
          </div>
        </div>
      </div>
    </div>
  );
}
