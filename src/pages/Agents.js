import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  PlayArrow,
  Edit,
  ToggleOff,
  ToggleOn,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { agentAPI } from '../api/services/agentAPI';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await agentAPI.getAgents();
      setAgents(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch agents');
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAgent = async (agentId) => {
    try {
      const response = await agentAPI.executeAgent(agentId);
      console.log('Agent execution result:', response.data);
      
      const result = response.data.result;
      setSuccessMessage(`Agent executed successfully! Processed: ${result.items_processed}, Actions: ${result.actions_taken}`);
      
    } catch (err) {
      setError('Failed to execute agent: ' + err.message);
    }
  };

  const handleEditAgent = (agentId) => {
    // Navigate to Agent Builder with edit parameter
    navigate(`/agent-builder?edit=${agentId}`);
  };

  const handleToggleAgent = async (agentId) => {
    try {
      await agentAPI.toggleAgent(agentId);
      setSuccessMessage('Agent status updated successfully');
      fetchAgents(); // Refresh the list
    } catch (err) {
      setError('Failed to update agent status');
    }
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          AI Agents
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your AI agents here
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {agents.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              No Agents Found
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              You haven't created any agents yet. Go to Agent Builder to create your first agent.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/agent-builder')}>
              Create Agent
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {agents.map((agent) => (
            <Grid item xs={12} md={6} lg={4} key={agent.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {agent.agent_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Type: {agent.agent_type}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={agent.is_active ? 'Active' : 'Inactive'}
                      color={agent.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Last run: {agent.last_run ? new Date(agent.last_run).toLocaleString() : 'Never'}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PlayArrow />}
                      onClick={() => handleExecuteAgent(agent.id)}
                      sx={{ mr: 1, mb: 1 }}
                    >
                      Run Now
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleEditAgent(agent.id)}
                      sx={{ mr: 1, mb: 1 }}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="text" 
                      size="small"
                      startIcon={agent.is_active ? <ToggleOff /> : <ToggleOn />}
                      onClick={() => handleToggleAgent(agent.id)}
                      color={agent.is_active ? 'error' : 'success'}
                      sx={{ mb: 1 }}
                    >
                      {agent.is_active ? 'Disable' : 'Enable'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={() => navigate('/agent-builder')}
      >
        Create New Agent
      </Button>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />
    </Container>
  );
};

export default Agents;