import { createTheme } from '@mui/material';

const lightThemeOptions = {
  palette: {
    mode: 'light' as const,
    primary: {
      main: '#3f51b5',
      light: '#6573c3',
      dark: '#2c387e',
    },
    secondary: {
      main: '#9c27b0',
      light: '#af52bf',
      dark: '#6d1b7b',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
};

const darkThemeOptions = {
  palette: {
    mode: 'dark' as const,
    primary: {
      main: '#90caf9',
      light: '#a6d4fa',
      dark: '#648dae',
    },
    secondary: {
      main: '#ce93d8',
      light: '#d7a7df',
      dark: '#906697',
    },
    background: {
      default: '#0a1929',
      paper: '#1a2027',
    },
  },
};

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);
