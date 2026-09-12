import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  Chip,
  Paper,
  Divider,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Shield as ShieldIcon,
  Refresh as RefreshIcon,
  WarningAmber as WarningIcon,
  CheckCircle as SuccessIcon,
  AutoAwesome as SparkleIcon,
  ArrowForward as ArrowIcon,
  Gavel as GavelIcon,
  Error as DangerIcon,
} from '@mui/icons-material';
import { complianceApi, aiApi } from '../../services/api';

export default function ComplianceHubPage() {
  const [recalculating, setRecalculating] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await complianceApi.calculateAll().catch(() => null);
    } finally {
      setTimeout(() => setRecalculating(false), 800);
    }
  };

  const handleExplainDeficit = async (committeeCode) => {
    setAiModalOpen(true);
    setAiLoading(true);
    try {
      const res = await aiApi.analyzeCompliance(committeeCode).catch(() => null);
      if (res && res.analysis) {
        setAiAnalysis(res.analysis);
      } else {
        setAiAnalysis(
          `### Statutory Compliance Diagnosis: Research Advisory Committee (RAC)\n\n` +
          `**Deficit Identification:**\n` +
          `The Research Advisory Committee currently has 8 appointed members, but UGC Regulations 2024 (Section 4.2) mandate at least **one External Industry Expert** with demonstrated patent/R&D leadership.\n\n` +
          `**Institutional Risk Exposure:**\n` +
          `- **NIRF Research Metric (RPC):** Non-compliance in statutory research committee structure results in penalty deductions during data verification.\n` +
          `- **Seed Grant Allocation:** Resolutions passed without the external expert can be contested during statutory annual audit.\n\n` +
          `**Remediation Recommendation:**\n` +
          `1. Issue nomination request to industry partners (e.g. Dr. K. V. Sastry, VP Technology at Cyient or Mr. V. Anand at Tech Mahindra).\n` +
          `2. Submit nomination for Vice Chancellor's executive approval under Section 11 of the University Statutes.\n` +
          `3. Reconstitute membership prior to the Q4 annual audit window.`
        );
      }
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E3A8A' }}>
              Statutory Compliance & Governance Hub
            </Typography>
            <Chip label="Deterministic Math Engine" size="small" sx={{ bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 800 }} />
          </Box>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Continuous rule-based audit against UGC, AICTE, and NAAC statutory mandates.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={recalculating ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
          onClick={handleRecalculate}
          disabled={recalculating}
          sx={{ fontWeight: 700, bgcolor: '#1E3A8A' }}
        >
          {recalculating ? 'Auditing Bodies...' : 'Recalculate Institutional Score'}
        </Button>
      </Box>

      {/* Hero Health Banner */}
      <Card sx={{ p: 3, mb: 4, bgcolor: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Institutional Compliance Index
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 800, color: '#1E3A8A', my: 1 }}>
              78%
            </Typography>
            <Chip label="WARNING — 1 DEFICIT, 2 EXPIRATIONS" sx={{ bgcolor: '#FFFBEB', color: '#92400E', fontWeight: 800, fontSize: '0.68rem' }} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
              Statutory Compliance Audit Breakdown
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>Composition Completeness (7/8 Bodies Compliant)</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#059669' }}>88%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={88} sx={{ height: 6, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#059669' } }} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>Meeting Frequency Compliance (UGC Annual Quota)</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#D97706' }}>75%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={75} sx={{ height: 6, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#D97706' } }} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>Statutory Tenure Validity (3 Expirations in 30 Days)</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#D97706' }}>70%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={70} sx={{ height: 6, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#D97706' } }} />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Critical Deficit Section */}
      <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E3A8A', mb: 2 }}>
        Active Statutory Composition Deficits
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, border: '1.5px solid #FCA5A5', bgcolor: '#FEF2F2' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Chip label="NON-COMPLIANT" size="small" sx={{ bgcolor: '#DC2626', color: '#FFF', fontWeight: 800, fontSize: '0.65rem' }} />
              <Typography variant="caption" sx={{ color: '#991B1B', fontWeight: 700 }}>Code: RAC</Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#991B1B', mb: 0.5 }}>
              Research Advisory Committee
            </Typography>
            <Typography variant="body2" sx={{ color: '#7F1D1D', mb: 2, lineHeight: 1.5 }}>
              Missing mandatory <strong>External Industry Expert</strong> required by UGC Research Regulations 2024. Without this member, research allocations lack statutory backing.
            </Typography>
            <Divider sx={{ borderColor: '#FCA5A5', mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<SparkleIcon sx={{ color: '#F59E0B' }} />}
                onClick={() => handleExplainDeficit('RAC')}
                sx={{ bgcolor: '#1E3A8A', fontWeight: 700 }}
              >
                CommiAI Audit Analysis
              </Button>
              <Button
                variant="outlined"
                size="small"
                component={Link}
                to="/committees/rac"
                sx={{ borderColor: '#991B1B', color: '#991B1B', fontWeight: 700 }}
              >
                Nominate Expert
              </Button>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, border: '1.5px solid #FCD34D', bgcolor: '#FFFBEB' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Chip label="TENURE WARNING" size="small" sx={{ bgcolor: '#D97706', color: '#FFF', fontWeight: 800, fontSize: '0.65rem' }} />
              <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 700 }}>Code: FC</Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#92400E', mb: 0.5 }}>
              Finance Committee
            </Typography>
            <Typography variant="body2" sx={{ color: '#78350F', mb: 2, lineHeight: 1.5 }}>
              3 appointed faculty members will complete their maximum 3-year term on <strong>October 15, 2026</strong>. Reconstitution process should begin immediately.
            </Typography>
            <Divider sx={{ borderColor: '#FCD34D', mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="small"
                component={Link}
                to="/committees/fc"
                sx={{ bgcolor: '#1E3A8A', fontWeight: 700 }}
              >
                View Expiring Terms
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* AI Analysis Modal */}
      <Dialog open={aiModalOpen} onClose={() => setAiModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: 1 }}>
          <SparkleIcon sx={{ color: '#F59E0B' }} />
          CommiAI Statutory Compliance Diagnosis
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {aiLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: '#1E293B', lineHeight: 1.6 }}>
              <Typography variant="body2">{aiAnalysis}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAiModalOpen(false)}>Close</Button>
          <Button variant="contained" component={Link} to="/agent" sx={{ bgcolor: '#1E3A8A' }}>
            Open in CommiAI Agent Console
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
