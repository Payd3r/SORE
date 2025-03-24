
import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Avatar,
  Tooltip,
  Badge,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import Sidebar from './Sidebar';

const drawerWidth = 280;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: 0,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: drawerWidth,
  }),
}));

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(!isMobile);
  const { user } = useAuth();
  const { mode, toggleTheme } = useThemeMode();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
          ml: { sm: `${open ? drawerWidth : 0}px` },
          display: user ? 'block' : 'none',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(90deg, rgba(26,32,39,1) 0%, rgba(10,25,41,0.95) 100%)' 
            : 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(245,245,245,0.95) 100%)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
            <Typography 
              variant="h6" 
              noWrap 
              component="div"
              sx={{
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(90deg, #9b87f5 0%, #7E69AB 100%)' 
                  : 'linear-gradient(90deg, #7E69AB 0%, #6E59A5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
                fontSize: '1.5rem'
              }}
            >
              Memory Grove
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifiche">
              <IconButton color="inherit">
                <Badge badgeContent={3} color="primary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title={mode === 'dark' ? 'Tema Chiaro' : 'Tema Scuro'}>
              <IconButton color="inherit" onClick={toggleTheme}>
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            {user && (
              <Tooltip title={user.name || 'Profilo'}>
                <Avatar 
                  src={user.profilePictureUrl}
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    ml: 1,
                    bgcolor: theme.palette.primary.main,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    }
                  }}
                  onClick={() => window.location.href = '/profilo'}
                >
                  {user.name?.[0]}
                </Avatar>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {user && (
        <Drawer
          variant={isMobile ? 'temporary' : 'persistent'}
          anchor="left"
          open={open}
          onClose={isMobile ? handleDrawerToggle : undefined}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              backgroundImage: theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, rgba(26,32,39,1) 0%, rgba(10,25,41,0.98) 100%)'
                : 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(245,245,245,0.98) 100%)',
              boxShadow: '4px 0 12px rgba(0, 0, 0, 0.05)',
              borderRight: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          <Sidebar onClose={handleDrawerToggle} />
        </Drawer>
      )}

      <Main open={open && !isMobile} sx={{ 
        bgcolor: 'background.default',
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 4 }
      }}>
        <Toolbar /> {/* Spacer for AppBar */}
        {children}
      </Main>
    </Box>
  );
};

export default Layout;
