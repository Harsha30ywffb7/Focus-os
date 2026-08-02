const API_BASE_URL = 'http://localhost:3001/api';

export const apiService = {
  // Check Bun backend health & Supabase connection
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch (e) {
      console.warn('Backend server offline, operating in local offline mode');
      return { status: 'offline', databaseConnected: false };
    }
  },

  // Fetch full state from PostgreSQL
  async fetchState() {
    try {
      const res = await fetch(`${API_BASE_URL}/state`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('Failed to fetch backend state', e);
      return null;
    }
  },

  // Sync state to PostgreSQL
  async syncState(state) {
    try {
      const res = await fetch(`${API_BASE_URL}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to sync to backend', e);
      return null;
    }
  },

  // GOALS API
  async addGoal(goal) {
    try {
      const res = await fetch(`${API_BASE_URL}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal)
      });
      return await res.json();
    } catch (e) { return null; }
  },

  async updateGoal(id, data) {
    try {
      const res = await fetch(`${API_BASE_URL}/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e) { return null; }
  },

  async deleteGoal(id) {
    try {
      await fetch(`${API_BASE_URL}/goals/${id}`, { method: 'DELETE' });
    } catch (e) {}
  },

  // TIME BLOCKS API
  async addTimeBlock(block) {
    try {
      const res = await fetch(`${API_BASE_URL}/time-blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(block)
      });
      return await res.json();
    } catch (e) { return null; }
  },

  async updateTimeBlock(id, data) {
    try {
      const res = await fetch(`${API_BASE_URL}/time-blocks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e) { return null; }
  },

  async deleteTimeBlock(id) {
    try {
      await fetch(`${API_BASE_URL}/time-blocks/${id}`, { method: 'DELETE' });
    } catch (e) {}
  },

  // MICRO TASKS API
  async addMicroTask(task) {
    try {
      const res = await fetch(`${API_BASE_URL}/micro-tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      return await res.json();
    } catch (e) { return null; }
  },

  async updateMicroTask(id, data) {
    try {
      const res = await fetch(`${API_BASE_URL}/micro-tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e) { return null; }
  },

  async deleteMicroTask(id) {
    try {
      await fetch(`${API_BASE_URL}/micro-tasks/${id}`, { method: 'DELETE' });
    } catch (e) {}
  },

  // Init DB Schemas
  async initSchemas() {
    try {
      const res = await fetch(`${API_BASE_URL}/db/init`, { method: 'POST' });
      return await res.json();
    } catch (e) {
      return { error: 'Failed to init schemas' };
    }
  }
};
