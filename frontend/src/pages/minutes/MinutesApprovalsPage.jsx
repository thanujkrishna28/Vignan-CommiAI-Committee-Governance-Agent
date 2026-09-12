import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  DescriptionRounded as MinutesIcon,
  CheckCircleRounded as ApprovedIcon,
  PendingActionsRounded as PendingIcon,
  EditNoteRounded as DraftIcon,
  DrawRounded as SignatureIcon,
  VisibilityRounded as ViewIcon,
  VerifiedUserRounded as VerifiedIcon,
  SearchRounded as SearchIcon,
  Add as AddIcon,
  AutoAwesome as SparkleIcon,
  MailOutlineRounded as MailIcon,
  RefreshRounded as ResendIcon,
  LockRounded as LockIcon,
} from '@mui/icons-material';
import { minutesApi, meetingsApi, getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/SocketContext';

export default function MinutesApprovalsPage() {
  const { user } = useAuth();
  const [minutesList, setMinutesList] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMom, setSelectedMom] = useState(null);
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Email OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  // Resend Countdown Timer
  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setInterval(() => setResendCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // New Minutes Draft State
  const [newMinutes, setNewMinutes] = useState({
    meeting_id: '',
    summary: '',
    discussion: '',
    decisions: '',
    conclusion: '',
  });

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError('');
    try {
      const [minutesData, meetingsData] = await Promise.all([
        minutesApi.list().catch(() => []),
        meetingsApi.list().catch(() => []),
      ]);
      setMinutesList(Array.isArray(minutesData) ? minutesData : []);
      setMeetings(Array.isArray(meetingsData) ? meetingsData : []);
      if (meetingsData && meetingsData.length > 0 && !newMinutes.meeting_id) {
        setNewMinutes((prev) => ({ ...prev, meeting_id: meetingsData[0].id }));
      }
    } catch (err) {
      console.error('Error loading minutes:', err);
      if (!isSilent) setError('Failed to load minutes records from live database.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [newMinutes.meeting_id]);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Real-time synchronization via Socket.io
  useRealtime(['minutes', 'meetings'], (payload) => {
    console.log('⚡ [Real-time Minutes Event Received]', payload);
    loadData(true);
  });


  const handleSendOtp = async (momId) => {
    const id = momId || selectedMom?.id;
    if (!id) return;
    setOtpSending(true);
    setOtpError('');
    setOtpMessage('');
    try {
      const res = await minutesApi.requestOtp(id);
      setOtpSent(true);
      setOtpMessage(res.message || `Verification code sent to ${res.email || user?.email || 'your email'}`);
      setResendCountdown(45);
    } catch (err) {
      console.error('OTP request error:', err);
      setOtpError(getErrorMessage(err, 'Failed to dispatch verification OTP to email.'));
    } finally {
      setOtpSending(false);
    }
  };

  const handleOpenSignModal = (mom) => {
    setSelectedMom(mom);
    setPinCode('');
    setOtpSent(false);
    setOtpMessage('');
    setOtpError('');
    setResendCountdown(0);
    setSignModalOpen(true);
    // Auto-request OTP when opening the signature modal
    handleSendOtp(mom.id);
  };

  const handleApplySignature = async () => {
    if (!pinCode.trim()) {
      alert('Please enter the 6-digit verification code received in your email.');
      return;
    }
    setSubmitting(true);
    try {
      await minutesApi.approve(selectedMom.id, {
        otp: pinCode.trim(),
        comments: `Ratified via email OTP digital signature by ${user?.name || 'Authorized Signatory'}`,
      });
      setSignModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Approval error:', err);
      alert(getErrorMessage(err, 'Failed to apply approval signature. Please verify your OTP code.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateMinutes = async (e) => {
    e.preventDefault();
    if (!newMinutes.meeting_id || !newMinutes.summary.trim()) {
      alert('Please select a meeting and provide a summary of resolutions.');
      return;
    }
    setSubmitting(true);
    try {
      await minutesApi.create({
        meeting_id: newMinutes.meeting_id,
        summary: newMinutes.summary,
        discussion: newMinutes.discussion || undefined,
        decisions: newMinutes.decisions || undefined,
        conclusion: newMinutes.conclusion || undefined,
      });
      setCreateModalOpen(false);
      setNewMinutes({
        meeting_id: meetings[0]?.id || '',
        summary: '',
        discussion: '',
        decisions: '',
        conclusion: '',
      });
      loadData();
    } catch (err) {
      console.error('Create minutes error:', err);
      alert(getErrorMessage(err, 'Failed to save minutes draft.'));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMinutes = minutesList.filter((m) => {
    const status = (m.status || 'DRAFT').toUpperCase();
    const matchesFilter =
      selectedFilter === 'ALL' ||
      (selectedFilter === 'PENDING' && (status === 'PENDING_REVIEW' || status === 'PENDING_SIGNATURE')) ||
      (selectedFilter === 'APPROVED' && (status === 'APPROVED' || status === 'SIGNED')) ||
      (selectedFilter === 'DRAFT' && status === 'DRAFT');

    const search = searchTerm.toLowerCase();
    const comm = (m.committee_name || '').toLowerCase();
    const title = (m.meeting_title || '').toLowerCase();
    const id = (m.id || '').toLowerCase();

    return matchesFilter && (comm.includes(search) || title.includes(search) || id.includes(search));
  });

  return (
    <Box>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
            Minutes of Meeting (MoM) &amp; Digital Signatures
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Live legal archives, statutory resolution sign-offs, and NAAC SSR Criterion 6.2.2 compliance documentation.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateModalOpen(true)}
          sx={{ fontWeight: 700, borderRadius: '10px' }}
        >
          Draft New Minutes
        </Button>
      </Box>

      {/* Filter & Search Controls */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search by meeting title, committee, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 320, flex: 1 }}
        />

        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel shrink>Workflow Status</InputLabel>
          <Select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} label="Workflow Status">
            <MenuItem value="ALL">All Records</MenuItem>
            <MenuItem value="DRAFT">Drafts</MenuItem>
            <MenuItem value="PENDING">Pending Signatures</MenuItem>
            <MenuItem value="APPROVED">Approved &amp; Sealed</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Table Card */}
      <Card sx={{ p: 0, borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading minutes archives from live database...</Typography>
          </Box>
        ) : filteredMinutes.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <MinutesIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              No Minutes Recorded
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, maxWidth: 400, mx: 'auto' }}>
              {searchTerm ? 'No minutes match your search query.' : 'No meeting minutes have been drafted yet. Click below to draft official minutes.'}
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateModalOpen(true)}>
              Draft First Minutes of Meeting
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 800 }}>Committee &amp; Meeting Title</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Meeting Date</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Resolution Summary</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Workflow Status</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">Digital Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMinutes.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                          <MinutesIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {m.meeting_title || 'Statutory Session'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {m.committee_name || 'Institutional Committee'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.84rem' }}>
                        {m.meeting_date ? new Date(m.meeting_date).toLocaleDateString() : 'Recorded'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 320 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.summary || 'Summary notes available upon opening.'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={m.status || 'DRAFT'}
                        size="small"
                        color={m.status === 'APPROVED' || m.status === 'SIGNED' ? 'success' : m.status === 'PENDING_REVIEW' ? 'warning' : 'default'}
                        sx={{ fontWeight: 800, fontSize: '0.68rem' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {m.status !== 'APPROVED' && m.status !== 'SIGNED' ? (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<SignatureIcon />}
                          onClick={() => handleOpenSignModal(m)}
                          sx={{ fontSize: '0.75rem', fontWeight: 700, borderRadius: '8px' }}
                        >
                          Sign / Approve
                        </Button>
                      ) : (
                        <Chip
                          icon={<VerifiedIcon sx={{ fontSize: '14px !important' }} />}
                          label="Sealed &amp; Ratified"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* ─── Draft New Minutes Modal Dialog ─────────────────────────────── */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pt: '24px !important' }}>Draft Statutory Minutes of Meeting</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <FormControl fullWidth>
            <InputLabel shrink>Associated Meeting *</InputLabel>
            <Select
              value={newMinutes.meeting_id}
              onChange={(e) => setNewMinutes({ ...newMinutes, meeting_id: e.target.value })}
              label="Associated Meeting *"
            >
              {meetings.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.title} &mdash; {m.committee?.name || 'Committee'} ({m.meeting_date})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Executive Summary &amp; Key Resolutions *"
            fullWidth
            multiline
            rows={4}
            value={newMinutes.summary}
            onChange={(e) => setNewMinutes({ ...newMinutes, summary: e.target.value })}
            placeholder="Summarize the core decisions, statutory approvals, curriculum changes, and budgets sanctioned..."
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Discussions &amp; Deliberations (Optional)"
            fullWidth
            multiline
            rows={3}
            value={newMinutes.discussion}
            onChange={(e) => setNewMinutes({ ...newMinutes, discussion: e.target.value })}
            placeholder="Record major discussions, questions raised by external members, and responses..."
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Formal Decisions &amp; Action Items (Optional)"
            fullWidth
            multiline
            rows={3}
            value={newMinutes.decisions}
            onChange={(e) => setNewMinutes({ ...newMinutes, decisions: e.target.value })}
            placeholder="Itemize resolved action points with designated responsibility..."
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCreateModalOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateMinutes} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Official Minutes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Digital Sign-off Modal Dialog with Email OTP ──────────────────────────────── */}
      <Dialog
        open={signModalOpen}
        onClose={() => setSignModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, pb: 0.5, pt: 2, px: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'rgba(37, 99, 235, 0.12)', color: 'primary.main', width: 44, height: 44 }}>
            <SignatureIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
              Apply Official Digital Sign-off
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Statutory Ratification &amp; NAAC SSR Criterion 6.2.2 Archival
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '20px !important', px: 2.5 }}>
          {/* Meeting & Committee Context Card */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '14px',
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
              Statutory Resolution to Ratify
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.5 }}>
              {selectedMom?.meeting_title || 'Committee Meeting Session'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700 }}>
              {selectedMom?.committee_name || 'Statutory Governance Body'}
            </Typography>
          </Paper>

          {/* Email OTP Notice Box */}
          <Box
            sx={{
              p: 2,
              borderRadius: '14px',
              bgcolor: 'rgba(37, 99, 235, 0.05)',
              border: '1px solid rgba(37, 99, 235, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MailIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Verification OTP via Institutional Mail
                </Typography>
              </Box>
              {otpSending && <CircularProgress size={16} />}
            </Box>

            <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
              A 6-digit security sign-off code has been dispatched to your official email:{' '}
              <strong style={{ color: '#2563eb' }}>{user?.email || 'registered institutional email'}</strong>
            </Typography>

            {otpMessage && (
              <Alert severity="success" sx={{ py: 0.5, px: 1.5, borderRadius: '10px', fontSize: '0.8rem', mt: 0.5 }}>
                {otpMessage}
              </Alert>
            )}

            {otpError && (
              <Alert severity="warning" sx={{ py: 0.5, px: 1.5, borderRadius: '10px', fontSize: '0.8rem', mt: 0.5 }}>
                {otpError}
              </Alert>
            )}
          </Box>

          {/* OTP Input & Resend Controls */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField
              label="Enter 6-Digit Email Verification OTP *"
              fullWidth
              autoFocus
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="e.g. 849201"
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    fontSize: '1.25rem',
                    letterSpacing: '6px',
                    fontWeight: 800,
                    textAlign: 'center',
                    borderRadius: '12px',
                  },
                },
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Code expires in 10 minutes.
              </Typography>
              <Button
                size="small"
                startIcon={<ResendIcon />}
                onClick={() => handleSendOtp(selectedMom?.id)}
                disabled={otpSending || resendCountdown > 0}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8rem' }}
              >
                {resendCountdown > 0 ? `Resend Code (${resendCountdown}s)` : 'Resend OTP to Mail'}
              </Button>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
          <Button onClick={() => setSignModalOpen(false)} sx={{ fontWeight: 700, borderRadius: '10px', color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleApplySignature}
            disabled={submitting || !pinCode.trim()}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <VerifiedIcon />}
            sx={{
              fontWeight: 800,
              borderRadius: '12px',
              px: 3,
              py: 1,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)',
            }}
          >
            {submitting ? 'Authenticating...' : 'Verify OTP & Ratify MoM'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
