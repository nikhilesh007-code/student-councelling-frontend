const API_URL = import.meta.env.VITE_API_URL;

export const studyPlannerApi = {
  generatePlan: async (userId: string, preferences?: any) => {
    const res = await fetch(`${API_URL}/study-planner/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, preferences })
    });
    if (!res.ok) throw new Error('Failed to generate plan');
    return res.json();
  },

  getTasks: async (userId: string) => {
    const res = await fetch(`${API_URL}/study-planner/tasks?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  updateTaskStatus: async (userId: string, taskId: string, status: string) => {
    const res = await fetch(`${API_URL}/study-planner/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, status })
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  getStatistics: async (userId: string) => {
    const res = await fetch(`${API_URL}/study-planner/statistics?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch statistics');
    return res.json();
  },

  archivePlan: async (userId: string, planId: string) => {
    const res = await fetch(`${API_URL}/study-planner/plan/${planId}?userId=${userId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to archive plan');
    return res.json();
  }
};
