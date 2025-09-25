const API_BASE_URL = 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const uploadApi = {
  uploadAvatar: async (avatarUrl: string): Promise<{ success: boolean; data: { user: any } }> => {
    const response = await fetch(`${API_BASE_URL}/upload/avatar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ avatarUrl })
    });
    return response.json();
  }
};

export default uploadApi;
