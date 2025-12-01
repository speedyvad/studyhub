import { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Edit3, 
  Save, 
  X, 
  Camera, 
  Trophy, 
  Star, 
  Clock, 
  Target,
  Award,
  Calendar,
  Mail,
  User
} from 'lucide-react';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';
import authApi from '../lib/authApi';
import uploadApi from '../lib/uploadApi';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, achievements, tasks, completedSessions, updateUser } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    favoriteSubjects: user?.favoriteSubjects || []
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  const handleSave = async () => {
    try {
      const response = await authApi.updateProfile({
        name: editData.name,
        bio: editData.bio,
        favoriteSubjects: editData.favoriteSubjects
      });

      if (response.success) {
        updateUser(response.data.user);
        toast.success('Perfil atualizado com sucesso!');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    }
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      bio: user?.bio || '',
      favoriteSubjects: user?.favoriteSubjects || []
    });
    setSelectedPhoto(null);
    setIsEditing(false);
  };

  const handlePhotoSelect = async (file: File) => {
    setSelectedPhoto(file);
    
    try {
      // Fazer upload do arquivo
      const uploadResponse = await uploadApi.uploadFile(file);
      
      if (uploadResponse.success) {
        const newAvatarUrl = uploadResponse.data.url;
        
        // Atualizar perfil com a nova URL
        const updateResponse = await authApi.updateProfile({
          avatarUrl: newAvatarUrl
        });

        if (updateResponse.success) {
          toast.success('Foto de perfil atualizada!');
          // Atualizar o usuário no store
          updateUser({ avatar: newAvatarUrl });
        } else {
          toast.error('Erro ao salvar foto no perfil');
        }
      } else {
        toast.error('Erro ao fazer upload da foto');
      }
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      toast.error('Erro ao fazer upload da foto');
    }
  };

  const handlePhotoRemove = async () => {
    setSelectedPhoto(null);
    
    try {
      // Remover avatar (atualizar com string vazia)
      const response = await authApi.updateProfile({
        avatarUrl: ''
      });
      
      if (response.success) {
        toast.success('Foto removida');
        // Atualizar o usuário no store
        updateUser({ avatar: undefined });
      } else {
        toast.error('Erro ao remover foto');
      }
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      toast.error('Erro ao remover foto');
    }
  };

  const toggleSubject = (subject: string) => {
    if (editData.favoriteSubjects.includes(subject)) {
      setEditData({
        ...editData,
        favoriteSubjects: editData.favoriteSubjects.filter(s => s !== subject)
      });
    } else {
      setEditData({
        ...editData,
        favoriteSubjects: [...editData.favoriteSubjects, subject]
      });
    }
  };

  const availableSubjects = [
    'Matemática', 'Física', 'Química', 'Biologia', 'História', 
    'Geografia', 'Português', 'Inglês', 'Programação', 'Filosofia',
    'Sociologia', 'Artes', 'Educação Física', 'Outros'
  ];

  const unlockedAchievements = achievements.filter(achievement => achievement.unlocked);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Estatísticas do mês atual
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlySessions = completedSessions.filter(session => {
    const sessionDate = new Date(session.timestamp);
    return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear;
  });

  const monthlyHours = monthlySessions.length * 0.42; // 25 minutos = 0.42 horas
  const monthlyPoints = monthlySessions.length * 25;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Perfil</h1>
        <p className="text-text-secondary">Gerencie suas informações e acompanhe seu progresso</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Profile Card */}
        <div className="lg:col-span-1 w-full">
          <div className="card">
            <div className="text-center">
              {/* Avatar */}
              <div className="mb-4">
                {isEditing ? (
                  <ProfilePhotoUpload
                    currentAvatar={user?.avatar}
                    onPhotoSelect={handlePhotoSelect}
                    onPhotoRemove={handlePhotoRemove}
                    size="lg"
                    className="mx-auto"
                  />
                ) : (
                  <div className="relative inline-block">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-24 h-24 rounded-full object-cover mx-auto"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mx-auto">
                        <span className="text-3xl font-bold text-primary">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Name and Bio */}
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Bio
                    </label>
                    <textarea
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      className="input-field"
                      rows={3}
                      placeholder="Conte um pouco sobre você..."
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-2">{user?.name}</h2>
                  <p className="text-text-secondary mb-4">{user?.bio || 'Nenhuma bio adicionada ainda.'}</p>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-center space-x-2 text-text-secondary">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-text-secondary">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Membro desde {new Date().getFullYear()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Salvar</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancelar</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Editar Perfil</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card mt-6">
            <h3 className="font-semibold text-text-primary mb-4">Estatísticas Rápidas</h3>
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Horas</p>
                    <p className="text-sm text-text-secondary">Estudadas</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-secondary">{user?.studyHours.toFixed(1)}h</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gamification-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-gamification" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Tarefas</p>
                    <p className="text-sm text-text-secondary">Concluídas</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-gamification">{completedTasks}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 w-full">
          {/* Favorite Subjects */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Matérias Favoritas</h3>
              {isEditing && (
                <span className="text-sm text-text-secondary">Clique para adicionar/remover</span>
              )}
            </div>
            
            {isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableSubjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => toggleSubject(subject)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      editData.favoriteSubjects.includes(subject)
                        ? 'border-primary bg-primary-50 text-primary'
                        : 'border-gray-200 hover:border-primary hover:bg-primary-50'
                    }`}
                  >
                    <span className="text-sm font-medium">{subject}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {user?.favoriteSubjects.length ? (
                  user.favoriteSubjects.map((subject) => (
                    <span
                      key={subject}
                      className="px-4 py-2 bg-primary-100 text-primary rounded-full text-sm font-medium"
                    >
                      📚 {subject}
                    </span>
                  ))
                ) : (
                  <p className="text-text-secondary">Nenhuma matéria favorita selecionada.</p>
                )}
              </div>
            )}
          </div>

          {/* Monthly Progress */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Progresso do Mês</h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-semibold text-text-primary mb-1">Horas Estudadas</h4>
                <p className="text-2xl font-bold text-primary">{monthlyHours.toFixed(1)}h</p>
                <p className="text-sm text-text-secondary">Este mês</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Target className="w-8 h-8 text-secondary" />
                </div>
                <h4 className="font-semibold text-text-primary mb-1">Sessões</h4>
                <p className="text-2xl font-bold text-secondary">{monthlySessions.length}</p>
                <p className="text-sm text-text-secondary">Pomodoros</p>
              </div>
            </div>
          </div>

          {/* Study Summary */}
          <div className="card">
            <h3 className="text-lg font-semibold text-text-primary mb-6">Resumo de Estudos</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Taxa de conclusão de tarefas</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-secondary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-text-primary w-12">
                    {completionRate.toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Média de sessões por dia</span>
                <span className="text-sm font-medium text-text-primary">
                  {(completedSessions.length / 30).toFixed(1)} sessões
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Matéria mais estudada</span>
                <span className="text-sm font-medium text-text-primary">
                  {tasks.length > 0 ? 
                    tasks.reduce((acc, task) => {
                      acc[task.subject] = (acc[task.subject] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>) && 
                    Object.entries(tasks.reduce((acc, task) => {
                      acc[task.subject] = (acc[task.subject] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>))
                      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
