#!/bin/bash
# setup_frontend_files.sh

echo "🎨 Adding Universal Agent System files to existing React project..."

# Create new directories
mkdir -p src/components/AgentBuilder
mkdir -p src/components/DatabaseConnection
mkdir -p src/components/AIAnalysis
mkdir -p src/pages/AgentBuilder
mkdir -p src/pages/DatabaseManagement
mkdir -p src/api/services
mkdir -p src/utils
mkdir -p src/hooks

# Create API service files
cat > src/api/services/databaseAPI.js << 'EOF'
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
EOF

cat > src/api/services/agentAPI.js << 'EOF'
import api from '../api';

export const agentAPI = {
  // Agent management
  createAgent: (agentConfig) => 
    api.post('/agents/create', agentConfig),
  
  getAgents: () => 
    api.get('/agents'),
  
  getAgentDetails: (agentId) => 
    api.get(`/agents/${agentId}`),
  
  executeAgent: (agentId) => 
    api.post(`/agents/${agentId}/execute`),
  
  toggleAgent: (agentId) => 
    api.post(`/agents/${agentId}/toggle`),
  
  // Scheduler management
  getSchedulerStatus: () => 
    api.get('/scheduler/status'),
  
  startScheduler: () => 
    api.post('/scheduler/start'),
  
  stopScheduler: () => 
    api.post('/scheduler/stop'),
};
EOF

# Create database connection component
cat > src/components/DatabaseConnection/DatabaseConnectionForm.jsx << 'EOF'
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { databaseAPI } from '../../api/services/databaseAPI';

const DatabaseConnectionForm = ({ onConnectionSuccess }) => {
  const [formData, setFormData] = useState({
    connection_name: '',
    database_type: 'mysql',
    connection_string: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await databaseAPI.connectDatabase(formData);
      setSuccess(`Connected successfully! Found ${Object.keys(response.data.schema.tables || {}).length} tables.`);
      
      if (onConnectionSuccess) {
        onConnectionSuccess(response.data);
      }
      
      // Reset form
      setFormData({
        connection_name: '',
        database_type: 'mysql',
        connection_string: ''
      });
      
    } catch (err) {
    setError(err.response?.data?.detail || 'Connection failed');
   } finally {
     setLoading(false);
   }
 };

 return (
   <Card>
     <CardContent>
       <Typography variant="h6" gutterBottom>
         Connect to Database
       </Typography>
       
       {error && (
         <Alert severity="error" sx={{ mb: 2 }}>
           {error}
         </Alert>
       )}
       
       {success && (
         <Alert severity="success" sx={{ mb: 2 }}>
           {success}
         </Alert>
       )}

       <Box component="form" onSubmit={handleSubmit}>
         <TextField
           fullWidth
           label="Connection Name"
           value={formData.connection_name}
           onChange={handleChange('connection_name')}
           margin="normal"
           required
           placeholder="e.g., My E-commerce Database"
         />

         <FormControl fullWidth margin="normal">
           <InputLabel>Database Type</InputLabel>
           <Select
             value={formData.database_type}
             onChange={handleChange('database_type')}
             label="Database Type"
           >
             <MenuItem value="mysql">MySQL</MenuItem>
             <MenuItem value="postgresql">PostgreSQL</MenuItem>
             <MenuItem value="sqlite">SQLite</MenuItem>
             <MenuItem value="sqlserver">SQL Server</MenuItem>
           </Select>
         </FormControl>

         <TextField
           fullWidth
           label="Connection String"
           value={formData.connection_string}
           onChange={handleChange('connection_string')}
           margin="normal"
           required
           placeholder="mysql://user:password@host:3306/database"
           helperText="Format: mysql://username:password@host:port/database_name"
         />

         <Box sx={{ mt: 3 }}>
           <Button
             type="submit"
             variant="contained"
             disabled={loading}
             startIcon={loading ? <CircularProgress size={20} /> : null}
           >
             {loading ? 'Connecting...' : 'Connect Database'}
           </Button>
         </Box>
       </Box>
     </CardContent>
   </Card>
 );
};

export default DatabaseConnectionForm;
EOF

