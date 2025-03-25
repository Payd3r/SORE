
import React, { useState, useEffect } from 'react';
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
  Paper,
  Collapse,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

const drawerWidth = 280;

const Main = styled(motion.main, { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: 0,
  width: '100%',
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const GlassAppBar = styled(AppBar)(({ theme }) => ({
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  borderBottom: '1px solid',
  borderColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.05)',
  boxShadow: 'none',
}));

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(!isMobile);
  const { user } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <GlassAppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
          ml: { sm: `${open ? drawerWidth : 0}px` },
          display: user ? 'block' : 'none',
          background: theme.palette.mode === 'dark' 
            ? 'rgba(10, 25, 41, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)',
          transition: 'all 0.3s ease',
          boxShadow: scrolled ? (theme.palette.mode === 'dark' 
            ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
            : '0 4px 20px rgba(0, 0, 0, 0.1)') : 'none',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2,
                transition: 'all 0.3s ease',
                transform: open ? 'rotate(0deg)' : 'rotate(180deg)',
              }}
            >
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Typography 
                variant="h6" 
                noWrap 
                component="div"
                sx={{
                  background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(90deg, #b388ff 0%, #9b87f5 100%)' 
                    : 'linear-gradient(90deg, #7E69AB 0%, #9b87f5 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold',
                  fontSize: { xs: '1.2rem', sm: '1.5rem' },
                  letterSpacing: '0.5px',
                  textShadow: theme.palette.mode === 'dark' 
                    ? '0 0 8px rgba(179, 136, 255, 0.5)' 
                    : '0 0 8px rgba(126, 105, 171, 0.3)',
                }}
              >
                Memory Grove
              </Typography>
            </motion.div>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifiche">
              <IconButton 
                color="inherit"
                sx={{
                  background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                <Badge badgeContent={3} color="primary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title={mode === 'dark' ? 'Tema Chiaro' : 'Tema Scuro'}>
              <IconButton 
                color="inherit" 
                onClick={toggleTheme}
                sx={{
                  background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            {user && (
              <Tooltip title={user.name || 'Profilo'}>
                <Avatar 
                  src={user.profilePicture}
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    ml: 1,
                    bgcolor: theme.palette.primary.main,
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
                    border: '2px solid',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
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
      </GlassAppBar>

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
                ? 'linear-gradient(180deg, rgba(26,32,39,0.95) 0%, rgba(10,25,41,0.98) 100%)'
                : 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(245,245,245,0.98) 100%)',
              boxShadow: theme.palette.mode === 'dark' 
                ? '4px 0 20px rgba(0, 0, 0, 0.3)' 
                : '4px 0 20px rgba(0, 0, 0, 0.1)',
              borderRight: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              overflowX: 'hidden',
            },
          }}
        >
          <Sidebar onClose={handleDrawerToggle} />
        </Drawer>
      )}

      <Main 
        open={open && !isMobile} 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        sx={{ 
          bgcolor: 'background.default',
          px: { xs: 2, md: 4 },
          py: { xs: 3, md: 4 },
          transition: 'all 0.3s ease',
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 4, 
            overflow: 'hidden',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(26, 32, 39, 0.7)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 10px 30px rgba(0, 0, 0, 0.25)' 
              : '0 10px 30px rgba(0, 0, 0, 0.05)',
            p: { xs: 2, md: 3 },
            mb: 4,
          }}
        >
          {children}
        </Paper>
      </Main>
    </Box>
  );
};

export default Layout;
