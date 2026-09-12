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
    switch (status) {
      case 'COMPLIANT':
        return (
          <Tooltip title={`Statutory AI Audit Score: ${score || 100}% — All quotas & quorum satisfied`}>
            <Chip
              icon={<CompliantIcon sx={{ fontSize: '13px !important', color: '#059669' }} />}
              label={`COMPLIANT ${score ? `(${score}%)` : '(100%)'}`}
              size="small"
              sx={{
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5'),
                color: '#059669',
                fontWeight: 800,
                fontSize: '0.67rem',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                boxShadow: '0 1px 3px rgba(16, 185, 129, 0.15)',
              }}
            />
          </Tooltip>
        );
      case 'ATTENTION':
      case 'WARNING':
        return (
          <Tooltip title={`Statutory AI Audit Score: ${score || 70}% — Action or Renewal Recommended`}>
            <Chip
              icon={<WarningIcon sx={{ fontSize: '13px !important', color: '#D97706' }} />}
              label={`ATTENTION ${score ? `(${score}%)` : ''}`}
              size="small"
              sx={{
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB'),
                color: '#D97706',
                fontWeight: 800,
                fontSize: '0.67rem',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                boxShadow: '0 1px 3px rgba(245, 158, 11, 0.15)',
              }}
            />
          </Tooltip>
        );
      case 'NON_COMPLIANT':
      default:
        return (
          <Tooltip title={`Statutory AI Audit Score: ${score || 40}% — Statutory shortfall detected`}>
            <Chip
              icon={<ErrorIcon sx={{ fontSize: '13px !important', color: '#DC2626' }} />}
              label={`NON-COMPLIANT ${score ? `(${score}%)` : ''}`}
              size="small"
              sx={{
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2'),
                color: '#DC2626',
                fontWeight: 800,
                fontSize: '0.67rem',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                boxShadow: '0 1px 3px rgba(239, 68, 68, 0.15)',
              }}
            />
          </Tooltip>
        );
    }
  };

  const getStatusColorConfig = (status) => {
    switch (status) {
      case 'COMPLIANT':
        return {
          gradient: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
          barColor: '#10B981',
          accentBg: 'rgba(16, 185, 129, 0.08)',
          borderColor: 'rgba(16, 185, 129, 0.3)',
        };
      case 'ATTENTION':
      case 'WARNING':
        return {
          gradient: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)',
          barColor: '#F59E0B',
          accentBg: 'rgba(245, 158, 11, 0.08)',
          borderColor: 'rgba(245, 158, 11, 0.3)',
        };
      case 'NON_COMPLIANT':
      default:
        return {
          gradient: 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)',
          barColor: '#EF4444',
          accentBg: 'rgba(239, 68, 68, 0.08)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
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
              fontWeight: 800,
              borderRadius: '12px',
              px: 2.5,
              py: 1,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
            }}
          >
            Constitute Committee
          </Button>
        )}
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
          {filtered.map((committee) => {
            const officer = getCommitteeOfficer(committee);
            const colorCfg = getStatusColorConfig(committee.compliance_status);
            const scoreVal = committee.compliance_score || (committee.compliance_status === 'COMPLIANT' ? 100 : committee.compliance_status === 'ATTENTION' ? 75 : 55);

            return (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={committee.id}>
                <Card
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: '20px',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? '0 6px 24px rgba(0, 0, 0, 0.4)'
                        : '0 4px 18px rgba(15, 23, 42, 0.04)',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      borderColor: colorCfg.borderColor,
                      boxShadow: (theme) =>
                        theme.palette.mode === 'dark'
                          ? '0 12px 32px rgba(0, 0, 0, 0.6)'
                          : '0 12px 28px rgba(37, 99, 235, 0.1)',
                      '& .action-btn': {
                        bgcolor: 'primary.main',
                        color: '#FFF',
                        borderColor: 'primary.main',
                        '& .MuiSvgIcon-root': {
                          transform: 'translateX(4px)',
                        },
                      },
                    },
                  }}
                >
                  {/* Top Status Gradient Bar */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: colorCfg.gradient,
                    }}
                  />

                  <Box>
                    {/* Card Header: Code Badge + Compliance Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(30, 58, 138, 0.25) 100%)',
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: '0.78rem',
                            letterSpacing: '0.02em',
                            boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.2)',
                          }}
                        >
                          {committee.code ? committee.code.substring(0, 3) : 'COM'}
                        </Box>
                        <Chip
                          label={committee.code || 'STATUTORY'}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            borderRadius: '8px',
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                            color: 'text.secondary',
                            border: '1px solid',
                            borderColor: 'divider',
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
                        fontSize: '1.08rem',
                        lineHeight: 1.35,
                        mb: 0.8,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {committee.name}
                    </Typography>

                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.6,
                        px: 1,
                        py: 0.3,
                        borderRadius: '6px',
                        bgcolor: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        mb: 1.6,
                      }}
                    >
                      <GavelIcon sx={{ fontSize: 13, color: '#D97706' }} />
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#B45309',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          lineHeight: 1,
                        }}
                      >
                        {committee.authority || 'University Statutory Regulations'}
                      </Typography>
                    </Box>

                    {/* Key Officer / Convener Pill */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1.2,
                        mb: 2,
                        borderRadius: '10px',
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : '#F8FAFC',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          color: '#FFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {officer.name.split(' ').filter(Boolean).slice(-1)[0]?.[0] || 'O'}
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.68rem', display: 'block', lineHeight: 1 }}>
                          {officer.role}: <strong style={{ color: 'inherit' }}>{officer.name}</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, fontSize: '0.68rem', display: 'block', mt: 0.3, lineHeight: 1 }}>
                          {officer.title}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Mandate Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.82rem',
                        lineHeight: 1.55,
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '2.5em',
                      }}
                    >
                      {committee.mandate || committee.description || 'Mandated to maintain statutory governance and institutional decision compliance.'}
                    </Typography>

                    {/* AI Compliance Health Bar */}
                    <Box sx={{ mb: 2.2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.68rem', color: 'text.secondary' }}>
                          Statutory Health Index
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.72rem', color: colorCfg.barColor }}>
                          {scoreVal}%
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: '100%',
                          height: 5,
                          borderRadius: '4px',
                          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            width: `${Math.min(100, Math.max(10, scoreVal))}%`,
                            height: '100%',
                            background: colorCfg.gradient,
                            borderRadius: '4px',
                            transition: 'width 0.6s ease',
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Footer Section */}
                  <Box>
                    <Divider sx={{ mb: 1.8 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: 'text.secondary' }}>
                        <PeopleIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.primary' }}>
                          {committee.member_count || 8} Members
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: 'text.secondary' }}>
                        <EventIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.primary' }}>
                          {committee.meeting_frequency || 2}x / {(committee.frequency_unit || 'YEAR').toLowerCase()}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      className="action-btn"
                      variant="outlined"
                      fullWidth
                      component={Link}
                      to={`/committees/${committee.id}`}
                      endIcon={<ArrowIcon sx={{ transition: 'transform 0.2s ease' }} />}
                      sx={{
                        borderRadius: '12px',
                        fontWeight: 800,
                        textTransform: 'none',
                        py: 0.9,
                        fontSize: '0.84rem',
                        borderColor: 'divider',
                        transition: 'all 0.2s ease',
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