# Create AI analysis component
cat > src/components/AIAnalysis/IntentAnalyzer.jsx << 'EOF'
import React, { useState } from 'react';
import {
 Card,
 CardContent,
 Typography,
 TextField,
 Button,
 Box,
 Alert,
 Chip,
 Grid,
 Paper,
 List,
 ListItem,
 ListItemText,
 CircularProgress,
} from '@mui/material';
import { AutoAwesome, Psychology } from '@mui/icons-material';
import { databaseAPI } from '../../api/services/databaseAPI';

const IntentAnalyzer = ({ connectionId, onAnalysisComplete }) => {
 const [userIntent, setUserIntent] = useState('');
 const [loading, setLoading] = useState(false);
 const [analysis, setAnalysis] = useState(null);
 const [error, setError] = useState('');

 const exampleIntents = [
   'Find customers who haven\'t purchased in 30 days',
   'Students falling behind in their courses',
   'Employees who haven\'t completed training',
   'Patients missing appointments',
   'Users who abandoned their shopping cart'
 ];

 const handleAnalyze = async () => {
   if (!userIntent.trim()) return;
   
   setLoading(true);
   setError('');
   
   try {
     const response = await databaseAPI.parseIntent(connectionId, userIntent);
     setAnalysis(response.data);
     
     if (onAnalysisComplete) {
       onAnalysisComplete(response.data);
     }
     
   } catch (err) {
     setError(err.response?.data?.detail || 'Analysis failed');
   } finally {
     setLoading(false);
   }
 };

 const handleExampleClick = (example) => {
   setUserIntent(example);
 };

 return (
   <Box>
     <Card>
       <CardContent>
         <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
           <Psychology sx={{ mr: 1, color: 'primary.main' }} />
           <Typography variant="h6">
             AI Intent Analysis
           </Typography>
         </Box>

         <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
           Describe what you want to achieve in plain English. Our AI will analyze your goal and suggest the optimal database query strategy.
         </Typography>

         {error && (
           <Alert severity="error" sx={{ mb: 2 }}>
             {error}
           </Alert>
         )}

         <TextField
           fullWidth
           multiline
           rows={3}
           label="What do you want to accomplish?"
           value={userIntent}
           onChange={(e) => setUserIntent(e.target.value)}
           placeholder="e.g., Find customers who haven't purchased anything in the last 30 days and send them a discount code"
           sx={{ mb: 2 }}
         />

         <Button
           variant="contained"
           onClick={handleAnalyze}
           disabled={loading || !userIntent.trim()}
           startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
           sx={{ mb: 2 }}
         >
           {loading ? 'Analyzing...' : 'Analyze with AI'}
         </Button>

         <Typography variant="subtitle2" sx={{ mb: 1 }}>
           Try these examples:
         </Typography>
         <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
           {exampleIntents.map((example, index) => (
             <Chip
               key={index}
               label={example}
               onClick={() => handleExampleClick(example)}
               variant="outlined"
               size="small"
               sx={{ cursor: 'pointer' }}
             />
           ))}
         </Box>
       </CardContent>
     </Card>

     {analysis && (
       <Card sx={{ mt: 2 }}>
         <CardContent>
           <Typography variant="h6" gutterBottom>
             AI Analysis Results
           </Typography>

           <Grid container spacing={2}>
             <Grid item xs={12} md={6}>
               <Paper sx={{ p: 2, mb: 2 }}>
                 <Typography variant="subtitle1" gutterBottom>
                   Parsed Intent
                 </Typography>
                 <Typography variant="body2">
                   {analysis.parsed_intent?.parsed_intent || analysis.parsed_intent}
                 </Typography>
                 
                 <Box sx={{ mt: 2 }}>
                   <Chip 
                     label={`Goal: ${analysis.parsed_intent?.business_goal || 'engagement'}`}
                     color="primary"
                     size="small"
                     sx={{ mr: 1, mb: 1 }}
                   />
                   <Chip 
                     label={`Action: ${analysis.parsed_intent?.action_type || 'notify'}`}
                     color="secondary"
                     size="small"
                   />
                 </Box>
               </Paper>
             </Grid>

             <Grid item xs={12} md={6}>
               <Paper sx={{ p: 2, mb: 2 }}>
                 <Typography variant="subtitle1" gutterBottom>
                   Suggested Strategy
                 </Typography>
                 <List dense>
                   <ListItem>
                     <ListItemText 
                       primary="Main Table"
                       secondary={analysis.suggested_query_strategy?.main_table || 'Not specified'}
                     />
                   </ListItem>
                   <ListItem>
                     <ListItemText 
                       primary="Expected Results"
                       secondary={analysis.suggested_query_strategy?.expected_result_count || 'Unknown'}
                     />
                   </ListItem>
                 </List>
               </Paper>
             </Grid>

             <Grid item xs={12}>
               <Paper sx={{ p: 2 }}>
                 <Typography variant="subtitle1" gutterBottom>
                   Recommended Tables & Joins
                 </Typography>
                 
                 {analysis.suggested_query_strategy?.required_joins?.length > 0 ? (
                   <List dense>
                     {analysis.suggested_query_strategy.required_joins.map((join, index) => (
                       <ListItem key={index}>
                         <ListItemText 
                           primary={`${join.join_type} JOIN ${join.table}`}
                           secondary={join.condition}
                         />
                       </ListItem>
                     ))}
                   </List>
                 ) : (
                   <Typography variant="body2" color="text.secondary">
                     No joins required - single table query
                   </Typography>
                 )}
               </Paper>
             </Grid>

             {analysis.suggested_query_strategy?.where_conditions?.length > 0 && (
               <Grid item xs={12}>
                 <Paper sx={{ p: 2 }}>
                   <Typography variant="subtitle1" gutterBottom>
                     Suggested Conditions
                   </Typography>
                   <List dense>
                     {analysis.suggested_query_strategy.where_conditions.map((condition, index) => (
                       <ListItem key={index}>
                         <ListItemText 
                           primary={`${condition.field} ${condition.operator} ${condition.value}`}
                           secondary={condition.logic && `Logic: ${condition.logic}`}
                         />
                       </ListItem>
                     ))}
                   </List>
                 </Paper>
               </Grid>
             )}
           </Grid>
         </CardContent>
       </Card>
     )}
   </Box>
 );
};

