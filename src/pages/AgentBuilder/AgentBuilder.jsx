import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tab,
  Tabs,
  Alert,
  Snackbar,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import AgentConfigurationWizard from '../../components/AgentBuilder/AgentConfigurationWizard';
import { agentAPI } from '../../api/services/agentAPI';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`agent-tabpanel-${index}`}
      aria-labelledby={`agent-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AgentBuilder = () => {
  const [tabValue, setTabValue] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editAgentData, setEditAgentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if we're in edit mode
    const editAgentId = searchParams.get('edit');
    if (editAgentId) {
      setEditMode(true);
      loadAgentForEdit(editAgentId);
    }
  }, [searchParams]);

  const loadAgentForEdit = async (agentId) => {
    try {
      setLoading(true);
      const response = await agentAPI.getAgentDetails(agentId);
      setEditAgentData(response.data.agent);
      setSuccessMessage(`Loaded agent "${response.data.agent.agent_name}" for editing`);
    } catch (error) {
      console.error('Failed to load agent for edit:', error);
      setSuccessMessage('Failed to load agent data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAgentCreated = (agentData) => {
    if (editMode) {
      setSuccessMessage(`Agent "${editAgentData?.agent_name}" updated successfully!`);
    } else {
      setSuccessMessage(`Agent "${agentData.agent_name || 'New Agent'}" created successfully!`);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {editMode ? 'Edit Agent' : 'Agent Builder'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {editMode 
            ? `Modify "${editAgentData?.agent_name || 'Loading...'}" configuration`
            : 'Create intelligent agents that automate your business processes using AI'
          }
        </Typography>
      </Box>

      {editMode && loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading agent configuration for editing...
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="agent builder tabs">
          <Tab label={editMode ? "Edit Agent" : "Create New Agent"} />
          <Tab label="Templates" />
          <Tab label="Import/Export" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <AgentConfigurationWizard 
          onAgentCreated={handleAgentCreated}
          editMode={editMode}
          editAgentData={editAgentData}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Alert severity="info">
          Pre-built agent templates coming soon! This will include templates for common use cases like:
          customer re-engagement, student progress monitoring, employee onboarding, and more.
        </Alert>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Alert severity="info">
          Import/Export functionality coming soon! This will allow you to share agent configurations
          and import proven strategies from other users.
        </Alert>
      </TabPanel>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />
    </Container>
  );
};

export default AgentBuilder;