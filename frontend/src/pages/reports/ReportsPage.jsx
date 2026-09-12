import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
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
  CircularProgress,
} from '@mui/material';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  VerifiedUser as VerifiedIcon,
  WorkspacePremium as PremiumIcon,
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('NAAC_SSR');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const dossierRef = useRef(null);

  const reportNames = {
    NAAC_SSR: 'Vignan_NAAC_SSR_Metric_6_5_2_Dossier_2026',
    STATUTORY_AUDIT: 'Vignan_UGC_Statutory_Compliance_Audit_2026',
    MEETING_QUORUM: 'Vignan_Annual_Quorum_Attendance_Register_2026',
    ACTION_MATRIX: 'Vignan_ATR_Resolution_Traceability_Ledger_2026',
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    if (!dossierRef.current || isExportingPdf) return;
    setIsExportingPdf(true);

    try {
      const element = dossierRef.current;
      
      // High-resolution canvas capture with cloned fixed-width layout
      const canvas = await html2canvas(element, {
        scale: 2.8,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.print-dossier-root');
          if (clonedElement) {
            clonedElement.style.width = '820px';
            clonedElement.style.maxWidth = '820px';
            clonedElement.style.minWidth = '820px';
            clonedElement.style.padding = '28px 32px';
            clonedElement.style.margin = '0';
            clonedElement.style.border = 'none';
            clonedElement.style.boxShadow = 'none';
            clonedElement.style.borderRadius = '0';
            clonedElement.style.boxSizing = 'border-box';
            clonedElement.style.backgroundColor = '#FFFFFF';
          }
        },
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Standard A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 8; // 8mm margin
      
      const availableWidth = pdfWidth - (margin * 2); // 194mm
      const availableHeight = pdfHeight - (margin * 2); // 281mm

      const imgRatio = canvas.height / canvas.width;
      const naturalHeight = availableWidth * imgRatio;

      // Single-page exact fit
      if (naturalHeight <= availableHeight * 1.05) {
        const finalHeight = Math.min(naturalHeight, availableHeight);
        const finalWidth = finalHeight === availableHeight ? (availableHeight / imgRatio) : availableWidth;
        const xOffset = margin + (availableWidth - finalWidth) / 2;

        pdf.addImage(imgData, 'PNG', xOffset, margin, finalWidth, finalHeight, undefined, 'FAST');
      } else {
        // Multi-page slicing if data exceeds 1 page
        let heightLeft = naturalHeight;
        let position = margin;

        pdf.addImage(imgData, 'PNG', margin, position, availableWidth, naturalHeight, undefined, 'FAST');
        heightLeft -= availableHeight;

        while (heightLeft > 0) {
          position = heightLeft - naturalHeight + margin;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', margin, position, availableWidth, naturalHeight, undefined, 'FAST');
          heightLeft -= availableHeight;
        }
      }

      const fileName = `${reportNames[selectedReport] || 'Vignan_Compliance_Dossier'}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // High-contrast status badge renderer
  const renderStatusBadge = (status) => {
    const isPositive = ['COMPLIANT', 'VERIFIED', 'CLOSED', 'RATIFIED'].includes(status);
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1,
          py: 0.3,
          borderRadius: '4px',
          fontSize: '0.64rem',
          fontWeight: 800,
          letterSpacing: '0.03em',
          backgroundColor: isPositive ? '#DCFCE7' : '#FEF3C7',
          color: isPositive ? '#14532D' : '#78350F',
          border: '1px solid',
          borderColor: isPositive ? '#86EFAC' : '#FDE68A',
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontSize: '0.6rem' }}>{isPositive ? '✔' : '▲'}</span>
        {status}
      </Box>
    );
  };

  return (
    <Box>
      {/* Top Action Bar (Hidden in Print) */}
      <Box className="no-print" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F2942' }}>
            Accreditation & Institutional Reports
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Generate audit-ready statutory dossiers for NAAC, NIRF, UGC, and AICTE peer review committees.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ fontWeight: 700, borderColor: '#CBD5E1', color: '#1E293B' }}>
            Print Dossier
          </Button>
          <Button
            variant="contained"
            disabled={isExportingPdf}
            startIcon={isExportingPdf ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
            onClick={handleExportPdf}
            sx={{ bgcolor: '#0B2545', fontWeight: 700, minWidth: 140, '&:hover': { bgcolor: '#133E6E' } }}
          >
            {isExportingPdf ? 'Generating...' : 'Export PDF'}
          </Button>
        </Box>
      </Box>

      {/* Report Selection Tabs (Hidden in Print) */}
      <Box className="no-print" sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
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
              bgcolor: selectedReport === rep.id ? '#0B2545' : '#FFF',
              color: selectedReport === rep.id ? '#FFF' : '#475569',
              border: '1px solid #CBD5E1',
            }}
          />
        ))}
      </Box>

      {/* Printable Institutional Dossier Paper */}
      <Paper
        ref={dossierRef}
        elevation={0}
        className="print-dossier-root"
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: 2,
          bgcolor: '#FFFFFF',
          color: '#0F172A',
          border: '1px solid #CBD5E1',
          maxWidth: 920,
          margin: '0 auto',
          '@media print': {
            border: 'none !important',
            boxShadow: 'none !important',
            p: '0 !important',
            m: '0 !important',
            maxWidth: '100% !important',
            width: '100% !important',
            borderRadius: 0,
          },
        }}
      >
        {/* Official University Letterhead Header */}
        <Box sx={{ pb: 2, borderBottom: '3px solid #0B2545', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
            {/* University Crest & Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                component="img"
                src="/vignan-official-logo.png"
                alt="Vignan Seal"
                onError={(e) => { e.target.src = '/vignan-logo.png'; }}
                sx={{ width: 68, height: 68, objectFit: 'contain' }}
              />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0B2545', textTransform: 'uppercase', letterSpacing: '0.02em', fontSize: '1.12rem', lineHeight: 1.2 }}>
                  Vignan's Foundation for Science, Technology & Research
                </Typography>
                <Typography variant="body2" sx={{ color: '#334155', fontWeight: 700, mt: 0.2, fontSize: '0.78rem' }}>
                  (Deemed to be University under Section 3 of UGC Act 1956) • Vadlamudi, Guntur - 522213, AP
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.7rem' }}>
                  Internal Quality Assurance Cell (IQAC) • Statutory Governance & Accreditation Secretariat
                </Typography>
              </Box>
            </Box>

            {/* NAAC A+ Accreditation Emblem */}
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', px: 1.2, py: 0.4, borderRadius: 1 }}>
                <PremiumIcon sx={{ fontSize: 16, color: '#D97706' }} />
                <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.72rem' }}>
                  NAAC 'A+' GRADE
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ display: 'block', color: '#64748B', fontWeight: 600, fontSize: '0.64rem', mt: 0.3 }}>
                UGC Category-1 Deemed University
              </Typography>
            </Box>
          </Box>
          
          {/* Gold & Navy Compliance Banner */}
          <Box sx={{ bgcolor: '#0B2545', color: '#FFFFFF', px: 2, py: 0.8, borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#FDE047', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.78rem' }}>
              OFFICIAL COMPLIANCE DOSSIER — ACADEMIC YEAR 2025-2026
            </Typography>
            <Typography variant="caption" sx={{ color: '#E2E8F0', fontWeight: 600, fontSize: '0.7rem' }}>
              Ref: VFSTR/REG/GOV/2026/09 • Digitally Certified on {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Typography>
          </Box>
        </Box>

        {/* Report Content - Switch dynamically by selectedReport */}
        {selectedReport === 'NAAC_SSR' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0B2545', mb: 0.3, fontSize: '0.92rem' }}>
              Criterion 6.5.2: Institutional Committee Governance & Minutes Record
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.4, mb: 1.6, fontSize: '0.76rem' }}>
              This verified audit dossier compiles the composition, mandated meeting frequencies, validated legal quorum, and approved minutes of statutory bodies constituted under University Statutes in conformity with UGC, AICTE, and NAAC accreditation frameworks.
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, mb: 1.8, border: '1px solid #CBD5E1', overflow: 'hidden' }}>
              <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#0F172A' }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '25%' }}>Statutory Body</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '20%' }}>Regulatory Authority</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '12%' }}>Mandated / Held</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '13%' }}>Avg Quorum</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '15%' }}>Signed Minutes</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '15%' }}>NAAC Status</TableCell>
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
                    <TableRow key={i} sx={{ '&:nth-of-type(even)': { bgcolor: '#F8FAFC' }, borderBottom: '1px solid #E2E8F0' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.74rem', py: 0.55 }}>{row.name}</TableCell>
                      <TableCell sx={{ color: '#475569', fontSize: '0.72rem', py: 0.55 }}>{row.authority}</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', py: 0.55 }}>{row.meetings}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#047857', fontSize: '0.72rem', py: 0.55 }}>{row.quorum}</TableCell>
                      <TableCell sx={{ color: '#1D4ED8', fontWeight: 700, fontSize: '0.72rem', py: 0.55 }}>{row.minutes}</TableCell>
                      <TableCell sx={{ py: 0.55 }}>
                        {renderStatusBadge(row.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {selectedReport === 'STATUTORY_AUDIT' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0B2545', mb: 0.3, fontSize: '0.92rem' }}>
              UGC & Statutory Committee Composition Audit
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.4, mb: 1.6, fontSize: '0.76rem' }}>
              Statutory verification of committee composition mandates, including minimum external expert representation, female representation under POSH Act 2013, student representatives, and active tenure compliance.
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, mb: 1.8, border: '1px solid #CBD5E1', overflow: 'hidden' }}>
              <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#0F172A' }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '22%' }}>Committee Name</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '24%' }}>Statutory Mandate</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '13%' }}>Total Members</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '15%' }}>External Experts</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '14%' }}>Tenure Validity</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '12%' }}>Audit Verdict</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { name: 'Academic Council', mandate: 'UGC §12 (Min 2 External Profs)', total: '12 Members', external: '2 Appointed (IIT/NIT)', tenure: 'Active (Expires 2027)', verdict: 'VERIFIED' },
                    { name: 'Finance Committee', mandate: 'BoG Statute (Finance Officer)', total: '6 Members', external: '1 CA / External Member', tenure: '1 Member Expiring Soon', verdict: 'TENURE NOTICE' },
                    { name: 'Internal Complaints Committee', mandate: 'POSH 2013 (≥50% Women + NGO)', total: '7 Members', external: '1 NGO Representative', tenure: 'Active (Expires 2028)', verdict: 'VERIFIED' },
                    { name: 'Anti-Ragging Committee', mandate: 'UGC 2009 (Police & Media Rep)', total: '8 Members', external: '2 External (Police/Civil)', tenure: 'Active (Expires 2027)', verdict: 'VERIFIED' },
                    { name: 'Research Advisory Committee', mandate: 'AICTE Research (Industry R&D)', total: '7 Members', external: '0 Industry Expert', tenure: 'Active', verdict: 'DEFICIT' },
                    { name: 'Student Welfare Committee', mandate: 'University Charter (Student Reps)', total: '8 Members', external: '2 Student Council Reps', tenure: 'Active (Expires 2027)', verdict: 'VERIFIED' },
                  ].map((row, i) => (
                    <TableRow key={i} sx={{ '&:nth-of-type(even)': { bgcolor: '#F8FAFC' }, borderBottom: '1px solid #E2E8F0' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.74rem', py: 0.55 }}>{row.name}</TableCell>
                      <TableCell sx={{ color: '#64748B', fontSize: '0.72rem', py: 0.55 }}>{row.mandate}</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', py: 0.55 }}>{row.total}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: row.external.startsWith('0') ? '#DC2626' : '#1E293B', fontSize: '0.72rem', py: 0.55 }}>{row.external}</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', color: row.tenure.includes('Expiring') ? '#D97706' : '#475569', py: 0.55 }}>{row.tenure}</TableCell>
                      <TableCell sx={{ py: 0.55 }}>
                        {renderStatusBadge(row.verdict)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {selectedReport === 'MEETING_QUORUM' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0B2545', mb: 0.3, fontSize: '0.92rem' }}>
              Annual Meetings & Quorum Attendance Register
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.4, mb: 1.6, fontSize: '0.76rem' }}>
              Chronological roll-call ledger of all convened statutory sessions, physical and virtual attendance counts, statutory quorum threshold verification, and legal ratification validity.
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, mb: 1.8, border: '1px solid #CBD5E1', overflow: 'hidden' }}>
              <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#0F172A' }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '25%' }}>Session ID & Title</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '15%' }}>Convened Date</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '18%' }}>Venue & Mode</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '18%' }}>Attendance Breakdown</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '12%' }}>Quorum Attainment</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '12%' }}>Legal Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { id: 'AC-2026-03', title: 'Academic Council - 42nd Session', date: '25 Sep 2026', venue: 'Senate Hall (Hybrid)', att: '10 / 12 (8 Physical, 2 Online)', quorum: '83% (Req: 50%)', status: 'RATIFIED' },
                    { id: 'FC-2026-02', title: 'Finance Committee - Q3 Budget Review', date: '15 Sep 2026', venue: 'Board Room', att: '5 / 6 (5 Physical)', quorum: '83% (Req: 50%)', status: 'RATIFIED' },
                    { id: 'ICC-2026-02', title: 'ICC Quarterly Compliance Session', date: '28 Aug 2026', venue: 'Conference Hall B', att: '6 / 7 (4 Physical, 2 Online)', quorum: '86% (Req: 50%)', status: 'RATIFIED' },
                    { id: 'EC-2026-04', title: 'Examination Results Moderation', date: '10 Aug 2026', venue: 'CoE Secure Room', att: '5 / 5 (5 Physical)', quorum: '100% (Req: 50%)', status: 'RATIFIED' },
                    { id: 'ARC-2026-03', title: 'Anti-Ragging Vigilance Review', date: '22 Jul 2026', venue: 'Main Auditorium', att: '7 / 8 (7 Physical)', quorum: '88% (Req: 50%)', status: 'RATIFIED' },
                    { id: 'SWC-2026-02', title: 'Student Welfare & Grievance', date: '18 Jul 2026', venue: 'Student Affairs Office', att: '6 / 8 (6 Physical)', quorum: '75% (Req: 50%)', status: 'RATIFIED' },
                  ].map((row, i) => (
                    <TableRow key={i} sx={{ '&:nth-of-type(even)': { bgcolor: '#F8FAFC' }, borderBottom: '1px solid #E2E8F0' }}>
                      <TableCell sx={{ py: 0.55 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.74rem' }}>{row.title}</Typography>
                        <Typography variant="caption" sx={{ color: '#1D4ED8', fontWeight: 700, fontSize: '0.68rem' }}>#{row.id}</Typography>
                      </TableCell>
                      <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.72rem', py: 0.55 }}>{row.date}</TableCell>
                      <TableCell sx={{ color: '#64748B', fontSize: '0.72rem', py: 0.55 }}>{row.venue}</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', py: 0.55 }}>{row.att}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#047857', fontSize: '0.72rem', py: 0.55 }}>{row.quorum}</TableCell>
                      <TableCell sx={{ py: 0.55 }}>
                        {renderStatusBadge(row.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {selectedReport === 'ACTION_MATRIX' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0B2545', mb: 0.3, fontSize: '0.92rem' }}>
              Action Taken Reports (ATR) & Resolution Traceability Ledger
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.4, mb: 1.6, fontSize: '0.76rem' }}>
              Formal traceability matrix mapping statutory resolutions passed in committee sessions to assigned institutional officers, target implementation milestones, and verified Action Taken Reports (ATR).
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, mb: 1.8, border: '1px solid #CBD5E1', overflow: 'hidden' }}>
              <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#0F172A' }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '28%' }}>Resolution / Action Item</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '16%' }}>Originating Committee</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '20%' }}>Assigned Responsibility</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '12%' }}>Target Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '14%' }}>ATR Status</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', py: 0.8, color: '#FFFFFF', width: '10%' }}>Audit Closure</TableCell>
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
                    <TableRow key={i} sx={{ '&:nth-of-type(even)': { bgcolor: '#F8FAFC' }, borderBottom: '1px solid #E2E8F0' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.74rem', py: 0.55, maxWidth: 220 }}>{row.title}</TableCell>
                      <TableCell sx={{ color: '#1D4ED8', fontWeight: 700, fontSize: '0.72rem', py: 0.55 }}>{row.comm}</TableCell>
                      <TableCell sx={{ color: '#475569', fontSize: '0.72rem', py: 0.55 }}>{row.resp}</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', py: 0.55 }}>{row.due}</TableCell>
                      <TableCell sx={{ color: row.status === 'CLOSED' ? '#047857' : '#B45309', fontWeight: 700, fontSize: '0.72rem', py: 0.55 }}>{row.atr}</TableCell>
                      <TableCell sx={{ py: 0.55 }}>
                        {renderStatusBadge(row.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Certification & Signatures Block */}
        <Box className="print-avoid-break certification-block" sx={{ breakInside: 'avoid', pageBreakInside: 'avoid', mt: 2 }}>
          {/* Institutional Certification Box */}
          <Box sx={{ p: 1.6, bgcolor: '#F0F9FF', borderRadius: 1, border: '1px solid #BAE6FD', mb: 2, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <VerifiedIcon sx={{ color: '#0284C7', fontSize: 20, mt: 0.2 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0369A1', mb: 0.2, fontSize: '0.78rem' }}>
                Institutional Statutory Certification & Quorum Validity:
              </Typography>
              <Typography variant="caption" sx={{ color: '#334155', lineHeight: 1.4, display: 'block', fontSize: '0.7rem' }}>
                I hereby certify that all meeting proceedings, quorum attendance logs, and resolutions recorded in this dossier reflect official university records conducted in conformity with University Statutes, UGC Regulations, and NAAC SSR governance mandates.
              </Typography>
            </Box>
          </Box>

          {/* Official Signatures Row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pt: 1.8, borderTop: '1.5px solid #CBD5E1', gap: 2 }}>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Box sx={{ height: 28 }} />
              <Box sx={{ borderTop: '1px solid #475569', width: '75%', margin: '0 auto', mb: 0.6 }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0B2545', display: 'block', fontSize: '0.76rem' }}>
                Director, IQAC
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.7rem' }}>
                Dr. E. Deepak Chowdary
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Box sx={{ height: 28 }} />
              <Box sx={{ borderTop: '1px solid #475569', width: '75%', margin: '0 auto', mb: 0.6 }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0B2545', display: 'block', fontSize: '0.76rem' }}>
                Dean, Academics / Convener
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.7rem' }}>
                Dr. S. V. Phani Kumar
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Box sx={{ height: 28 }} />
              <Box sx={{ borderTop: '1px solid #475569', width: '75%', margin: '0 auto', mb: 0.6 }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0B2545', display: 'block', fontSize: '0.76rem' }}>
                Registrar
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.7rem' }}>
                Prof. Dr. K. V. Krishna Kishore
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

