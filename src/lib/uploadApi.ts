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
  },

  uploadFile: async (file: File): Promise<{ success: boolean; data: { url: string; filename: string; mimetype: string; size: number } }> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return response.json();
  }
};

export default uploadApi;
