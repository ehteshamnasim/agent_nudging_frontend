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
