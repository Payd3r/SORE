import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Typography,
  Button,
  Paper,
  useTheme,
  Chip,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import BookIcon from '@mui/icons-material/Book';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import TimelineIcon from '@mui/icons-material/Timeline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';

interface SidebarProps {
  onClose?: () => void;
}

const menuItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/home' },
  { text: 'Ricordi', icon: <AutoStoriesIcon />, path: '/ricordi' },
  { text: 'Galleria', icon: <PhotoLibraryIcon />, path: '/galleria' },
  { text: 'Idee', icon: <LightbulbIcon />, path: '/idee' },
  { text: 'Recap', icon: <TimelineIcon />, path: '/recap' },
  { text: 'Profilo', icon: <AccountCircleIcon />, path: '/profilo' },
];

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode } = useThemeMode();
  const theme = useTheme();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onClose && window.innerWidth < 600) {
      onClose();
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box 
        sx={{ 
          p: 3, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          gap: 2,
        }}
      >
        <Avatar
          src={user?.profilePicture}
          sx={{
            width: 80,
            height: 80,
            bgcolor: theme.palette.primary.main,
            fontSize: '2rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '4px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)',
            mb: 1,
            cursor: 'pointer',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            }
          }}
          onClick={() => handleNavigation('/profilo')}
        >
          {user?.name?.[0]}
        </Avatar>
        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h6" 
            fontWeight={600}
            sx={{
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(90deg, #9b87f5 0%, #7E69AB 100%)' 
                : 'linear-gradient(90deg, #7E69AB 0%, #6E59A5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {user?.name}
          </Typography>
          {user?.coupleId && (
            <Chip 
              icon={<FavoriteBorderIcon sx={{ fontSize: '0.8rem' }} />}
              label="In una relazione" 
              size="small"
              sx={{ 
                mt: 1, 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(155, 135, 245, 0.2)' : 'rgba(155, 135, 245, 0.1)',
                color: theme.palette.primary.main,
                fontWeight: 500,
                fontSize: '0.7rem'
              }}
            />
          )}
          {user?.email && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: '0.8rem', opacity: 0.8, mt: 1 }}
            >
              {user.email}
            </Typography>
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 1, opacity: 0.6 }} />

      <Box 
        sx={{ 
          flex: 1, 
          overflow: 'auto',
          px: 2,
          py: 1,
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            borderRadius: '10px',
          },
        }}
        className="custom-scrollbar"
      >
        <List sx={{ px: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 3,
                  transition: 'all 0.2s',
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': isActive(item.path) ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                    opacity: 0.9,
                    zIndex: -1,
                  } : {},
                  '&.Mui-selected': {
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                  },
                  '&:hover': {
                    backgroundColor: isActive(item.path) ? 'transparent' : theme.palette.action.hover,
                    transform: 'translateX(5px)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive(item.path) ? '#fff' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 600 : 400,
                  }}
                />
                {isActive(item.path) && (
                  <Box
                    sx={{
                      width: 4,
                      height: 20,
                      borderRadius: 1,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : '#fff',
                      position: 'absolute',
                      right: 12,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {user?.coupleId && (
        <Box sx={{ p: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, rgba(155, 135, 245, 0.15) 0%, rgba(110, 89, 165, 0.15) 100%)'
                : 'linear-gradient(135deg, rgba(155, 135, 245, 0.1) 0%, rgba(110, 89, 165, 0.1) 100%)',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(155, 135, 245, 0.2)',
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              ID Coppia
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {user.coupleId}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '0.75rem',
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
              }}
              onClick={() => {
                navigator.clipboard.writeText(user.coupleId.toString());
              }}
            >
              Copia
            </Button>
          </Paper>
        </Box>
      )}

      <Box sx={{ p: 2, mt: 'auto' }}>
        <Divider sx={{ mb: 2, opacity: 0.6 }} />
        <Button
          variant="outlined"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={logout}
          sx={{
            borderRadius: 3,
            py: 1.2,
            textTransform: 'none',
            justifyContent: 'flex-start',
            pl: 2,
            color: theme.palette.error.main,
            borderColor: theme.palette.error.main,
            '&:hover': {
              borderColor: theme.palette.error.dark,
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(244, 67, 54, 0.08)'
                : 'rgba(244, 67, 54, 0.04)',
            },
            fontWeight: 500,
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;
