import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, useTheme } from '@mui/material';

export default function PortalGreetingBanner({
  roleTitle = 'Registrar',
  statusText = 'Institutional governance status: 10 active bodies, 80% statutory compliance.',
  quoteText = '“Transparency. Statutory Accountability. Academic Excellence.” — Vignan CommiAI Governance Engine',
  accentColor = '#1D61E7',
  badgeText = null,
  actionButtons = null,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic time-based greeting (Good Morning < 12, Good Afternoon 12..17, Good Evening >= 17)
  const hour = currentTime.getHours();
  const timeGreeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const dayOfWeek = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).toUpperCase();
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '18px',
        p: { xs: 2, sm: 2.2, md: 2.5 },
        border: '1.5px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.85)',
        backgroundColor: isDark ? '#0B132B' : '#F8FAFC',
        backgroundImage: isDark
          ? 'linear-gradient(135deg, #0B172E 0%, #0F172A 55%, #1E293B 100%)'
          : 'linear-gradient(135deg, #EEF5FF 0%, #F8FAFC 50%, #FFFFFF 100%)',
        boxShadow: isDark
          ? '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
          : '0 8px 25px -5px rgba(37, 99, 235, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1.2,
        height: '100%',
        minHeight: { xs: 'auto', md: 140 },
      }}
    >
      {/* Right Side Campus Image with Smooth Fade */}
      <Box
        component="img"
        src="/vignan-building.jpg"
        alt="Vignan University Campus"
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: { xs: '55%', sm: '46%', md: '38%' },
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          opacity: isDark ? 0.30 : 0.85,
          maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 25%, rgba(0,0,0,1) 80%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 25%, rgba(0,0,0,1) 80%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Main Top Row Content */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 2,
          position: 'relative',
          zIndex: 2,
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
        }}
      >
        {/* Left Side: Dynamic Greeting & Institutional Status */}
        <Box sx={{ maxWidth: { xs: '100%', sm: '68%', md: '65%' } }}>
          {badgeText && (
            <Chip
              label={badgeText}
              size="small"
              sx={{
                mb: 0.6,
                bgcolor: isDark ? `${accentColor}25` : `${accentColor}15`,
                color: accentColor,
                fontWeight: 800,
                fontSize: '0.67rem',
                border: `1px solid ${accentColor}40`,
                letterSpacing: '0.03em',
                height: 22,
              }}
            />
          )}

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.2rem', sm: '1.38rem', md: '1.55rem' },
              lineHeight: 1.25,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
              flexWrap: 'wrap',
            }}
          >
            <span>
              {timeGreeting},{' '}
              <Box component="span" sx={{ color: accentColor, fontWeight: 900 }}>
                {roleTitle}
              </Box>
            </span>
            <Typography
              component="span"
              sx={{
                fontSize: { xs: '1.2rem', sm: '1.38rem', md: '1.55rem' },
                animation: 'wave 2s infinite',
                display: 'inline-block',
                transformOrigin: '70% 70%',
                lineHeight: 1,
                '@keyframes wave': {
                  '0%': { transform: 'rotate(0deg)' },
                  '10%': { transform: 'rotate(14deg)' },
                  '20%': { transform: 'rotate(-8deg)' },
                  '30%': { transform: 'rotate(14deg)' },
                  '40%': { transform: 'rotate(-4deg)' },
                  '50%': { transform: 'rotate(10deg)' },
                  '60%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(0deg)' },
                },
              }}
            >
              👋
            </Typography>
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mt: 0.4,
              fontSize: { xs: '0.78rem', sm: '0.84rem' },
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            {statusText}
          </Typography>

          {actionButtons && (
            <Box sx={{ display: 'flex', gap: 1.2, mt: 1.4, flexWrap: 'wrap' }}>
              {actionButtons}
            </Box>
          )}
        </Box>

        {/* Right Side: Floating Live Clock & Calendar Widget */}
        <Paper
          elevation={0}
          sx={{
            p: '8px 14px',
            borderRadius: '14px',
            bgcolor: isDark ? 'rgba(15, 23, 42, 0.90)' : 'rgba(255, 255, 255, 0.95)',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(226, 232, 240, 0.95)',
            boxShadow: isDark
              ? '0 6px 20px rgba(0, 0, 0, 0.35)'
              : '0 4px 16px rgba(37, 99, 235, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'flex-start', sm: 'flex-end' },
            backdropFilter: 'blur(12px)',
            flexShrink: 0,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 700,
              fontSize: '0.7rem',
              textTransform: 'capitalize',
            }}
          >
            {dayOfWeek}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              fontSize: '0.86rem',
              letterSpacing: '0.01em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formattedDate}, {formattedTime}
          </Typography>
        </Paper>
      </Box>

      {/* Bottom Subtle Institutional Quote */}
      {quoteText && (
        <Box
          sx={{
            pt: 0.8,
            borderTop: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(226, 232, 240, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            position: 'relative',
            zIndex: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontStyle: 'italic',
              fontWeight: 500,
              color: isDark ? '#94A3B8' : '#64748B',
              fontSize: '0.74rem',
            }}
          >
            {quoteText}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
