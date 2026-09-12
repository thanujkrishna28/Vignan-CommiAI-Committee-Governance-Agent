import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  AccountBalance as CommitteeIcon,
  People as PeopleIcon,
  Event as EventIcon,
  CheckCircle as CompliantIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ArrowForward as ArrowIcon,
  Gavel as GavelIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { committeesApi, complianceApi } from '../../services/api';
import { useRealtime } from '../../context/SocketContext';

export default function CommitteesListPage() {
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [openModal, setOpenModal] = useState(false);
  const [newCommittee, setNewCommittee] = useState({
    name: '',
    code: '',
    authority: 'University Grants Commission (UGC)',
    mandate: '',
    quorum_type: 'FIXED',
    quorum_value: 5,
    meeting_frequency: 2,
    frequency_unit: 'MONTH',
  });

  const loadCommittees = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await committeesApi.list();
      if (Array.isArray(data)) {
        setCommittees(data);
      } else {
        setCommittees([]);
      }
    } catch (err) {
      console.error('Error loading committees:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCommittees(false);
  }, [loadCommittees]);

  // Real-time synchronization via Socket.io
  useRealtime(['committees', 'compliance'], (payload) => {
    console.log('⚡ [Real-time Committees Event Received]', payload);
    loadCommittees(true);
  });


  const handleCreate = async () => {
    if (!newCommittee.name || !newCommittee.code) {
      alert('Please provide committee name and code');
      return;
    }
    try {
      await committeesApi.create(newCommittee);
      setOpenModal(false);
      setNewCommittee({
        name: '',
        code: '',
        authority: 'University Grants Commission (UGC)',
        mandate: '',
        quorum_type: 'FIXED',
        quorum_value: 5,
        meeting_frequency: 2,
        frequency_unit: 'MONTH',
      });
      loadCommittees();
    } catch (e) {
      alert('Failed to save committee: ' + (e?.response?.data?.detail || e.message));
    }
  };

  const filtered = committees.filter((c) => {
    const nameMatch = (c.name || '').toLowerCase().includes(search.toLowerCase());
    const codeMatch = (c.code || '').toLowerCase().includes(search.toLowerCase());
    const authMatch = (c.authority || '').toLowerCase().includes(search.toLowerCase());
    const matchSearch = nameMatch || codeMatch || authMatch;

    if (filterType === 'ALL') return matchSearch;
    if (filterType === 'COMPLIANT') return matchSearch && c.compliance_status === 'COMPLIANT';
    if (filterType === 'ATTENTION') return matchSearch && (c.compliance_status === 'ATTENTION' || c.compliance_status === 'WARNING');
    if (filterType === 'NON_COMPLIANT') return matchSearch && c.compliance_status === 'NON_COMPLIANT';
    return matchSearch;
  });

  const getStatusChip = (status, score) => {
    switch (status) {
      case 'COMPLIANT':
        return (
          <Tooltip title={`Compliance Score: ${score || 100}%`}>
            <Chip
              icon={<CompliantIcon sx={{ fontSize: '14px !important', color: '#10B981' }} />}
              label={`COMPLIANT ${score ? `(${score}%)` : ''}`}
              size="small"
              sx={{
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5'),
                color: '#10B981',
                fontWeight: 800,
                fontSize: '0.68rem',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            />
          </Tooltip>
        );
      case 'ATTENTION':
      case 'WARNING':
        return (
          <Tooltip title={`Compliance Score: ${score || 70}% - Action Recommended`}>
            <Chip
              icon={<WarningIcon sx={{ fontSize: '14px !important', color: '#F59E0B' }} />}
              label={`ATTENTION ${score ? `(${score}%)` : ''}`}
              size="small"
              sx={{
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB'),
                color: '#F59E0B',
                fontWeight: 800,
                fontSize: '0.68rem',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            />
          </Tooltip>
        );
      case 'NON_COMPLIANT':
      default:
        return (
          <Tooltip title={`Non-compliant with statutory requirements: ${score || 40}%`}>
            <Chip
              icon={<ErrorIcon sx={{ fontSize: '14px !important', color: '#EF4444' }} />}
              label={`NON-COMPLIANT ${score ? `(${score}%)` : ''}`}
              size="small"
              sx={{
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2'),
                color: '#EF4444',
                fontWeight: 800,
                fontSize: '0.68rem',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            />
          </Tooltip>
        );
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em' }}>
            Institutional Committees Register
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Statutory, standing, and executive bodies constituted under Vignan University & statutory bylaws.
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
          Constitute Committee
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
          placeholder="Search by committee name, code, or authority..."
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
            { id: 'ALL', label: 'All Committees' },
            { id: 'COMPLIANT', label: 'Compliant' },
            { id: 'ATTENTION', label: 'Requires Attention' },
            { id: 'NON_COMPLIANT', label: 'Non-Compliant' },
          ].map((tab) => (
            <Chip
              key={tab.id}
              label={tab.label}
              clickable
              onClick={() => setFilterType(tab.id)}
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                borderRadius: '8px',
                bgcolor: filterType === tab.id ? 'primary.main' : 'action.hover',
                color: filterType === tab.id ? '#FFFFFF' : 'text.primary',
                '&:hover': {
                  bgcolor: filterType === tab.id ? 'primary.dark' : 'action.selected',
                },
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* Committee Cards Grid */}
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
          <CommitteeIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            No committees found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Try adjusting your search query or filter criteria.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2.5} sx={{ width: '100%' }} alignItems="stretch">
          {filtered.map((committee) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={committee.id}>
              <Card
                sx={{
                  p: 2.8,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
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
                    transform: 'translateY(-3px)',
                    borderColor: 'primary.main',
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? '0 8px 28px rgba(0, 0, 0, 0.5)'
                        : '0 8px 24px rgba(37, 99, 235, 0.12)',
                  },
                }}
              >
                <Box>
                  {/* Card Header: Code Badge + Compliance Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          bgcolor: (theme) =>
                            theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.08)',
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '0.75rem',
                        }}
                      >
                        {committee.code ? committee.code.substring(0, 3) : 'COM'}
                      </Box>
                      <Chip
                        label={committee.code || 'STATUTORY'}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          borderRadius: '6px',
                          bgcolor: 'action.hover',
                          color: 'text.secondary',
                        }}
                      />
                    </Box>
                    {getStatusChip(committee.compliance_status, committee.compliance_score)}
                  </Box>

                  {/* Title & Authority */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: 'text.primary',
                      fontSize: '1.05rem',
                      lineHeight: 1.3,
                      mb: 0.8,
                    }}
                  >
                    {committee.name}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: '#F59E0B',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mb: 1.2,
                      fontSize: '0.72rem',
                    }}
                  >
                    <GavelIcon sx={{ fontSize: 13 }} />
                    Authority: {committee.authority || 'University Statutory Regulations'}
                  </Typography>

                  {/* Mandate Description */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.82rem',
                      lineHeight: 1.5,
                      mb: 2.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '3.75em',
                    }}
                  >
                    {committee.mandate || committee.description || 'Mandated to maintain statutory governance and institutional decision compliance.'}
                  </Typography>
                </Box>

                {/* Footer Section */}
                <Box>
                  <Divider sx={{ mb: 1.8 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: 'text.secondary' }}>
                      <PeopleIcon sx={{ fontSize: 17, color: 'primary.main' }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.primary' }}>
                        {committee.member_count || 8} Members
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: 'text.secondary' }}>
                      <EventIcon sx={{ fontSize: 17, color: 'primary.main' }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.primary' }}>
                        {committee.meeting_frequency || 2}x / {(committee.frequency_unit || 'YEAR').toLowerCase()}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="outlined"
                    fullWidth
                    component={Link}
                    to={`/committees/${committee.id}`}
                    endIcon={<ArrowIcon />}
                    sx={{
                      borderRadius: '10px',
                      fontWeight: 700,
                      textTransform: 'none',
                      py: 0.8,
                      fontSize: '0.82rem',
                    }}
                  >
                    View Committee Details
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Creation Modal */}
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
          Constitute New Statutory Committee
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '24px !important', px: 2.5 }}>
          <TextField
            label="Committee Name"
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            value={newCommittee.name}
            onChange={(e) => setNewCommittee({ ...newCommittee, name: e.target.value })}
            placeholder="e.g. Institutional Biosafety Committee (IBSC)"
          />
          <TextField
            label="Committee Code"
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            value={newCommittee.code}
            onChange={(e) => setNewCommittee({ ...newCommittee, code: e.target.value.toUpperCase() })}
            placeholder="e.g. IBSC-001"
          />
          <TextField
            label="Constituting Authority / Legal Basis"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newCommittee.authority}
            onChange={(e) => setNewCommittee({ ...newCommittee, authority: e.target.value })}
            placeholder="e.g. University Grants Commission (UGC)"
          />
          <Grid container spacing={2} sx={{ width: '100%' }}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Quorum (Minimum Members)"
                type="number"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newCommittee.quorum_value}
                onChange={(e) => setNewCommittee({ ...newCommittee, quorum_value: parseInt(e.target.value) || 5 })}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Meeting Frequency (Per Year)"
                type="number"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newCommittee.meeting_frequency}
                onChange={(e) => setNewCommittee({ ...newCommittee, meeting_frequency: parseInt(e.target.value) || 2 })}
              />
            </Grid>
          </Grid>
          <TextField
            label="Statutory Mandate & Responsibilities"
            multiline
            rows={3}
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newCommittee.mandate}
            onChange={(e) => setNewCommittee({ ...newCommittee, mandate: e.target.value })}
            placeholder="Specify legal scope, compliance duties, and powers..."
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
            Constitute Body
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
