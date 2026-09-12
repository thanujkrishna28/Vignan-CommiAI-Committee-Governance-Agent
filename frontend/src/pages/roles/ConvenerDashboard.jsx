import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  Chip,
  Paper,
  Divider,
} from '@mui/material';
import {
  EventAvailable as MeetingIcon,
  PlayArrow as PlayIcon,
  Add as AddIcon,
  Description as DraftIcon,
  AssignmentTurnedIn as ActionIcon,
  AutoAwesome as SparkleIcon,
  Schedule as ClockIcon,
} from '@mui/icons-material';
import { meetingsApi, actionsApi } from '../../services/api';
import { useRealtime } from '../../context/SocketContext';
import PortalGreetingBanner from '../../components/common/PortalGreetingBanner';

export default function ConvenerDashboard() {
  const [meetings, setMeetings] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [mList, aList] = await Promise.all([
        meetingsApi.list().catch(() => []),
        actionsApi.list().catch(() => []),
      ]);
      setMeetings(mList || []);
      setActions(aList || []);
    } catch (e) {
      console.error(e);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  useRealtime(['meetings', 'actions'], (payload) => {
    console.log('⚡ [Real-time Convener Dashboard Refresh]', payload);
    loadData(true);
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>
      {/* Convener Header Banner */}
      <PortalGreetingBanner
        roleTitle="Dr. S. V. Phani Kumar"
        badgeText="CONVENER • PROFESSOR & HOD, CSE"
        statusText="Academic Council & Statutory Committee Operations • Prepare meeting notices, conduct sessions with real-time quorum validation, and draft official minutes."
        quoteText="“Procedural Precision. Statutory Rigor. Streamlined Governance.” — Vignan CommiAI Governance Engine"
        accentColor="#D97706"
        actionButtons={
          <>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              component={Link}
              to="/meetings/new"
              sx={{ bgcolor: '#C69214', color: '#0B172E', fontWeight: 700, '&:hover': { bgcolor: '#DFAC36' } }}
            >
              Schedule Meeting
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PlayIcon />}
              component={Link}
              to="/meetings"
              sx={{ color: 'text.primary', borderColor: 'divider', bgcolor: 'background.paper', fontWeight: 600 }}
            >
              Live Meeting Hub
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SparkleIcon sx={{ color: '#F59E0B' }} />}
              component={Link}
              to="/agent"
              sx={{ color: 'text.primary', borderColor: 'divider', bgcolor: 'background.paper', fontWeight: 600 }}
            >
              AI Agenda Builder
            </Button>
          </>
        }
      />

      {/* Convener Quick Stats */}
      <Grid container spacing={1.5} sx={{ width: '100%' }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 1.8, borderRadius: '14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Next Scheduled Session
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.25rem', my: 0.4 }}>
              Academic Council #42
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#10B981' }}>
              <ClockIcon sx={{ fontSize: 15 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.74rem' }}>
                Tomorrow at 10:30 AM
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 1.8, borderRadius: '14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Quorum Readiness
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#10B981', fontSize: '1.5rem', my: 0.4 }}>
              8 / 12 Confirmed
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.74rem' }}>
              Statutory 50% quorum met
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 1.8, borderRadius: '14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Pending Minutes Draft
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#F59E0B', fontSize: '1.5rem', my: 0.4 }}>
              1 Ready
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.74rem' }}>
              Session 41 awaiting submit
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 1.8, borderRadius: '14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Action Items Under Oversight
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.5rem', my: 0.4 }}>
              6 Active Tasks
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.74rem' }}>
              2 due this week
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Main Focus: Live Meeting Management */}
      <Grid container spacing={2.5} sx={{ width: '100%' }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  My Committee Meetings & Live Consoles
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Click to launch live attendance and quorum verification
                </Typography>
              </Box>
              <Chip label="Ready to Convene" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontWeight: 700 }} />
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                mb: 2,
                borderRadius: 2.5,
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      Academic Council - 42nd Regular Session
                    </Typography>
                    <Chip label="AC-2026-01" size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Scheduled: Tomorrow, 10:30 AM • Senate Hall / Hybrid VC • 12 Invited Members
                  </Typography>
                </Box>
                <Chip label="NOTICE DISPATCHED" size="small" color="primary" sx={{ fontWeight: 700 }} />
              </Box>

              <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  AGENDA HIGHLIGHTS:
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.primary', display: 'block' }}>
                  1. Confirmation of 41st Meeting Minutes • 2. AICTE Curriculum 2026 Revision • 3. Ph.D. Viva Approvals • 4. NAAC SSR Committee Status
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  size="small"
                  component={Link}
                  to="/meetings/ac-01"
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  Edit Agenda & Papers
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PlayIcon />}
                  component={Link}
                  to="/meetings/ac-01"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                  }}
                >
                  Launch Live Meeting Console
                </Button>
              </Box>
            </Paper>
          </Card>
        </Grid>

        {/* Convener Quick Tools */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Convener AI Copilot
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              Statutory drafting automations for Member Secretaries
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<SparkleIcon sx={{ color: '#F59E0B' }} />}
                component={Link}
                to="/agent"
                sx={{ justifyContent: 'flex-start', py: 1.2, borderRadius: 2, fontSize: '0.85rem', fontWeight: 600 }}
              >
                Draft Meeting Notice & Agenda
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<DraftIcon sx={{ color: '#2563EB' }} />}
                component={Link}
                to="/meetings"
                sx={{ justifyContent: 'flex-start', py: 1.2, borderRadius: 2, fontSize: '0.85rem', fontWeight: 600 }}
              >
                Generate Minutes from Raw Notes
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ActionIcon sx={{ color: '#10B981' }} />}
                component={Link}
                to="/actions"
                sx={{ justifyContent: 'flex-start', py: 1.2, borderRadius: 2, fontSize: '0.85rem', fontWeight: 600 }}
              >
                Extract Action Items with Owners
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
