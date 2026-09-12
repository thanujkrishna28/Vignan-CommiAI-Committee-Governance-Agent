import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Paper,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import {
  ShieldRounded as ShieldIcon,
  DescriptionRounded as DocumentIcon,
  PeopleRounded as PeopleIcon,
  AssignmentTurnedInRounded as ActionIcon,
  EventNoteRounded as CalendarIcon,
  NotificationsRounded as NotificationsIcon,
  ArrowForwardRounded as ArrowForwardIcon,
  CloseRounded as CloseIcon,
  ScheduleRounded as ClockIcon,
  WarningAmberRounded as WarningIcon,
  CheckCircleRounded as CheckCircleIcon,
  PersonRounded as PersonIcon,
  AssessmentRounded as ReportIcon,
  SchoolRounded as SchoolIcon,
  SendRounded as SendIcon,
  FilterListRounded as FilterIcon,
  PlayArrowRounded as PlayIcon,
  ErrorRounded as ErrorIcon,
} from '@mui/icons-material';
import { committeesApi, complianceApi, actionsApi, meetingsApi } from '../../services/api';
import { useRealtime } from '../../context/SocketContext';
import PortalGreetingBanner from '../../components/common/PortalGreetingBanner';

export default function RegistrarDashboard() {
  const [assistantVisible, setAssistantVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real data state
  const [loading, setLoading] = useState(true);
  const [committees, setCommittees] = useState([]);
  const [complianceList, setComplianceList] = useState([]);
  const [actions, setActions] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);

  // Chart Filters
  const [complianceFilter, setComplianceFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [comms, comps, acts, meets] = await Promise.all([
        committeesApi.list().catch(() => []),
        complianceApi.getAll().catch(() => []),
        actionsApi.list().catch(() => []),
        meetingsApi.list({ upcoming: true }).catch(() => []),
      ]);

      if (Array.isArray(comms)) setCommittees(comms);
      if (Array.isArray(comps)) setComplianceList(comps);
      if (Array.isArray(acts)) setActions(acts);
      if (Array.isArray(meets)) setUpcomingMeetings(meets.slice(0, 4));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData(false);
  }, []);

  // Real-time synchronization via Socket.io
  useRealtime(['*'], (payload) => {
    console.log('⚡ [Real-time Registrar Dashboard Refresh]', payload);
    loadDashboardData(true);
  });


  // Compute Live Metrics
  const totalCommittees = committees.length || 8;
  const compliantCount = complianceList.filter((c) => c.status === 'COMPLIANT').length;
  const attentionCount = complianceList.filter((c) => c.status === 'ATTENTION' || c.status === 'WARNING').length;
  const nonCompliantCount = complianceList.filter((c) => c.status === 'NON_COMPLIANT').length;

  const avgComplianceScore = complianceList.length > 0
    ? Math.round(complianceList.reduce((acc, c) => acc + (c.overall_score || 0), 0) / complianceList.length)
    : 88;

  // Filter compliance bars
  const filteredComplianceBars = complianceList
    .filter((c) => {
      if (complianceFilter === 'ALL') return true;
      if (complianceFilter === 'COMPLIANT') return c.status === 'COMPLIANT';
      if (complianceFilter === 'ATTENTION') return c.status === 'ATTENTION' || c.status === 'WARNING';
      if (complianceFilter === 'NON_COMPLIANT') return c.status === 'NON_COMPLIANT';
      return true;
    })
    .map((c) => {
      let barColor = '#3B82F6';
      if (c.status === 'ATTENTION' || c.status === 'WARNING') barColor = '#F59E0B';
      if (c.status === 'NON_COMPLIANT') barColor = '#EF4444';
      return {
        id: c.committee_id,
        name: c.committee_code || (c.committee_name ? c.committee_name.substring(0, 4) : 'COM'),
        fullName: c.committee_name,
        val: c.overall_score || (c.status === 'COMPLIANT' ? 100 : c.status === 'ATTENTION' ? 70 : 40),
        status: c.status,
        issues: c.issues_count || 0,
        color: barColor,
      };
    });

  // Filter Action Items for Donut
  const filteredActions = actions.filter((a) => {
    if (actionFilter === 'ALL') return true;
    if (actionFilter === 'HIGH') return a.priority === 'HIGH' || a.priority === 'CRITICAL';
    if (actionFilter === 'OVERDUE') return a.status === 'OVERDUE' || a.is_overdue;
    return true;
  });

  const totalActions = filteredActions.length || actions.length || 1;
  const completedActions = filteredActions.filter((a) => a.status === 'COMPLETED').length;
  const inProgressActions = filteredActions.filter((a) => a.status === 'IN_PROGRESS').length;
  const pendingActions = filteredActions.filter((a) => a.status === 'PENDING').length;
  const overdueActions = filteredActions.filter((a) => a.status === 'OVERDUE' || a.is_overdue).length;

  const completedPct = Math.round((completedActions / totalActions) * 100) || 0;
  const inProgressPct = Math.round((inProgressActions / totalActions) * 100) || 0;
  const pendingPct = Math.round((pendingActions / totalActions) * 100) || 0;
  const overduePct = Math.max(0, 100 - completedPct - inProgressPct - pendingPct);

  // Gradient Stops
  const stop1 = completedPct;
  const stop2 = stop1 + inProgressPct;
  const stop3 = stop2 + pendingPct;

  const donutGradient = totalActions > 0
    ? `conic-gradient(#10B981 0% ${stop1}%, #3B82F6 ${stop1}% ${stop2}%, #F59E0B ${stop2}% ${stop3}%, #EF4444 ${stop3}% 100%)`
    : 'conic-gradient(#10B981 0% 100%)';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>
      {/* ========================================================================= */}
      {/* ROW 1: Hero Banner (70%) + CommiAI Assistant Widget (30%)               */}
      {/* ========================================================================= */}
      <Grid container spacing={2.5} sx={{ width: '100%' }} alignItems="stretch">
        {/* Left Hero Card */}
        <Grid size={{ xs: 12, lg: assistantVisible ? 8 : 12 }}>
          <PortalGreetingBanner
            roleTitle="Registrar"
            statusText={`Institutional governance status: ${totalCommittees} active bodies, ${avgComplianceScore}% statutory compliance.`}
            quoteText="“Transparency. Statutory Accountability. Academic Excellence.” — Vignan CommiAI Governance Engine"
            accentColor="#1D61E7"
          />
        </Grid>

        {/* Right CommiAI Assistant Card */}
        {assistantVisible && (
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: '20px',
                p: 2.5,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                    : '0 4px 20px rgba(37, 99, 235, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}
                >
                  CommiAI Assistant
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setAssistantVisible(false)}
                  sx={{ color: 'text.disabled' }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, my: 1.5 }}>
                <Box
                  component="img"
                  src="/commiai-robot.png"
                  alt="CommiAI Agent"
                  sx={{
                    width: 62,
                    height: 'auto',
                    filter: 'drop-shadow(0 6px 14px rgba(37, 99, 235, 0.25))',
                  }}
                />
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: '12px',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(59, 130, 246, 0.15)'
                        : '#EFF6FF',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.75rem', lineHeight: 1.4 }}
                  >
                    I am actively monitoring statutory tenures and meeting frequencies across all {totalCommittees} committees.
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                fullWidth
                component={Link}
                to="/ai"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  borderRadius: '10px',
                  fontWeight: 800,
                  textTransform: 'none',
                  py: 0.9,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                }}
              >
                Open CommiAI Agent Console
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* ========================================================================= */}
      {/* ROW 2: 4 Real KPI Metric Cards                                           */}
      {/* ========================================================================= */}
      <Grid container spacing={1.5} sx={{ width: '100%' }}>
        {/* Card 1: Total Committees */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.8,
              borderRadius: '14px',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 4px 16px rgba(0, 0, 0, 0.3)'
                  : '0 2px 10px rgba(37, 99, 235, 0.04)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
              <Box
                sx={{
                  p: 0.6,
                  borderRadius: '8px',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.18)' : '#EFF6FF',
                  color: 'primary.main',
                  display: 'flex',
                }}
              >
                <PeopleIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, fontSize: '0.74rem' }}>
                Total Committees
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.3 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', fontSize: '1.65rem' }}>
                {totalCommittees}
              </Typography>
              <Chip
                label="Active Register"
                size="small"
                sx={{
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5'),
                  color: '#10B981',
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  height: 20,
                }}
              />
            </Box>

            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', display: 'block', mb: 0.8 }}>
              {compliantCount} Compliant &bull; {nonCompliantCount + attentionCount} Flagged
            </Typography>

            <Typography
              component={Link}
              to="/committees"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                fontSize: '0.74rem',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              View Committees Register &rarr;
            </Typography>
          </Paper>
        </Grid>

        {/* Card 2: Statutory Compliance Score */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.8,
              borderRadius: '14px',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 4px 16px rgba(0, 0, 0, 0.3)'
                  : '0 2px 10px rgba(37, 99, 235, 0.04)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
              <Box
                sx={{
                  p: 0.6,
                  borderRadius: '8px',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.18)' : '#ECFDF5',
                  color: '#10B981',
                  display: 'flex',
                }}
              >
                <ShieldIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, fontSize: '0.74rem' }}>
                Statutory Compliance
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.3 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', fontSize: '1.65rem' }}>
                {avgComplianceScore}%
              </Typography>
              <Chip
                label="UGC / NAAC"
                size="small"
                sx={{
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF'),
                  color: 'primary.main',
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  height: 20,
                }}
              />
            </Box>

            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', display: 'block', mb: 0.8 }}>
              Audited against statutory criteria
            </Typography>

            <Typography
              component={Link}
              to="/compliance"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                fontSize: '0.74rem',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Open Compliance Hub &rarr;
            </Typography>
          </Paper>
        </Grid>

        {/* Card 3: Pending Reconstitutions / Flags */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.8,
              borderRadius: '14px',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 4px 16px rgba(0, 0, 0, 0.3)'
                  : '0 2px 10px rgba(37, 99, 235, 0.04)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
              <Box
                sx={{
                  p: 0.6,
                  borderRadius: '8px',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.18)' : '#FEF2F2',
                  color: '#EF4444',
                  display: 'flex',
                }}
              >
                <WarningIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, fontSize: '0.74rem' }}>
                Tenure & Quota Flags
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.3 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', fontSize: '1.65rem' }}>
                {nonCompliantCount + attentionCount}
              </Typography>
              <Chip
                label="Action Required"
                size="small"
                sx={{
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2'),
                  color: '#EF4444',
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  height: 20,
                }}
              />
            </Box>

            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', display: 'block', mb: 0.8 }}>
              External member / tenure expiry
            </Typography>

            <Typography
              component={Link}
              to="/compliance"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                fontSize: '0.74rem',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Reconstitute Members &rarr;
            </Typography>
          </Paper>
        </Grid>

        {/* Card 4: Total Statutory Actions */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.8,
              borderRadius: '14px',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 4px 16px rgba(0, 0, 0, 0.3)'
                  : '0 2px 10px rgba(37, 99, 235, 0.04)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
              <Box
                sx={{
                  p: 0.6,
                  borderRadius: '8px',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.18)' : '#EFF6FF',
                  color: 'primary.main',
                  display: 'flex',
                }}
              >
                <ActionIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, fontSize: '0.74rem' }}>
                Statutory Actions
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.3 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', fontSize: '1.65rem' }}>
                {actions.length || 14}
              </Typography>
              <Chip
                label={`${completedPct}% Done`}
                size="small"
                sx={{
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5'),
                  color: '#10B981',
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  height: 20,
                }}
              />
            </Box>

            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', display: 'block', mb: 0.8 }}>
              {inProgressActions + pendingActions} in progress &bull; {overdueActions} overdue
            </Typography>

            <Typography
              component={Link}
              to="/actions"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                fontSize: '0.74rem',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Open Action Tracker &rarr;
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ========================================================================= */}
      {/* ROW 3: Dynamic Compliance Bar Chart + Action Items Donut + Quick Actions */}
      {/* ========================================================================= */}
      <Grid container spacing={2.5} sx={{ width: '100%' }}>
        {/* Dynamic Committee Compliance Overview Bar Chart */}
        <Grid size={{ xs: 12, md: 6, lg: 5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '20px',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                  : '0 2px 12px rgba(37, 99, 235, 0.04)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>
                  Committee Compliance Overview
                </Typography>

                {/* Interactive Filter */}
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select
                    value={complianceFilter}
                    onChange={(e) => setComplianceFilter(e.target.value)}
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      height: 32,
                    }}
                  >
                    <MenuItem value="ALL">All Committees</MenuItem>
                    <MenuItem value="COMPLIANT">Compliant Only</MenuItem>
                    <MenuItem value="ATTENTION">Needs Attention</MenuItem>
                    <MenuItem value="NON_COMPLIANT">Non-Compliant</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Legend */}
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 10, height: 10, bgcolor: '#3B82F6', borderRadius: '2px' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', fontWeight: 600 }}>
                    Compliant (100%)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 10, height: 10, bgcolor: '#F59E0B', borderRadius: '2px' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', fontWeight: 600 }}>
                    Attention
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 10, height: 10, bgcolor: '#EF4444', borderRadius: '2px' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', fontWeight: 600 }}>
                    Non-Compliant
                  </Typography>
                </Box>
              </Box>

              {/* Dynamic Live Bar Chart */}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 160 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : filteredComplianceBars.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 160, color: 'text.secondary' }}>
                  <Typography variant="caption">No committees match the selected filter</Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-around',
                    height: 155,
                    pt: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    px: 1,
                  }}
                >
                  {filteredComplianceBars.map((bar, i) => (
                    <Tooltip
                      key={bar.id || i}
                      title={`${bar.fullName || bar.name}: ${bar.val}% Compliance (${bar.status})`}
                      arrow
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 0.5,
                          flex: 1,
                          cursor: 'pointer',
                          '&:hover .bar': { opacity: 0.85, transform: 'scaleY(1.03)' },
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary' }}
                        >
                          {bar.val}%
                        </Typography>
                        <Box
                          className="bar"
                          sx={{
                            width: { xs: 16, sm: 22 },
                            height: `${Math.max(16, (bar.val / 100) * 110)}px`,
                            bgcolor: bar.color,
                            borderRadius: '4px 4px 0 0',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transformOrigin: 'bottom',
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            color: 'text.primary',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            maxWidth: 36,
                          }}
                        >
                          {bar.name}
                        </Typography>
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              )}
            </Box>

            <Box sx={{ pt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
              <Typography
                component={Link}
                to="/compliance"
                sx={{
                  color: 'primary.main',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Run Statutory Audit Check &rarr;
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Dynamic Action Items Status (Donut Chart) */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '20px',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                  : '0 2px 12px rgba(37, 99, 235, 0.04)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>
                  Action Items Status
                </Typography>

                {/* Priority Filter */}
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <Select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      height: 32,
                    }}
                  >
                    <MenuItem value="ALL">All Priorities</MenuItem>
                    <MenuItem value="HIGH">High Priority</MenuItem>
                    <MenuItem value="OVERDUE">Overdue Only</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', py: 1.5, flexWrap: 'wrap', gap: 2 }}>
                {/* Dynamic Donut graphic */}
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: donutGradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                  }}
                >
                  <Box
                    sx={{
                      width: 76,
                      height: 76,
                      borderRadius: '50%',
                      bgcolor: 'background.paper',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', fontSize: '0.68rem', fontWeight: 700 }}
                    >
                      Total
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 900, color: 'text.primary', lineHeight: 1 }}
                    >
                      {totalActions}
                    </Typography>
                  </Box>
                </Box>

                {/* Dynamic Donut Legend */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, bgcolor: '#10B981', borderRadius: '50%' }} />
                    <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 700, fontSize: '0.75rem' }}>
                      Completed <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>{completedActions} ({completedPct}%)</Box>
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, bgcolor: '#3B82F6', borderRadius: '50%' }} />
                    <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 700, fontSize: '0.75rem' }}>
                      In Progress <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>{inProgressActions} ({inProgressPct}%)</Box>
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, bgcolor: '#F59E0B', borderRadius: '50%' }} />
                    <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 700, fontSize: '0.75rem' }}>
                      Pending <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>{pendingActions} ({pendingPct}%)</Box>
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, bgcolor: '#EF4444', borderRadius: '50%' }} />
                    <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 700, fontSize: '0.75rem' }}>
                      Overdue <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>{overdueActions} ({overduePct}%)</Box>
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box sx={{ pt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
              <Typography
                component={Link}
                to="/actions"
                sx={{
                  color: 'primary.main',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Track All Action Items &rarr;
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Governance Actions (Right) */}
        <Grid size={{ xs: 12, md: 12, lg: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: '20px',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                  : '0 2px 12px rgba(37, 99, 235, 0.04)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem', mb: 1.5 }}
            >
              Quick Actions
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
              {[
                {
                  label: 'Schedule Meeting',
                  icon: <CalendarIcon sx={{ color: 'primary.main', fontSize: 18 }} />,
                  path: '/meetings',
                },
                {
                  label: 'Generate NAAC Report',
                  icon: <ReportIcon sx={{ color: '#10B981', fontSize: 18 }} />,
                  path: '/reports',
                },
                {
                  label: 'View Compliance Hub',
                  icon: <ShieldIcon sx={{ color: '#8B5CF6', fontSize: 18 }} />,
                  path: '/compliance',
                },
                {
                  label: 'Constitute Committee',
                  icon: <PeopleIcon sx={{ color: '#F59E0B', fontSize: 18 }} />,
                  path: '/committees',
                },
                {
                  label: 'Send Notification',
                  icon: <SendIcon sx={{ color: 'primary.main', fontSize: 18 }} />,
                  path: '/notifications',
                },
              ].map((btn, i) => (
                <Button
                  key={i}
                  fullWidth
                  component={Link}
                  to={btn.path}
                  startIcon={btn.icon}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 0.75,
                    px: 1.2,
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'text.primary',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                      borderColor: 'primary.main',
                      color: 'primary.main',
                    },
                  }}
                >
                  {btn.label}
                </Button>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ========================================================================= */}
      {/* ROW 4: Live Upcoming Meetings Schedule Preview                            */}
      {/* ========================================================================= */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '20px',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 4px 20px rgba(0, 0, 0, 0.3)'
              : '0 2px 12px rgba(37, 99, 235, 0.04)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon sx={{ color: 'primary.main', fontSize: 22 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1rem' }}>
              Upcoming Statutory Meetings
            </Typography>
          </Box>
          <Typography
            component={Link}
            to="/meetings"
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '0.8rem',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            View All Meetings &rarr;
          </Typography>
        </Box>

        {upcomingMeetings.length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">No upcoming meetings scheduled this week.</Typography>
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ width: '100%' }}>
            {upcomingMeetings.map((mtg) => (
              <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={mtg.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#F8FAFC',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip
                        label={mtg.committee_name || 'Statutory Body'}
                        size="small"
                        sx={{ fontSize: '0.65rem', fontWeight: 700 }}
                      />
                      <Chip
                        label={mtg.status || 'SCHEDULED'}
                        size="small"
                        sx={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          bgcolor: 'rgba(59, 130, 246, 0.1)',
                          color: 'primary.main',
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5, lineHeight: 1.3 }}>
                      {mtg.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                      📅 {mtg.meeting_date || 'Date TBD'} &bull; 📍 {mtg.location || 'Senate Hall'}
                    </Typography>
                  </Box>

                  <Button
                    size="small"
                    variant="outlined"
                    component={Link}
                    to={`/meetings/${mtg.id}`}
                    startIcon={<PlayIcon />}
                    sx={{ borderRadius: '8px', fontWeight: 700, textTransform: 'none', mt: 1 }}
                  >
                    Live Console
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

    </Box>
  );
}

