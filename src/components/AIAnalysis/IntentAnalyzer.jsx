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
  const [queryResults, setQueryResults] = useState(null); // Add this line

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

 const testQuery = async (connectionId) => {
  try {
    // Build the query from analysis
    const strategy = analysis.suggested_query_strategy;
    const query = buildQueryFromStrategy(strategy);
    
    const response = await databaseAPI.testQuery(connectionId, query);
    
    // Show results in a dialog or new section
    console.log('Query results:', response.data);
    setQueryResults(response.data);
    
  } catch (error) {
    console.error('Query test failed:', error);
  }
};

const buildQueryFromStrategy = (strategy) => {
  const selectFields = strategy?.select_fields?.join(', ') || '*';
  const mainTable = strategy?.main_table || 'students';
  
  let query = `SELECT ${selectFields} FROM ${mainTable}`;
  
  // FIX 1: Remove double JOIN
  if (strategy?.required_joins && strategy.required_joins.length > 0) {
    strategy.required_joins.forEach(join => {
      let joinType = join.join_type || 'INNER JOIN';
      // Clean any double JOINs
      joinType = joinType.replace(/JOIN\s+JOIN/gi, 'JOIN');
      query += ` ${joinType} ${join.table} ON ${join.condition}`;
    });
  }
  
  // FIX 2: Proper WHERE conditions with table prefixes
  if (strategy?.where_conditions && strategy.where_conditions.length > 0) {
    const conditions = strategy.where_conditions.map(cond => {
      let field = cond.field;
      // Add table prefix if missing
      if (!field.includes('.')) {
        field = `${mainTable}.${field}`;
      }
      return `${field} ${cond.operator} '${cond.value}'`;
    }).join(' AND ');
    
    query += ` WHERE ${conditions}`;
  }
  
  // FIX 3: Add NULL handling for scores
  if (selectFields.includes('score') && !query.includes('score IS NOT NULL')) {
    if (query.includes('WHERE')) {
      query += ' AND submissions.score IS NOT NULL';
    } else {
      query += ' WHERE submissions.score IS NOT NULL';
    }
  }
  
  query += ' LIMIT 10';
  return query;
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
        Generated SQL Query
      </Typography>
      
      {/* Show the actual query */}
      <Paper sx={{ p: 2, mb: 2, backgroundColor: 'grey.100' }}>
        <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
          {`SELECT ${analysis.suggested_query_strategy?.select_fields?.join(', ') || '*'}
FROM ${analysis.suggested_query_strategy?.main_table || 'table_name'}
${analysis.suggested_query_strategy?.required_joins?.map(join => 
  `${join.join_type} JOIN ${join.table} ON ${join.condition}`
).join('\n') || ''}
${analysis.suggested_query_strategy?.where_conditions?.length > 0 ? 
  'WHERE ' + analysis.suggested_query_strategy.where_conditions.map(cond => 
    `${cond.field} ${cond.operator} '${cond.value}'`
  ).join(' AND ') : ''}`}
        </Typography>
      </Paper>

      {/* Add button to test query */}
      <Button
        variant="outlined"
        onClick={() => testQuery(connectionId)}
        sx={{ mr: 2 }}
      >
        Test This Query
      </Button>
      
    <Button
  variant="contained"
  color="success"
  onClick={() => {
    if (onAnalysisComplete) {
      onAnalysisComplete(analysis);
    } else {
      alert('Analysis complete! This would normally proceed to agent creation.');
    }
  }}
>
  Use This Strategy
</Button>
    </CardContent>
  </Card>
)}
{queryResults && (
  <Card sx={{ mt: 2 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Query Results ({queryResults.row_count} rows)
      </Typography>
      
      <Paper sx={{ p: 2, overflow: 'auto', maxHeight: 300 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {queryResults.columns?.map((col, index) => (
                <th key={index} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#f5f5f5' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {queryResults.rows?.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} style={{ border: '1px solid #ccc', padding: '8px' }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Paper>
    </CardContent>
  </Card>
)}
   </Box>
 );
};

export default IntentAnalyzer;
