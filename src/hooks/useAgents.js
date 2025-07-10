import { useState, useEffect } from 'react';
import { agentAPI } from '../api/services/agentAPI';

export const useAgents = () => {
 const [agents, setAgents] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 const fetchAgents = async () => {
   try {
     setLoading(true);
     const response = await agentAPI.getAgents();
     setAgents(response.data);
     setError(null);
   } catch (err) {
     setError(err.response?.data?.detail || 'Failed to fetch agents');
   } finally {
     setLoading(false);
   }
 };

 const executeAgent = async (agentId) => {
   try {
     const response = await agentAPI.executeAgent(agentId);
     return response.data;
   } catch (err) {
     throw new Error(err.response?.data?.detail || 'Failed to execute agent');
   }
 };

 const toggleAgent = async (agentId) => {
   try {
     await agentAPI.toggleAgent(agentId);
     // Refresh agents list
     fetchAgents();
   } catch (err) {
     throw new Error(err.response?.data?.detail || 'Failed to toggle agent');
   }
 };

 useEffect(() => {
   fetchAgents();
 }, []);

 return {
   agents,
   loading,
   error,
   fetchAgents,
   executeAgent,
   toggleAgent,
 };
};
