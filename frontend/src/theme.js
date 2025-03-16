import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6B6B',
      light: '#FF8E8E',
      dark: '#FF4848',
    },
    secondary: {
      main: '#4ECDC4',
      light: '#71D7D0',
      dark: '#3DBEB6',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F8F9FA',
    },
  },
  typography: {
    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#2D3436',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#2D3436',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#2D3436',
    },
    body1: {
      fontSize: '1rem',
      color: '#2D3436',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          textTransform: 'none',
          fontSize: '1rem',
          padding: '8px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

export default theme;