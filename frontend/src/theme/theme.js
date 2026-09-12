import { createTheme } from '@mui/material/styles';

export const getAppTheme = (mode = 'light') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: isDark ? '#3B82F6' : '#2563EB',
        light: isDark ? '#60A5FA' : '#3B82F6',
        dark: isDark ? '#1D4ED8' : '#1D4ED8',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: isDark ? '#38BDF8' : '#0284C7',
        light: isDark ? '#7DD3FC' : '#38BDF8',
        dark: isDark ? '#0284C7' : '#0369A1',
        contrastText: isDark ? '#0F172A' : '#FFFFFF',
      },
      background: {
        default: isDark ? '#0B1120' : '#F4F8FC',
        paper: isDark ? '#1E293B' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#F8FAFC' : '#0F172A',
        secondary: isDark ? '#94A3B8' : '#475569',
        disabled: isDark ? '#64748B' : '#94A3B8',
      },
      success: {
        main: '#10B981',
        light: isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5',
        dark: '#047857',
      },
      warning: {
        main: '#F59E0B',
        light: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
        dark: '#B45309',
      },
      error: {
        main: '#EF4444',
        light: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
        dark: '#B91C1C',
      },
      info: {
        main: '#3B82F6',
        light: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF',
        dark: '#1D4ED8',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h3: {
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      h4: {
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      subtitle1: {
        fontWeight: 500,
      },
      subtitle2: {
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontSize: '0.75rem',
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
        letterSpacing: '0.01em',
      },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? '#0B1120' : '#F4F8FC',
            color: isDark ? '#F8FAFC' : '#0F172A',
            transition: 'background-color 0.25s ease, color 0.25s ease',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: 'none',
            padding: '8px 18px',
            fontWeight: 600,
            '&:hover': {
              boxShadow: isDark ? '0 2px 10px rgba(0, 0, 0, 0.5)' : '0 2px 8px rgba(10, 37, 64, 0.12)',
            },
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
            },
          },
          containedSecondary: {
            background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0369A1 0%, #075985 100%)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
            boxShadow: isDark
              ? '0 4px 20px rgba(0, 0, 0, 0.35)'
              : '0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: isDark ? '0 8px 30px rgba(0, 0, 0, 0.5)' : '0 8px 24px rgba(15, 23, 42, 0.07)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: isDark
              ? '0 2px 10px rgba(0, 0, 0, 0.3)'
              : '0 1px 3px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 6,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
            color: isDark ? '#94A3B8' : '#475569',
            fontWeight: 600,
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
          },
          body: {
            color: isDark ? '#E2E8F0' : '#1E293B',
            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #F1F5F9',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            backgroundImage: 'none',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            backgroundImage: 'none',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E2E8F0',
          },
        },
      },
    },
  });
};

export const theme = getAppTheme('light');
