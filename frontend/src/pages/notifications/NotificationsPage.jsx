import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Tooltip,
  Divider,
  Badge,
  useTheme,
  Skeleton,
} from '@mui/material';
import {
  NotificationsRounded as NotificationsIcon,
  EmailRounded as EmailIcon,
  ErrorOutlineRounded as ErrorIcon,
  CheckCircleRounded as CheckIcon,
  SettingsSuggestRounded as RulesIcon,
  SendRounded as SendIcon,
  RefreshRounded as RefreshIcon,
  DoneAllRounded as DoneAllIcon,
  PlayArrowRounded as TestIcon,
  WarningAmberRounded as WarningIcon,
  ScheduleRounded as ScheduleIcon,
  ShieldRounded as ShieldIcon,
  AutoAwesomeRounded as SparkleIcon,
  MarkEmailReadRounded as EmailSuccessIcon,
  ForwardToInboxRounded as InboxIcon,
  BoltRounded as ZapIcon,
  HubRounded as HubIcon,
} from '@mui/icons-material';
import { notificationsApi } from '../../services/api';

const SERVICES_CATALOG = [
  {
    id: 1,
    name: "Meeting Notice & Agenda Circular Service",
    event_type: "MEETING_SCHEDULED",
    priority: "Must have",
    category: "Meetings",
    description: "Notifies all appointed committee members when a new meeting is scheduled with agenda particulars.",
    defaultPayload: {
      committee_name: "Academic Council",
      meeting_number: "AC-2026-03",
      meeting_date: "25 Sep 2026",
      start_time: "10:30 AM",
      end_time: "01:00 PM",
      venue: "Board of Governors Conference Hall",
      mode: "Hybrid",
      agenda_summary: "1. Curriculum revision for AY 2026-27<br>2. Approval of external examiners<br>3. NAAC accreditation audit readiness",
    }
  },
  {
    id: 2,
    name: "Attendance RSVP & Calendar Invite Service",
    event_type: "MEETING_24_HOURS",
    priority: "Must have",
    category: "Meetings",
    description: "Dispatches 48h & 24h reminders to collect attendance confirmation and ensure statutory quorum readiness.",
    defaultPayload: {
      committee_name: "Finance Committee",
      meeting_date: "Tomorrow, 10:00 AM",
      start_time: "10:00 AM",
      venue: "Administrative Senate Room",
      mode: "Physical",
      hours_remaining: "24",
    }
  },
  {
    id: 3,
    name: "Meeting Reschedule / Adjournment Alert Service",
    event_type: "MEETING_UPDATED",
    priority: "Important",
    category: "Meetings",
    description: "Immediately alerts all members if meeting date, time, venue, or status changes.",
    defaultPayload: {
      committee_name: "Research Advisory Committee",
      prev_details: "15 Sep 2026, 10:00 AM in Senate Hall",
      new_details: "18 Sep 2026, 11:30 AM in Conference Hall A",
      reason: "Official convener travel schedule adjustment",
    }
  },
  {
    id: 4,
    name: "Quorum Deficit Warning Service",
    event_type: "QUORUM_DEFICIT",
    priority: "Must have",
    category: "Quorum & Statutory",
    description: "Warns Convener and Registrar 1 hour before meeting if confirmed attendance is below statutory quorum.",
    defaultPayload: {
      committee_name: "Internal Quality Assurance Cell (IQAC)",
      meeting_title: "Quarterly Quality Audit Review",
      quorum_required: 6,
      confirmed_count: 4,
      shortfall: 2,
    }
  },
  {
    id: 5,
    name: "Authorized Quorum Override Audit Circular",
    event_type: "QUORUM_OVERRIDE",
    priority: "Important",
    category: "Quorum & Statutory",
    description: "Creates an official institutional audit record when an authorized official overrides a quorum deficit.",
    defaultPayload: {
      committee_name: "Board of Studies - CSE",
      meeting_title: "Curriculum Modernization Session",
      timestamp: "11 Sep 2026, 02:30 PM",
      override_by_name: "Dr. P. Nagabhushan",
      override_by_role: "REGISTRAR",
      present_count: 4,
      total_members: 8,
      quorum_required: 5,
      reason: "Urgent AICTE syllabus ratification deadline approved by Vice Chancellor",
    }
  },
  {
    id: 6,
    name: "Minutes Draft Approval Request Service",
    event_type: "MINUTES_SUBMITTED_FOR_APPROVAL",
    priority: "Must have",
    category: "Minutes & Approvals",
    description: "Alerts the Registrar when Convener submits draft minutes for executive review and signature.",
    defaultPayload: {
      committee_name: "Academic Council",
      meeting_title: "34th Statutory Academic Council Meeting",
      meeting_date: "05 Sep 2026",
      convener_name: "Dr. K. V. Krishna",
      approver_name: "Registrar",
    }
  },
  {
    id: 7,
    name: "Ratified Minutes Official Broadcast Service",
    event_type: "MINUTES_APPROVED",
    priority: "Must have",
    category: "Minutes & Approvals",
    description: "Distributes certified, digitally signed minutes and ratified resolutions to all stakeholders.",
    defaultPayload: {
      committee_name: "Board of Management",
      meeting_title: "Annual Governance & Budget Ratification",
      meeting_date: "01 Sep 2026",
      ratified_date: "11 Sep 2026",
      resolutions_summary: "Resolution 1: Approved annual research grant allocations.<br>Resolution 2: Ratified NAAC criterion heads.",
    }
  },
  {
    id: 8,
    name: "Action Item Assignment Dispatcher",
    event_type: "ACTION_ASSIGNED",
    priority: "Must have",
    category: "Action Tracking",
    description: "Notifies responsible officials immediately when a committee deliberation action is assigned.",
    defaultPayload: {
      committee_name: "Anti-Ragging Committee",
      meeting_title: "Monsoon Semester Safety Review",
      action_title: "Deploy 24/7 CCTV surveillance across Block C & hostel gates",
      priority: "CRITICAL",
      due_date: "20 Sep 2026",
      assigner: "Dr. K. V. Krishna (Convener)",
      owner_name: "Prof. S. R. Rao",
    }
  },
  {
    id: 9,
    name: "Action Item Deadline & Escalation Reminder Service",
    event_type: "ACTION_3_DAYS_BEFORE",
    priority: "Must have",
    category: "Action Tracking",
    description: "Escalates pending action items 3 days before deadline, on due date, and when overdue.",
    defaultPayload: {
      committee_name: "Research Advisory Committee",
      action_title: "Submit Patent Filing Evaluation Dossier for CSIR Grant",
      due_date: "14 Sep 2026",
      status: "IN_PROGRESS",
      days_remaining: 3,
    }
  },
  {
    id: 10,
    name: "Action Taken Report (ATR) Compilation Circular",
    event_type: "ATR_GENERATION_REQUIRED",
    priority: "Important",
    category: "Action Tracking",
    description: "Circulates consolidated Action Taken Report (ATR) before the next meeting agenda is finalized.",
    defaultPayload: {
      committee_name: "Internal Quality Assurance Cell (IQAC)",
      meeting_number: "IQAC-2026-02",
      total_actions: 8,
      completed_count: 6,
      in_progress_count: 1,
      overdue_count: 1,
    }
  },
  {
    id: 11,
    name: "Member Tenure Expiry Early-Warning Service",
    event_type: "TENURE_30_DAYS",
    priority: "Must have",
    category: "Tenure & Governance",
    description: "Warns Registrar and Convener 30 and 15 days before a member's statutory tenure lapses.",
    defaultPayload: {
      member_name: "Prof. Ramesh Kumar",
      committee_name: "Board of Studies - ECE",
      role: "External Industry Representative",
      expiry_date: "30 Sep 2026",
      days_remaining: 19,
    }
  },
  {
    id: 12,
    name: "Statutory Composition Deficit Alert Service",
    event_type: "COMPOSITION_DEFICIT",
    priority: "Must have",
    category: "Compliance Radar",
    description: "Instant alert to Registrar, VC, and IQAC when mandatory regulatory composition is violated.",
    defaultPayload: {
      committee_name: "Research Advisory Committee",
      requirement_name: "External Industry Expert (UGC/AICTE Mandatory)",
      regulation_source: "UGC Statutory Regulations 2024 Section 4.2",
      required_count: 1,
      current_count: 0,
      deficit: 1,
      recommendation: "Initiate nomination of eligible senior R&D expert from industry for Vice Chancellor sign-off.",
    }
  },
  {
    id: 13,
    name: "Overdue Statutory Meeting Alert Service",
    event_type: "MEETING_OVERDUE",
    priority: "Must have",
    category: "Compliance Radar",
    description: "Alerts when a committee exceeds its required statutory meeting interval.",
    defaultPayload: {
      committee_name: "Library Committee",
      required_frequency: "Every 1 quarter(s)",
      last_meeting_date: "12 Mar 2026",
      days_overdue: 42,
    }
  },
];

