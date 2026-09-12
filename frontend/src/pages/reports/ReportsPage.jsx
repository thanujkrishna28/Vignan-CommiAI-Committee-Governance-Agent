import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  Assessment as ReportIcon,
  Verified as VerifiedIcon,
  School as UniversityIcon,
} from '@mui/icons-material';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('NAAC_SSR');

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E3A8A' }}>
            Accreditation & Institutional Reports
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Generate audit-ready evidence packets for NAAC, NIRF, UGC, and AICTE peer review teams.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ fontWeight: 700 }}>
            Print Formal Dossier
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={handlePrint} sx={{ bgcolor: '#1E3A8A', fontWeight: 700 }}>
            Export PDF
          </Button>
        </Box>
      </Box>

      {/* Report Selection Tabs */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        {[
          { id: 'NAAC_SSR', label: 'NAAC SSR Metric 6.5.2 (Governance & Minutes)' },
          { id: 'STATUTORY_AUDIT', label: 'UGC Statutory Committee Compliance Dossier' },
          { id: 'MEETING_QUORUM', label: 'Annual Meetings & Quorum Attendance Register' },
          { id: 'ACTION_MATRIX', label: 'Action Taken Reports (ATR) Ledger' },
        ].map((rep) => (
          <Chip
            key={rep.id}
            label={rep.label}
            clickable
            onClick={() => setSelectedReport(rep.id)}
            sx={{
              p: 1,
              fontWeight: 700,
              fontSize: '0.8rem',
              bgcolor: selectedReport === rep.id ? '#1E3A8A' : '#FFF',
              color: selectedReport === rep.id ? '#FFF' : '#475569',
              border: '1px solid #E2E8F0',
            }}
          />
        ))}
      </Box>

      {/* Printable Institutional Dossier Paper */}
      <Paper
        elevation={1}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          bgcolor: '#FFF',
          border: '1px solid #CBD5E1',
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        {/* University Official Header */}
        <Box sx={{ textAlign: 'center', pb: 3, borderBottom: '2px solid #1E3A8A', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Vignan's Foundation for Science, Technology & Research
          </Typography>
          <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, display: 'block', mt: 0.5 }}>
            (Deemed to be University under Section 3 of UGC Act 1956) • Vadlamudi, Guntur, AP
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#C69214', mt: 2, textTransform: 'uppercase' }}>
            OFFICIAL COMPLIANCE DOSSIER — AY 2025-2026
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            Document Reference: VIGNAN/REG/GOV/2026/09 • Generated on {new Date().toLocaleDateString()}
          </Typography>
        </Box>

        {/* Report Content */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E3A8A', mb: 1 }}>
            Criterion 6.5: Institutional Committee Governance & Minutes Record
          </Typography>
          <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6, mb: 3 }}>
            This verified audit dossier compiles the composition, meeting frequencies, validated legal quorum, and approved minutes of statutory bodies constituted under the University Statutes in conformity with UGC, AICTE, and statutory accreditation frameworks.
          </Typography>

          {/* Data Table */}
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell>Statutory Body</TableCell>
                  <TableCell>Regulatory Authority</TableCell>
                  <TableCell>Meetings Held</TableCell>
                  <TableCell>Average Quorum</TableCell>
                  <TableCell>Statutory Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { name: 'Academic Council', authority: 'UGC Act §12', meetings: '4 / 4', quorum: '84%', status: 'COMPLIANT' },
                  { name: 'Board of Governors', authority: 'University Charter', meetings: '3 / 3', quorum: '78%', status: 'COMPLIANT' },
                  { name: 'Finance Committee', authority: 'Statute 8', meetings: '3 / 3', quorum: '86%', status: 'WARNING (Tenure)' },
                  { name: 'Research Advisory Committee', authority: 'UGC Research 2024', meetings: '2 / 2', quorum: '77%', status: 'DEFICIT (Industry Expert)' },
                  { name: 'Internal Complaints Committee', authority: 'PoSH Act 2013', meetings: '2 / 2', quorum: '88%', status: 'COMPLIANT' },
                  { name: 'Anti-Ragging Committee', authority: 'Supreme Court Directive', meetings: '3 / 3', quorum: '91%', status: 'COMPLIANT' },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ fontWeight: 700 }}>{row.name}</TableCell>
                    <TableCell sx={{ color: '#64748B' }}>{row.authority}</TableCell>
                    <TableCell>{row.meetings}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#059669' }}>{row.quorum}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          bgcolor: row.status.includes('COMPLIANT') ? '#ECFDF5' : row.status.includes('WARNING') ? '#FFFBEB' : '#FEF2F2',
                          color: row.status.includes('COMPLIANT') ? '#065F46' : row.status.includes('WARNING') ? '#92400E' : '#991B1B',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0', mb: 4 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E3A8A', mb: 0.5 }}>
              Institutional Certification of Minutes & Action Taken:
            </Typography>
            <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.5, display: 'block' }}>
              I hereby certify that all minutes recorded in this dossier reflect true deliberations conducted with verified statutory quorum. All resolutions have been entered into the institutional resolution register and assigned for administrative compliance.
            </Typography>
          </Box>

          {/* Official Signatures Footer */}
          <Grid container spacing={4} sx={{ pt: 4, mt: 2, borderTop: '1px solid #E2E8F0' }}>
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <Box sx={{ height: 40 }} />
              <Divider sx={{ mb: 1 }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E3A8A', display: 'block' }}>
                Director, IQAC
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Dr. B. Prasad
              </Typography>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <Box sx={{ height: 40 }} />
              <Divider sx={{ mb: 1 }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E3A8A', display: 'block' }}>
                Dean, Academics
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Dr. M. S. Rao
              </Typography>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <Box sx={{ height: 40 }} />
              <Divider sx={{ mb: 1 }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E3A8A', display: 'block' }}>
                Registrar
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Dr. R. K. Sharma
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}
