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
        <Box sx={{ pb: 3, borderBottom: '2px solid #1E3A8A', mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, mb: 1.5, flexWrap: 'wrap' }}>
            <Box
              component="img"
              src="/vignan-official-logo.png"
              alt="Vignan University Seal"
              onError={(e) => { e.target.src = '/vignan-logo.png'; }}
              sx={{ width: 72, height: 72, objectFit: 'contain' }}
            />
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '0.03em', fontSize: { xs: '1.1rem', sm: '1.35rem' } }}>
                Vignan's Foundation for Science, Technology & Research
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', fontWeight: 700, mt: 0.3 }}>
                (Deemed to be University under Section 3 of UGC Act 1956) • Vadlamudi, Guntur - 522213, AP
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                NAAC 'A+' Accredited Institution • Internal Quality Assurance Cell (IQAC) Statutory Archive
              </Typography>
            </Box>
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#C69214', mt: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            OFFICIAL COMPLIANCE DOSSIER — AY 2025-2026
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
            Document Reference: VIGNAN/REG/GOV/2026/09 • Verified &amp; Digitally Certified on {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Typography>
        </Box>

        {/* Report Content - Switch dynamically by selectedReport */}
        {selectedReport === 'NAAC_SSR' && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E3A8A', mb: 1 }}>
              Criterion 6.5.2: Institutional Committee Governance &amp; Minutes Record
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6, mb: 3 }}>
              This verified audit dossier compiles the composition, mandated meeting frequencies, validated legal quorum, and approved minutes of statutory bodies constituted under University Statutes in conformity with UGC, AICTE, and NAAC accreditation frameworks.
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    <TableCell sx={{ fontWeight: 800 }}>Statutory Body</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Regulatory Authority</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Mandated / Held</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Avg Quorum</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Signed Minutes</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>NAAC Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { name: 'Academic Council (AC-001)', authority: 'UGC Act §12', meetings: '4 / 4', quorum: '84%', minutes: 'Digitally Signed', status: 'COMPLIANT' },
                    { name: 'Finance Committee (FC-001)', authority: 'Ministry of Education', meetings: '3 / 3', quorum: '86%', minutes: 'Digitally Signed', status: 'COMPLIANT' },
                    { name: 'Examination Committee (EC-001)', authority: 'Board of Examiners', meetings: '6 / 6', quorum: '90%', minutes: 'Digitally Signed', status: 'COMPLIANT' },
                    { name: 'Internal Complaints Committee (ICC-001)', authority: 'PoSH Act 2013', meetings: '4 / 4', quorum: '88%', minutes: 'Digitally Signed', status: 'COMPLIANT' },
                    { name: 'Anti-Ragging Committee (ARC-001)', authority: 'UGC Regulations 2009', meetings: '5 / 5', quorum: '92%', minutes: 'Digitally Signed', status: 'COMPLIANT' },
                    { name: 'Research Advisory Committee (RAC-001)', authority: 'AICTE Research Policy', meetings: '3 / 3', quorum: '77%', minutes: 'Under Review', status: 'ACTION REQUIRED' },
                    { name: 'Student Welfare Committee (SWC-001)', authority: 'University Charter', meetings: '4 / 4', quorum: '82%', minutes: 'Digitally Signed', status: 'COMPLIANT' },
                    { name: 'Library Committee (LC-001)', authority: 'NAAC Criteria 4', meetings: '3 / 3', quorum: '80%', minutes: 'Digitally Signed', status: 'COMPLIANT' },
                  ].map((row, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ fontWeight: 700 }}>{row.name}</TableCell>
                      <TableCell sx={{ color: '#64748B' }}>{row.authority}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.meetings}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#059669' }}>{row.quorum}</TableCell>
                      <TableCell sx={{ color: '#2563EB', fontWeight: 600 }}>{row.minutes}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            bgcolor: row.status === 'COMPLIANT' ? '#ECFDF5' : '#FFFBEB',
                            color: row.status === 'COMPLIANT' ? '#065F46' : '#92400E',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {selectedReport === 'STATUTORY_AUDIT' && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E3A8A', mb: 1 }}>
              UGC &amp; Statutory Committee Composition Audit
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6, mb: 3 }}>
              Statutory verification of committee composition mandates, including minimum external expert representation, female representation under POSH Act 2013, student representatives, and active tenure compliance.
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    <TableCell sx={{ fontWeight: 800 }}>Committee Name</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Statutory Mandate</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Total Members</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>External Experts</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Tenure Validity</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Audit Verdict</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { name: 'Academic Council', mandate: 'UGC §12 (Min 2 External Profs)', total: '12 Members', external: '2 Appointed (IIT/NIT)', tenure: 'Active (Expires 2027)', verdict: 'VERIFIED' },
                    { name: 'Finance Committee', mandate: 'BoG Statute (Finance Officer)', total: '6 Members', external: '1 CA / External Member', tenure: '1 Member Expiring Soon', verdict: 'TENURE NOTICE' },
                    { name: 'Internal Complaints Committee', mandate: 'POSH 2013 (≥50% Women + NGO)', total: '7 Members', external: '1 NGO Representative', tenure: 'Active (Expires 2028)', verdict: 'VERIFIED' },
                    { name: 'Anti-Ragging Committee', mandate: 'UGC 2009 (Police & Media Rep)', total: '8 Members', external: '2 External (Police/Civil)', tenure: 'Active (Expires 2027)', verdict: 'VERIFIED' },
                    { name: 'Research Advisory Committee', mandate: 'AICTE Research (Industry R&D)', total: '7 Members', external: '0 Industry Expert', tenure: 'Active', verdict: 'DEFICIT (Add Industry Expert)' },
                    { name: 'Student Welfare Committee', mandate: 'University Charter (Student Reps)', total: '8 Members', external: '2 Student Council Reps', tenure: 'Active (Expires 2027)', verdict: 'VERIFIED' },
                  ].map((row, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ fontWeight: 700 }}>{row.name}</TableCell>
                      <TableCell sx={{ color: '#64748B', fontSize: '0.8rem' }}>{row.mandate}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.total}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: row.external.startsWith('0') ? '#DC2626' : 'text.primary' }}>{row.external}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', color: row.tenure.includes('Expiring') ? '#D97706' : '#475569' }}>{row.tenure}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.verdict}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            bgcolor: row.verdict === 'VERIFIED' ? '#ECFDF5' : row.verdict.includes('TENURE') ? '#FFFBEB' : '#FEF2F2',
                            color: row.verdict === 'VERIFIED' ? '#065F46' : row.verdict.includes('TENURE') ? '#92400E' : '#991B1B',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {selectedReport === 'MEETING_QUORUM' && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E3A8A', mb: 1 }}>
              Annual Meetings &amp; Quorum Attendance Register
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6, mb: 3 }}>
              Chronological roll-call ledger of all convened statutory sessions, physical and virtual attendance counts, statutory quorum threshold verification, and legal ratification validity.
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    <TableCell sx={{ fontWeight: 800 }}>Session ID &amp; Title</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Convened Date</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Venue &amp; Mode</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Attendance Breakdown</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Quorum Attainment</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Legal Ratification</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { id: 'AC-2026-03', title: 'Academic Council - 42nd Session', date: '25 Sep 2026', venue: 'Senate Hall (Hybrid)', att: '10 / 12 (8 In-person, 2 Virtual)', quorum: '83% (Req: 50%)', status: 'RATIFIED' },
                    { id: 'FC-2026-02', title: 'Finance Committee - Q3 Budget Review', date: '15 Sep 2026', venue: 'Board Room', att: '5 / 6 (5 In-person)', quorum: '83% (Req: 50%)', status: 'RATIFIED' },
                    { id: 'ICC-2026-02', title: 'ICC Quarterly Compliance Session', date: '28 Aug 2026', venue: 'Conference Hall B', att: '6 / 7 (4 In-person, 2 Virtual)', quorum: '86% (Req: 50%)', status: 'RATIFIED' },
                    { id: 'EC-2026-04', title: 'Examination Results Moderation Session', date: '10 Aug 2026', venue: 'CoE Secure Room', att: '5 / 5 (5 In-person)', quorum: '100% (Req: 50%)', status: 'RATIFIED' },
                    { id: 'ARC-2026-03', title: 'Anti-Ragging Vigilance Review', date: '22 Jul 2026', venue: 'Main Auditorium', att: '7 / 8 (7 In-person)', quorum: '88% (Req: 50%)', status: 'RATIFIED' },
                    { id: 'SWC-2026-02', title: 'Student Welfare & Grievance Review', date: '18 Jul 2026', venue: 'Student Affairs Office', att: '6 / 8 (6 In-person)', quorum: '75% (Req: 50%)', status: 'RATIFIED' },
                  ].map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{row.title}</Typography>
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>#{row.id}</Typography>
                      </TableCell>
                      <TableCell sx={{ color: '#475569', fontWeight: 600 }}>{row.date}</TableCell>
                      <TableCell sx={{ color: '#64748B', fontSize: '0.8rem' }}>{row.venue}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.att}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#059669' }}>{row.quorum}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            bgcolor: '#ECFDF5',
                            color: '#065F46',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {selectedReport === 'ACTION_MATRIX' && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E3A8A', mb: 1 }}>
              Action Taken Reports (ATR) &amp; Resolution Traceability Ledger
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6, mb: 3 }}>
              Formal traceability matrix mapping statutory resolutions passed in committee sessions to assigned institutional officers, target implementation milestones, and verified Action Taken Reports (ATR).
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    <TableCell sx={{ fontWeight: 800 }}>Resolution / Action Item</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Originating Committee</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Assigned Responsibility</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Target Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>ATR Status</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Audit Closure</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { title: 'Curriculum Revision for AY 2026-27 under R24 Regulations', comm: 'Academic Council', resp: 'Dr. S. V. Phani Kumar (Dean Academics)', due: 'Aug 15, 2026', atr: 'ATR Submitted & Ratified', status: 'CLOSED' },
                    { title: 'Annual Capital Expenditure & Lab Modernization Budget', comm: 'Finance Committee', resp: 'Finance Secretary Dr. J. Vijetha Ananthi', due: 'Sep 01, 2026', atr: 'Disbursement Approved', status: 'CLOSED' },
                    { title: 'Deployment of Campus CCTV & Anti-Ragging Flying Squads', comm: 'Anti-Ragging Committee', resp: 'Prof. K. Venkateswara Rao', due: 'Jul 30, 2026', atr: 'Squads Active & Logs Logged', status: 'CLOSED' },
                    { title: 'Subscription Renewal for IEEE Xplore & ScienceDirect', comm: 'Library Committee', resp: 'Dr. K. B. S. Rao (Chief Librarian)', due: 'Oct 15, 2026', atr: 'Purchase Order Issued', status: 'IN PROGRESS' },
                    { title: 'Faculty Research Incentive Disbursement for SCI/Scopus', comm: 'Research Advisory Committee', resp: 'Dr. M. S. Rao (Director R&D)', due: 'Oct 30, 2026', atr: 'Application Verification Pending', status: 'IN PROGRESS' },
                    { title: 'Orientation Workshop on POSH Act 2013 for Freshers', comm: 'Internal Complaints Committee', resp: 'Dr. K. Sunitha (Presiding Officer)', due: 'Sep 20, 2026', atr: 'Conducted for 1,200 Students', status: 'CLOSED' },
                  ].map((row, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ fontWeight: 700, maxWidth: 260 }}>{row.title}</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.8rem' }}>{row.comm}</TableCell>
                      <TableCell sx={{ color: '#475569', fontSize: '0.82rem' }}>{row.resp}</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.82rem' }}>{row.due}</TableCell>
                      <TableCell sx={{ color: row.status === 'CLOSED' ? '#059669' : '#D97706', fontWeight: 600, fontSize: '0.8rem' }}>{row.atr}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            bgcolor: row.status === 'CLOSED' ? '#ECFDF5' : '#FFFBEB',
                            color: row.status === 'CLOSED' ? '#065F46' : '#92400E',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

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
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                Dr. E. Deepak Chowdary
              </Typography>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <Box sx={{ height: 40 }} />
              <Divider sx={{ mb: 1 }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E3A8A', display: 'block' }}>
                Dean, Academics / Convener
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                Dr. S. V. Phani Kumar
              </Typography>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <Box sx={{ height: 40 }} />
              <Divider sx={{ mb: 1 }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E3A8A', display: 'block' }}>
                Registrar
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                Prof. Dr. K. V. Krishna Kishore
              </Typography>
            </Grid>
          </Grid>
      </Paper>
    </Box>
  );
}
