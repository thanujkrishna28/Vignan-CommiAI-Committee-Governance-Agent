import React, { useState, useEffect } from 'react';
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
  FormControlLabel,
  Card,
  CardContent,
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
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  SettingsSuggest as RulesIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  DoneAll as DoneAllIcon,
  PlayArrow as TestIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Gavel as GavelIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { notificationsApi, committeesApi } from '../../services/api';

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

  useEffect(() => {
    loadData();
  }, [tabIndex]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tabIndex === 0) {
        const res = await notificationsApi.list();
        setNotifications(res.items || []);
        setUnreadCount(res.unread_count || 0);
      } else if (tabIndex === 1 || tabIndex === 2) {
        const res = await notificationsApi.getLogs();
        setEmailLogs(res.logs || []);
        setEmailStats(res.stats || { sent: 0, failed: 0, pending: 0, total: 0 });
      } else if (tabIndex === 3) {
        const res = await notificationsApi.getRules();
        setRules(res || []);
      }
    } catch (err) {
      console.error('Error fetching notification data:', err);
    } finally {
      setLoading(false);
    }
  };

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
      setAlertInfo({ type: 'success', text: 'Background compliance & reminder sweep completed' });
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
      setAlertInfo({ type: 'success', text: `Dispatched "${s.name}" to ${customRecipient} via Brevo SMTP!` });
    } catch (err) {
      setAlertInfo({ type: 'error', text: 'Error dispatching automated service test' });
    } finally {
      setDispatching(false);
    }
  };

  const selectedService = SERVICES_CATALOG.find((x) => x.id === selectedServiceId);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              }}
            >
              <EmailIcon />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
                Notification & Email Automation Engine
              </Typography>
              <Typography variant="body2" color="text.secondary">
                13 statutory event services &bull; Role-aware recipient dispatch &bull; Brevo SMTP Relay &bull; Real-time audit logs
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<ScheduleIcon />}
            onClick={handleRunManualSweep}
            disabled={loading}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Run Scheduler Sweep
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={loading}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Global Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, borderRadius: 3, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
              Delivered Emails
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#15803D', mt: 0.5 }}>
              {emailStats.sent}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, borderRadius: 3, bgcolor: '#FEF2F2', border: '1px solid #FECACA' }}>
            <Typography variant="caption" sx={{ color: '#991B1B', fontWeight: 700, textTransform: 'uppercase' }}>
              Failed Dispatches
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#DC2626', mt: 0.5 }}>
              {emailStats.failed}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, borderRadius: 3, bgcolor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <Typography variant="caption" sx={{ color: '#1E40AF', fontWeight: 700, textTransform: 'uppercase' }}>
              Unread In-App Alerts
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#2563EB', mt: 0.5 }}>
              {unreadCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, borderRadius: 3, bgcolor: '#FAF5FF', border: '1px solid #E9D5FF' }}>
            <Typography variant="caption" sx={{ color: '#6B21A8', fontWeight: 700, textTransform: 'uppercase' }}>
              Automated Services
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#9333EA', mt: 0.5 }}>
              13 Active
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {alertInfo && (
        <Alert
          severity={alertInfo.type}
          onClose={() => setAlertInfo(null)}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {alertInfo.text}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Tabs
          value={tabIndex}
          onChange={(e, val) => setTabIndex(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: '1px solid #E2E8F0', px: 2, bgcolor: '#F8FAFC' }}
        >
          <Tab
            label={
              <Badge badgeContent={unreadCount} color="error">
                In-App Notifications
              </Badge>
            }
            icon={<NotificationsIcon />}
            iconPosition="start"
            sx={{ fontWeight: 700, textTransform: 'none', py: 2 }}
          />
          <Tab
            label="Email Delivery Logs"
            icon={<EmailIcon />}
            iconPosition="start"
            sx={{ fontWeight: 700, textTransform: 'none', py: 2 }}
          />
          <Tab
            label={
              <Badge badgeContent={emailStats.failed} color="error">
                Failed & Retries
              </Badge>
            }
            icon={<ErrorIcon />}
            iconPosition="start"
            sx={{ fontWeight: 700, textTransform: 'none', py: 2 }}
          />
          <Tab
            label="13 Automation Rules"
            icon={<RulesIcon />}
            iconPosition="start"
            sx={{ fontWeight: 700, textTransform: 'none', py: 2 }}
          />
          <Tab
            label="13-Service Live Test Studio"
            icon={<TestIcon />}
            iconPosition="start"
            sx={{ fontWeight: 700, textTransform: 'none', py: 2, color: 'primary.main' }}
          />
        </Tabs>

        {/* Tab 0: In-App Notifications */}
        {tabIndex === 0 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Recent Institutional Alerts
              </Typography>
              {unreadCount > 0 && (
                <Button
                  startIcon={<DoneAllIcon />}
                  size="small"
                  onClick={handleMarkAllRead}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Mark All Read
                </Button>
              )}
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <CheckIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="h6">You're completely caught up!</Typography>
                <Typography variant="body2">No pending notifications or unread alerts.</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {notifications.map((n) => {
                  const isCrit = n.type === 'CRITICAL' || n.title.includes('URGENT') || n.title.includes('ALERT');
                  const isWarn = n.type === 'WARNING' || n.title.includes('Warning') || n.title.includes('Override');
                  const isSucc = n.type === 'SUCCESS' || n.title.includes('Ratified') || n.title.includes('Approved');

                  const bgCol = !n.is_read ? (isCrit ? '#FEF2F2' : isWarn ? '#FFFBEB' : isSucc ? '#F0FDF4' : '#EFF6FF') : '#FFFFFF';
                  const borderCol = !n.is_read ? (isCrit ? '#FECACA' : isWarn ? '#FDE68A' : isSucc ? '#BBF7D0' : '#BFDBFE') : '#E2E8F0';

                  return (
                    <Paper
                      key={n.id}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: bgCol,
                        border: `1px solid ${borderCol}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        transition: 'all 0.2s',
                        '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Box sx={{ mt: 0.5 }}>
                          {isCrit ? (
                            <Chip label="CRITICAL" size="small" sx={{ bgcolor: '#DC2626', color: '#FFF', fontWeight: 800, fontSize: 10 }} />
                          ) : isWarn ? (
                            <Chip label="WARNING" size="small" sx={{ bgcolor: '#D97706', color: '#FFF', fontWeight: 800, fontSize: 10 }} />
                          ) : isSucc ? (
                            <Chip label="SUCCESS" size="small" sx={{ bgcolor: '#16A34A', color: '#FFF', fontWeight: 800, fontSize: 10 }} />
                          ) : (
                            <Chip label="INFO" size="small" sx={{ bgcolor: '#2563EB', color: '#FFF', fontWeight: 800, fontSize: 10 }} />
                          )}
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: n.is_read ? 600 : 800, color: 'text.primary' }}>
                            {n.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3 }}>
                            {n.message}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}>
                            {n.created_at ? new Date(n.created_at).toLocaleString() : 'Just now'}
                          </Typography>
                        </Box>
                      </Box>

                      {!n.is_read && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleMarkRead(n.id)}
                          sx={{ textTransform: 'none', fontSize: 12, borderRadius: 1.5 }}
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

        {/* Tab 1: Email Delivery Logs */}
        {tabIndex === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Statutory Email Audit Trail
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Service</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Recipient</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {emailLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          No email logs recorded yet. Try dispatching from the Test Studio tab.
                        </TableCell>
                      </TableRow>
                    ) : (
                      emailLogs.map((l) => (
                        <TableRow key={l.id} hover>
                          <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>{l.service_name}</TableCell>
                          <TableCell sx={{ fontSize: 13, color: 'text.secondary' }}>{l.recipient_email}</TableCell>
                          <TableCell sx={{ fontSize: 13 }}>{l.subject}</TableCell>
                          <TableCell>
                            {l.status === 'SENT' ? (
                              <Chip label="DELIVERED" size="small" sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700, fontSize: 11 }} />
                            ) : l.status === 'FAILED' ? (
                              <Chip label="FAILED" size="small" sx={{ bgcolor: '#FEE2E2', color: '#B91C1C', fontWeight: 700, fontSize: 11 }} />
                            ) : (
                              <Chip label={l.status} size="small" sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 700, fontSize: 11 }} />
                            )}
                          </TableCell>
                          <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>
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

        {/* Tab 2: Failed Emails & Retry */}
        {tabIndex === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Failed Email Queue & Resend Console
            </Typography>
            {emailLogs.filter((l) => l.status === 'FAILED').length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <CheckIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="h6">Zero Failed Deliveries</Typography>
                <Typography variant="body2">All dispatched emails were accepted by Brevo SMTP relay.</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Service</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Recipient</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Error Details</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {emailLogs
                      .filter((l) => l.status === 'FAILED')
                      .map((l) => (
                        <TableRow key={l.id}>
                          <TableCell sx={{ fontWeight: 600 }}>{l.service_name}</TableCell>
                          <TableCell>{l.recipient_email}</TableCell>
                          <TableCell sx={{ color: 'error.main', fontSize: 12 }}>{l.error_message || 'SMTP Timeout'}</TableCell>
                          <TableCell align="right">
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<RefreshIcon />}
                              onClick={() => handleRetryEmail(l.id)}
                              sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700 }}
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

        {/* Tab 3: 13 Automation Rules */}
        {tabIndex === 3 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                13 Automated Governance Email Rules
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toggle automated event triggers. Note: Statutory critical circulars (e.g. Composition Deficit, Quorum Override) cannot be disabled.
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {SERVICES_CATALOG.map((svc) => {
                const dbRule = rules.find((r) => r.event_type === svc.event_type);
                const isEnabled = dbRule ? dbRule.enabled : true;
                const isLocked = ['COMPOSITION_DEFICIT', 'QUORUM_OVERRIDE', 'MINUTES_APPROVED'].includes(svc.event_type);

                return (
                  <Grid item xs={12} md={6} key={svc.id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 2.5,
                        border: '1px solid #E2E8F0',
                        bgcolor: isEnabled ? '#FFFFFF' : '#F8FAFC',
                        opacity: isEnabled ? 1 : 0.75,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '100%',
                      }}
                    >
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip label={`#${svc.id}`} size="small" sx={{ fontWeight: 800, bgcolor: '#E2E8F0' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                              {svc.name}
                            </Typography>
                          </Box>
                          {isLocked ? (
                            <Tooltip title="Statutory Requirement: This alert cannot be disabled">
                              <Chip
                                icon={<ShieldIcon sx={{ fontSize: '14px !important' }} />}
                                label="MANDATORY"
                                size="small"
                                sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 800, fontSize: 10 }}
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
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                          {svc.description}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #F1F5F9' }}>
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                          TRIGGER: {svc.event_type}
                        </Typography>
                        <Chip label={svc.category} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* Tab 4: 13-Service Live Test Studio */}
        {tabIndex === 4 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                13-Service Live Demonstration Studio
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trigger real Brevo SMTP emails for any of the 13 automated services. Evaluates template rendering, dynamic resolution, and audit logging.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <Paper elevation={0} sx={{ p: 3, border: '1px solid #DCE8F5', borderRadius: 3, bgcolor: '#F8FAFC' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'primary.main', textTransform: 'uppercase' }}>
                    1. Select Automated Service
                  </Typography>
                  <FormControl fullWidth size="small" sx={{ mb: 2.5, bgcolor: '#FFF' }}>
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

                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'primary.main', textTransform: 'uppercase' }}>
                    2. Target Recipient Email
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={customRecipient}
                    onChange={(e) => setCustomRecipient(e.target.value)}
                    placeholder="name@vignan.ac.in"
                    helperText="Brevo verified sender will dispatch real email to this inbox"
                    sx={{ mb: 3, bgcolor: '#FFF' }}
                  />

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={dispatching ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    onClick={handleTestDispatch}
                    disabled={dispatching || !customRecipient}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 800,
                      textTransform: 'none',
                      fontSize: 15,
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                    }}
                  >
                    {dispatching ? 'Dispatching via Brevo...' : `Dispatch #${selectedServiceId} Live Email`}
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12} md={7}>
                <Paper elevation={0} sx={{ p: 3, border: '1px solid #DCE8F5', borderRadius: 3, bgcolor: '#FFFFFF' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'text.secondary', textTransform: 'uppercase' }}>
                    Service Specification & Payload
                  </Typography>

                  {selectedService && (
                    <Box>
                      <Box sx={{ mb: 2, p: 2, bgcolor: '#EFF6FF', borderRadius: 2, border: '1px solid #BFDBFE' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E40AF' }}>
                          {selectedService.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#3B82F6', mt: 0.5 }}>
                          {selectedService.description}
                        </Typography>
                      </Box>

                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                        Dynamic Data Injected into Template:
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          p: 2,
                          bgcolor: '#0F172A',
                          color: '#38BDF8',
                          borderRadius: 2,
                          fontSize: 12,
                          overflowX: 'auto',
                          mt: 1,
                        }}
                      >
                        {JSON.stringify(selectedService.defaultPayload, null, 2)}
                      </Box>

                      {dispatchResult && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#15803D' }}>
                            Dispatch Result: {dispatchResult.status.toUpperCase()}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#166534', fontSize: 13, mt: 0.5 }}>
                            Subject: {dispatchResult.subject}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#15803D' }}>
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
