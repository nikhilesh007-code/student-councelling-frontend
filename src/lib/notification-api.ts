const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const notificationApi = {
  getNotifications: async (userId: string, options: { page?: number; limit?: number; module?: string; read?: boolean; search?: string } = {}) => {
    const params = new URLSearchParams();
    params.append('userId', userId);
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.module && options.module !== 'ALL') params.append('module', options.module);
    if (options.read !== undefined) params.append('read', options.read.toString());
    if (options.search) params.append('search', options.search);

    const res = await fetch(`${API_URL}/notifications?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  getUnreadCount: async (userId: string) => {
    const res = await fetch(`${API_URL}/notifications/unread-count?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch unread count');
    return res.json();
  },

  getUnreadNotifications: async (userId: string) => {
    const res = await fetch(`${API_URL}/notifications/unread?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch unread notifications');
    return res.json();
  },

  markRead: async (userId: string, id: string) => {
    const res = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error('Failed to mark read');
    return res.json();
  },

  markAllRead: async (userId: string) => {
    const res = await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error('Failed to mark all read');
    return res.json();
  },

  deleteById: async (userId: string, id: string) => {
    const res = await fetch(`${API_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error('Failed to delete notification');
    return res.json();
  },

  deleteAll: async (userId: string) => {
    const res = await fetch(`${API_URL}/notifications`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error('Failed to delete all notifications');
    return res.json();
  }
};
