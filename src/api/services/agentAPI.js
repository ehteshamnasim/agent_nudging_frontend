import api from '../api';

export const agentAPI = {
  // Agent management
  createAgent: agentConfig => api.post('/agents/create', agentConfig),

  getAgents: () => api.get('/agents'),

  getAgentDetails: agentId => api.get(`/agents/${agentId}`),

  executeAgent: agentId => api.post(`/agents/${agentId}/execute`),

  toggleAgent: agentId => api.post(`/agents/${agentId}/toggle`),

  getAgentDetails: agentId => api.get(`/agents/${agentId}`),

  updateAgent: (agentId, agentConfig) => api.put(`/agents/${agentId}`, agentConfig),

  // Scheduler management
  getSchedulerStatus: () => api.get('/scheduler/status'),

  startScheduler: () => api.post('/scheduler/start'),

  stopScheduler: () => api.post('/scheduler/stop')
};
