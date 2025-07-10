// src/components/AgentBuilder/AgentConfigurationWizard.jsx
import React, { useState, useEffect } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DatabaseConnectionForm from '../DatabaseConnection/DatabaseConnectionForm';
import IntentAnalyzer from '../AIAnalysis/IntentAnalyzer';
import { databaseAPI } from '../../api/services/databaseAPI';
import { agentAPI } from '../../api/services/agentAPI';

const AgentConfigurationWizard = ({ onAgentCreated, editMode = false, editAgentData = null }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [agentConfig, setAgentConfig] = useState({
    agent_name: '',
    agent_type: 'dynamic',
    database_connection_id: null,
    user_intent: '',
    ai_analysis: null,
    query_config: {},
    template_config: {
      subject: '',
      template: ''
    },
    schedule_config: {
      type: 'interval',
      minutes: 60
    },
    channel_config: {
      channels: ['email'],
      primary: 'email'
    }
  });
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    // Pre-populate form if in edit mode
    if (editMode && editAgentData) {
      console.log('Loading edit data:', editAgentData);
      setAgentConfig({
        agent_name: editAgentData.agent_name || '',
        agent_type: editAgentData.agent_type || 'dynamic',
        database_connection_id: JSON.parse(editAgentData.database_config || '{}').connection_id || null,
        user_intent: '',
        ai_analysis: null,
        query_config: JSON.parse(editAgentData.query_config || '{}'),
        template_config: JSON.parse(editAgentData.template_config || '{"subject": "", "template": ""}'),
        schedule_config: JSON.parse(editAgentData.schedule_config || '{"type": "interval", "minutes": 60}'),
        channel_config: JSON.parse(editAgentData.channel_config || '{"channels": ["email"], "primary": "email"}')
      });
    }
  }, [editMode, editAgentData]);

  const fetchConnections = async () => {
    try {
      const response = await databaseAPI.getConnections();
      setConnections(response.data);
    } catch (err) {
      console.error('Failed to fetch connections:', err);
    }
  };

  const steps = [
    'Basic Information',
    'Database Connection',
    'AI Intent Analysis',
    'Query Configuration',
    'Template & Channels',
    'Scheduling',
    'Review & Deploy'
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleConnectionSuccess = (connectionData) => {
    setAgentConfig({
      ...agentConfig,
      database_connection_id: connectionData.connection_id
    });
    fetchConnections();
    handleNext();
  };

  const handleAnalysisComplete = (analysisData) => {
    console.log('Analysis completed:', analysisData);
    setAgentConfig({
      ...agentConfig,
      ai_analysis: analysisData,
      query_config: analysisData.suggested_query_strategy || {}
    });
  };

  const handleCreateAgent = async () => {
    setLoading(true);
    setError('');

    try {
      const agentData = {
        agent_name: agentConfig.agent_name,
        agent_type: agentConfig.agent_type,
        database_config: JSON.stringify({
          connection_id: agentConfig.database_connection_id
        }),
        query_config: JSON.stringify(agentConfig.query_config),
        template_config: JSON.stringify(agentConfig.template_config),
        schedule_config: JSON.stringify(agentConfig.schedule_config),
        channel_config: JSON.stringify(agentConfig.channel_config)
      };

      let response;
      if (editMode && editAgentData) {
        response = await agentAPI.updateAgent(editAgentData.id, agentData);
        console.log('Agent updated:', response.data);
      } else {
        response = await agentAPI.createAgent(agentData);
        console.log('Agent created:', response.data);
      }
      
      if (onAgentCreated) {
        onAgentCreated(response.data);
      }
      
      // Navigate back to agents page
      setTimeout(() => {
        navigate('/agents');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to ${editMode ? 'update' : 'create'} agent`);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {editMode ? 'Edit Agent Information' : 'Agent Information'}
              </Typography>
              <TextField
                fullWidth
                label="Agent Name"
                value={agentConfig.agent_name}
                onChange={(e) => setAgentConfig({...agentConfig, agent_name: e.target.value})}
                margin="normal"
                placeholder="e.g., Customer Re-engagement Agent"
                required
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Agent Type</InputLabel>
                <Select
                  value={agentConfig.agent_type}
                  onChange={(e) => setAgentConfig({...agentConfig, agent_type: e.target.value})}
                  label="Agent Type"
                >
                  <MenuItem value="dynamic">Dynamic Agent</MenuItem>
                  <MenuItem value="monitoring">Monitoring Agent</MenuItem>
                  <MenuItem value="engagement">Engagement Agent</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description (Optional)"
                value={agentConfig.description || ''}
                onChange={(e) => setAgentConfig({...agentConfig, description: e.target.value})}
                margin="normal"
                placeholder="Describe what this agent will do..."
              />
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Box>
            {connections.length > 0 && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Select Database Connection
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Database Connection</InputLabel>
                    <Select
                      value={agentConfig.database_connection_id || ''}
                      onChange={(e) => {
                        setAgentConfig({...agentConfig, database_connection_id: e.target.value});
                        if (!editMode) handleNext();
                      }}
                      label="Database Connection"
                    >
                      {connections.map((conn) => (
                        <MenuItem key={conn.id} value={conn.id}>
                          {conn.connection_name} ({conn.database_type})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            )}
            <Typography variant="h6" gutterBottom>
              Or Create New Connection
            </Typography>
            <DatabaseConnectionForm onConnectionSuccess={handleConnectionSuccess} />
          </Box>
        );

      case 2:
        return agentConfig.database_connection_id ? (
          <Box>
            <IntentAnalyzer 
              connectionId={agentConfig.database_connection_id}
              onAnalysisComplete={handleAnalysisComplete}
            />
            {agentConfig.ai_analysis && (
              <Alert severity="success" sx={{ mt: 2 }}>
                AI analysis completed! You can now proceed to configure the query.
              </Alert>
            )}
          </Box>
        ) : (
          <Alert severity="warning">Please select a database connection first.</Alert>
        );

      case 3:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Query Configuration
              </Typography>
              {agentConfig.ai_analysis ? (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    AI has analyzed your intent and suggested an optimal query strategy. You can modify it below.
                  </Alert>
                  
                  <TextField
                    fullWidth
                    label="Main Table"
                    value={agentConfig.query_config.main_table || ''}
                    onChange={(e) => setAgentConfig({
                      ...agentConfig,
                      query_config: {...agentConfig.query_config, main_table: e.target.value}
                    })}
                    margin="normal"
                  />
                  
                  <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                    Query Strategy Summary:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip label={`Table: ${agentConfig.query_config.main_table}`} color="primary" />
                    <Chip label={`Fields: ${agentConfig.query_config.select_fields?.length || 0}`} />
                    <Chip label={`Joins: ${agentConfig.query_config.required_joins?.length || 0}`} />
                    <Chip label={`Conditions: ${agentConfig.query_config.where_conditions?.length || 0}`} />
                  </Box>
                </Box>
              ) : (
                <Alert severity="warning">
                  Please complete the AI analysis step first.
                </Alert>
              )}
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Message Template
                  </Typography>
                  <TextField
                    fullWidth
                    label="Email Subject"
                    value={agentConfig.template_config.subject || ''}
                    onChange={(e) => setAgentConfig({
                      ...agentConfig,
                      template_config: {...agentConfig.template_config, subject: e.target.value}
                    })}
                    margin="normal"
                    placeholder="Hi {{name}}, important update!"
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Message Template"
                    value={agentConfig.template_config.template || ''}
                    onChange={(e) => setAgentConfig({
                      ...agentConfig,
                      template_config: {...agentConfig.template_config, template: e.target.value}
                    })}
                    margin="normal"
                    placeholder="Hi {{name}}, your progress is {{progress}}%. Keep going!"
                    helperText="Use {{field_name}} for dynamic values from your query results"
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Communication Channels
                  </Typography>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Primary Channel</InputLabel>
                    <Select
                      value={agentConfig.channel_config.primary || 'email'}
                      onChange={(e) => setAgentConfig({
                        ...agentConfig,
                        channel_config: {...agentConfig.channel_config, primary: e.target.value}
                      })}
                      label="Primary Channel"
                    >
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="sms">SMS</MenuItem>
                      <MenuItem value="push">Push Notification</MenuItem>
                      <MenuItem value="webhook">Webhook</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    Available Template Variables:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {agentConfig.query_config.select_fields?.map((field, index) => (
                      <Chip 
                        key={index} 
                        label={`{{${field.replace(/.*\./, '')}}}`} 
                        size="small" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 5:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Scheduling Configuration
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Schedule Type</InputLabel>
                <Select
                  value={agentConfig.schedule_config.type || 'interval'}
                  onChange={(e) => setAgentConfig({
                    ...agentConfig,
                    schedule_config: {...agentConfig.schedule_config, type: e.target.value}
                  })}
                  label="Schedule Type"
                >
                  <MenuItem value="interval">Run Every X Minutes</MenuItem>
                  <MenuItem value="cron">Cron Expression</MenuItem>
                  <MenuItem value="manual">Manual Only</MenuItem>
                </Select>
              </FormControl>
              
              {agentConfig.schedule_config.type === 'interval' && (
                <TextField
                  fullWidth
                  type="number"
                  label="Interval (minutes)"
                  value={agentConfig.schedule_config.minutes || 60}
                  onChange={(e) => setAgentConfig({
                    ...agentConfig,
                    schedule_config: {...agentConfig.schedule_config, minutes: parseInt(e.target.value)}
                  })}
                  margin="normal"
                  helperText="How often should this agent run? (15 = every 15 minutes)"
                />
              )}
              
              {agentConfig.schedule_config.type === 'cron' && (
                <TextField
                  fullWidth
                  label="Cron Expression"
                  value={agentConfig.schedule_config.cron || '0 9 * * *'}
                  onChange={(e) => setAgentConfig({
                    ...agentConfig,
                    schedule_config: {...agentConfig.schedule_config, cron: e.target.value}
                  })}
                  margin="normal"
                  helperText="e.g., '0 9 * * *' runs daily at 9 AM"
                />
              )}
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Review & Deploy Agent
              </Typography>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Agent Details:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Name:</strong> {agentConfig.agent_name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Type:</strong> {agentConfig.agent_type}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Database:</strong> {connections.find(c => c.id === agentConfig.database_connection_id)?.connection_name || 'None selected'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Configuration:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Schedule:</strong> {agentConfig.schedule_config.type === 'interval' 
                      ? `Every ${agentConfig.schedule_config.minutes} minutes` 
                      : agentConfig.schedule_config.type}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Channel:</strong> {agentConfig.channel_config.primary}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Target Table:</strong> {agentConfig.query_config.main_table || 'Not configured'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Message Template:
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Subject: {agentConfig.template_config.subject || 'No subject set'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {agentConfig.template_config.template || 'No message template set'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        {editMode ? `Edit Agent: ${editAgentData?.agent_name}` : 'Create New Agent'}
      </Typography>
      
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              {renderStepContent(index)}
              <Box sx={{ mb: 2, mt: 2 }}>
                <div>
                  {index === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleCreateAgent}
                      disabled={loading}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      {loading ? (
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                      ) : null}
                      {editMode ? 'Update Agent' : 'Create Agent'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1 }}
                      disabled={
                        (index === 0 && !agentConfig.agent_name) ||
                        (index === 1 && !agentConfig.database_connection_id) ||
                        (index === 2 && !agentConfig.ai_analysis)
                      }
                    >
                      Continue
                    </Button>
                  )}
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                  {editMode && (
                    <Button
                      onClick={() => navigate('/agents')}
                      sx={{ mt: 1 }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default AgentConfigurationWizard;