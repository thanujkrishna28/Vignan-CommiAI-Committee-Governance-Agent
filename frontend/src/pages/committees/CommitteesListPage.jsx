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
import { useAuth } from '../../context/AuthContext';

export default function CommitteesListPage() {
  const { user } = useAuth();
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

  const getCommitteeOfficer = (c) => {
    const nameLower = (c.name || '').toLowerCase();
    const codeLower = (c.code || '').toLowerCase();

    if (nameLower.includes('academic') || codeLower.includes('ac')) {
      return { role: 'Convener', name: 'Dr. S. V. Phani Kumar', title: 'Dean, Academics' };
    }
    if (nameLower.includes('finance') || codeLower.includes('fc')) {
      return { role: 'Chairperson', name: 'Prof. Dr. K. V. Krishna Kishore', title: 'Registrar' };
    }
    if (nameLower.includes('complaints') || codeLower.includes('icc') || nameLower.includes('posh')) {
      return { role: 'Chairperson', name: 'Dr. S. S. S. N. Usha Devi N.', title: 'ICC Presiding Officer' };
    }
    if (nameLower.includes('anti-ragging') || codeLower.includes('arc')) {
      return { role: 'Nodal Officer', name: 'Dr. J. Veeranjaneyulu', title: 'Dean, Student Affairs' };
    }
    if (nameLower.includes('examination') || codeLower.includes('ec')) {
      return { role: 'Convener', name: 'Dr. N. Veeranjaneyulu', title: 'Controller of Examinations' };
    }
    if (nameLower.includes('research') || codeLower.includes('rac')) {
      return { role: 'Convener', name: 'Dr. B. Premamayudu', title: 'Dean, R&D' };
    }
    if (nameLower.includes('welfare') || codeLower.includes('swc')) {
      return { role: 'Convener', name: 'Dr. J. Veeranjaneyulu', title: 'Dean, Student Affairs' };
    }
    if (nameLower.includes('iqac') || codeLower.includes('iqac')) {
      return { role: 'Director', name: 'Dr. E. Deepak Chowdary', title: 'Director, IQAC' };
    }
    if (nameLower.includes('library') || codeLower.includes('lc')) {
      return { role: 'Convener', name: 'Dr. Satish Kumar Setti', title: 'Professor, ECE' };
    }
    return { role: 'Lead Officer', name: 'Dr. S. V. Phani Kumar', title: 'Dean, Academics' };
  };

  const getStatusChip = (status, score) => {
    const formattedScore = score !== undefined && score !== null ? `${score}%` : '';
    switch (status) {
      case 'COMPLIANT':
        return (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              px: 1,
              py: 0.3,
              borderRadius: '12px',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5'),
              color: '#059669',
              fontSize: '0.7rem',
              fontWeight: 700,
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981' }} />
            COMPLIANT {formattedScore ? `(${formattedScore})` : ''}
          </Box>
        );
      case 'ATTENTION':
      case 'WARNING':
        return (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              px: 1,
              py: 0.3,
              borderRadius: '12px',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.12)' : '#FFFBEB'),
              color: '#D97706',
              fontSize: '0.7rem',
              fontWeight: 700,
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#F59E0B' }} />
            ATTENTION {formattedScore ? `(${formattedScore})` : ''}
          </Box>
        );
      case 'NON_COMPLIANT':
      default:
        return (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              px: 1,
              py: 0.3,
              borderRadius: '12px',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2'),
              color: '#DC2626',
              fontSize: '0.7rem',
              fontWeight: 700,
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#EF4444' }} />
            NON-COMPLIANT {formattedScore ? `(${formattedScore})` : ''}
          </Box>
        );
    }
  };

  const getStatusColorConfig = (status) => {
    switch (status) {
      case 'COMPLIANT':
        return {
          gradient: '#10B981',
          barColor: '#10B981',
        };
      case 'ATTENTION':
      case 'WARNING':
        return {
          gradient: '#F59E0B',
          barColor: '#F59E0B',
        };
      case 'NON_COMPLIANT':
      default:
        return {
          gradient: '#EF4444',
          barColor: '#EF4444',
        };
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

        {(user?.role === 'REGISTRAR' || user?.role === 'SUPER_ADMIN') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{
              borderRadius: '12px',
              px: 2.5,
              py: 1,
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
            }}
          >
            Constitute Committee
          </Button>
        )}
      </Box>

      {/* Filters Bar */}
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
          placeholder="Search by Committee Name, Code, or Statutory Authority..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{
            flex: { xs: '1 1 100%', md: '1 1 400px' },
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['ALL', 'COMPLIANT', 'ATTENTION', 'NON_COMPLIANT'].map((type) => {
            const isSelected = filterType === type;
            return (
              <Chip
                key={type}
                label={type.replace('_', ' ')}
                onClick={() => setFilterType(type)}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  borderRadius: '10px',
                  px: 0.5,
                  bgcolor: isSelected
                    ? 'primary.main'
                    : (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9'),
                  color: isSelected ? '#FFFFFF' : 'text.secondary',
                  border: '1px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  '&:hover': {
                    bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                  },
                }}
              />
            );
          })}
        </Box>
      </Paper>

      {/* Committees Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: '20px',
            bgcolor: 'background.paper',
            border: '1px dashed',
            borderColor: 'divider',
          }}
        >
          <CommitteeIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
            No Committees Found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Try adjusting your search query or filter criteria.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2.5} sx={{ width: '100%' }} alignItems="stretch">
          {filtered.map((committee) => {
            const officer = getCommitteeOfficer(committee);
            const colorCfg = getStatusColorConfig(committee.compliance_status);
            const scoreVal = committee.compliance_score || (committee.compliance_status === 'COMPLIANT' ? 100 : committee.compliance_status === 'ATTENTION' ? 75 : 55);

            return (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={committee.id}>
                <Card
                  sx={{
                    p: 2.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: '16px',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease',
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? '0 2px 12px rgba(0, 0, 0, 0.25)'
                        : '0 2px 8px rgba(15, 23, 42, 0.04)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: 'primary.main',
                      boxShadow: (theme) =>
                        theme.palette.mode === 'dark'
                          ? '0 6px 20px rgba(0, 0, 0, 0.35)'
                          : '0 6px 16px rgba(37, 99, 235, 0.08)',
                    },
                  }}
                >
                  <Box>
                    {/* Top Row: Code Badge + Compliance Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          color: 'primary.main',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {committee.code || 'STATUTORY'}
                      </Typography>
                      {getStatusChip(committee.compliance_status, committee.compliance_score)}
                    </Box>

                    {/* Committee Title */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        color: 'text.primary',
                        fontSize: '1.05rem',
                        lineHeight: 1.35,
                        mb: 0.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '2.7em',
                      }}
                    >
                      {committee.name}
                    </Typography>

                    {/* Authority Subtitle */}
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                        fontSize: '0.72rem',
                        display: 'block',
                        mb: 1.5,
                      }}
                    >
                      {committee.authority || 'University Statutory Regulations'}
                    </Typography>

                    {/* Officer In-charge */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                      <PeopleIcon sx={{ fontSize: 15, color: 'text.secondary', opacity: 0.7 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.74rem' }}>
                        {officer.role}: <strong style={{ color: 'text.primary' }}>{officer.name}</strong> ({officer.title})
                      </Typography>
                    </Box>

                    {/* Mandate Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        lineHeight: 1.5,
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '2.4em',
                      }}
                    >
                      {committee.mandate ||
                        committee.description ||
                        'Mandated to maintain statutory governance and institutional decision compliance.'}
                    </Typography>

                    {/* Statutory Health Index Bar */}
                    <Box sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.68rem',
                            color: 'text.secondary',
                          }}
                        >
                          Statutory Health Index
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            color: colorCfg.barColor,
                          }}
                        >
                          {scoreVal}%
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: '100%',
                          height: 4,
                          borderRadius: '4px',
                          bgcolor: (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.08)'
                              : '#E2E8F0',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            width: `${Math.min(100, Math.max(10, scoreVal))}%`,
                            height: '100%',
                            bgcolor: colorCfg.barColor,
                            borderRadius: '4px',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Footer Section */}
                  <Box>
                    <Divider sx={{ mb: 1.5 }} />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.74rem',
                          color: 'text.secondary',
                        }}
                      >
                        {committee.member_count || 8} Members
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.74rem',
                          color: 'text.secondary',
                        }}
                      >
                        {committee.meeting_frequency || 2}x /{' '}
                        {(committee.frequency_unit || 'YEAR').toLowerCase()}
                      </Typography>
                    </Box>

                    <Button
                      variant="outlined"
                      fullWidth
                      component={Link}
                      to={`/committees/${committee.id}`}
                      endIcon={<ArrowIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        borderRadius: '8px',
                        fontWeight: 700,
                        textTransform: 'none',
                        py: 0.75,
                        fontSize: '0.82rem',
                        borderColor: 'divider',
                        color: 'primary.main',
                      }}
                    >
                      View Committee Details
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
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
