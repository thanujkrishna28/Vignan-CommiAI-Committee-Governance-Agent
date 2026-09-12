import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Paper,
  Divider,
  Grid,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Event as EventIcon,
  PlayArrow as PlayIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  CheckCircle as SuccessIcon,
  Schedule as ScheduleIcon,
  Videocam as VideoIcon,
  AssignmentTurnedIn as QuorumIcon,
  Article as MinutesIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { meetingsApi, committeesApi } from '../../services/api';
import { useRealtime } from '../../context/SocketContext';

export default function MeetingsListPage() {
  const [meetings, setMeetings] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    committee_id: '',
    meeting_number: '',
    meeting_date: '',
    start_time: '10:30',
    end_time: '12:30',
    location: 'Senate Hall / Hybrid VC',
    meeting_mode: 'HYBRID',
    agenda_text: 'Review of statutory mandates and governance compliance.',
  });

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [meetingsData, committeesData] = await Promise.all([
        meetingsApi.list().catch(() => []),
        committeesApi.list().catch(() => []),
      ]);

      if (Array.isArray(committeesData)) {
        setCommittees(committeesData);
      }

      if (Array.isArray(meetingsData)) {
        setMeetings(meetingsData);
      } else {
        setMeetings([]);
      }
    } catch (err) {
      console.error('Error loading meetings:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Real-time synchronization via Socket.io
  useRealtime(['meetings', 'committees'], (payload) => {
    console.log('⚡ [Real-time Meetings Event Received]', payload);
    loadData(true);
  });


  const handleCreate = async () => {
    if (!newMeeting.title?.trim() || !newMeeting.committee_id || !newMeeting.meeting_date) {
      alert('Please fill in Session Title, Committee, and Meeting Date');
      return;
    }
    try {
      const payload = {
        title: newMeeting.title.trim(),
        committee_id: newMeeting.committee_id,
        meeting_number: newMeeting.meeting_number?.trim() || `MTG-${Date.now().toString().slice(-4)}`,
        meeting_date: newMeeting.meeting_date || null,
        start_time: newMeeting.start_time || null,
        end_time: newMeeting.end_time || null,
        location: newMeeting.location?.trim() || 'Senate Hall / Hybrid VC',
        meeting_mode: newMeeting.meeting_mode || 'HYBRID',
        agenda_text: newMeeting.agenda_text?.trim() || '',
      };
      await meetingsApi.create(payload);
      setOpenModal(false);
      setNewMeeting({
        title: '',
        committee_id: '',
        meeting_number: '',
        meeting_date: '',
        start_time: '10:30',
        end_time: '12:30',
        location: 'Senate Hall / Hybrid VC',
        meeting_mode: 'HYBRID',
        agenda_text: '',
      });
      loadData();
    } catch (e) {
      const detail = e?.response?.data?.detail;
      let errorMsg = 'Failed to schedule session: ';
      if (Array.isArray(detail)) {
        errorMsg += detail.map((item) => `${item.loc?.slice(-1)[0] || 'field'}: ${item.msg}`).join(', ');
      } else if (typeof detail === 'object' && detail !== null) {
        errorMsg += JSON.stringify(detail);
      } else if (typeof detail === 'string') {
        errorMsg += detail;
      } else {
        errorMsg += e.message || 'Unknown error occurred';
      }
      alert(errorMsg);
    }
  };

  const filtered = meetings.filter((m) => {
    const titleMatch = (m.title || '').toLowerCase().includes(search.toLowerCase());
    const commMatch = (m.committee_name || '').toLowerCase().includes(search.toLowerCase());
    const matchSearch = titleMatch || commMatch;

    if (!matchSearch) return false;
    if (filter === 'ALL') return true;
    if (filter === 'UPCOMING') return m.status === 'SCHEDULED' || m.status === 'NOTICE_SENT';
    if (filter === 'COMPLETED') return m.status === 'COMPLETED';
    if (filter === 'OVERDUE') return m.status === 'OVERDUE';
    return true;
  });

  const formatMeetingDateTime = (mDate, mTime) => {
    if (!mDate) return 'Date to be scheduled';
    try {
      const d = new Date(`${mDate}T${mTime || '00:00'}`);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: mTime ? '2-digit' : undefined,
        minute: mTime ? '2-digit' : undefined,
      });
    } catch {
      return `${mDate} ${mTime || ''}`;
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Chip
            label="COMPLETED"
            size="small"
            icon={<SuccessIcon sx={{ fontSize: '14px !important', color: '#10B981' }} />}
            sx={{
              fontWeight: 800,
              fontSize: '0.68rem',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5'),
              color: '#10B981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          />
        );
      case 'NOTICE_SENT':
      case 'SCHEDULED':
        return (
          <Chip
            label={status.replace('_', ' ')}
            size="small"
            icon={<ScheduleIcon sx={{ fontSize: '14px !important', color: '#3B82F6' }} />}
            sx={{
              fontWeight: 800,
              fontSize: '0.68rem',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF'),
              color: '#3B82F6',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}
          />
        );
      case 'OVERDUE':
        return (
          <Chip
            label="OVERDUE"
            size="small"
            icon={<WarningIcon sx={{ fontSize: '14px !important', color: '#EF4444' }} />}
            sx={{
              fontWeight: 800,
              fontSize: '0.68rem',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2'),
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          />
        );
      default:
        return (
          <Chip
            label={status || 'ACTIVE'}
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '0.68rem',
              bgcolor: 'action.hover',
              color: 'text.secondary',
            }}
          />
        );
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em' }}>
            Statutory Meetings & Quorum Console
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Convene sessions, enforce statutory quorum validation, manage live attendance, and track minutes.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{
            fontWeight: 800,
            borderRadius: '12px',
            px: 2.5,
            py: 1,
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
          }}
        >
          Convene New Session
        </Button>
      </Box>

      {/* Filter and Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '16px',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TextField
          size="small"
          placeholder="Search meetings by title or committee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: { xs: '100%', sm: 340 } }}
        />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Sessions' },
            { id: 'UPCOMING', label: 'Upcoming / Scheduled' },
            { id: 'COMPLETED', label: 'Concluded & Minutes' },
            { id: 'OVERDUE', label: 'Overdue' },
          ].map((tab) => (
            <Chip
              key={tab.id}
              label={tab.label}
              clickable
              onClick={() => setFilter(tab.id)}
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                borderRadius: '8px',
                bgcolor: filter === tab.id ? 'primary.main' : 'action.hover',
                color: filter === tab.id ? '#FFFFFF' : 'text.primary',
                '&:hover': {
                  bgcolor: filter === tab.id ? 'primary.dark' : 'action.selected',
                },
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* Meetings List in Order */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={36} />
        </Box>
      ) : filtered.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: '16px',
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <EventIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            No meeting sessions found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            There are no meetings matching the selected filter.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2} sx={{ width: '100%' }}>
          {filtered.map((m) => (
            <Grid size={{ xs: 12 }} key={m.id}>
              <Card
                sx={{
                  p: 2.8,
                  borderRadius: '18px',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                      : '0 2px 12px rgba(37, 99, 235, 0.04)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: 'primary.main',
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? '0 8px 24px rgba(0, 0, 0, 0.45)'
                        : '0 6px 20px rgba(37, 99, 235, 0.08)',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2.5,
                  }}
                >
                  {/* Left Info Column */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={m.meeting_number ? `#${m.meeting_number}` : '#MTG-SESSION'}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.7rem',
                          borderRadius: '6px',
                          bgcolor: (theme) =>
                            theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                          color: 'primary.main',
                        }}
                      />
                      <Chip
                        label={m.committee_name || 'Statutory Body'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          borderRadius: '6px',
                          bgcolor: 'action.hover',
                          color: 'text.secondary',
                        }}
                      />
                      {getStatusChip(m.status)}
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        color: 'text.primary',
                        fontSize: '1.1rem',
                        lineHeight: 1.3,
                        mb: 1.2,
                      }}
                    >
                      {m.title}
                    </Typography>

                    {/* Meta Row: Date, Location, Quorum */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 2, sm: 3 },
                        color: 'text.secondary',
                        flexWrap: 'wrap',
                        fontSize: '0.8rem',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <ScheduleIcon sx={{ fontSize: 17, color: 'primary.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', color: 'text.primary' }}>
                          {formatMeetingDateTime(m.meeting_date, m.start_time)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <LocationIcon sx={{ fontSize: 17, color: '#F59E0B' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', color: 'text.secondary' }}>
                          {m.location || m.venue || 'Senate Hall / Hybrid VC'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <QuorumIcon
                          sx={{
                            fontSize: 17,
                            color: m.quorum_met || m.status === 'COMPLETED' ? '#10B981' : '#3B82F6',
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            color: m.quorum_met || m.status === 'COMPLETED' ? '#10B981' : 'primary.main',
                          }}
                        >
                          {m.quorum_met
                            ? 'Legal Quorum Validated & Met'
                            : m.status === 'COMPLETED'
                            ? 'Session Concluded (Quorum Confirmed)'
                            : 'Live Quorum Ready for Session'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Right Action Button Column */}
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', width: { xs: '100%', md: 'auto' } }}>
                    <Button
                      variant="contained"
                      fullWidth={{ xs: true, md: false }}
                      startIcon={<PlayIcon />}
                      component={Link}
                      to={`/meetings/${m.id}`}
                      sx={{
                        borderRadius: '10px',
                        fontWeight: 800,
                        textTransform: 'none',
                        px: 2.8,
                        py: 1,
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                      }}
                    >
                      Open Live Console
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Schedule Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
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
        <DialogTitle sx={{ fontWeight: 900, color: 'text.primary', pb: 0.5, pt: 2, px: 2.5 }}>
          Convene Statutory Meeting Session
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '24px !important', px: 2.5 }}>
          <TextField
            label="Session Title"
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            value={newMeeting.title}
            onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
            placeholder="e.g. 43rd Academic Council Meeting"
          />

          <FormControl fullWidth required>
            <InputLabel shrink>Constituted Committee</InputLabel>
            <Select
              value={newMeeting.committee_id}
              label="Constituted Committee"
              notched
              onChange={(e) => setNewMeeting({ ...newMeeting, committee_id: e.target.value })}
            >
              {committees.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Grid container spacing={2} sx={{ width: '100%' }}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Meeting Date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={newMeeting.meeting_date}
                onChange={(e) => setNewMeeting({ ...newMeeting, meeting_date: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Start Time"
                type="time"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newMeeting.start_time}
                onChange={(e) => setNewMeeting({ ...newMeeting, start_time: e.target.value })}
              />
            </Grid>
          </Grid>

          <TextField
            label="Venue / Hybrid VC Link"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newMeeting.location}
            onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
            placeholder="e.g. Senate Hall / Google Meet link"
          />

          <TextField
            label="Initial Agenda Outline"
            multiline
            rows={3}
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newMeeting.agenda_text}
            onChange={(e) => setNewMeeting({ ...newMeeting, agenda_text: e.target.value })}
            placeholder="Key agenda topics to circulate to members..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ fontWeight: 700, borderRadius: '10px' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            sx={{ fontWeight: 800, borderRadius: '10px', px: 3 }}
          >
            Convene & Notify
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
