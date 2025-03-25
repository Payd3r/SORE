import { createTheme, responsiveFontSizes } from '@mui/material';
import { alpha } from '@mui/material/styles';

// Create base theme options
const createThemeOptions = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';
  
  // Primary colors
  const primaryMain = isDark ? '#b388ff' : '#7E69AB';
  const primaryLight = isDark ? '#e7b9ff' : '#9b87f5';
  const primaryDark = isDark ? '#805acb' : '#6E59A5';
  
  // Secondary colors
  const secondaryMain = isDark ? '#ff80ab' : '#f97316';
  const secondaryLight = isDark ? '#ffb2dd' : '#ff9a57';
  const secondaryDark = isDark ? '#c94f7c' : '#c45800';
  
  // Background colors
  const backgroundDefault = isDark ? '#0a1929' : '#f8f9fc';
  const backgroundPaper = isDark ? '#1a2027' : '#ffffff';
  
  return {
    palette: {
      mode,
      primary: {
        main: primaryMain,
        light: primaryLight,
        dark: primaryDark,
        contrastText: '#ffffff',
      },
      secondary: {
        main: secondaryMain,
        light: secondaryLight,
        dark: secondaryDark,
        contrastText: '#ffffff',
      },
      background: {
        default: backgroundDefault,
        paper: backgroundPaper,
      },
      success: {
        main: isDark ? '#66BB6A' : '#4CAF50',
        light: isDark ? '#81C784' : '#81C784',
        dark: isDark ? '#388E3C' : '#388E3C',
      },
      error: {
        main: isDark ? '#F44336' : '#F44336',
        light: isDark ? '#E57373' : '#E57373',
        dark: isDark ? '#D32F2F' : '#D32F2F',
      },
      info: {
        main: isDark ? '#29B6F6' : '#2196F3',
        light: isDark ? '#4FC3F7' : '#64B5F6',
        dark: isDark ? '#0288D1' : '#1976D2',
      },
      warning: {
        main: isDark ? '#FFA726' : '#FF9800',
        light: isDark ? '#FFB74D' : '#FFB74D',
        dark: isDark ? '#F57C00' : '#F57C00',
      },
      text: {
        primary: isDark ? '#f1f5f9' : '#27272a',
        secondary: isDark ? '#94a3b8' : '#64748b',
        disabled: isDark ? '#475569' : '#cbd5e1',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
        fontSize: '2.5rem',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
        fontSize: '2rem',
      },
      h3: {
        fontWeight: 600,
        letterSpacing: '0em',
        fontSize: '1.75rem',
      },
      h4: {
        fontWeight: 600,
        letterSpacing: '0.01em',
        fontSize: '1.5rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 500,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 16,
    },
    shadows: [
      'none',
      isDark 
        ? '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.36)'
        : '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.14)',
      isDark 
        ? '0 3px 6px rgba(0, 0, 0, 0.3), 0 3px 6px rgba(0, 0, 0, 0.4)'
        : '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
      isDark
        ? '0 10px 20px rgba(0, 0, 0, 0.3), 0 6px 10px rgba(0, 0, 0, 0.4)'
        : '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
      isDark
        ? '0 14px 28px rgba(0, 0, 0, 0.35), 0 10px 10px rgba(0, 0, 0, 0.4)'
        : '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
      isDark
        ? '0 19px 38px rgba(0, 0, 0, 0.4), 0 15px 12px rgba(0, 0, 0, 0.4)'
        : '0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22)',
      isDark
        ? '0 25px 50px rgba(0, 0, 0, 0.45), 0 20px 15px rgba(0, 0, 0, 0.4)'
        : '0 25px 50px rgba(0, 0, 0, 0.35), 0 20px 15px rgba(0, 0, 0, 0.22)',
      isDark
        ? '0 30px 60px rgba(0, 0, 0, 0.5), 0 25px 20px rgba(0, 0, 0, 0.4)'
        : '0 30px 60px rgba(0, 0, 0, 0.4), 0 25px 20px rgba(0, 0, 0, 0.22)',
      isDark
        ? '0 35px 70px rgba(0, 0, 0, 0.55), 0 30px 25px rgba(0, 0, 0, 0.4)'
        : '0 35px 70px rgba(0, 0, 0, 0.45), 0 30px 25px rgba(0, 0, 0, 0.22)',
      isDark
        ? '0 40px 80px rgba(0, 0, 0, 0.6), 0 35px 30px rgba(0, 0, 0, 0.4)'
        : '0 40px 80px rgba(0, 0, 0, 0.5), 0 35px 30px rgba(0, 0, 0, 0.22)',
      isDark
        ? '0 45px 90px rgba(0, 0, 0, 0.65), 0 40px 35px rgba(0, 0, 0, 0.4)'
        : '0 45px 90px rgba(0, 0, 0, 0.55), 0 40px 35px rgba(0, 0, 0, 0.22)',
      isDark
        ? '0 50px 100px rgba(0, 0, 0, 0.7), 0 45px 40px rgba(0, 0, 0, 0.4)'
        : '0 50px 100px rgba(0, 0, 0, 0.6), 0 45px 40px rgba(0, 0, 0, 0.22)',
      isDark
        ? '0 55px 110px rgba(0, 0, 0, 0.75), 0 50px 45px rgba(0, 0, 0, 0.4)'
        : '0 55px 110px rgba(0, 0, 0, 0.65), 0 50px 45px rgba(0, 0, 0, 0.22)',
      isDark
        ? '0 60px 120px rgba(0, 0, 0, 0.8), 0 55px 50px rgba(0, 0, 0, 0.4)'
        : '0 60px 120px rgba(0, 0, 0, 0.7), 0 55px 50px rgba(0, 0, 0, 0.22)',
    ],
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: isDark 
              ? '0 10px 30px rgba(0, 0, 0, 0.3)' 
              : '0 10px 30px rgba(0, 0, 0, 0.08)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: isDark 
                ? '0 15px 35px rgba(0, 0, 0, 0.4)' 
                : '0 15px 35px rgba(0, 0, 0, 0.12)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '8px 20px',
            fontWeight: 500,
            textTransform: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: isDark 
                ? '0 6px 20px rgba(0, 0, 0, 0.4)' 
                : '0 6px 20px rgba(0, 0, 0, 0.15)',
            },
          },
          contained: {
            boxShadow: isDark 
              ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
              : '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${primaryMain} 0%, ${primaryDark} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${primaryLight} 0%, ${primaryMain} 100%)`,
            },
          },
          containedSecondary: {
            background: `linear-gradient(135deg, ${secondaryMain} 0%, ${secondaryDark} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${secondaryLight} 0%, ${secondaryMain} 100%)`,
            },
          },
          outlined: {
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              transition: 'all 0.3s ease',
              '& fieldset': {
                borderWidth: isDark ? 1 : 1.5,
                borderColor: isDark 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(0, 0, 0, 0.08)',
              },
              '&:hover fieldset': {
                borderColor: isDark 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(0, 0, 0, 0.15)',
              },
              '&.Mui-focused fieldset': {
                borderColor: primaryMain,
                borderWidth: 2,
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontWeight: 500,
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: isDark 
                ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
                : '0 2px 8px rgba(0, 0, 0, 0.1)',
            },
          },
          filled: {
            background: isDark 
              ? 'rgba(255, 255, 255, 0.08)' 
              : 'rgba(0, 0, 0, 0.05)',
          },
          outlined: {
            borderWidth: 1.5,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            transition: 'box-shadow 0.3s ease',
          },
          elevation1: {
            boxShadow: isDark 
              ? '0 4px 15px rgba(0, 0, 0, 0.3)' 
              : '0 4px 15px rgba(0, 0, 0, 0.07)',
          },
          elevation2: {
            boxShadow: isDark 
              ? '0 8px 25px rgba(0, 0, 0, 0.35)' 
              : '0 8px 25px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: isDark 
              ? '0 4px 15px rgba(0, 0, 0, 0.3)' 
              : '0 4px 15px rgba(0, 0, 0, 0.07)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: '1px solid',
            borderColor: isDark 
              ? 'rgba(255, 255, 255, 0.05)' 
              : 'rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 24,
            boxShadow: isDark 
              ? '0 20px 40px rgba(0, 0, 0, 0.4)' 
              : '0 20px 40px rgba(0, 0, 0, 0.15)',
            backgroundImage: isDark 
              ? 'linear-gradient(180deg, #1a2027 0%, #0a1929 100%)' 
              : 'linear-gradient(180deg, #ffffff 0%, #f8f9fc 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            boxShadow: isDark 
              ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
              : '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: '2px solid',
            borderColor: isDark 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(255, 255, 255, 0.9)',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: isDark 
              ? 'rgba(255, 255, 255, 0.05)' 
              : 'rgba(0, 0, 0, 0.03)',
          },
          indicator: {
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            transition: 'all 0.3s ease',
            '&.Mui-selected': {
              fontWeight: 600,
            },
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: isDark 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.02)',
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            transition: 'all 0.2s ease',
            '&.Mui-selected': {
              backgroundColor: isDark 
                ? alpha(primaryMain, 0.15) 
                : alpha(primaryMain, 0.1),
              '&:hover': {
                backgroundColor: isDark 
                  ? alpha(primaryMain, 0.2) 
                  : alpha(primaryMain, 0.15),
              },
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              backgroundColor: isDark 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(0, 0, 0, 0.05)',
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDark 
              ? 'rgba(255, 255, 255, 0.08)' 
              : 'rgba(0, 0, 0, 0.06)',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 8,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            backgroundColor: isDark 
              ? 'rgba(26, 32, 39, 0.9)' 
              : 'rgba(0, 0, 0, 0.75)',
            boxShadow: isDark 
              ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
              : '0 4px 12px rgba(0, 0, 0, 0.15)',
            padding: '8px 12px',
            fontWeight: 500,
          },
        },
      },
    },
  };
};

// Create and export themes
const createAndExportTheme = (mode: 'light' | 'dark') => {
  const theme = createTheme(createThemeOptions(mode));
  return responsiveFontSizes(theme);
};

export const lightTheme = createAndExportTheme('light');
export const darkTheme = createAndExportTheme('dark');