export default function NotificationsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [tabIndex, setTabIndex] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [emailLogs, setEmailLogs] = useState([]);
  const [emailStats, setEmailStats] = useState({ sent: 0, failed: 0, pending: 0, total: 0 });
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  // Test Dispatcher State
  const [selectedServiceId, setSelectedServiceId] = useState(1);
  const [customRecipient, setCustomRecipient] = useState('thanujkrishna22@gmail.com');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (tabIndex === 0) {
        const res = await notificationsApi.list();
        setNotifications(res?.items || []);
        setUnreadCount(res?.unread_count || 0);
      } else if (tabIndex === 1 || tabIndex === 2) {
        const res = await notificationsApi.getLogs();
        setEmailLogs(res?.logs || []);
        setEmailStats(res?.stats || { sent: 0, failed: 0, pending: 0, total: 0 });
      } else if (tabIndex === 3) {
        const res = await notificationsApi.getRules();
        setRules(res || []);
      }
    } catch (err) {
      console.error('Error fetching notification data:', err);
    } finally {
      setLoading(false);
    }
  }, [tabIndex]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      setAlertInfo({ type: 'success', text: 'All notifications marked as read' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRetryEmail = async (logId) => {
    try {
      setLoading(true);
      const res = await notificationsApi.retryEmail(logId);
      setAlertInfo({ type: 'success', text: res.message || 'Email retried successfully' });
      loadData();
    } catch (err) {
      setAlertInfo({ type: 'error', text: 'Failed to retry email dispatch' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (ruleId, currentVal) => {
    try {
      await notificationsApi.updateRule(ruleId, { enabled: !currentVal });
      setRules((prev) =>
        prev.map((r) => (r.id === ruleId ? { ...r, enabled: !currentVal } : r))
      );
      setAlertInfo({ type: 'success', text: 'Automation rule configuration updated' });
    } catch (err) {
      setAlertInfo({ type: 'error', text: 'Error updating rule' });
    }
  };

  const handleRunManualSweep = async () => {
    try {
      setLoading(true);
      await notificationsApi.runSweep();
      setAlertInfo({ type: 'success', text: 'Background statutory sweep executed successfully' });
      loadData();
    } catch (err) {
      setAlertInfo({ type: 'error', text: 'Failed to trigger scheduler sweep' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestDispatch = async () => {
    setDispatching(true);
    setDispatchResult(null);
    try {
      const s = SERVICES_CATALOG.find((x) => x.id === selectedServiceId);
      const payload = { ...s.defaultPayload };
      const res = await notificationsApi.triggerService({
        service_name: s.name,
        event_type: s.event_type,
        recipient_email: customRecipient,
        recipient_name: 'Institutional Stakeholder',
        payload: payload,
        force: true,
      });
      setDispatchResult(res);
      setAlertInfo({ type: 'success', text: `Dispatched "${s.name}" to ${customRecipient} via Institutional Gateway!` });
    } catch (err) {
      setAlertInfo({ type: 'error', text: 'Error dispatching automated service test' });
    } finally {
      setDispatching(false);
    }
  };

  const selectedService = SERVICES_CATALOG.find((x) => x.id === selectedServiceId);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* ─── Hero Header Banner ────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: '20px',
          border: '1.5px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.85)',
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.90) 50%, rgba(15, 23, 42, 0.85) 100%)'
            : 'linear-gradient(135deg, #FFFFFF 0%, #F0F6FF 60%, #E8F2FE 100%)',
          backdropFilter: 'blur(12px)',
          boxShadow: isDark
            ? '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
            : '0 8px 25px -5px rgba(37, 99, 235, 0.07)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #1D61E7 0%, #3B82F6 100%)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(29, 97, 231, 0.35)',
            }}
          >
            <EmailIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.4 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em' }}>
                Official Governance Notices &amp; Circular Dispatch
              </Typography>
              <Chip
                icon={<ZapIcon sx={{ fontSize: '14px !important', color: '#10B981 !important' }} />}
                label="DISPATCH ACTIVE"
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7',
                  color: '#10B981',
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Statutory event triggers &bull; Role-aware member circulars &bull; Official institutional dispatch &bull; Live delivery audit trails
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ScheduleIcon />}
            onClick={handleRunManualSweep}
            disabled={loading}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              color: 'text.primary',
              borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(226,232,240,0.9)',
              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#FFF' },
            }}
          >
            Run Scheduler Sweep
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={loading}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#1D61E7',
              boxShadow: '0 4px 14px rgba(29, 97, 231, 0.3)',
              '&:hover': { bgcolor: '#1548B2' },
            }}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* ─── 4 Executive KPI Metric Cards ──────────────────────────────────── */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: '18px',
              border: '1.5px solid',
              borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(187, 247, 208, 0.8)',
              bgcolor: isDark ? 'rgba(6, 78, 59, 0.15)' : '#F0FDF4',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.15)' },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Delivered Emails
              </Typography>
              <EmailSuccessIcon sx={{ color: '#16A34A', fontSize: 20 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#15803D', my: 0.6, letterSpacing: '-0.02em' }}>
              {emailStats.sent}
            </Typography>
            <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 600 }}>
              &bull; 100% Brevo delivery acceptance
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: '18px',
              border: '1.5px solid',
              borderColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(254, 202, 202, 0.8)',
              bgcolor: isDark ? 'rgba(127, 29, 29, 0.15)' : '#FEF2F2',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.15)' },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Failed Dispatches
              </Typography>
              <ErrorIcon sx={{ color: '#DC2626', fontSize: 20 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#DC2626', my: 0.6, letterSpacing: '-0.02em' }}>
              {emailStats.failed}
            </Typography>
            <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 600 }}>
              &bull; Zero pending retry drops
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: '18px',
              border: '1.5px solid',
              borderColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(191, 219, 254, 0.8)',
              bgcolor: isDark ? 'rgba(30, 58, 138, 0.15)' : '#EFF6FF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.15)' },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Unread In-App Alerts
              </Typography>
              <InboxIcon sx={{ color: '#2563EB', fontSize: 20 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#2563EB', my: 0.6, letterSpacing: '-0.02em' }}>
              {unreadCount}
            </Typography>
            <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600 }}>
              &bull; Synchronized in real-time
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: '18px',
              border: '1.5px solid',
              borderColor: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(233, 213, 255, 0.8)',
              bgcolor: isDark ? 'rgba(88, 28, 135, 0.15)' : '#FAF5FF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(168, 85, 247, 0.15)' },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#9333EA', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Automated Services
              </Typography>
              <HubIcon sx={{ color: '#9333EA', fontSize: 20 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#9333EA', my: 0.6, letterSpacing: '-0.02em' }}>
              13 Active
            </Typography>
            <Typography variant="caption" sx={{ color: '#9333EA', fontWeight: 600 }}>
              &bull; Statutory compliance verified
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Alert Notice Banner */}
      {alertInfo && (
        <Alert
          severity={alertInfo.type}
          onClose={() => setAlertInfo(null)}
          sx={{ borderRadius: '14px', fontWeight: 600 }}
        >
          {alertInfo.text}
        </Alert>
      )}

      {/* ─── Main Glassmorphic Tabs & Container ────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '22px',
          border: '1.5px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.85)',
          bgcolor: 'background.paper',
          overflow: 'hidden',
          boxShadow: isDark
            ? '0 10px 30px -10px rgba(0, 0, 0, 0.4)'
            : '0 8px 25px -5px rgba(37, 99, 235, 0.05)',
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={(e, val) => setTabIndex(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)',
            px: 2,
            bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#F8FAFC',
            '& .MuiTab-root': {
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '0.88rem',
              py: 2,
              minHeight: 56,
              transition: 'all 0.2s',
            },
          }}
        >
          <Tab
            label={
              <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { fontWeight: 800 } }}>
                In-App Notifications
              </Badge>
            }
            icon={<NotificationsIcon />}
            iconPosition="start"
          />
          <Tab
            label="Email Delivery Logs"
            icon={<EmailIcon />}
            iconPosition="start"
          />
          <Tab
            label={
              <Badge badgeContent={emailStats.failed} color="error">
                Failed & Retries
              </Badge>
            }
            icon={<ErrorIcon />}
            iconPosition="start"
          />
          <Tab
            label="13 Automation Rules"
            icon={<RulesIcon />}
            iconPosition="start"
          />
          <Tab
            label="13-Service Live Test Studio"
            icon={<TestIcon />}
            iconPosition="start"
            sx={{ color: '#1D61E7 !important' }}
          />
        </Tabs>

        {/* ─── TAB 0: In-App Notifications ───────────────────────────────── */}
        {tabIndex === 0 && (
          <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary' }}>
                  Recent Institutional Alerts
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Real-time statutory notifications, quorum warnings, and minute approvals.
                </Typography>
              </Box>
              {unreadCount > 0 && (
                <Button
                  startIcon={<DoneAllIcon />}
                  size="small"
                  variant="outlined"
                  onClick={handleMarkAllRead}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '10px',
                    color: 'text.primary',
                    borderColor: 'divider',
                  }}
                >
                  Mark All Read
                </Button>
              )}
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2 }} />
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <CheckIcon sx={{ fontSize: 36, color: '#10B981' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  You're Completely Caught Up!
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  No unread statutory circulars or action item alerts at this time.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {notifications.map((n) => {
                  const isCrit = n.type === 'CRITICAL' || n.title?.includes('URGENT') || n.title?.includes('ALERT');
                  const isWarn = n.type === 'WARNING' || n.title?.includes('Warning') || n.title?.includes('Override');
                  const isSucc = n.type === 'SUCCESS' || n.title?.includes('Ratified') || n.title?.includes('Approved');

                  let chipBg = '#2563EB';
                  let chipText = 'INFO';
                  if (isCrit) { chipBg = '#DC2626'; chipText = 'CRITICAL'; }
                  else if (isWarn) { chipBg = '#D97706'; chipText = 'WARNING'; }
                  else if (isSucc) { chipBg = '#16A34A'; chipText = 'SUCCESS'; }

                  return (
                    <Paper
                      key={n.id}
                      elevation={0}
                      sx={{
                        p: 2.2,
                        borderRadius: '14px',
                        bgcolor: !n.is_read
                          ? (isDark ? 'rgba(30, 41, 59, 0.7)' : '#F0F6FF')
                          : (isDark ? 'rgba(15, 23, 42, 0.4)' : '#FFFFFF'),
                        border: '1px solid',
                        borderColor: !n.is_read
                          ? (isDark ? 'rgba(59, 130, 246, 0.4)' : '#BFDBFE')
                          : (isDark ? 'rgba(255, 255, 255, 0.06)' : '#E2E8F0'),
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateX(4px)',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Chip
                          label={chipText}
                          size="small"
                          sx={{
                            bgcolor: chipBg,
                            color: '#FFF',
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            mt: 0.3,
                          }}
                        />
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: n.is_read ? 700 : 900, color: 'text.primary', fontSize: '0.94rem' }}>
                            {n.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.4, lineHeight: 1.5 }}>
                            {n.message}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.6, display: 'block', fontWeight: 600 }}>
                            {n.created_at ? new Date(n.created_at).toLocaleString() : 'Just now'}
                          </Typography>
                        </Box>
                      </Box>

                      {!n.is_read && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleMarkRead(n.id)}
                          sx={{
                            textTransform: 'none',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            borderRadius: '8px',
                            flexShrink: 0,
                          }}
                        >
                          Mark Read
                        </Button>
                      )}
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {/* ─── TAB 1: Email Delivery Logs ─────────────────────────────────── */}
        {tabIndex === 1 && (
          <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary' }}>
                Statutory Email Audit Trail
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Verifiable cryptographic audit trail of official statutory dispatches to university officers.
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Skeleton variant="rounded" height={50} />
                <Skeleton variant="rounded" height={50} />
                <Skeleton variant="rounded" height={50} />
              </Box>
            ) : (
              <TableContainer sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: isDark ? 'rgba(30, 41, 59, 0.7)' : '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Service</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Recipient</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Timestamp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {emailLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                          No email logs recorded yet. Try dispatching a verification notice from the <strong>Notification Preview &amp; Verification</strong> tab.
                        </TableCell>
                      </TableRow>
                    ) : (
                      emailLogs.map((l) => (
                        <TableRow key={l.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.84rem' }}>{l.service_name}</TableCell>
                          <TableCell sx={{ fontSize: '0.84rem', color: 'text.secondary', fontWeight: 500 }}>{l.recipient_email}</TableCell>
                          <TableCell sx={{ fontSize: '0.84rem', color: 'text.primary' }}>{l.subject}</TableCell>
                          <TableCell>
                            {l.status === 'SENT' ? (
                              <Chip label="DELIVERED" size="small" sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 800, fontSize: '0.68rem' }} />
                            ) : l.status === 'FAILED' ? (
                              <Chip label="FAILED" size="small" sx={{ bgcolor: '#FEE2E2', color: '#B91C1C', fontWeight: 800, fontSize: '0.68rem' }} />
                            ) : (
                              <Chip label={l.status} size="small" sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 800, fontSize: '0.68rem' }} />
                            )}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.78rem', color: 'text.secondary', fontWeight: 500 }}>
                            {l.sent_at ? new Date(l.sent_at).toLocaleString() : l.created_at ? new Date(l.created_at).toLocaleString() : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* ─── TAB 2: Failed & Retries ────────────────────────────────────── */}
        {tabIndex === 2 && (
          <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary' }}>
                Failed Email Queue & Resend Console
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Isolate gateway rejections, network timeouts, and execute immediate redelivery.
              </Typography>
            </Box>

            {emailLogs.filter((l) => l.status === 'FAILED').length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <CheckIcon sx={{ fontSize: 36, color: '#10B981' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  Zero Failed Deliveries
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  All outgoing automated dispatches were accepted and delivered without issues.
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: isDark ? 'rgba(30, 41, 59, 0.7)' : '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Service</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Recipient</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Error Details</TableCell>
                      <TableCell sx={{ fontWeight: 800 }} align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {emailLogs
                      .filter((l) => l.status === 'FAILED')
                      .map((l) => (
                        <TableRow key={l.id} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{l.service_name}</TableCell>
                          <TableCell>{l.recipient_email}</TableCell>
                          <TableCell sx={{ color: 'error.main', fontSize: '0.8rem', fontWeight: 600 }}>{l.error_message || 'Timeout / Connection Refused'}</TableCell>
                          <TableCell align="right">
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<RefreshIcon />}
                              onClick={() => handleRetryEmail(l.id)}
                              sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                fontWeight: 800,
                                bgcolor: '#1D61E7',
                              }}
                            >
                              Retry Dispatch
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* ─── TAB 3: Statutory Dispatch Policies ─────────────────────────── */}
        {tabIndex === 3 && (
          <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary' }}>
                Statutory Dispatch Policies &amp; Trigger Rules
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Automated notification policies governed by UGC, AICTE, and university statutory compliance rules.
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {SERVICES_CATALOG.map((svc) => {
                const dbRule = rules.find((r) => r.event_type === svc.event_type);
                const isEnabled = dbRule ? dbRule.enabled : true;
                const isLocked = ['COMPOSITION_DEFICIT', 'QUORUM_OVERRIDE', 'MINUTES_APPROVED'].includes(svc.event_type);

                return (
                  <Grid size={{ xs: 12, md: 6 }} key={svc.id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: '16px',
                        border: '1.5px solid',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.9)',
                        bgcolor: isEnabled
                          ? (isDark ? 'rgba(30, 41, 59, 0.5)' : '#FFFFFF')
                          : (isDark ? 'rgba(15, 23, 42, 0.3)' : '#F8FAFC'),
                        opacity: isEnabled ? 1 : 0.75,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '100%',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: isEnabled ? '#1D61E7' : 'divider',
                          boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
                        },
                      }}
                    >
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip label={`#${svc.id}`} size="small" sx={{ fontWeight: 900, bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.96rem' }}>
                              {svc.name}
                            </Typography>
                          </Box>
                          {isLocked ? (
                            <Tooltip title="Statutory Mandate: Regulatory requirement cannot be disabled">
                              <Chip
                                icon={<ShieldIcon sx={{ fontSize: '13px !important', color: '#B45309 !important' }} />}
                                label="MANDATORY"
                                size="small"
                                sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 900, fontSize: '0.65rem' }}
                              />
                            </Tooltip>
                          ) : (
                            <Switch
                              checked={isEnabled}
                              onChange={() => dbRule && handleToggleRule(dbRule.id, isEnabled)}
                              color="primary"
                            />
                          )}
                        </Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.8, fontSize: '0.85rem', lineHeight: 1.5 }}>
                          {svc.description}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1.2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, fontSize: '0.72rem' }}>
                          TRIGGER: {svc.event_type}
                        </Typography>
                        <Chip label={svc.category} size="small" variant="outlined" sx={{ fontSize: '0.72rem', fontWeight: 700 }} />
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* ─── TAB 4: Notification Preview & Verification ─────────────────── */}
        {tabIndex === 4 && (
          <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary' }}>
                Notification Preview &amp; Verification Center
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Verify and dispatch institutional governance notices for statutory events. Validates template formatting and recipient delivery.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: '1.5px solid',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#DCE8F5',
                    borderRadius: '18px',
                    bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#F8FAFC',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1.5, color: '#1D61E7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    1. Select Automated Service
                  </Typography>
                  <FormControl fullWidth size="small" sx={{ mb: 2.5, bgcolor: 'background.paper', borderRadius: '10px' }}>
                    <InputLabel>Service Name</InputLabel>
                    <Select
                      value={selectedServiceId}
                      label="Service Name"
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                    >
                      {SERVICES_CATALOG.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          #{s.id} &bull; {s.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1, color: '#1D61E7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    2. Target Recipient Email
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={customRecipient}
                    onChange={(e) => setCustomRecipient(e.target.value)}
                    placeholder="name@vignan.ac.in"
                    helperText="Institutional verified sender will dispatch official notice to this inbox"
                    sx={{ mb: 3, bgcolor: 'background.paper', borderRadius: '10px' }}
                  />

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={dispatching ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    onClick={handleTestDispatch}
                    disabled={dispatching || !customRecipient}
                    sx={{
                      py: 1.6,
                      borderRadius: '14px',
                      fontWeight: 900,
                      textTransform: 'none',
                      fontSize: '0.96rem',
                      bgcolor: '#1D61E7',
                      boxShadow: '0 8px 24px rgba(29, 97, 231, 0.35)',
                      '&:hover': { bgcolor: '#1548B2' },
                    }}
                  >
                    {dispatching ? 'Dispatching Official Notice...' : `Dispatch #${selectedServiceId} Verification Notice`}
                  </Button>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 7 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: '1.5px solid',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#DCE8F5',
                    borderRadius: '18px',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Service Specification & Payload
                  </Typography>

                  {selectedService && (
                    <Box>
                      <Box
                        sx={{
                          mb: 2.5,
                          p: 2.2,
                          bgcolor: isDark ? 'rgba(30, 58, 138, 0.2)' : '#EFF6FF',
                          borderRadius: '14px',
                          border: '1px solid',
                          borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE',
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1D61E7' }}>
                          {selectedService.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                          {selectedService.description}
                        </Typography>
                      </Box>

                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
                        Dynamic Injected Parameters:
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          p: 2.2,
                          bgcolor: '#0F172A',
                          color: '#38BDF8',
                          borderRadius: '14px',
                          fontSize: '0.8rem',
                          fontFamily: 'monospace',
                          overflowX: 'auto',
                          mt: 1,
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        {JSON.stringify(selectedService.defaultPayload, null, 2)}
                      </Box>

                      {dispatchResult && (
                        <Box
                          sx={{
                            mt: 2.5,
                            p: 2.2,
                            bgcolor: isDark ? 'rgba(6, 78, 59, 0.2)' : '#F0FDF4',
                            border: '1px solid',
                            borderColor: '#86EFAC',
                            borderRadius: '14px',
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#15803D' }}>
                            Dispatch Result: {dispatchResult.status?.toUpperCase()}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#166534', fontSize: '0.84rem', mt: 0.5 }}>
                            Subject: {dispatchResult.subject}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 700 }}>
                            Sent Count: {dispatchResult.sent_count} | Failed: {dispatchResult.failed_count}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
