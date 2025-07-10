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
