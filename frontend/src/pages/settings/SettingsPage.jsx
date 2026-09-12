import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Tabs,
  Tab,
  Chip,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import {
  SettingsRounded as SettingsIcon,
  AccountBalanceRounded as UniversityIcon,
  GavelRounded as LegalIcon,
  EmailRounded as NotificationIcon,
  SmartToyRounded as AiIcon,
  SecurityRounded as SecurityIcon,
  SaveRounded as SaveIcon,
  CheckCircleRounded as CheckIcon,
  RefreshRounded as ResetIcon,
  TuneRounded as ConfigIcon,
} from '@mui/icons-material';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Form State
  const [generalSettings, setGeneralSettings] = useState({
    institutionName: "Vignan's Foundation for Science, Technology & Research (VFSTR)",
    aisheCode: 'U-0043',
    naacGrade: 'A+',
    academicYear: '2025-2026',
    registrarEmail: 'registrar@vignan.ac.in',
    vcSecretariatEmail: 'vc@vignan.ac.in',
  });

  const [governanceSettings, setGovernanceSettings] = useState({
    quorumThreshold: '60',
    statutoryMeetingIntervalDays: '90',
    noticeLeadTimeDays: '7',
    atrSubmissionDeadlineDays: '14',
    strictQuorumCancellation: true,
    requireVCRatification: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    brevoSenderEmail: 'notifications@vignan.ac.in',
    brevoSenderName: 'Vignan CommiAI Governance Desk',
    enableBrevoSmtp: true,
    enableWhatsappGateway: true,
    enableSmsFallback: false,
    autoReminderDays: '3',
  });

  const [aiSettings, setAiSettings] = useState({
    aiModel: 'Gemini 2.5 Pro (Autonomous Governance Engine)',
    autoDraftMom: true,
    autonomousConflictCheck: true,
    multiLingualTranscription: true,
    summarizationDepth: 'Balanced (Standard Resolutions & Full ATRs)',
  });

  const handleSave = () => {
    setSnackbarMessage('Governance & System configurations saved successfully!');
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box
              sx={{
                bgcolor: '#3B82F6',
                color: '#FFFFFF',
                borderRadius: '10px',
                p: 0.8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SettingsIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E3A8A' }}>
              Governance & System Settings
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Configure institutional profiles, statutory compliance rules, notification gateways, and CommiAI autonomous intelligence.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<ResetIcon />}
            sx={{ fontWeight: 700, borderColor: '#CBD5E1', color: '#334155' }}
            onClick={() => setSnackbarMessage('Reset settings to statutory university defaults.')}
          >
            Reset Defaults
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
            }}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      {/* Tabs Navigation */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          mb: 3,
          bgcolor: '#FFFFFF',
          px: 2,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'none',
              minHeight: 56,
            },
            '& .Mui-selected': {
              color: '#2563EB !important',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#2563EB',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab icon={<UniversityIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Institutional Profile" />
          <Tab icon={<LegalIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Statutory Quorum Rules" />
          <Tab icon={<NotificationIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Brevo & Notifications" />
          <Tab icon={<AiIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="CommiAI Agent Core" />
          <Tab icon={<SecurityIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Security & Access Control" />
        </Tabs>
      </Paper>

      {/* TAB 0: Institutional Profile */}
      {activeTab === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E3A8A', mb: 0.5 }}>
            University Identity & Accreditation Details
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
            These parameters are embedded automatically into all statutory dossiers, notices, and meeting minutes.
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12} md={8}>
              <TextField
                label="Institution Name"
                fullWidth
                value={generalSettings.institutionName}
                onChange={(e) => setGeneralSettings({ ...generalSettings, institutionName: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="AISHE Code"
                fullWidth
                value={generalSettings.aisheCode}
                onChange={(e) => setGeneralSettings({ ...generalSettings, aisheCode: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="NAAC Grade Status"
                fullWidth
                value={generalSettings.naacGrade}
                onChange={(e) => setGeneralSettings({ ...generalSettings, naacGrade: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Current Academic Year"
                fullWidth
                value={generalSettings.academicYear}
                onChange={(e) => setGeneralSettings({ ...generalSettings, academicYear: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Office of Registrar Contact Email"
                fullWidth
                value={generalSettings.registrarEmail}
                onChange={(e) => setGeneralSettings({ ...generalSettings, registrarEmail: e.target.value })}
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* TAB 1: Statutory Quorum Rules */}
      {activeTab === 1 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E3A8A', mb: 0.5 }}>
            Statutory Governance & Compliance Policies
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
            Enforce mandatory thresholds adhering to UGC §12 and AICTE statutory committee compliance frameworks.
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} md={6}>
              <TextField
                label="Mandatory Quorum Threshold (%)"
                type="number"
                fullWidth
                value={governanceSettings.quorumThreshold}
                onChange={(e) => setGovernanceSettings({ ...governanceSettings, quorumThreshold: e.target.value })}
                helperText="Minimum attendance required before resolutions can be legally ratified."
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <TextField
                label="Max Interval Between Statutory Meetings (Days)"
                type="number"
                fullWidth
                value={governanceSettings.statutoryMeetingIntervalDays}
                onChange={(e) => setGovernanceSettings({ ...governanceSettings, statutoryMeetingIntervalDays: e.target.value })}
                helperText="Triggers compliance warnings if no meeting is held within this window."
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <TextField
                label="Meeting Notice Lead Time (Days)"
                type="number"
                fullWidth
                value={governanceSettings.noticeLeadTimeDays}
                onChange={(e) => setGovernanceSettings({ ...governanceSettings, noticeLeadTimeDays: e.target.value })}
                helperText="Notice circulation SLA prior to meeting date."
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <TextField
                label="Action Taken Report (ATR) Submission Deadline (Days)"
                type="number"
                fullWidth
                value={governanceSettings.atrSubmissionDeadlineDays}
                onChange={(e) => setGovernanceSettings({ ...governanceSettings, atrSubmissionDeadlineDays: e.target.value })}
                helperText="Days allowed for action item owners to submit verified progress reports."
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={governanceSettings.strictQuorumCancellation}
                    onChange={(e) => setGovernanceSettings({ ...governanceSettings, strictQuorumCancellation: e.target.checked })}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Autonomous Quorum Adjournment Alert
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      CommiAI automatically flags and postpones meetings if RSVPs fall below legal threshold 24 hours prior.
                    </Typography>
                  </Box>
                }
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* TAB 2: Brevo & Notifications */}
      {activeTab === 2 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E3A8A' }}>
                Brevo SMTP & Multi-Channel Gateway
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                Delivery channels for 13 automated email notices, quorum reminders, and digital sign-off alerts.
              </Typography>
            </Box>
            <Chip label="Brevo API: Connected (42ms)" color="success" size="small" sx={{ fontWeight: 700 }} />
          </Box>

          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Verified Brevo Sender Email"
                fullWidth
                value={notificationSettings.brevoSenderEmail}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, brevoSenderEmail: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Sender Display Name"
                fullWidth
                value={notificationSettings.brevoSenderName}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, brevoSenderName: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.enableBrevoSmtp}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, enableBrevoSmtp: e.target.checked })}
                  />
                }
                label="Enable Real-Time Institutional Email Delivery"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.enableWhatsappGateway}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, enableWhatsappGateway: e.target.checked })}
                  />
                }
                label="Enable WhatsApp Business Notification Gateway"
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* TAB 3: CommiAI Agent Core */}
      {activeTab === 3 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E3A8A', mb: 0.5 }}>
            CommiAI Intelligence Configuration
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
            Fine-tune the reasoning models, prompt templates, and autonomous document synthesis parameters.
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Primary LLM Engine</InputLabel>
                <Select
                  value={aiSettings.aiModel}
                  label="Primary LLM Engine"
                  onChange={(e) => setAiSettings({ ...aiSettings, aiModel: e.target.value })}
                >
                  <MenuItem value="Gemini 2.5 Pro (Autonomous Governance Engine)">Gemini 2.5 Pro (Autonomous Governance Engine)</MenuItem>
                  <MenuItem value="Gemini 2.5 Flash (Ultra-Fast Response)">Gemini 2.5 Flash (Ultra-Fast Response)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Minutes Summarization Depth</InputLabel>
                <Select
                  value={aiSettings.summarizationDepth}
                  label="Minutes Summarization Depth"
                  onChange={(e) => setAiSettings({ ...aiSettings, summarizationDepth: e.target.value })}
                >
                  <MenuItem value="Balanced (Standard Resolutions & Full ATRs)">Balanced (Standard Resolutions & Full ATRs)</MenuItem>
                  <MenuItem value="Exhaustive (Full Verbatim Transcript & Citations)">Exhaustive (Full Verbatim Transcript & Citations)</MenuItem>
                  <MenuItem value="Executive (Core Decisions Only)">Executive (Core Decisions Only)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={aiSettings.autoDraftMom}
                    onChange={(e) => setAiSettings({ ...aiSettings, autoDraftMom: e.target.checked })}
                  />
                }
                label="Autonomous Instant Draft Generation upon Meeting Conclusion"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={aiSettings.autonomousConflictCheck}
                    onChange={(e) => setAiSettings({ ...aiSettings, autonomousConflictCheck: e.target.checked })}
                  />
                }
                label="Autonomous Member Schedule Conflict Detection across 85+ Committees"
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* TAB 4: Security & Access Control */}
      {activeTab === 4 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E3A8A', mb: 0.5 }}>
            Security, Cryptography & Audit Trails
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
            Tamper-proof digital signatures and role-based institutional privilege separation.
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Alert severity="success" sx={{ borderRadius: '12px' }}>
                All ratified minutes are protected with SHA-256 digital seals verified against the Vignan Institutional Audit Ledger.
              </Alert>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Session Inactivity Timeout (Minutes)" defaultValue="30" fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Registrar IP Whitelist" defaultValue="172.16.0.0/16, 10.20.0.0/16" fullWidth size="small" />
            </Grid>
          </Grid>
        </Paper>
      )}

      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
      />
    </Box>
  );
}
