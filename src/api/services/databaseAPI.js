import api from '../api';

export const databaseAPI = {
  // Database connections
  connectDatabase: (connectionData) => 
    api.post('/database/connect', connectionData),
  
  getConnections: () => 
    api.get('/database/connections'),
  
  getSchema: (connectionId) => 
    api.get(`/database/${connectionId}/schema`),
  
  refreshSchema: (connectionId) => 
    api.post(`/database/${connectionId}/refresh-schema`),
  
  // AI analysis
  analyzeSchema: (connectionId) => 
    api.post('/ai/analyze-schema', { connection_id: connectionId }),
  
  parseIntent: (connectionId, userIntent) => 
    api.post('/ai/parse-intent', {
      database_connection_id: connectionId,
      user_intent: userIntent
    }),
  
  suggestJoins: (connectionId, tables) => 
    api.post('/ai/suggest-joins', { connection_id: connectionId, tables }),
  
  // Query testing
  testQuery: (connectionId, query) => 
    api.post('/query/test', { connection_id: connectionId, query }),
};