export default IntentAnalyzer;
EOF

# Create agent builder component
cat > src/components/AgentBuilder/AgentConfigurationWizard.jsx << 'EOF'
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
 Chip,
 Alert,
} from '@mui/material';
import DatabaseConnectionForm from '../DatabaseConnection/DatabaseConnectionForm';
import IntentAnalyzer from '../AIAnalysis/IntentAnalyzer';
import { databaseAPI } from '../../api/services/databaseAPI';
import { agentAPI } from '../../api/services/agentAPI';

const AgentConfigurationWizard = ({ onAgentCreated }) => {
 const [activeStep, setActiveStep] = useState(0);
 const [agentConfig, setAgentConfig] = useState({
   agent_name: '',
   agent_type: 'dynamic',
   database_connection_id: null,
   user_intent: '',
   ai_analysis: null,
   query_config: {},
   template_config: {},
   schedule_config: {},
   channel_config: {}
 });
 const [connections, setConnections] = useState([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 useEffect(() => {
   fetchConnections();
 }, []);

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

     const response = await agentAPI.createAgent(agentData);
     
     if (onAgentCreated) {
       onAgentCreated(response.data);
     }
     
     // Reset wizard
     setActiveStep(0);
     setAgentConfig({
       agent_name: '',
       agent_type: 'dynamic',
       database_connection_id: null,
       user_intent: '',
       ai_analysis: null,
       query_config: {},
       template_config: {},
       schedule_config: {},
       channel_config: {}
     });

   } catch (err) {
     setError(err.response?.data?.detail || 'Failed to create agent');
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
             <TextField
               fullWidth
               label="Agent Name"
               value={agentConfig.agent_name}
               onChange={(e) => setAgentConfig({...agentConfig, agent_name: e.target.value})}
               margin="normal"
               placeholder="e.g., Customer Re-engagement Agent"
             />
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
                   Existing Connections
                 </Typography>
                 <FormControl fullWidth>
                   <InputLabel>Select Database Connection</InputLabel>
                   <Select
                     value={agentConfig.database_connection_id || ''}
                     onChange={(e) => {
                       setAgentConfig({...agentConfig, database_connection_id: e.target.value});
                       handleNext();
                     }}
                     label="Select Database Connection"
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
         <IntentAnalyzer 
           connectionId={agentConfig.database_connection_id}
           onAnalysisComplete={handleAnalysisComplete}
         />
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
                 {/* Add more query configuration fields */}
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
                   placeholder="Hi {{name}}, we miss you!"
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
                   placeholder="Use {{field_name}} for dynamic values"
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
                 <MenuItem value="interval">Interval</MenuItem>
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
               Review Configuration
             </Typography>
             {error && (
               <Alert severity="error" sx={{ mb: 2 }}>
                 {error}
               </Alert>
             )}
             <Grid container spacing={2}>
               <Grid item xs={12} sm={6}>
                 <Typography variant="subtitle1">Agent Name:</Typography>
                 <Typography variant="body2" sx={{ mb: 2 }}>
                   {agentConfig.agent_name}
                 </Typography>
               </Grid>
               <Grid item xs={12} sm={6}>
                 <Typography variant="subtitle1">Database:</Typography>
                 <Typography variant="body2" sx={{ mb: 2 }}>
                   {connections.find(c => c.id === agentConfig.database_connection_id)?.connection_name}
                 </Typography>
               </Grid>
               <Grid item xs={12}>
                 <Typography variant="subtitle1">Intent:</Typography>
                 <Typography variant="body2" sx={{ mb: 2 }}>
                   {agentConfig.ai_analysis?.parsed_intent?.parsed_intent || agentConfig.user_intent}
                 </Typography>
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
       Create New Agent
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
                     {loading ? 'Creating...' : 'Create Agent'}
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
EOF

# Create main agent builder page
cat > src/pages/AgentBuilder/AgentBuilder.jsx << 'EOF'
import React, { useState } from 'react';
import {
 Container,
 Typography,
 Box,
 Tab,
 Tabs,
 Alert,
 Snackbar,
} from '@mui/material';
import AgentConfigurationWizard from '../../components/AgentBuilder/AgentConfigurationWizard';

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

 const handleTabChange = (event, newValue) => {
   setTabValue(newValue);
 };

 const handleAgentCreated = (agentData) => {
   setSuccessMessage(`Agent "${agentData.agent_name || 'New Agent'}" created successfully!`);
 };

 return (
   <Container maxWidth="lg">
     <Box sx={{ mb: 4 }}>
       <Typography variant="h4" component="h1" gutterBottom>
         Agent Builder
       </Typography>
       <Typography variant="subtitle1" color="text.secondary">
         Create intelligent agents that automate your business processes using AI
       </Typography>
     </Box>

     <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
       <Tabs value={tabValue} onChange={handleTabChange} aria-label="agent builder tabs">
         <Tab label="Create New Agent" />
         <Tab label="Templates" />
         <Tab label="Import/Export" />
       </Tabs>
     </Box>

     <TabPanel value={tabValue} index={0}>
       <AgentConfigurationWizard onAgentCreated={handleAgentCreated} />
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
EOF

# Create database management page
cat > src/pages/DatabaseManagement/DatabaseManagement.jsx << 'EOF'
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
 IconButton,
 Dialog,
 DialogTitle,
 DialogContent,
 DialogActions,
 Alert,
} from '@mui/material';
import { Refresh, Visibility, Delete } from '@mui/icons-material';
import DatabaseConnectionForm from '../../components/DatabaseConnection/DatabaseConnectionForm';
import { databaseAPI } from '../../api/services/databaseAPI';

const DatabaseManagement = () => {
 const [connections, setConnections] = useState([]);
 const [loading, setLoading] = useState(true);
 const [selectedConnection, setSelectedConnection] = useState(null);
 const [schemaDialog, setSchemaDialog] = useState(false);
 const [schema, setSchema] = useState(null);

 useEffect(() => {
   fetchConnections();
 }, []);

 const fetchConnections = async () => {
   try {
     const response = await databaseAPI.getConnections();
     setConnections(response.data);
   } catch (error) {
     console.error('Failed to fetch connections:', error);
   } finally {
     setLoading(false);
   }
 };

 const handleViewSchema = async (connection) => {
   try {
     const response = await databaseAPI.getSchema(connection.id);
     setSchema(response.data);
     setSelectedConnection(connection);
     setSchemaDialog(true);
   } catch (error) {
     console.error('Failed to fetch schema:', error);
   }
 };

 const handleRefreshSchema = async (connectionId) => {
   try {
     await databaseAPI.refreshSchema(connectionId);
     fetchConnections();
   } catch (error) {
     console.error('Failed to refresh schema:', error);
   }
 };

 const formatDate = (dateString) => {
   return new Date(dateString).toLocaleString();
 };

 return (
   <Container maxWidth="lg">
     <Box sx={{ mb: 4 }}>
       <Typography variant="h4" component="h1" gutterBottom>
         Database Management
       </Typography>
       <Typography variant="subtitle1" color="text.secondary">
         Manage database connections and explore schemas for your agents
       </Typography>
     </Box>

     <Grid container spacing={3}>
       <Grid item xs={12} md={6}>
         <DatabaseConnectionForm onConnectionSuccess={fetchConnections} />
       </Grid>

       <Grid item xs={12} md={6}>
         <Card>
           <CardContent>
             <Typography variant="h6" gutterBottom>
               Connected Databases
             </Typography>
             
             {connections.length === 0 ? (
               <Typography variant="body2" color="text.secondary">
                 No databases connected yet. Add your first connection to get started.
               </Typography>
             ) : (
               <Box>
                 {connections.map((connection) => (
                   <Card key={connection.id} variant="outlined" sx={{ mb: 2 }}>
                     <CardContent>
                       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                         <Box>
                           <Typography variant="h6">
                             {connection.connection_name}
                           </Typography>
                           <Chip 
                             label={connection.database_type.toUpperCase()} 
                             size="small" 
                             color="primary"
                             sx={{ mr: 1 }}
                           />
                           <Typography variant="caption" color="text.secondary">
                             Connected: {formatDate(connection.created_at)}
                           </Typography>
                           {connection.last_schema_refresh && (
                             <Typography variant="caption" color="text.secondary" display="block">
                               Schema updated: {formatDate(connection.last_schema_refresh)}
                             </Typography>
                           )}
                         </Box>
                         <Box>
                           <IconButton onClick={() => handleViewSchema(connection)}>
                             <Visibility />
                           </IconButton>
                           <IconButton onClick={() => handleRefreshSchema(connection.id)}>
                             <Refresh />
                           </IconButton>
                         </Box>
                       </Box>
                     </CardContent>
                   </Card>
                 ))}
               </Box>
             )}
           </CardContent>
         </Card>
       </Grid>
     </Grid>

     {/* Schema Dialog */}
     <Dialog open={schemaDialog} onClose={() => setSchemaDialog(false)} maxWidth="md" fullWidth>
       <DialogTitle>
         Database Schema: {selectedConnection?.connection_name}
       </DialogTitle>
       <DialogContent>
         {schema && (
           <Box>
           <Typography variant="h6" gutterBottom>
               Tables ({Object.keys(schema.tables || {}).length})
             </Typography>
             
             {Object.entries(schema.tables || {}).map(([tableName, tableInfo]) => (
               <Card key={tableName} variant="outlined" sx={{ mb: 2 }}>
                 <CardContent>
                   <Typography variant="h6" color="primary">
                     {tableName}
                   </Typography>
                   
                   <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                     Columns ({tableInfo.columns?.length || 0}):
                   </Typography>
                   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                     {tableInfo.columns?.map((column) => (
                       <Chip
                         key={column.name}
                         label={`${column.name} (${column.type})`}
                         size="small"
                         variant={column.primary_key ? "filled" : "outlined"}
                         color={column.primary_key ? "primary" : "default"}
                       />
                     ))}
                   </Box>
                   
                   {tableInfo.relationships?.length > 0 && (
                     <Box>
                       <Typography variant="subtitle2" sx={{ mb: 1 }}>
                         Relationships:
                       </Typography>
                       {tableInfo.relationships.map((rel, index) => (
                         <Typography key={index} variant="caption" display="block">
                           {rel.type}: {rel.table} ({rel.join_condition})
                         </Typography>
                       ))}
                     </Box>
                   )}
                 </CardContent>
               </Card>
             ))}
           </Box>
         )}
       </DialogContent>
       <DialogActions>
         <Button onClick={() => setSchemaDialog(false)}>Close</Button>
       </DialogActions>
     </Dialog>
   </Container>
 );
};

export default DatabaseManagement;
EOF

# Create updated App.js with new routes
cat > src/App.js << 'EOF'
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppThemeProvider } from './contexts/ThemeContext';
import AppLayout from './components/Layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import AgentBuilder from './pages/AgentBuilder/AgentBuilder';
import DatabaseManagement from './pages/DatabaseManagement/DatabaseManagement';

// Placeholder components for other routes
const Students = () => (
 <div>
   <h1>Students Management</h1>
   <p>Student management interface coming soon...</p>
 </div>
);

const Courses = () => (
 <div>
   <h1>Courses Management</h1>
   <p>Course management interface coming soon...</p>
 </div>
);

const Analytics = () => (
 <div>
   <h1>Advanced Analytics</h1>
   <p>Advanced analytics interface coming soon...</p>
 </div>
);

const Settings = () => (
 <div>
   <h1>Settings</h1>
   <p>Settings interface coming soon...</p>
 </div>
);

function App() {
 return (
   <AppThemeProvider>
     <Router>
       <AppLayout>
         <Routes>
           <Route path="/" element={<Dashboard />} />
           <Route path="/students" element={<Students />} />
           <Route path="/courses" element={<Courses />} />
           <Route path="/agents" element={<Agents />} />
           <Route path="/agent-builder" element={<AgentBuilder />} />
           <Route path="/database" element={<DatabaseManagement />} />
           <Route path="/analytics" element={<Analytics />} />
           <Route path="/settings" element={<Settings />} />
         </Routes>
       </AppLayout>
     </Router>
   </AppThemeProvider>
 );
}

export default App;
EOF

# Update AppLayout with new menu items
cat > src/components/Layout/AppLayout.js << 'EOF'
import React from 'react';
import {
 Box,
 AppBar,
 Toolbar,
 Typography,
 IconButton,
 Drawer,
 List,
 ListItem,
 ListItemIcon,
 ListItemText,
 ListItemButton,
 Switch,
 FormControlLabel,
 useTheme,
} from '@mui/material';
import {
 Menu as MenuIcon,
 Dashboard,
 People,
 School,
 SmartToy,
 Analytics,
 Settings,
 Brightness4,
 Brightness7,
 Build,
 Storage,
} from '@mui/icons-material';
import { useAppTheme } from '../../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const AppLayout = ({ children }) => {
 const theme = useTheme();
 const { darkMode, toggleDarkMode } = useAppTheme();
 const navigate = useNavigate();
 const location = useLocation();
 const [mobileOpen, setMobileOpen] = React.useState(false);

 const handleDrawerToggle = () => {
   setMobileOpen(!mobileOpen);
 };

 const menuItems = [
   { text: 'Dashboard', icon: <Dashboard />, path: '/' },
   { text: 'Agent Builder', icon: <Build />, path: '/agent-builder' },
   { text: 'Database', icon: <Storage />, path: '/database' },
   { text: 'Agents', icon: <SmartToy />, path: '/agents' },
   { text: 'Students', icon: <People />, path: '/students' },
   { text: 'Courses', icon: <School />, path: '/courses' },
   { text: 'Analytics', icon: <Analytics />, path: '/analytics' },
   { text: 'Settings', icon: <Settings />, path: '/settings' },
 ];

 const drawer = (
   <Box>
     <Toolbar>
       <Typography variant="h6" noWrap component="div">
         Universal Agents
       </Typography>
     </Toolbar>
     <List>
       {menuItems.map((item) => (
         <ListItem key={item.text} disablePadding>
           <ListItemButton
             selected={location.pathname === item.path}
             onClick={() => navigate(item.path)}
           >
             <ListItemIcon>{item.icon}</ListItemIcon>
             <ListItemText primary={item.text} />
           </ListItemButton>
         </ListItem>
       ))}
     </List>
     <Box sx={{ mt: 'auto', p: 2 }}>
       <FormControlLabel
         control={
           <Switch
             checked={darkMode}
             onChange={toggleDarkMode}
             icon={<Brightness7 />}
             checkedIcon={<Brightness4 />}
           />
         }
         label="Dark Mode"
       />
     </Box>
   </Box>
 );

 return (
   <Box sx={{ display: 'flex' }}>
     <AppBar
       position="fixed"
       sx={{
         width: { sm: `calc(100% - ${drawerWidth}px)` },
         ml: { sm: `${drawerWidth}px` },
       }}
     >
       <Toolbar>
         <IconButton
           color="inherit"
           aria-label="open drawer"
           edge="start"
           onClick={handleDrawerToggle}
           sx={{ mr: 2, display: { sm: 'none' } }}
         >
           <MenuIcon />
         </IconButton>
         <Typography variant="h6" noWrap component="div">
           Universal Multi-Agent Platform
         </Typography>
         <Box sx={{ flexGrow: 1 }} />
         <IconButton color="inherit" onClick={toggleDarkMode}>
           {darkMode ? <Brightness7 /> : <Brightness4 />}
         </IconButton>
       </Toolbar>
     </AppBar>
     <Box
       component="nav"
       sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
     >
       <Drawer
         variant="temporary"
         open={mobileOpen}
         onClose={handleDrawerToggle}
         ModalProps={{ keepMounted: true }}
         sx={{
           display: { xs: 'block', sm: 'none' },
           '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
         }}
       >
         {drawer}
       </Drawer>
       <Drawer
         variant="permanent"
         sx={{
           display: { xs: 'none', sm: 'block' },
           '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
         }}
         open
       >
         {drawer}
       </Drawer>
     </Box>
     <Box
       component="main"
       sx={{
         flexGrow: 1,
         p: 3,
         width: { sm: `calc(100% - ${drawerWidth}px)` },
       }}
     >
       <Toolbar />
       {children}
     </Box>
   </Box>
 );
};

export default AppLayout;
EOF

# Create hooks for agent management
cat > src/hooks/useAgents.js << 'EOF'
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
EOF

# Create utility functions
cat > src/utils/formatters.js << 'EOF'
export const formatDate = (dateString) => {
 if (!dateString) return 'Never';
 return new Date(dateString).toLocaleString();
};

export const formatRelativeTime = (dateString) => {
 if (!dateString) return 'Never';
 
 const date = new Date(dateString);
 const now = new Date();
 const diffInMinutes = Math.floor((now - date) / (1000 * 60));
 
 if (diffInMinutes < 1) return 'Just now';
 if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
 
 const diffInHours = Math.floor(diffInMinutes / 60);
 if (diffInHours < 24) return `${diffInHours}h ago`;
 
 const diffInDays = Math.floor(diffInHours / 24);
 return `${diffInDays}d ago`;
};

export const formatNumber = (num) => {
 if (num >= 1000000) {
   return (num / 1000000).toFixed(1) + 'M';
 }
 if (num >= 1000) {
   return (num / 1000).toFixed(1) + 'K';
 }
 return num.toString();
};

export const formatPercentage = (decimal) => {
 return `${(decimal * 100).toFixed(1)}%`;
};
EOF

# Create README for frontend
cat > README_FRONTEND.md << 'EOF'
# Universal Multi-Agent Platform - Frontend Files

## 🎨 New Components Added

### Core Components:
- **DatabaseConnectionForm**: Connect to any database
- **IntentAnalyzer**: AI-powered natural language query building  
- **AgentConfigurationWizard**: Step-by-step agent creation

### New Pages:
- **AgentBuilder**: Create agents with AI assistance
- **DatabaseManagement**: Manage database connections and explore schemas

### API Services:
- **databaseAPI**: Database connection and schema management
- **agentAPI**: Agent creation and management

### Hooks:
- **useAgents**: Manage agent state and operations

## 🚀 Getting Started

1. **Install new dependencies**:
  ```bash
  npm install @mui/icons-material