import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,
  Grid,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Avatar,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  People as PeopleIcon,
  Event as EventIcon,
  VerifiedUser as ComplianceIcon,
  Description as DocumentIcon,
  PlayArrow as PlayIcon,
  AutoAwesome as SparkleIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import { committeesApi, complianceApi } from '../../services/api';

export default function CommitteeDetailPage() {
  const { id } = useParams();
  const [tabIndex, setTabIndex] = useState(0);
  const [committee, setCommittee] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, fetch from committeesApi.get(id)
    setCommittee({
      id: id || 'ac',
      name: id === 'rac' ? 'Research Advisory Committee' : id === 'fc' ? 'Finance Committee' : 'Academic Council',
      code: id === 'rac' ? 'RAC' : id === 'fc' ? 'FC' : 'AC',
      committee_type: 'STATUTORY',
      authority: id === 'rac' ? 'UGC Research Regulations 2024' : 'UGC Act §12',
      status: id === 'rac' ? 'NON_COMPLIANT' : id === 'fc' ? 'WARNING' : 'COMPLIANT',
      mandate: 'Principal statutory body responsible for institutional academic policy, curriculum approvals, research governance, and statutory quality criteria.',
      quorum_type: 'FRACTION',
      quorum_value: 0.5,
      meeting_frequency: 4,
      frequency_unit: 'YEAR',
      members: [
        { id: '1', name: 'Dr. P. Nagabhushan', role: 'Chairperson', designation: 'Vice Chancellor', type: 'INTERNAL', tenure_end: '2027-06-30' },
        { id: '2', name: 'Dr. M. S. Rao', role: 'Member Secretary', designation: 'Dean Academics', type: 'INTERNAL', tenure_end: '2026-12-31' },
        { id: '3', name: 'Prof. K. Sunitha', role: 'Faculty Member', designation: 'Professor CSE', type: 'INTERNAL', tenure_end: '2027-03-31' },
        { id: '4', name: 'Dr. T. S. Murthy', role: 'External Academician', designation: 'Director, NIT Warangal', type: 'EXTERNAL', tenure_end: '2026-08-31' },
        { id: id === 'rac' ? null : '5', name: id === 'rac' ? '[VACANT - Industry Expert]' : 'Mr. V. Anand', role: 'External Industry Expert', designation: id === 'rac' ? 'Mandatory Vacancy' : 'VP, Tech Mahindra', type: 'EXTERNAL', tenure_end: '2026-11-30', isDeficit: id === 'rac' },
      ].filter(Boolean),
    });
    setLoading(false);
  }, [id]);

  return (
    <Box>
      {/* Back link */}
      <Box sx={{ mb: 2 }}>
        <Button component={Link} to="/committees" startIcon={<BackIcon />} sx={{ color: '#64748B', fontWeight: 600 }}>
          Back to Committees Directory
        </Button>
      </Box>

      {/* Hero Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          bgcolor: '#FFF',
          border: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Chip label={committee?.code} size="small" sx={{ fontWeight: 800, bgcolor: '#1E3A8A', color: '#FFF' }} />
            <Chip
              label={committee?.status?.replace('_', ' ')}
              size="small"
              sx={{
                fontWeight: 800,
                bgcolor: committee?.status === 'COMPLIANT' ? '#ECFDF5' : '#FEF2F2',
                color: committee?.status === 'COMPLIANT' ? '#065F46' : '#991B1B',
              }}
            />
            <Chip label={committee?.committee_type} size="small" sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 700 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E3A8A' }}>
            {committee?.name}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
            Statutory Authority: <strong>{committee?.authority}</strong> • Mandate: {committee?.mandate}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<PlayIcon />}
            component={Link}
            to="/meetings/ac-01"
            sx={{ bgcolor: '#1E3A8A', fontWeight: 700 }}
          >
            Live Meeting Console
          </Button>
          <Button
            variant="outlined"
            startIcon={<SparkleIcon sx={{ color: '#F59E0B' }} />}
            component={Link}
            to="/agent"
            sx={{ fontWeight: 700 }}
          >
            CommiAI Audit
          </Button>
        </Box>
      </Paper>

      {/* 5-Tab Navigation */}
      <Paper elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', mb: 3 }}>
        <Tabs
          value={tabIndex}
          onChange={(e, val) => setTabIndex(val)}
          sx={{
            px: 2,
            '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '0.9rem', minHeight: 52 },
          }}
        >
          <Tab label="Committee Hierarchy & Members" />
          <Tab label="Statutory Meetings & Quorum" />
          <Tab label="Compliance Diagnostics" />
          <Tab label="Official Documents & Act" />
        </Tabs>
      </Paper>

      {/* Tab 0: Members */}
      {tabIndex === 0 && (
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E3A8A' }}>
                Active Composition & Hierarchy
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Statutory positions and tenure duration compliance
              </Typography>
            </Box>
            <Button size="small" variant="outlined" sx={{ fontWeight: 700 }}>
              + Add Member Nomination
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Member Name & Designation</TableCell>
                  <TableCell>Committee Role</TableCell>
                  <TableCell>Affiliation Type</TableCell>
                  <TableCell>Tenure Expiry</TableCell>
                  <TableCell>Compliance Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {committee?.members?.map((m) => (
                  <TableRow key={m.id || Math.random()}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: m.isDeficit ? '#FEF2F2' : '#1E3A8A', color: m.isDeficit ? '#DC2626' : '#FFF', width: 36, height: 36, fontWeight: 700, fontSize: '0.85rem' }}>
                          {m.name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: m.isDeficit ? '#DC2626' : '#0F172A' }}>
                            {m.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {m.designation}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={m.role} size="small" sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem' }} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={m.type}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: m.type === 'EXTERNAL' ? '#EFF6FF' : '#F1F5F9',
                          color: m.type === 'EXTERNAL' ? '#1E40AF' : '#475569',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {m.tenure_end}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {m.isDeficit ? (
                        <Chip label="DEFICIT - VACANCY" size="small" sx={{ bgcolor: '#FEF2F2', color: '#991B1B', fontWeight: 800, fontSize: '0.65rem' }} />
                      ) : (
                        <Chip label="VALID" size="small" sx={{ bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 800, fontSize: '0.65rem' }} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Tab 1: Meetings */}
      {tabIndex === 1 && (
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E3A8A' }}>
              Statutory Meetings & Ratified Minutes
            </Typography>
            <Button variant="contained" size="small" component={Link} to="/meetings/new" sx={{ bgcolor: '#1E3A8A' }}>
              Schedule Session
            </Button>
          </Box>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Academic Council - 42nd Regular Session
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Tomorrow at 10:30 AM • Quorum: 8/12 Confirmed
              </Typography>
            </Box>
            <Button variant="contained" size="small" component={Link} to="/meetings/ac-01" sx={{ bgcolor: '#1E3A8A' }}>
              Open Console
            </Button>
          </Paper>
        </Card>
      )}

      {/* Tab 2: Compliance */}
      {tabIndex === 2 && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E3A8A', mb: 1 }}>
            Deterministic Statutory Diagnostics
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
            This evaluation is mathematically computed by the backend compliance engine based on the UGC/AICTE statutory rulebook.
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
                  Composition Health
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, my: 1, color: '#059669' }}>
                  100%
                </Typography>
                <Typography variant="caption" sx={{ color: '#059669' }}>
                  All mandatory internal & external categories present
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
                  Meeting Frequency
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, my: 1, color: '#059669' }}>
                  4 / 4 Required
                </Typography>
                <Typography variant="caption" sx={{ color: '#059669' }}>
                  Met minimum 4 statutory meetings per calendar year
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
                  Tenure Integrity
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, my: 1, color: '#059669' }}>
                  Valid
                </Typography>
                <Typography variant="caption" sx={{ color: '#059669' }}>
                  No members currently exceed statutory 3-year term
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* Tab 3: Documents */}
      {tabIndex === 3 && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E3A8A', mb: 2 }}>
            Statutory Orders & Gazette Notifications
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {['Vignan University Statutory By-Laws 2024.pdf', 'UGC Minimum Standards Notification.pdf'].map((doc, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <DocumentIcon sx={{ color: '#1E3A8A' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{doc}</Typography>
                </Box>
                <Button size="small" variant="text">View Document</Button>
              </Paper>
            ))}
          </Box>
        </Card>
      )}
    </Box>
  );
}
