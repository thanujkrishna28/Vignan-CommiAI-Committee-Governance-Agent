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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Download as DownloadIcon,
  AutoAwesome as SparkleIcon,
} from '@mui/icons-material';
import { complianceApi } from '../../services/api';
import PortalGreetingBanner from '../../components/common/PortalGreetingBanner';

export default function IqacDashboard() {
  const [complianceList, setComplianceList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complianceApi.listAll().then((data) => {
      setComplianceList(data || []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>
      {/* IQAC Header Banner */}
      <PortalGreetingBanner
        roleTitle="IQAC Coordinator"
        badgeText="Dr. E. Deepak Chowdary • Asst. Prof., CSE"
        statusText="Internal Quality Assurance Cell • Audit statutory committee compositions, enforce UGC/AICTE mandates, and compile institutional evidence."
        quoteText="“Quality Assurance. Accreditation Readiness. Continuous Institutional Improvement.” — Vignan CommiAI Governance Engine"
        accentColor="#10B981"
        actionButtons={
          <>
            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              component={Link}
              to="/reports"
              sx={{ bgcolor: '#10B981', color: '#0B172E', fontWeight: 700, '&:hover': { bgcolor: '#34D399' } }}
            >
              Export NAAC SSR Packet
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SparkleIcon sx={{ color: '#F59E0B' }} />}
              component={Link}
              to="/agent"
              sx={{ color: 'text.primary', borderColor: 'divider', bgcolor: 'background.paper', fontWeight: 600 }}
            >
              Audit AI Explainer
            </Button>
          </>
        }
      />

      {/* IQAC Audit Metrics */}
      <Grid container spacing={1.5} sx={{ width: '100%' }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 1.8, borderRadius: '14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              NAAC Criterion 6.5 Index
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#10B981', fontSize: '1.65rem', my: 0.4 }}>
              3.82 / 4.0
            </Typography>
            <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600, fontSize: '0.74rem' }}>
              Institutional Governance Rating (A++)
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 1.8, borderRadius: '14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Statutory Deficits
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#EF4444', fontSize: '1.65rem', my: 0.4 }}>
              1 Committee
            </Typography>
            <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 600, fontSize: '0.74rem' }}>
              • RAC missing External Industry Expert
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 1.8, borderRadius: '14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Tenure Expirations Ahead
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#F59E0B', fontSize: '1.65rem', my: 0.4 }}>
              3 Members
            </Typography>
            <Typography variant="caption" sx={{ color: '#F59E0B', fontWeight: 600, fontSize: '0.74rem' }}>
              • Expiring within 30 days (Finance Committee)
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 1.8, borderRadius: '14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Documented Evidence Chunks
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.65rem', my: 0.4 }}>
              48 Files
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.74rem' }}>
              Indexed in RAG repository for NIRF/UGC review
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Statutory Mandate Verification Matrix */}
      <Grid container spacing={2.5} sx={{ width: '100%' }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Statutory Bodies Compliance Audit Matrix
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Deterministic verification against UGC / AICTE statutory composition guidelines
                </Typography>
              </Box>
              <Button size="small" component={Link} to="/compliance" sx={{ fontWeight: 700 }}>
                Full Audit Hub →
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Committee</TableCell>
                    <TableCell>Statutory Authority</TableCell>
                    <TableCell>Mandatory Composition</TableCell>
                    <TableCell>Audit Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    {
                      name: 'Academic Council',
                      code: 'AC',
                      authority: 'UGC Regulations Clause 5',
                      mandate: 'Min 2 external academic experts • 50% quorum',
                      status: 'COMPLIANT',
                      color: '#10B981',
                      bgcolor: 'rgba(16, 185, 129, 0.15)',
                    },
                    {
                      name: 'Board of Studies (CSE)',
                      code: 'BoS',
                      authority: 'AICTE Norms 2026',
                      mandate: 'Industry representative mandatory • 2 Alumni experts',
                      status: 'COMPLIANT',
                      color: '#10B981',
                      bgcolor: 'rgba(16, 185, 129, 0.15)',
                    },
                    {
                      name: 'Research Advisory Committee',
                      code: 'RAC',
                      authority: 'DST / UGC Guidelines',
                      mandate: 'External Scientist required • Industry R&D leader',
                      status: 'DEFICIT DETECTED',
                      note: 'Missing Industry R&D expert nomination',
                      color: '#EF4444',
                      bgcolor: 'rgba(239, 68, 68, 0.15)',
                    },
                    {
                      name: 'Internal Complaints Committee',
                      code: 'ICC',
                      authority: 'POSH Act 2013 Statutory',
                      mandate: 'Presiding officer woman faculty • 50% women members',
                      status: 'COMPLIANT',
                      color: '#10B981',
                      bgcolor: 'rgba(16, 185, 129, 0.15)',
                    },
                  ].map((row, i) => (
                    <TableRow key={i} sx={{ '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={row.code} size="small" sx={{ fontWeight: 800, height: 20, fontSize: '0.65rem' }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {row.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          {row.authority}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {row.mandate}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.65rem',
                            bgcolor: row.bgcolor,
                            color: row.color,
                            border: `1px solid ${row.color}40`,
                          }}
                        />
                        {row.note && (
                          <Typography variant="caption" sx={{ color: row.color, display: 'block', fontSize: '0.68rem', mt: 0.3, fontWeight: 600 }}>
                            {row.note}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Right: Accreditation Packet Generator */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Accreditation Dossier Generator
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              One-click compilation for regulatory visits
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  NAAC SSR Metric 6.5.2
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                  Minutes of statutory bodies, action taken reports & IQAC initiatives.
                </Typography>
                <Button size="small" variant="contained" fullWidth component={Link} to="/reports" sx={{ textTransform: 'none', fontWeight: 700 }}>
                  Generate SSR Packet
                </Button>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  NIRF Governance Disclosure
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                  Committee meeting frequencies, attendee registers, and decisions ledger.
                </Typography>
                <Button size="small" variant="outlined" fullWidth component={Link} to="/reports" sx={{ textTransform: 'none', fontWeight: 700 }}>
                  Generate NIRF Dossier
                </Button>
              </Paper>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
