import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  AssignmentTurnedIn as ActionIcon,
  CheckCircle as DoneIcon,
  CheckCircleRounded as CheckCircleIcon,
  AutorenewRounded as InProgressIcon,
  AccessTimeRounded as PendingIcon,
  ErrorOutlineRounded as OverdueIcon,
  KeyboardArrowDownRounded as ArrowDownIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { actionsApi, committeesApi, membersApi } from '../../services/api';
import { useRealtime } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

export default function ActionItemsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [actions, setActions] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [openModal, setOpenModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    committee_id: '',
    assigned_to_id: '',
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'HIGH',
  });

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError('');
    try {
      const [actionsData, committeesData, membersData] = await Promise.all([
        actionsApi.list().catch(() => []),
        committeesApi.list().catch(() => []),
        membersApi.list().catch(() => []),
      ]);
      setActions(Array.isArray(actionsData) ? actionsData : []);
      setCommittees(Array.isArray(committeesData) ? committeesData : []);
      setMembers(Array.isArray(membersData) ? membersData : []);
      if (committeesData && committeesData.length > 0 && !newAction.committee_id) {
        setNewAction((prev) => ({ ...prev, committee_id: committeesData[0].id }));
      }
    } catch (err) {
      console.error('Error loading actions:', err);
      if (!isSilent) setError('Failed to load action items from database.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [newAction.committee_id]);

  useEffect(() => {
    loadData(false);
  }, []);

  // Real-time synchronization via Socket.io
  useRealtime(['actions', 'committees', 'members'], (payload) => {
    console.log('⚡ [Real-time Actions Event Received]', payload);
    loadData(true);
  });

  const handleStatusChange = async (id, nextStatus) => {
    // Optimistic UI update instantly
    setActions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
    );
    try {
      await actionsApi.update(id, { status: nextStatus });
    } catch (err) {
      console.error('Error updating action status:', err);
      alert('Failed to update status in database.');
      loadData(true);
    }
  };


  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newAction.title.trim()) {
      alert('Please provide a title for the action item.');
      return;
    }
    setSaving(true);
    try {
      await actionsApi.create({
        title: newAction.title,
        description: newAction.description || undefined,
        committee_id: newAction.committee_id || undefined,
        assigned_to_id: newAction.assigned_to_id || undefined,
        due_date: newAction.due_date,
        priority: newAction.priority,
      });
      setOpenModal(false);
      setNewAction({
        title: '',
        description: '',
        committee_id: committees[0]?.id || '',
        assigned_to_id: '',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'HIGH',
      });
      loadData();
    } catch (err) {
      console.error('Error creating action:', err);
      alert(err.response?.data?.detail || 'Failed to create action item.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = actions.filter((a) => {
    const title = (a.title || '').toLowerCase();
    const assignee = (a.assigned_to_name || a.assigned_to?.name || '').toLowerCase();
    const commName = (a.committee_name || a.committee?.name || '').toLowerCase();
    const query = search.toLowerCase();

    const matchSearch = title.includes(query) || assignee.includes(query) || commName.includes(query);
    const matchStatus = filterStatus === 'ALL' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const STATUS_CONFIG = {
    COMPLETED: {
      label: 'Completed',
      color: '#059669',
      bg: (theme) => theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.16)' : '#ECFDF5',
      border: 'rgba(16, 185, 129, 0.35)',
      hoverBg: (theme) => theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.25)' : '#D1FAE5',
      icon: CheckCircleIcon,
    },
    IN_PROGRESS: {
      label: 'In Progress',
      color: '#2563EB',
      bg: (theme) => theme.palette.mode === 'dark' ? 'rgba(37, 99, 235, 0.16)' : '#EFF6FF',
      border: 'rgba(37, 99, 235, 0.35)',
      hoverBg: (theme) => theme.palette.mode === 'dark' ? 'rgba(37, 99, 235, 0.25)' : '#DBEAFE',
      icon: InProgressIcon,
    },
    PENDING: {
      label: 'Pending',
      color: '#D97706',
      bg: (theme) => theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.16)' : '#FFFBEB',
      border: 'rgba(245, 158, 11, 0.35)',
      hoverBg: (theme) => theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.25)' : '#FEF3C7',
      icon: PendingIcon,
    },
    OVERDUE: {
      label: 'Overdue',
      color: '#DC2626',
      bg: (theme) => theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.16)' : '#FEF2F2',
      border: 'rgba(239, 68, 68, 0.35)',
      hoverBg: (theme) => theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.25)' : '#FEE2E2',
      icon: OverdueIcon,
    },
  };

  const getPriorityChip = (p) => {
    const norm = (p || 'MEDIUM').toUpperCase();
    const colors = {
      CRITICAL: { bg: 'rgba(239, 68, 68, 0.15)', text: '#DC2626' },
      HIGH: { bg: 'rgba(249, 115, 22, 0.15)', text: '#EA580C' },
      MEDIUM: { bg: 'rgba(59, 130, 246, 0.15)', text: '#2563EB' },
      LOW: { bg: 'rgba(100, 116, 139, 0.15)', text: '#64748B' },
    };
    const c = colors[norm] || colors.LOW;
    return <Chip label={norm} size="small" sx={{ bgcolor: c.bg, color: c.text, fontWeight: 800, fontSize: '0.65rem' }} />;
  };

  return (
    <Box>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
            Action Items &amp; ATR Matrix
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Traceability matrix of resolutions, assigned responsibilities, due dates, and Action Taken Reports (ATR).
          </Typography>
        </Box>

        {(user?.role === 'REGISTRAR' || user?.role === 'CONVENER' || user?.role === 'SUPER_ADMIN') && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenModal(true)} sx={{ fontWeight: 700, borderRadius: '10px' }}>
            Create Action Item
          </Button>
        )}
      </Box>

      {/* Filters & Search */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search by action title, committee, or assignee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
          <InputLabel shrink>Status Filter</InputLabel>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status Filter">
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
            <MenuItem value="OVERDUE">Overdue</MenuItem>
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
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading action items from live database...</Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <ActionIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              No Action Items Found
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, maxWidth: 400, mx: 'auto' }}>
              {search ? 'No actions match your search filter.' : 'No action items recorded yet. Click below to create a new task.'}
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenModal(true)}>
              Create First Action Item
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 800, width: '34%', py: 1.8 }}>Action Title &amp; Committee</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: '22%', py: 1.8 }}>Assigned To</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: '16%', py: 1.8 }}>Target Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: '12%', py: 1.8 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: '16%', py: 1.8 }} align="right">Workflow Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((a) => {
                  const assigneeName = a.assigned_to?.name || a.assigned_to_name || 'Unassigned';
                  const isAssigned = assigneeName !== 'Unassigned';
                  const formattedDate = a.due_date ? new Date(a.due_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No due date';
                  const canEditStatus =
                    user?.role === 'REGISTRAR' ||
                    user?.role === 'CONVENER' ||
                    user?.role === 'SUPER_ADMIN' ||
                    (user?.role === 'MEMBER' && (
                      a.assigned_to_id === user?.member_id ||
                      assigneeName.toLowerCase().includes(user?.name?.toLowerCase()) ||
                      (a.assigned_to?.email && a.assigned_to?.email.toLowerCase() === user?.email?.toLowerCase())
                    ));

                  return (
                    <TableRow key={a.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {/* Action Title & Committee */}
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.92rem' }}>
                          {a.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, display: 'block', mt: 0.3 }}>
                          {a.committee?.name || a.committee_name || 'Statutory Committee'}
                        </Typography>
                      </TableCell>

                      {/* Assigned To with Avatar */}
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              bgcolor: isAssigned ? 'rgba(37, 99, 235, 0.12)' : 'rgba(148, 163, 184, 0.15)',
                              color: isAssigned ? 'primary.main' : 'text.secondary',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                            }}
                          >
                            {isAssigned ? assigneeName.charAt(0).toUpperCase() : '?'}
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: isAssigned ? 'text.primary' : 'text.secondary', fontWeight: isAssigned ? 700 : 500, fontSize: '0.84rem' }}>
                              {assigneeName}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Target Due Date */}
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.84rem' }}>
                          {formattedDate}
                        </Typography>
                      </TableCell>

                      {/* Priority */}
                      <TableCell sx={{ py: 2 }}>
                        {getPriorityChip(a.priority)}
                      </TableCell>

                      {/* Workflow Status Interactive Selector / Badge */}
                      <TableCell align="right" sx={{ py: 2 }}>
                        {canEditStatus ? (
                          <Select
                            size="small"
                            value={a.status || 'PENDING'}
                            onChange={(e) => handleStatusChange(a.id, e.target.value)}
                            IconComponent={ArrowDownIcon}
                            renderValue={(val) => {
                              const cur = STATUS_CONFIG[val] || STATUS_CONFIG.PENDING;
                              const IconComp = cur.icon;
                              return (
                                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, pr: 0.5 }}>
                                  <IconComp sx={{ fontSize: 16, color: cur.color }} />
                                  <Typography
                                    component="span"
                                    sx={{
                                      fontWeight: 800,
                                      fontSize: '0.78rem',
                                      color: cur.color,
                                      letterSpacing: '-0.01em',
                                    }}
                                  >
                                    {cur.label}
                                  </Typography>
                                </Box>
                              );
                            }}
                            sx={{
                              borderRadius: '24px',
                              height: 32,
                              minWidth: 135,
                              bgcolor: (theme) => {
                                const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.PENDING;
                                return typeof cfg.bg === 'function' ? cfg.bg(theme) : cfg.bg;
                              },
                              border: '1.5px solid',
                              borderColor: (STATUS_CONFIG[a.status]?.border) || STATUS_CONFIG.PENDING.border,
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                              '&:hover': {
                                bgcolor: (theme) => {
                                  const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.PENDING;
                                  return typeof cfg.hoverBg === 'function' ? cfg.hoverBg(theme) : cfg.hoverBg;
                                },
                                borderColor: (STATUS_CONFIG[a.status]?.color) || STATUS_CONFIG.PENDING.color,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                              },
                              '& .MuiSelect-select': {
                                py: '4px !important',
                                pl: '10px !important',
                                pr: '28px !important',
                                display: 'flex',
                                alignItems: 'center',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none',
                              },
                              '& .MuiSelect-icon': {
                                color: (STATUS_CONFIG[a.status]?.color) || STATUS_CONFIG.PENDING.color,
                                fontSize: 18,
                                right: 6,
                                transition: 'transform 0.2s',
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                elevation: 6,
                                sx: {
                                  borderRadius: '16px',
                                  mt: 0.8,
                                  p: 0.8,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  backdropFilter: 'blur(12px)',
                                  boxShadow: '0 12px 30px -5px rgba(0,0,0,0.15)',
                                },
                              },
                            }}
                          >
                            {Object.entries(STATUS_CONFIG).map(([key, item]) => {
                              const ItemIcon = item.icon;
                              return (
                                <MenuItem
                                  key={key}
                                  value={key}
                                  sx={{
                                    borderRadius: '10px',
                                    my: 0.3,
                                    px: 1.5,
                                    py: 0.9,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.2,
                                    fontSize: '0.82rem',
                                    fontWeight: 700,
                                    color: item.color,
                                    transition: 'all 0.15s',
                                    '&:hover': {
                                      bgcolor: (theme) => typeof item.bg === 'function' ? item.bg(theme) : item.bg,
                                    },
                                    '&.Mui-selected': {
                                      bgcolor: (theme) => typeof item.bg === 'function' ? item.bg(theme) : item.bg,
                                      fontWeight: 900,
                                    },
                                  }}
                                >
                                  <ItemIcon sx={{ fontSize: 17, color: item.color }} />
                                  <span>{item.label}</span>
                                </MenuItem>
                              );
                            })}
                          </Select>
                        ) : (
                          <Chip
                            icon={React.createElement(STATUS_CONFIG[a.status]?.icon || STATUS_CONFIG.PENDING.icon, {
                              sx: { fontSize: '15px !important', color: `${(STATUS_CONFIG[a.status]?.color) || STATUS_CONFIG.PENDING.color} !important` },
                            })}
                            label={(STATUS_CONFIG[a.status]?.label) || 'Pending'}
                            size="small"
                            sx={{
                              borderRadius: '24px',
                              height: 30,
                              px: 1,
                              fontWeight: 800,
                              fontSize: '0.76rem',
                              bgcolor: (theme) => {
                                const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.PENDING;
                                return typeof cfg.bg === 'function' ? cfg.bg(theme) : cfg.bg;
                              },
                              border: '1.5px solid',
                              borderColor: (STATUS_CONFIG[a.status]?.border) || STATUS_CONFIG.PENDING.border,
                              color: (STATUS_CONFIG[a.status]?.color) || STATUS_CONFIG.PENDING.color,
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
        )}
      </Card>

      {/* ─── Create Action Item Modal Dialog ────────────────────────────── */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pt: '24px !important' }}>Create New Action Item</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField
            label="Action Item Title *"
            fullWidth
            value={newAction.title}
            onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
            placeholder="e.g. Submit revised CSE curriculum structure for BoS ratification"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Detailed Description"
            fullWidth
            multiline
            rows={3}
            value={newAction.description}
            onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
            placeholder="Specify context, expected deliverables, and statutory resolution basis..."
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <FormControl fullWidth>
            <InputLabel shrink>Target Committee</InputLabel>
            <Select
              value={newAction.committee_id}
              onChange={(e) => setNewAction({ ...newAction, committee_id: e.target.value })}
              label="Target Committee"
            >
              {committees.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel shrink>Assignee</InputLabel>
              <Select
                value={newAction.assigned_to_id}
                onChange={(e) => setNewAction({ ...newAction, assigned_to_id: e.target.value })}
                label="Assignee"
              >
                <MenuItem value="">Unassigned</MenuItem>
                {members.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.name} ({m.designation || m.department || 'Member'})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel shrink>Priority</InputLabel>
              <Select
                value={newAction.priority}
                onChange={(e) => setNewAction({ ...newAction, priority: e.target.value })}
                label="Priority"
              >
                <MenuItem value="CRITICAL">Critical</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="LOW">Low</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="Due Date"
            type="date"
            fullWidth
            value={newAction.due_date}
            onChange={(e) => setNewAction({ ...newAction, due_date: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}>
            {saving ? 'Creating...' : 'Create Action Item'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
