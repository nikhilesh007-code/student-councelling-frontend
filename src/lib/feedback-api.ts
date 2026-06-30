const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const feedbackApi = {
  async submitFeedback(data: FormData) {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      body: data,
      // Note: Don't set Content-Type header when sending FormData,
      // the browser will automatically set it to multipart/form-data with the correct boundary
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to submit feedback');
    }
    
    return res.json();
  },

  async getMyFeedback(userId?: string) {
    const url = userId ? `${API_BASE}/feedback/my?userId=${userId}` : `${API_BASE}/feedback/my`;
    const res = await fetch(url);
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to fetch feedback');
    }
    
    return res.json();
  },

  async deleteFeedback(id: string, userId?: string) {
    const url = userId ? `${API_BASE}/feedback/${id}?userId=${userId}` : `${API_BASE}/feedback/${id}`;
    const res = await fetch(url, {
      method: 'DELETE',
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to delete feedback');
    }
    
    return res.json();
  }
};
