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
  Avatar,
  TextField,
  InputAdornment,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  People as PeopleIcon,
  Add as AddIcon,
  Verified as VerifiedIcon,
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { membersApi, getErrorMessage } from '../../services/api';
import { useRealtime } from '../../context/SocketContext';

export default function MembersListPage() {
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    designation: '',
    department: '',
    category: 'INTERNAL',
    gender: 'MALE',
    phone: '',
  });

  const loadMembers = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError('');
    try {
      const data = await membersApi.list();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading members:', err);
      if (!isSilent) setError('Failed to load members from live database.');
      setMembers([]);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers(false);
  }, [loadMembers]);

  // Real-time synchronization via Socket.io
  useRealtime(['members'], (payload) => {
    console.log('⚡ [Real-time Members Event Received]', payload);
    loadMembers(true);
  });


  const handleCreateMember = async (e) => {
    e.preventDefault();
    if (!newMember.name.trim() || !newMember.email.trim()) {
      alert('Please provide member name and institutional email.');
      return;
    }
    setSaving(true);
    try {
      await membersApi.create(newMember);
      setOpenModal(false);
      setNewMember({
        name: '',
        email: '',
        designation: '',
        department: '',
        category: 'INTERNAL',
        gender: 'MALE',
        phone: '',
      });
      loadMembers();
    } catch (err) {
      console.error('Error creating member:', err);
      alert(getErrorMessage(err, 'Failed to nominate member.'));
    } finally {
      setSaving(false);
    }
  };

  const filtered = members.filter((m) => {
    const name = (m.name || '').toLowerCase();
    const dept = (m.department || '').toLowerCase();
    const desig = (m.designation || '').toLowerCase();
    const query = search.toLowerCase();
    return name.includes(query) || dept.includes(query) || desig.includes(query);
  });

  return (
    <Box>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
            Committee Members Directory
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Live register of university officials, faculty members, and external experts appointed to institutional bodies.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ fontWeight: 700, borderRadius: '10px', px: 2.5, py: 1 }}
        >
          Nominate Member
        </Button>
      </Box>

      {/* Search Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <TextField
          size="small"
          placeholder="Search by name, department, or designation..."
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
          sx={{ maxWidth: 450 }}
        />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Members Table */}
      <Card sx={{ p: 0, borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading institutional roster from database...</Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              No Members Found
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, maxWidth: 400, mx: 'auto' }}>
              {search ? 'No members match your search criteria.' : 'No members have been nominated yet. Click below to add your first member.'}
            </Typography>
            <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setOpenModal(true)}>
              Nominate First Member
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 800 }}>Member Name &amp; Designation</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Department / Affiliation</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Committee Assignment &amp; Role</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">Tenure &amp; Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700, width: 38, height: 38 }}>
                          {(m.name || 'M')[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {m.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {m.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={m.category || m.type || 'INTERNAL'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.68rem',
                          bgcolor: (m.category || m.type) === 'EXTERNAL' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: (m.category || m.type) === 'EXTERNAL' ? '#D97706' : 'primary.main',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.84rem' }}>
                        {m.designation ? `${m.designation} • ` : ''}{m.department || 'Computer Science & Engineering'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.84rem' }}>
                          {m.primary_committee || m.committee_name || (m.committees_count ? `${m.committees_count} Committees` : 'Statutory Body Member')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          Role: {m.role || 'Member'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.4 }}>
                        <Chip
                          label={m.status || (m.is_active !== false ? 'ACTIVE' : 'INACTIVE')}
                          size="small"
                          color={m.status === 'INACTIVE' || m.is_active === false ? 'default' : 'success'}
                          sx={{ fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                        />
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                          {m.tenure_status === 'EXPIRING' ? 'Expires in 18d' : m.tenure || '2024 - 2026 Term'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* ─── Nominate Member Modal Dialog ───────────────────────────────── */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pt: '24px !important' }}>
          Nominate Institutional Member
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField
            label="Full Name & Title *"
            fullWidth
            value={newMember.name}
            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            placeholder="e.g. Prof. K. Sunitha"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Official / Contact Email *"
            type="email"
            fullWidth
            value={newMember.email}
            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
            placeholder="e.g. member@gmail.com"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Designation"
              fullWidth
              value={newMember.designation}
              onChange={(e) => setNewMember({ ...newMember, designation: e.target.value })}
              placeholder="e.g. Professor & Head"
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              label="Department / Org"
              fullWidth
              value={newMember.department}
              onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
              placeholder="e.g. Computer Science"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel shrink>Member Category</InputLabel>
              <Select
                value={newMember.category}
                onChange={(e) => setNewMember({ ...newMember, category: e.target.value })}
                label="Member Category"
              >
                <MenuItem value="INTERNAL">Internal Faculty / Admin</MenuItem>
                <MenuItem value="EXTERNAL">External Expert / Industry</MenuItem>
                <MenuItem value="STUDENT">Student Representative</MenuItem>
                <MenuItem value="ALUMNI">Alumni Representative</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel shrink>Statutory Role</InputLabel>
              <Select
                value={newMember.role || 'MEMBER'}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                label="Statutory Role"
              >
                <MenuItem value="MEMBER">Committee Member</MenuItem>
                <MenuItem value="CONVENER">Convener</MenuItem>
                <MenuItem value="CHAIRPERSON">Chairperson</MenuItem>
                <MenuItem value="STUDENT_REP">Student Representative</MenuItem>
                <MenuItem value="EXTERNAL_EXPERT">External Expert</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="Phone Number (Optional)"
            fullWidth
            value={newMember.phone}
            onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
            placeholder="e.g. +91 98765 43210"
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateMember} disabled={saving}>
            {saving ? 'Saving...' : 'Save & Nominate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
