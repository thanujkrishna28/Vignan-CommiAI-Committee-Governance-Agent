import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  Chip,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as DangerIcon,
  AutoAwesome as SparkleIcon,
  Send as SendIcon,
  Gavel as GavelIcon,
  Timer as TimerIcon,
  Add as AddIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { meetingsApi, aiApi } from '../../services/api';

export default function MeetingDetailPage() {
  const { id } = useParams();
  const { user, isRole } = useAuth();
  const isExecutive = user?.role === 'REGISTRAR' || user?.role === 'CONVENER' || user?.role === 'SUPER_ADMIN';

  const [tabIndex, setTabIndex] = useState(0);
  const [meetingStatus, setMeetingStatus] = useState('IN_PROGRESS');
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [isOverridden, setIsOverridden] = useState(false);
  const [minutesDraft, setMinutesDraft] = useState('');
  const [minutesStatus, setMinutesStatus] = useState('DRAFT');
  const [aiGenerating, setAiGenerating] = useState(false);

  // Live Attendance State
  const [attendees, setAttendees] = useState([
    { id: '1', name: 'Dr. P. Nagabhushan', email: '231fa04e50@gmail.com', role: 'Chairperson / VC', status: 'PRESENT', type: 'INTERNAL' },
    { id: '2', name: 'Dr. M. S. Rao', email: '231fa04a32@gmail.com', role: 'Convener / Dean Academics', status: 'PRESENT', type: 'INTERNAL' },
    { id: '3', name: 'Prof. Thanuj Krishna', email: 'thanujkrishna28@gmail.com', role: 'Faculty Member', status: 'PRESENT', type: 'INTERNAL' },
    { id: '4', name: 'Dr. T. S. Murthy', email: 'k4@gmail.com', role: 'External Expert (NIT)', status: 'VIRTUAL', type: 'EXTERNAL' },
    { id: '5', name: 'Dr. Pujitha Yarramsetty', email: 'pujithayarramsetty@gmail.com', role: 'Director IQAC', status: 'PRESENT', type: 'INTERNAL' },
    { id: '6', name: 'Prof. A. V. Rao', role: 'Dean Admissions', status: 'PRESENT', type: 'INTERNAL' },
    { id: '7', name: 'Dr. S. Reddy', role: 'HOD ECE', status: 'ABSENT', type: 'INTERNAL' },
    { id: '8', name: 'Dr. N. Sharma', role: 'HOD Mechanical', status: 'ABSENT', type: 'INTERNAL' },
    { id: '9', name: 'Mr. V. Anand', role: 'External Industry Expert', status: 'EXCUSED', type: 'EXTERNAL' },
    { id: '10', name: 'Prof. G. Lakshmi', role: 'Faculty Member', status: 'ABSENT', type: 'INTERNAL' },
  ]);

  const [agenda, setAgenda] = useState([
    { id: '1', item: '1. Confirmation of 41st Academic Council Minutes', time: '10 mins', done: true },
    { id: '2', item: '2. Review of AICTE Curriculum Revision 2026 for B.Tech CSE & ECE', time: '30 mins', done: true },
    { id: '3', item: '3. Approval of Ph.D. Viva-Voce Examination Reports (14 candidates)', time: '20 mins', done: false },
    { id: '4', item: '4. NAAC SSR Committee Status & Governance Disclosures', time: '20 mins', done: false },
    { id: '5', item: '5. Any other item with permission of the Chair', time: '10 mins', done: false },
  ]);

  // Quorum Calculations (50% rule)
  const totalInvited = attendees.length;
  const presentCount = attendees.filter((a) => a.status === 'PRESENT' || a.status === 'VIRTUAL').length;
  const quorumRequired = Math.ceil(totalInvited * 0.5); // 5 members required
  const quorumMet = presentCount >= quorumRequired || isOverridden;

  const handleStatusChange = (memberId, newStatus) => {
    setAttendees(attendees.map((a) => (a.id === memberId ? { ...a, status: newStatus } : a)));
  };

  const handleGenerateAiMinutes = async () => {
    setAiGenerating(true);
    setTimeout(() => {
      setMinutesDraft(
        `MINUTES OF THE 42ND REGULAR SESSION OF THE ACADEMIC COUNCIL\n` +
        `HELD ON MARCH 11, 2026 AT SENATE HALL, VIGNAN UNIVERSITY\n\n` +
        `CHAIRPERSON: Dr. P. Nagabhushan, Vice Chancellor\n` +
        `MEMBERS PRESENT: 6 Members (Legal Quorum Met: 60% attendance)\n` +
        `EXTERNAL EXPERTS PARTICIPATING: Dr. T. S. Murthy (Director NIT Warangal - via Hybrid VC)\n\n` +
        `RESOLUTIONS ADOPTED:\n` +
        `1. The minutes of the 41st meeting of the Academic Council were read and unanimously ratified.\n` +
        `2. Resolved to approve the AICTE 2026 Model Curriculum for B.Tech CSE and ECE with effect from AY 2026-27.\n` +
        `3. Approved Ph.D. degree awards for 14 research scholars following successful Viva-Voce defense.\n` +
        `4. Directed IQAC to finalize Criterion 6 documentation for NAAC peer-team review by end of month.\n\n` +
        `The meeting concluded with a vote of thanks to the Chair.`
      );
      setAiGenerating(false);
    }, 1200);
  };

  const handleOverrideSubmit = () => {
    if (!overrideReason.trim()) {
      alert('Please enter statutory reason for quorum override.');
      return;
    }
    setIsOverridden(true);
    setOverrideOpen(false);
  };

  return (
    <Box>
      {/* Back link */}
      <Box sx={{ mb: 2 }}>
        <Button component={Link} to="/meetings" startIcon={<BackIcon />} sx={{ color: '#64748B', fontWeight: 600 }}>
          Back to Meetings Schedule
        </Button>
      </Box>

      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          bgcolor: '#0B172E',
          color: '#FFF',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Chip label="AC-2026-01" size="small" sx={{ bgcolor: '#C69214', color: '#0B172E', fontWeight: 800 }} />
            <Chip
              label={meetingStatus}
              size="small"
              sx={{
                bgcolor: meetingStatus === 'IN_PROGRESS' ? 'rgba(16, 185, 129, 0.2)' : '#1E293B',
                color: meetingStatus === 'IN_PROGRESS' ? '#34D399' : '#94A3B8',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                fontWeight: 700,
              }}
            />
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              Senate Hall • Hybrid VC Enabled
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFF' }}>
            Academic Council — 42nd Regular Session
          </Typography>
          <Typography variant="caption" sx={{ color: '#CBD5E1' }}>
            Convened by Dr. M. S. Rao • Chaired by Vice Chancellor Dr. P. Nagabhushan
          </Typography>
        </Box>

        {isExecutive ? (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {meetingStatus === 'IN_PROGRESS' ? (
              <Button
                variant="contained"
                color="error"
                size="small"
                startIcon={<StopIcon />}
                onClick={() => setMeetingStatus('CONCLUDED')}
                sx={{ fontWeight: 700 }}
              >
                Adjourn Session
              </Button>
            ) : (
              <Button
                variant="contained"
                size="small"
                startIcon={<PlayIcon />}
                onClick={() => setMeetingStatus('IN_PROGRESS')}
                sx={{ bgcolor: '#059669', fontWeight: 700 }}
              >
                Resume Session
              </Button>
            )}
          </Box>
        ) : (
          <Chip
            label={meetingStatus === 'IN_PROGRESS' ? 'SESSION IN PROGRESS' : 'SESSION CONCLUDED'}
            size="small"
            sx={{
              fontWeight: 800,
              bgcolor: meetingStatus === 'IN_PROGRESS' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)',
              color: meetingStatus === 'IN_PROGRESS' ? '#10B981' : '#64748B',
              border: '1px solid',
              borderColor: meetingStatus === 'IN_PROGRESS' ? '#10B981' : '#64748B',
              px: 1.2,
              py: 0.5,
            }}
          />
        )}
      </Paper>

      {/* LIVE QUORUM ENGINE BANNER */}
      <Card
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          bgcolor: quorumMet ? '#F0FDF4' : '#FEF2F2',
          border: `2px solid ${quorumMet ? '#86EFAC' : '#FCA5A5'}`,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  bgcolor: quorumMet ? '#059669' : '#DC2626',
                  color: '#FFF',
                  p: 1.5,
                  borderRadius: 2.5,
                  display: 'flex',
                }}
              >
                {quorumMet ? <SuccessIcon sx={{ fontSize: 32 }} /> : <DangerIcon sx={{ fontSize: 32 }} />}
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: quorumMet ? '#065F46' : '#991B1B' }}>
                    {quorumMet ? 'LEGAL QUORUM ATTAINED' : 'QUORUM DEFICIT — ACTIONS CANNOT BE RATIFIED'}
                  </Typography>
                  {isOverridden && (
                    <Chip label="STATUTORY OVERRIDE ACTIVE" size="small" sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 800 }} />
                  )}
                </Box>
                <Typography variant="body2" sx={{ color: '#475569', mt: 0.5 }}>
                  Statutory Requirement: <strong>50% of Voting Members ({quorumRequired} members)</strong> • Currently Attending:{' '}
                  <strong>{presentCount} of {totalInvited} members</strong> ({Math.round((presentCount / totalInvited) * 100)}%)
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1.5 }}>
            {!quorumMet && isExecutive && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<GavelIcon />}
                onClick={() => setOverrideOpen(true)}
                sx={{ fontWeight: 700, borderRadius: 2 }}
              >
                Authorized Quorum Override
              </Button>
            )}
            <Chip
              label={`${presentCount} / ${totalInvited} Active Participants`}
              sx={{ bgcolor: '#FFF', fontWeight: 700, border: '1px solid #CBD5E1', height: 36, px: 1 }}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Tabs: Live Attendance, Agenda, Minutes Draft */}
      <Paper elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', mb: 3 }}>
        <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} sx={{ px: 2 }}>
          <Tab
            label={isExecutive ? `Live Attendance & Roll Call (${presentCount}/${totalInvited})` : `Committee Roster & Attendance (${presentCount}/${totalInvited})`}
            sx={{ fontWeight: 700 }}
          />
          <Tab label="Session Agenda & Timetable" sx={{ fontWeight: 700 }} />
          <Tab
            label={isExecutive ? "Minutes of Meeting (AI Draft & Approval)" : "Minutes of Meeting (Official Record)"}
            sx={{ fontWeight: 700 }}
          />
        </Tabs>
      </Paper>

      {/* TAB 0: Live Attendance Table */}
      {tabIndex === 0 && (
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E3A8A' }}>
              Roll Call Roster & Real-time Attendance
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              {isExecutive ? 'Toggling member status immediately re-evaluates legal quorum' : 'Official statutory roll call record • Read-only attendee view'}
            </Typography>
          </Box>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Member Name</TableCell>
                  <TableCell>Designation & Role</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Attendance Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendees.map((member) => {
                  const isSelf = member.email?.toLowerCase() === user?.email?.toLowerCase() ||
                    (user?.role === 'MEMBER' && member.name?.toLowerCase().includes('thanuj'));

                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: '#1E3A8A', width: 32, height: 32, fontSize: '0.8rem', fontWeight: 700 }}>
                            {member.name[0]}
                          </Avatar>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                            {member.name} {isSelf && <Chip label="YOU" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: '#DBEAFE', color: '#1D4ED8', ml: 0.5 }} />}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                          {member.role}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={member.type}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            bgcolor: member.type === 'EXTERNAL' ? '#EFF6FF' : '#F1F5F9',
                            color: member.type === 'EXTERNAL' ? '#1E40AF' : '#475569',
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {isExecutive ? (
                          <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                            {['PRESENT', 'VIRTUAL', 'ABSENT', 'EXCUSED'].map((st) => (
                              <Button
                                key={st}
                                size="small"
                                variant={member.status === st ? 'contained' : 'outlined'}
                                onClick={() => handleStatusChange(member.id, st)}
                                sx={{
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  py: 0.3,
                                  px: 1.2,
                                  borderRadius: 1.5,
                                  bgcolor: member.status === st ? (st === 'PRESENT' ? '#059669' : st === 'VIRTUAL' ? '#2563EB' : st === 'EXCUSED' ? '#D97706' : '#DC2626') : 'transparent',
                                  borderColor: '#CBD5E1',
                                  color: member.status === st ? '#FFF' : '#64748B',
                                }}
                              >
                                {st}
                              </Button>
                            ))}
                          </Box>
                        ) : isSelf ? (
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={member.status}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                fontSize: '0.72rem',
                                bgcolor: member.status === 'PRESENT' ? '#DCFCE7' : member.status === 'VIRTUAL' ? '#DBEAFE' : '#FEE2E2',
                                color: member.status === 'PRESENT' ? '#15803D' : member.status === 'VIRTUAL' ? '#1D4ED8' : '#B91C1C',
                              }}
                            />
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleStatusChange(member.id, member.status === 'PRESENT' ? 'VIRTUAL' : 'PRESENT')}
                              sx={{ fontSize: '0.72rem', fontWeight: 800, borderRadius: 1.5, bgcolor: '#1E3A8A' }}
                            >
                              {member.status === 'PRESENT' ? 'Mark Virtual' : 'Confirm Presence'}
                            </Button>
                          </Box>
                        ) : (
                          <Chip
                            label={member.status}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.72rem',
                              bgcolor: member.status === 'PRESENT' ? '#DCFCE7' : member.status === 'VIRTUAL' ? '#DBEAFE' : member.status === 'EXCUSED' ? '#FEF3C7' : '#FEE2E2',
                              color: member.status === 'PRESENT' ? '#15803D' : member.status === 'VIRTUAL' ? '#1D4ED8' : member.status === 'EXCUSED' ? '#B45309' : '#B91C1C',
                            }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* TAB 1: Agenda */}
      {tabIndex === 1 && (
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E3A8A' }}>
              Statutory Agenda Items
            </Typography>
            {isExecutive && (
              <Button size="small" startIcon={<AddIcon />} variant="outlined" sx={{ fontWeight: 700 }}>
                Add Item
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {agenda.map((ag) => (
              <Paper
                key={ag.id}
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  bgcolor: ag.done ? '#F8FAFC' : '#FFF',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip
                    label={ag.done ? 'CONCLUDED' : 'PENDING'}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      bgcolor: ag.done ? '#ECFDF5' : '#FFFBEB',
                      color: ag.done ? '#065F46' : '#92400E',
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: ag.done ? '#64748B' : '#0F172A' }}>
                    {ag.item}
                  </Typography>
                </Box>
                <Chip icon={<TimerIcon sx={{ fontSize: 16 }} />} label={ag.time} size="small" sx={{ fontWeight: 600 }} />
              </Paper>
            ))}
          </Box>
        </Card>
      )}

      {/* TAB 2: Minutes Draft & Approval */}
      {tabIndex === 2 && (
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E3A8A' }}>
                Minutes of the Meeting (MoM)
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Status: <strong>{minutesStatus}</strong> • Official Statutory Record
              </Typography>
            </Box>

            {isExecutive ? (
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SparkleIcon sx={{ color: '#F59E0B' }} />}
                  onClick={handleGenerateAiMinutes}
                  disabled={aiGenerating}
                  sx={{ fontWeight: 700 }}
                >
                  {aiGenerating ? 'AI Synthesizing...' : '1-Click CommiAI Minutes'}
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<SendIcon />}
                  onClick={() => setMinutesStatus('PENDING_REGISTRAR_APPROVAL')}
                  sx={{ bgcolor: '#1E3A8A', fontWeight: 700 }}
                >
                  Submit for Registrar Sign-off
                </Button>
              </Box>
            ) : (
              <Chip
                label="Official Minutes (Read-Only Archive)"
                sx={{ fontWeight: 800, bgcolor: '#EFF6FF', color: '#1E40AF' }}
              />
            )}
          </Box>

          <TextField
            fullWidth
            multiline
            rows={12}
            slotProps={{
              input: {
                readOnly: !isExecutive,
              },
            }}
            value={minutesDraft || (isExecutive ? 'Click "1-Click CommiAI Minutes" above to auto-generate structured minutes based on attendance and agenda deliberations.' : 'Minutes draft will be published here following executive convener synthesis and approval.')}
            onChange={(e) => setMinutesDraft(e.target.value)}
            sx={{
              fontFamily: 'monospace',
              bgcolor: '#F8FAFC',
              borderRadius: 2,
              '& .MuiInputBase-input': { fontFamily: 'inherit', fontSize: '0.88rem', lineHeight: 1.6 },
            }}
          />
        </Card>
      )}

      {/* Quorum Override Modal */}
      <Dialog open={overrideOpen} onClose={() => setOverrideOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#DC2626' }}>
          Authorized Quorum Override
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            Statutory Alert: Proceeding without quorum requires explicit regulatory justification under Section 14(3) of the University Charter. This action is permanently audited.
          </Alert>
          <TextField
            label="Statutory Justification Reason"
            multiline
            rows={3}
            fullWidth
            required
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
            placeholder="e.g. Urgent emergency approval required prior to Academic Year commencement per Chancellor directive."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOverrideOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleOverrideSubmit} sx={{ fontWeight: 700 }}>
            Authorize Legal Override
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
