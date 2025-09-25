import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Folder, FolderOpen, X } from 'lucide-react';
import groupsApi from '../lib/groupsApi';
import type { TaskGroup, CreateGroupData } from '../types/group';
import toast from 'react-hot-toast';

interface GroupManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupSelect: (groupId: string | null) => void;
  selectedGroupId: string | null;
}

const groupColors = [
  { name: 'Azul', value: 'blue', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  { name: 'Verde', value: 'green', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  { name: 'Roxo', value: 'purple', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  { name: 'Rosa', value: 'pink', bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  { name: 'Laranja', value: 'orange', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  { name: 'Vermelho', value: 'red', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
];

const groupIcons = [
  { name: 'Pasta', value: 'folder', icon: Folder },
  { name: 'Pasta Aberta', value: 'folder-open', icon: FolderOpen },
  { name: 'Livro', value: 'book', icon: () => <span>📚</span> },
  { name: 'Cérebro', value: 'brain', icon: () => <span>🧠</span> },
  { name: 'Foguete', value: 'rocket', icon: () => <span>🚀</span> },
  { name: 'Estrela', value: 'star', icon: () => <span>⭐</span> },
];

export default function GroupManager({ isOpen, onClose, onGroupSelect, selectedGroupId }: GroupManagerProps) {
  const [groups, setGroups] = useState<TaskGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TaskGroup | null>(null);
  const [formData, setFormData] = useState<CreateGroupData>({
    name: '',
    description: '',
    color: 'blue',
    icon: 'folder'
  });

  useEffect(() => {
    if (isOpen) {
      loadGroups();
    }
  }, [isOpen]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await groupsApi.getGroups();
      if (response.success) {
        setGroups(response.data.groups);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast.error('Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      const response = await groupsApi.createGroup(formData);
      if (response.success) {
        toast.success('Grupo criado com sucesso!');
        setShowCreateForm(false);
        setFormData({ name: '', description: '', color: 'blue', icon: 'folder' });
        loadGroups();
      }
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      toast.error('Erro ao criar grupo');
    }
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup) return;
    
    try {
      const response = await groupsApi.updateGroup(editingGroup.id, formData);
      if (response.success) {
        toast.success('Grupo atualizado com sucesso!');
        setEditingGroup(null);
        setFormData({ name: '', description: '', color: 'blue', icon: 'folder' });
        loadGroups();
      }
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      toast.error('Erro ao atualizar grupo');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (confirm('Tem certeza que deseja excluir este grupo?')) {
      try {
        const response = await groupsApi.deleteGroup(groupId);
        if (response.success) {
          toast.success('Grupo excluído com sucesso!');
          loadGroups();
          if (selectedGroupId === groupId) {
            onGroupSelect(null);
          }
        }
      } catch (error) {
        console.error('Erro ao excluir grupo:', error);
        toast.error('Erro ao excluir grupo');
      }
    }
  };

  const startEdit = (group: TaskGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      color: group.color,
      icon: group.icon
    });
    setShowCreateForm(true);
  };

  const cancelEdit = () => {
    setEditingGroup(null);
    setShowCreateForm(false);
    setFormData({ name: '', description: '', color: 'blue', icon: 'folder' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Gerenciar Grupos
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Grupos Existentes */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Seus Grupos</h3>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Grupo</span>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {groups.map((group) => {
                  const colorConfig = groupColors.find(c => c.value === group.color) || groupColors[0];
                  const iconConfig = groupIcons.find(i => i.value === group.icon) || groupIcons[0];
                  const IconComponent = iconConfig.icon;
                  
                  return (
                    <motion.div
                      key={group.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedGroupId === group.id
                          ? `${colorConfig.border} ${colorConfig.bg}`
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => onGroupSelect(selectedGroupId === group.id ? null : group.id)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${colorConfig.bg} rounded-lg flex items-center justify-center`}>
                            <IconComponent />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{group.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {group.taskCount} tarefas
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(group);
                            }}
                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGroup(group.id);
                            }}
                            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {group.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {group.description}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Formulário de Criação/Edição */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              className="border-t border-gray-200 dark:border-gray-700 pt-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {editingGroup ? 'Editar Grupo' : 'Criar Novo Grupo'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome do Grupo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field w-full"
                    placeholder="Ex: Estudos de Matemática"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field w-full"
                    rows={3}
                    placeholder="Descreva o propósito deste grupo..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cor
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {groupColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          className={`p-2 rounded-lg border-2 transition-all ${
                            formData.color === color.value
                              ? `${color.border} ${color.bg}`
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full ${color.bg} mx-auto`}></div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {color.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ícone
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {groupIcons.map((icon) => (
                        <button
                          key={icon.value}
                          onClick={() => setFormData({ ...formData, icon: icon.value })}
                          className={`p-2 rounded-lg border-2 transition-all ${
                            formData.icon === icon.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            <icon.icon />
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {icon.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={editingGroup ? handleUpdateGroup : handleCreateGroup}
                    className="btn-primary flex-1"
                    disabled={!formData.name.trim()}
                  >
                    {editingGroup ? 'Atualizar Grupo' : 'Criar Grupo'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="btn-outline flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
