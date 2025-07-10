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
