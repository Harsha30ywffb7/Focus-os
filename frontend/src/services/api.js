const API_BASE_URL = 'http://localhost:3001/api';

export const apiService = {
  // 1. HEALTH & HYDRATION
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch (e) {
      return { status: 'offline', databaseConnected: false };
    }
  },

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

  // 2. HABITS API (`/api/habits`)
  async getHabits() {
    try {
      const res = await fetch(`${API_BASE_URL}/habits`);
      return await res.json();
    } catch (e) { return []; }
  },

  async addHabit(habit) {
    try {
      const res = await fetch(`${API_BASE_URL}/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habit)
      });
      return await res.json();
    } catch (e) { return null; }
  },

  async updateHabit(id, data) {
    try {
      const res = await fetch(`${API_BASE_URL}/habits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e) { return null; }
  },

  async deleteHabit(id) {
    try {
      await fetch(`${API_BASE_URL}/habits/${id}`, { method: 'DELETE' });
    } catch (e) {}
  },

  // 3. TIME BLOCKS API (`/api/time-blocks`)
  async getTimeBlocks() {
    try {
      const res = await fetch(`${API_BASE_URL}/time-blocks`);
      return await res.json();
    } catch (e) { return []; }
  },

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

  // 4. MICRO TASKS API (`/api/micro-tasks`)
  async getMicroTasks() {
    try {
      const res = await fetch(`${API_BASE_URL}/micro-tasks`);
      return await res.json();
    } catch (e) { return []; }
  },

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

  // 5. GOALS API (`/api/goals`)
  async getGoals() {
    try {
      const res = await fetch(`${API_BASE_URL}/goals`);
      return await res.json();
    } catch (e) { return []; }
  },

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

  // 6. LIFE PILLARS API (`/api/pillars`)
  async getPillars() {
    try {
      const res = await fetch(`${API_BASE_URL}/pillars`);
      return await res.json();
    } catch (e) { return []; }
  },

  async addPillar(pillar) {
    try {
      const res = await fetch(`${API_BASE_URL}/pillars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pillar)
      });
      return await res.json();
    } catch (e) { return null; }
  },

  async addPillarMilestone(pillarId, milestone) {
    try {
      const res = await fetch(`${API_BASE_URL}/pillars/${pillarId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(milestone)
      });
      return await res.json();
    } catch (e) { return null; }
  },

  async updatePillarMilestone(milestoneId, data) {
    try {
      const res = await fetch(`${API_BASE_URL}/pillars/milestones/${milestoneId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e) { return null; }
  },

  async deletePillarMilestone(milestoneId) {
    try {
      await fetch(`${API_BASE_URL}/pillars/milestones/${milestoneId}`, { method: 'DELETE' });
    } catch (e) {}
  },

  // 7. QUICK CAPTURE NOTES API (`/api/notes`)
  async saveNotes(notes) {
    try {
      await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
    } catch (e) {}
  },

  // 8. DAILY INTENTION API (`/api/intention`)
  async saveIntention(intention, quote) {
    try {
      await fetch(`${API_BASE_URL}/intention`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intention, quote })
      });
    } catch (e) {}
  },

  // 9. MILESTONE TIMELINE API (`/api/timeline`)
  async addTimelineItem(item) {
    try {
      const res = await fetch(`${API_BASE_URL}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      return await res.json();
    } catch (e) { return null; }
  },

  async deleteTimelineItem(id) {
    try {
      await fetch(`${API_BASE_URL}/timeline/${id}`, { method: 'DELETE' });
    } catch (e) {}
  },

  // 10. INIT SCHEMAS
  async initSchemas() {
    try {
      const res = await fetch(`${API_BASE_URL}/db/init`, { method: 'POST' });
      return await res.json();
    } catch (e) {
      return { error: 'Failed to init schemas' };
    }
  }
};
