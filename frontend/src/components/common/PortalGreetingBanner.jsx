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
        borderRadius: '20px',
        p: { xs: 2.5, sm: 3, md: 3.2 },
        border: '1.5px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.85)',
        backgroundColor: isDark ? '#0B132B' : '#F8FAFC',
        backgroundImage: isDark
          ? `linear-gradient(135deg, rgba(11, 23, 46, 0.96) 0%, rgba(15, 23, 42, 0.91) 48%, rgba(15, 23, 42, 0.72) 100%), url('/vignan-building.jpg')`
          : `linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 246, 255, 0.92) 48%, rgba(240, 246, 255, 0.70) 100%), url('/vignan-building.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center right',
        backdropFilter: 'blur(12px)',
        boxShadow: isDark
          ? '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
          : '0 8px 25px -5px rgba(37, 99, 235, 0.07)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 2,
        minHeight: { xs: 'auto', md: 160 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Left Side: Dynamic Greeting & Institutional Status */}
        <Box sx={{ maxWidth: { xs: '100%', md: '72%' } }}>
          {badgeText && (
            <Chip
              label={badgeText}
              size="small"
              sx={{
                mb: 1,
                bgcolor: isDark ? `${accentColor}25` : `${accentColor}15`,
                color: accentColor,
                fontWeight: 800,
                fontSize: '0.68rem',
                border: `1px solid ${accentColor}40`,
                letterSpacing: '0.04em',
              }}
            />
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: 'text.primary',
                letterSpacing: '-0.03em',
                fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.1rem' },
                lineHeight: 1.2,
              }}
            >
              {timeGreeting},{' '}
              <Box component="span" sx={{ color: accentColor }}>
                {roleTitle}
              </Box>
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.1rem' },
                animation: 'wave 2s infinite',
                display: 'inline-block',
                transformOrigin: '70% 70%',
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
          </Box>

          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              mt: 0.8,
              fontSize: { xs: '0.85rem', sm: '0.96rem' },
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            {statusText}
          </Typography>

          {actionButtons && (
            <Box sx={{ display: 'flex', gap: 1.5, mt: 1.8, flexWrap: 'wrap' }}>
              {actionButtons}
            </Box>
          )}
        </Box>

        {/* Right Side: Floating Live Clock & Calendar Widget (exact match to screenshot 2) */}
        <Paper
          elevation={0}
          sx={{
            p: '10px 18px',
            borderRadius: '16px',
            bgcolor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.95)',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(226, 232, 240, 0.95)',
            boxShadow: isDark
              ? '0 8px 24px rgba(0, 0, 0, 0.35)'
              : '0 6px 20px rgba(37, 99, 235, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'flex-start', sm: 'flex-end' },
            backdropFilter: 'blur(12px)',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 700,
              fontSize: '0.74rem',
              textTransform: 'capitalize',
            }}
          >
            {dayOfWeek}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 900,
              color: 'text.primary',
              fontSize: '0.92rem',
              letterSpacing: '0.02em',
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
            pt: 1.2,
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
              fontWeight: 600,
              color: isDark ? '#94A3B8' : '#64748B',
              fontSize: '0.78rem',
            }}
          >
            {quoteText}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
