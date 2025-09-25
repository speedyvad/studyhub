import type { TaskGroup, CreateGroupData, UpdateGroupData } from '../types/group';

const API_BASE_URL = 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const groupsApi = {
  getGroups: async (): Promise<{ success: boolean; data: { groups: TaskGroup[] } }> => {
    const response = await fetch(`${API_BASE_URL}/groups`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  createGroup: async (groupData: CreateGroupData): Promise<{ success: boolean; data: { group: TaskGroup } }> => {
    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(groupData)
    });
    return response.json();
  },

  updateGroup: async (id: string, groupData: UpdateGroupData): Promise<{ success: boolean; data: { group: TaskGroup } }> => {
    const response = await fetch(`${API_BASE_URL}/groups/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(groupData)
    });
    return response.json();
  },

  deleteGroup: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/groups/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getGroupTasks: async (groupId: string): Promise<{ success: boolean; data: { tasks: any[] } }> => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/tasks`, {
      headers: getAuthHeaders()
    });
    return response.json();
  }
};

export default groupsApi;
