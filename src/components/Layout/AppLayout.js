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
