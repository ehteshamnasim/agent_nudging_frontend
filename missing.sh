# Create missing directories
mkdir -p src/contexts src/pages src/api

# Create ThemeContext
cat > src/contexts/ThemeContext.js << 'EOF'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeContextProvider');
  }
  return context;
};

export const AppThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
EOF

# Create basic API
cat > src/api/api.js << 'EOF'
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
EOF

# Create basic pages
cat > src/pages/Dashboard.js << 'EOF'
import React from 'react';
import { Typography, Container } from '@mui/material';

const Dashboard = () => (
  <Container>
    <Typography variant="h4">Dashboard</Typography>
    <Typography>Welcome to Universal Agent Platform</Typography>
  </Container>
);

export default Dashboard;
EOF

cat > src/pages/Agents.js << 'EOF'
import React from 'react';
import { Typography, Container } from '@mui/material';

const Agents = () => (
  <Container>
    <Typography variant="h4">Agents</Typography>
    <Typography>Manage your AI agents here</Typography>
  </Container>
);

export default Agents;
EOF