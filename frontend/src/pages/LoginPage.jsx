import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Divider,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  CircularProgress,
  Paper,
  Chip,
  Avatar,
} from '@mui/material';
import {
  EmailOutlined as EmailIcon,
  LockOutlined as LockIcon,
  Visibility,
  VisibilityOff,
  ArrowForward as ArrowForwardIcon,
  Groups as GroupsIcon,
  DescriptionOutlined as DocIcon,
  CalendarTodayOutlined as CalendarIcon,
  BarChartOutlined as ChartIcon,
  ShieldOutlined as ShieldIcon,
  AdminPanelSettingsOutlined as AdminIcon,
  AssignmentIndOutlined as ConvenerIcon,
  PersonOutlined as MemberIcon,
  VerifiedUserOutlined as IqacIcon,
  FlashOn as QuickIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  {
    role: 'REGISTRAR',
    label: 'Registrar',
    subLabel: 'Dean, SOCE',
    name: 'Prof. Dr. K. V. Krishna Kishore',
    email: '231fa04e50@gmail.com',
    password: 'Demo@1234',
    color: '#1D61E7',
    bgColor: 'rgba(29, 97, 231, 0.08)',
    borderColor: 'rgba(29, 97, 231, 0.25)',
    icon: <AdminIcon sx={{ fontSize: 20 }} />,
    desc: 'Executive governance, statutory controls & institutional sign-off',
  },
  {
    role: 'CONVENER',
    label: 'Convener',
    subLabel: 'HoD, CSE',
    name: 'Dr. S. V. Phani Kumar',
    email: '231fa04a32@gmail.com',
    password: 'Demo@1234',
    color: '#7C3AED',
    bgColor: 'rgba(124, 58, 237, 0.08)',
    borderColor: 'rgba(124, 58, 237, 0.25)',
    icon: <ConvenerIcon sx={{ fontSize: 20 }} />,
    desc: 'Meeting notices, live quorum validation & automated MoM generation',
  },
  {
    role: 'MEMBER',
    label: 'Member',
    subLabel: 'Asst. Prof., CSE',
    name: 'Dr. J. Veeranjaneyulu',
    email: 'thanujkrishna28@gmail.com',
    password: 'Demo@1234',
    color: '#059669',
    bgColor: 'rgba(5, 150, 105, 0.08)',
    borderColor: 'rgba(5, 150, 105, 0.25)',
    icon: <MemberIcon sx={{ fontSize: 20 }} />,
    desc: 'Agenda papers, assigned actions (ATR) & attendance confirmation',
  },
  {
    role: 'IQAC',
    label: 'IQAC Coordinator',
    subLabel: 'Asst. Prof., CSE',
    name: 'Dr. E. Deepak Chowdary',
    email: 'pujithayarramsetty@gmail.com',
    password: 'Demo@1234',
    color: '#D97706',
    bgColor: 'rgba(217, 119, 6, 0.08)',
    borderColor: 'rgba(217, 119, 6, 0.25)',
    icon: <IqacIcon sx={{ fontSize: 20 }} />,
    desc: 'NAAC SSR Criterion 6 compliance radar & composition auditor',
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeDemoRole, setActiveDemoRole] = useState(null);

  // Login Form State
  const [email, setEmail] = useState('231fa04e50@gmail.com');
  const [password, setPassword] = useState('Demo@1234');

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setActiveDemoRole(acc.role);
    setError('');
    setLoading(true);
    try {
      await login(acc.email, acc.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to log in as ${acc.label}. Ensure database is seeded.`);
    } finally {
      setLoading(false);
      setActiveDemoRole(null);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundImage: `linear-gradient(135deg, rgba(240, 246, 255, 0.88) 0%, rgba(225, 238, 255, 0.72) 45%, rgba(245, 249, 255, 0.88) 100%), url('/vignan-campus-aerial.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        overflowX: 'hidden',
        px: { xs: 2, sm: 3, md: 5 },
        py: { xs: 1.5, sm: 2, md: 2.5 },
      }}
    >
      {/* Top Header Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          width: '100%',
          maxWidth: 1400,
          margin: '0 auto',
          mb: { xs: 1, md: 1.5 },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.6 }}>
          <Box
            component="img"
            src="/vignan-official-logo.png"
            alt="Vignan University"
            sx={{
              height: { xs: 36, sm: 42, md: 48 },
              objectFit: 'contain',
              borderRadius: '8px',
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              p: 0.5,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
            }}
          />

          <Box sx={{ pl: 0.2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1rem', md: '1.15rem' },
                letterSpacing: '-0.02em',
                color: '#0A1B39',
                lineHeight: 1.15,
              }}
            >
              Commi<Box component="span" sx={{ color: '#1D61E7' }}>AI</Box>
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#64748B',
                fontWeight: 600,
                fontSize: '0.7rem',
                letterSpacing: '0.02em',
                display: 'block',
              }}
            >
              Committee Governance Agent
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{
            display: { xs: 'none', md: 'block' },
            color: '#475569',
            fontSize: '0.85rem',
            fontWeight: 500,
            fontStyle: 'italic',
            pt: 0.8,
          }}
        >
          &mdash; Intelligent Statutory Governance for Higher Education
        </Typography>
      </Box>

      {/* Main Center Content Body */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { xs: 'stretch', lg: 'center' },
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: 1400,
          margin: '0 auto',
          py: { xs: 1, md: 1.5 },
          gap: { xs: 3, lg: 5 },
        }}
      >
        {/* Left Column: Vision & Value Pillars */}
        <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 52%' }, minWidth: 0, pr: { lg: 2 }, mt: { lg: -1 } }}>
          <Typography
            variant="overline"
            sx={{
              color: '#64748B',
              fontWeight: 700,
              letterSpacing: '0.22em',
              fontSize: '0.72rem',
              display: 'block',
              mb: 1,
            }}
          >
            PEOPLE &nbsp;|&nbsp; PROCESS &nbsp;|&nbsp; COMPLIANCE &nbsp;|&nbsp; IMPACT
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#0A1B39',
              mb: 1.8,
            }}
          >
            Smarter Committees <br />
            for a <Box component="span" sx={{ color: '#1D61E7' }}>Stronger Vignan</Box>
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#475569',
              fontSize: { xs: '0.92rem', md: '1.02rem' },
              lineHeight: 1.55,
              maxWidth: 580,
              mb: 2.5,
              fontWeight: 400,
            }}
          >
            Constitutional authority management, live quorum enforcement, autonomous compliance auditing, and AI-driven minutes for all institutional bodies.
          </Typography>

          {/* 4 Feature Badges */}
          <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
            {[
              {
                icon: <GroupsIcon sx={{ color: '#1D61E7', fontSize: 20 }} />,
                title: 'Live Committee Registers',
              },
              {
                icon: <DocIcon sx={{ color: '#1D61E7', fontSize: 20 }} />,
                title: 'Statutory Quorum Audit',
              },
              {
                icon: <CalendarIcon sx={{ color: '#1D61E7', fontSize: 20 }} />,
                title: 'Automated MoM Drafting',
              },
              {
                icon: <ChartIcon sx={{ color: '#1D61E7', fontSize: 20 }} />,
                title: 'NAAC SSR 6.2.2 Evidence',
              },
            ].map((item, index) => (
              <Grid size={{ xs: 6, sm: 3 }} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    p: 1.4,
                    minHeight: 92,
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.95)',
                    boxShadow: '0 4px 16px rgba(29, 97, 231, 0.06)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      background: 'rgba(255, 255, 255, 0.96)',
                      boxShadow: '0 8px 24px rgba(29, 97, 231, 0.14)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      bgcolor: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 0.6,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: '#1E293B',
                      fontSize: '0.72rem',
                      lineHeight: 1.25,
                    }}
                  >
                    {item.title}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 0.2, display: 'inline-block' }}>
            <Typography
              sx={{
                fontFamily: '"Caveat", cursive',
                fontSize: { xs: '1.4rem', md: '1.75rem' },
                color: '#1D61E7',
                fontWeight: 700,
                transform: 'rotate(-2deg)',
                display: 'block',
                letterSpacing: '0.02em',
              }}
            >
              &ldquo;Better Governance Builds Better Institutions&rdquo;
            </Typography>
          </Box>
        </Box>

        {/* Right Column: Clean Institutional Auth Box */}
        <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 42%' }, maxWidth: { lg: 470, xl: 490 }, width: '100%', mx: { xs: 'auto', lg: 0 } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3, md: 3.2 },
              borderRadius: '22px',
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(28px)',
              border: '1.5px solid rgba(255, 255, 255, 0.95)',
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.12), 0 4px 20px rgba(29, 97, 231, 0.08)',
            }}
          >
            {/* Quick Demo Perspective Switch (Compact Bar matching Image 2) */}
            <Box sx={{ mb: 2.4 }}>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748B',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  display: 'block',
                  mb: 1,
                  textAlign: { xs: 'left', sm: 'center' },
                }}
              >
                Quick Demo Perspective Switch
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  gap: { xs: 0.8, sm: 1 },
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {DEMO_ACCOUNTS.map((acc) => {
                  const isLoggingInThis = loading && activeDemoRole === acc.role;
                  return (
                    <Button
                      key={acc.role}
                      onClick={() => !loading && handleQuickDemoLogin(acc)}
                      disabled={loading}
                      size="small"
                      sx={{
                        px: { xs: 1.2, sm: 1.6 },
                        py: 0.6,
                        borderRadius: '8px',
                        bgcolor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        color: '#334155',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        textTransform: 'none',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        transition: 'all 0.18s ease-in-out',
                        minWidth: 'auto',
                        '&:hover': {
                          bgcolor: acc.bgColor,
                          borderColor: acc.color,
                          color: acc.color,
                          transform: 'translateY(-1px)',
                          boxShadow: `0 4px 10px ${acc.color}20`,
                        },
                      }}
                    >
                      {isLoggingInThis ? (
                        <CircularProgress size={14} sx={{ color: acc.color, mr: 0.5 }} />
                      ) : null}
                      {acc.label}
                    </Button>
                  );
                })}
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, fontSize: '0.7rem', px: 1 }}>
                INSTITUTIONAL SIGN IN
              </Typography>
            </Divider>

            {error && (
              <Alert severity="error" sx={{ mb: 1.8, py: 0.4, borderRadius: '8px', fontSize: '0.8rem' }}>
                {error}
              </Alert>
            )}

            {/* Manual Sign In Form */}
            <Box component="form" onSubmit={handleLoginSubmit} noValidate>
              <Box sx={{ mb: 1.8 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.4, display: 'block', fontSize: '0.78rem' }}>
                  Institutional Email Address *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. 231fa04e50@gmail.com"
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      fontSize: '0.86rem',
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.4, display: 'block', fontSize: '0.78rem' }}>
                  Password *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" sx={{ color: '#94A3B8', p: 0.4 }}>
                            {showPassword ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      fontSize: '0.86rem',
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      size="small"
                      sx={{ p: 0.4, color: '#1D61E7', '&.Mui-checked': { color: '#1D61E7' } }}
                    />
                  }
                  label={<Typography variant="body2" sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 500 }}>Remember me</Typography>}
                />
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.72rem' }}>
                  Default password: <strong>Demo@1234</strong>
                </Typography>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                endIcon={!loading && <ArrowForwardIcon />}
                sx={{
                  py: 1.2,
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  bgcolor: '#1D61E7',
                  background: 'linear-gradient(135deg, #1D61E7 0%, #174EC4 100%)',
                  boxShadow: '0 4px 14px rgba(29, 97, 231, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #174EC4 0%, #133FA2 100%)',
                  },
                }}
              >
                {loading && !activeDemoRole ? <CircularProgress size={22} color="inherit" /> : 'Sign In to Portal'}
              </Button>
            </Box>

            {/* Institutional Seal Footnote */}
            <Box
              sx={{
                p: 1.1,
                mt: 2,
                borderRadius: '10px',
                bgcolor: '#EFF6FF',
                border: '1px solid #DBEAFE',
                display: 'flex',
                gap: 1.1,
                alignItems: 'center',
              }}
            >
              <ShieldIcon sx={{ color: '#1D61E7', fontSize: 18 }} />
              <Typography
                variant="caption"
                sx={{
                  color: '#1E293B',
                  fontWeight: 600,
                  lineHeight: 1.35,
                  display: 'block',
                  fontSize: '0.72rem',
                }}
              >
                Directly connected to Vignan Statutory Database with autonomous compliance auditing.
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Footer Credits */}
      <Box
        sx={{
          textAlign: 'center',
          width: '100%',
          maxWidth: 1380,
          margin: '0 auto',
          pt: 1.5,
        }}
      >
        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.75rem' }}>
          &copy; {new Date().getFullYear()} Vignan's Foundation for Science, Technology &amp; Research (Deemed to be University). All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}

