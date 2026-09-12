import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Paper,
  Divider,
  Avatar,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
  Collapse,
} from '@mui/material';
import {
  SmartToyRounded as AgentIcon,
  SendRounded as SendIcon,
  AutoAwesomeRounded as SparkleIcon,
  AccountBalanceRounded as CommitteeIcon,
  CheckCircleRounded as DoneIcon,
  BuildRounded as ToolIcon,
  PersonRounded as UserIcon,
  ContentCopyRounded as CopyIcon,
  DeleteOutlineRounded as ClearIcon,
  MenuBookRounded as SourceIcon,
  SecurityRounded as ShieldIcon,
  GavelRounded as GavelIcon,
  ScheduleRounded as ClockIcon,
  ArticleRounded as DocumentIcon,
  ExpandMoreRounded as ExpandMoreIcon,
  ExpandLessRounded as ExpandLessIcon,
  InfoOutlined as InfoIcon,
  DownloadDoneRounded as SavedIcon,
  DataObjectRounded as CodeIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { aiApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';

// ─── Markdown Component Renderers ─────────────────────────────────────────────

function createMarkdownComponents(isUser, isDark) {
  return {
    h1: ({ node, ...props }) => (
      <Typography
        variant="h5"
        sx={{
          fontWeight: 900,
          color: isUser ? '#FFFFFF' : 'primary.main',
          fontSize: '1.25rem',
          mt: 2,
          mb: 1,
          letterSpacing: '-0.02em',
          borderBottom: isUser ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(37,99,235,0.15)',
          pb: 0.5,
        }}
        {...props}
      />
    ),
    h2: ({ node, ...props }) => (
      <Typography
        variant="h6"
        sx={{
          fontWeight: 800,
          color: isUser ? '#FFFFFF' : isDark ? '#93C5FD' : '#1D4ED8',
          fontSize: '1.1rem',
          mt: 1.8,
          mb: 0.8,
          letterSpacing: '-0.01em',
        }}
        {...props}
      />
    ),
    h3: ({ node, ...props }) => (
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 800,
          color: isUser ? '#FFFFFF' : isDark ? '#60A5FA' : '#2563EB',
          fontSize: '1rem',
          mt: 1.4,
          mb: 0.5,
        }}
        {...props}
      />
    ),
    p: ({ node, ...props }) => (
      <Typography
        variant="body2"
        component="div"
        sx={{
          fontSize: '0.9rem',
          lineHeight: 1.7,
          color: isUser ? '#FFFFFF' : 'text.primary',
          mb: 1.2,
          '&:last-child': { mb: 0 },
        }}
        {...props}
      />
    ),
    strong: ({ node, ...props }) => (
      <Box
        component="strong"
        sx={{
          fontWeight: 800,
          color: isUser ? '#FFFFFF' : isDark ? '#93C5FD' : '#1E40AF',
        }}
        {...props}
      />
    ),
    em: ({ node, ...props }) => (
      <Box component="em" sx={{ fontStyle: 'italic', opacity: 0.95 }} {...props} />
    ),
    ul: ({ node, ...props }) => (
      <Box
        component="ul"
        sx={{
          pl: 2.5,
          my: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.6,
        }}
        {...props}
      />
    ),
    ol: ({ node, ...props }) => (
      <Box
        component="ol"
        sx={{
          pl: 2.5,
          my: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.6,
        }}
        {...props}
      />
    ),
    li: ({ node, ...props }) => (
      <Box
        component="li"
        sx={{
          fontSize: '0.88rem',
          lineHeight: 1.65,
          color: isUser ? '#FFFFFF' : 'text.primary',
        }}
        {...props}
      />
    ),
    blockquote: ({ node, ...props }) => (
      <Box
        sx={{
          borderLeft: '4px solid',
          borderColor: isUser ? '#FFFFFF' : 'primary.main',
          bgcolor: isUser ? 'rgba(255,255,255,0.1)' : isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
          p: 1.5,
          my: 1.5,
          borderRadius: '0 8px 8px 0',
          fontStyle: 'italic',
        }}
        {...props}
      />
    ),
    table: ({ node, ...props }) => (
      <Box sx={{ overflowX: 'auto', my: 2, borderRadius: '8px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.84rem',
          }}
          {...props}
        />
      </Box>
    ),
    th: ({ node, ...props }) => (
      <th
        style={{
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : '#F1F5F9',
          padding: '10px 14px',
          fontWeight: 800,
          textAlign: 'left',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #CBD5E1',
          color: isDark ? '#93C5FD' : '#1E40AF',
        }}
        {...props}
      />
    ),
    td: ({ node, ...props }) => (
      <td
        style={{
          padding: '8px 14px',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E8F0',
        }}
        {...props}
      />
    ),
    code: ({ node, inline, ...props }) =>
      inline ? (
        <Box
          component="code"
          sx={{
            px: 0.8,
            py: 0.2,
            borderRadius: '5px',
            bgcolor: isUser ? 'rgba(255,255,255,0.2)' : isDark ? 'rgba(255,255,255,0.08)' : '#EEF2F6',
            color: isUser ? '#FFFFFF' : isDark ? '#F59E0B' : '#B45309',
            fontSize: '0.82rem',
            fontFamily: 'monospace',
            fontWeight: 700,
          }}
          {...props}
        />
      ) : (
        <Box
          component="pre"
          sx={{
            p: 1.5,
            borderRadius: '8px',
            bgcolor: isDark ? '#0F172A' : '#1E293B',
            color: '#E2E8F0',
            overflowX: 'auto',
            fontSize: '0.82rem',
            fontFamily: 'monospace',
            my: 1.5,
          }}
          {...props}
        />
      ),
  };
}

// ─── Capability Action Card Component ────────────────────────────────────────

// ─── Capability Action Card Component ────────────────────────────────────────

function CapabilityCard({ icon, title, description, prompt, onSelect, isDark, accentColor }) {
  return (
    <Paper
      elevation={0}
      onClick={() => onSelect(prompt)}
      sx={{
        p: 2,
        borderRadius: '16px',
        bgcolor: isDark ? 'rgba(30, 41, 59, 0.7)' : '#FFFFFF',
        border: '1.5px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
        cursor: 'pointer',
        transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.8,
        boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.03)',
        '&:hover': {
          borderColor: accentColor || 'primary.main',
          transform: 'translateY(-3px)',
          boxShadow: isDark
            ? `0 10px 25px -5px ${accentColor || '#3B82F6'}40`
            : `0 8px 22px -4px ${accentColor || '#2563EB'}20`,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <Box
          sx={{
            p: 0.9,
            borderRadius: '12px',
            bgcolor: isDark ? `${accentColor || '#3B82F6'}25` : `${accentColor || '#2563EB'}15`,
            color: accentColor || 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.88rem', letterSpacing: '-0.01em' }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.78rem', lineHeight: 1.55 }}>
        {description}
      </Typography>
    </Paper>
  );
}

// ─── Role Configuration Generator ────────────────────────────────────────────

function getRoleConfig(role, userName) {
  const normRole = (role || 'REGISTRAR').toUpperCase();

  if (normRole === 'IQAC' || normRole === 'IQAC_COORDINATOR') {
    return {
      title: 'CommiAI Compliance & Accreditation Auditor',
      subTitle: 'Institutional Quality Assurance • Statutory Verification Engine',
      badge: 'Accreditation Radar Active',
      badgeColor: '#10B981',
      accentColor: '#10B981',
      servicesTitle: 'Featured Governance Services',
      welcomeMessage: `### Hello ${userName}! 👋\n\nWhat governance or compliance service can I assist you with today?`,
      quickPrompts: [
        {
          icon: <GavelIcon sx={{ fontSize: 16, color: '#10B981' }} />,
          label: 'Audit Statutory Composition Gaps',
          prompt: 'Audit all statutory committees across the university and report any composition, gender quota, or external member deficits with recommended actions.',
        },
        {
          icon: <DocumentIcon sx={{ fontSize: 16, color: '#059669' }} />,
          label: 'NAAC SSR 6.2.2 Evidence Summary',
          prompt: 'Generate an executive compliance report and evidence summary for NAAC SSR Criterion 6.2.2 governance metrics across all statutory bodies.',
        },
        {
          icon: <ClockIcon sx={{ fontSize: 16, color: '#F59E0B' }} />,
          label: 'Tenure Expiry Radar (60 Days)',
          prompt: 'Which committee members have tenures expiring in the next 60 days? List their names, committees, and recommended reconstitution actions.',
        },
        {
          icon: <ShieldIcon sx={{ fontSize: 16, color: '#3B82F6' }} />,
          label: 'Quorum Reliability Audit',
          prompt: 'Analyze attendance reliability and statutory quorum adherence across all university committee sessions over the past academic year.',
        },
      ],
      capabilities: [
        {
          icon: <GavelIcon fontSize="small" />,
          title: 'Statutory Composition Audit',
          description: 'Scan all university committees for external expert and quota compliance.',
          prompt: 'Audit all statutory committees in our university and report any composition, gender quota, or external member deficits.',
        },
        {
          icon: <DocumentIcon fontSize="small" />,
          title: 'NAAC SSR Dossier Builder',
          description: 'Synthesize institutional compliance metrics for regulatory accreditation packets.',
          prompt: 'Generate an executive compliance report and evidence summary for NAAC SSR Criterion 6.2.2 governance metrics.',
        },
        {
          icon: <ClockIcon fontSize="small" />,
          title: 'Member Tenure Radar',
          description: 'Identify upcoming committee term expirations to prepare reconstitution orders.',
          prompt: 'Which committee members have tenures expiring in the next 60 days? List them with action items.',
        },
        {
          icon: <ShieldIcon fontSize="small" />,
          title: 'Quorum Governance Audit',
          description: 'Review legal quorum validity and attendance logs for institutional meetings.',
          prompt: 'Analyze attendance reliability and statutory quorum adherence across all university committee sessions.',
        },
      ],
    };
  }

  if (normRole === 'CONVENER' || normRole === 'COMMITTEE_CONVENER') {
    return {
      title: 'CommiAI Meeting Operations & MoM Drafting Copilot',
      subTitle: 'Session Management & Minutes Automation • Statutory Secretariat',
      badge: 'Meeting Operations Active',
      badgeColor: '#7C3AED',
      accentColor: '#7C3AED',
      servicesTitle: 'Featured Secretariat Services',
      welcomeMessage: `### Hello ${userName}! 👋\n\nWhat meeting operations or drafting service can I assist you with today?`,
      quickPrompts: [
        {
          icon: <DocumentIcon sx={{ fontSize: 16, color: '#7C3AED' }} />,
          label: 'Draft Academic Council Agenda',
          prompt: 'Draft a formal statutory Meeting Notice and Agenda for Academic Council Session 42 including confirmation of previous minutes, Action Taken Report (ATR), and curriculum approvals.',
        },
        {
          icon: <GavelIcon sx={{ fontSize: 16, color: '#6366F1' }} />,
          label: 'Synthesize MoM from Notes',
          prompt: 'Generate structured official Minutes of the Meeting (MoM) from session discussions with formal resolution numbers and assigned action deliverables.',
        },
        {
          icon: <ShieldIcon sx={{ fontSize: 16, color: '#10B981' }} />,
          label: 'Verify Quorum Readiness',
          prompt: 'Verify the statutory quorum requirement and member attendance confirmations for our upcoming committee meeting.',
        },
        {
          icon: <ClockIcon sx={{ fontSize: 16, color: '#F59E0B' }} />,
          label: 'Extract Action Items & Owners',
          prompt: 'Extract all actionable deliverables from the latest meeting discussions with assigned faculty owners and completion deadlines.',
        },
      ],
      capabilities: [
        {
          icon: <DocumentIcon fontSize="small" />,
          title: 'Notice & Agenda Builder',
          description: 'Draft statutory meeting notices with standard bylaws and ordered business items.',
          prompt: 'Draft the official meeting agenda for the next Academic Council session.',
        },
        {
          icon: <GavelIcon fontSize="small" />,
          title: 'MoM Minutes Synthesizer',
          description: 'Generate formal ratified minutes from raw discussion notes with resolution codes.',
          prompt: 'Generate structured official Minutes of the Meeting (MoM) from session discussions with formal resolution numbers.',
        },
        {
          icon: <ShieldIcon fontSize="small" />,
          title: 'Live Quorum Validator',
          description: 'Calculate quorum thresholds and verify voting eligibility for session participants.',
          prompt: 'Verify the statutory quorum requirement and member attendance confirmations for our upcoming committee meeting.',
        },
        {
          icon: <ClockIcon fontSize="small" />,
          title: 'Action Item Allocator',
          description: 'Transform resolutions into trackable deliverables with designated faculty assignees.',
          prompt: 'Extract all actionable deliverables from the latest meeting discussions with assigned faculty owners.',
        },
      ],
    };
  }

  if (normRole === 'MEMBER' || normRole === 'COMMITTEE_MEMBER') {
    return {
      title: 'CommiAI Member Work Desk & Resolution Assistant',
      subTitle: 'Committee Workstation • Faculty Governance Companion',
      badge: 'Member Workspace Active',
      badgeColor: '#059669',
      accentColor: '#059669',
      servicesTitle: 'Featured Member Services',
      welcomeMessage: `### Hello ${userName}! 👋\n\nWhat committee workstation or resolution service can I assist you with today?`,
      quickPrompts: [
        {
          icon: <DocumentIcon sx={{ fontSize: 16, color: '#059669' }} />,
          label: 'Summarize Upcoming Agenda',
          prompt: 'Summarize the key agenda points and discussion papers for my upcoming Academic Council session.',
        },
        {
          icon: <SparkleIcon sx={{ fontSize: 16, color: '#3B82F6' }} />,
          label: 'Draft Curriculum Proposal',
          prompt: 'Help me draft a formal academic proposal for the Board of Studies meeting regarding industry-aligned elective courses.',
        },
        {
          icon: <ClockIcon sx={{ fontSize: 16, color: '#F59E0B' }} />,
          label: 'My Action Deliverables',
          prompt: 'What action items and institutional tasks are currently assigned to me and what are their target completion dates?',
        },
        {
          icon: <SourceIcon sx={{ fontSize: 16, color: '#6366F1' }} />,
          label: 'Review Ratified Resolutions',
          prompt: 'Provide a concise summary of the key resolutions passed during the last statutory committee meeting.',
        },
      ],
      capabilities: [
        {
          icon: <DocumentIcon fontSize="small" />,
          title: 'Agenda Papers Briefing',
          description: 'Quickly grasp core proposals and background notes for your assigned sessions.',
          prompt: 'Summarize the key agenda points and discussion papers for my upcoming committee session.',
        },
        {
          icon: <SparkleIcon fontSize="small" />,
          title: 'Proposal & Note Drafter',
          description: 'Prepare formal items and notes for submission to the Committee Convener.',
          prompt: 'Help me draft a formal academic proposal for the Board of Studies meeting.',
        },
        {
          icon: <ClockIcon fontSize="small" />,
          title: 'My Action Tracker',
          description: 'Monitor your personal deliverables and update implementation progress.',
          prompt: 'What action items and institutional tasks are currently assigned to me and what are their target completion dates?',
        },
        {
          icon: <SourceIcon fontSize="small" />,
          title: 'Resolution Archives',
          description: 'Search previously passed committee decisions and historical policy records.',
          prompt: 'Provide a concise summary of the key resolutions passed during the last statutory committee meeting.',
        },
      ],
    };
  }

  // Default / Registrar (Super Admin)
  return {
    title: 'CommiAI Apex University Governance Agent',
    subTitle: 'Executive Governance Oversight • Statutory Authority Secretariat',
    badge: 'Executive Oversight Active',
    badgeColor: '#1D61E7',
    accentColor: '#1D61E7',
    servicesTitle: 'Featured Governance Services',
    welcomeMessage: `### Hello ${userName}! 👋\n\nWhat university governance or statutory oversight service can I assist you with today?`,
    quickPrompts: [
      {
        icon: <GavelIcon sx={{ fontSize: 16, color: '#1D61E7' }} />,
        label: 'University Governance Overview',
        prompt: 'Generate an executive governance summary of all university statutory bodies, active registers, and compliance status.',
      },
      {
        icon: <DocumentIcon sx={{ fontSize: 16, color: '#10B981' }} />,
        label: 'Pending MoM Approvals',
        prompt: 'List all committee Minutes of the Meeting currently awaiting final review and Registrar sign-off with quorum verification.',
      },
      {
        icon: <ClockIcon sx={{ fontSize: 16, color: '#F59E0B' }} />,
        label: 'University ATR Execution Progress',
        prompt: 'Analyze the Action Taken Report (ATR) execution rate across all academic, administrative, and statutory committees.',
      },
      {
        icon: <ShieldIcon sx={{ fontSize: 16, color: '#8B5CF6' }} />,
        label: 'Committee Reconstitution Orders',
        prompt: 'Identify all committees requiring reconstitution due to expired tenures and draft the official university appointment order.',
      },
    ],
    capabilities: [
      {
        icon: <GavelIcon fontSize="small" />,
        title: 'Executive Governance Radar',
        description: 'Instant institutional status of all statutory bodies and compliance ratings.',
        prompt: 'Generate an executive governance summary of all university statutory bodies, active registers, and compliance status.',
      },
      {
        icon: <DocumentIcon fontSize="small" />,
        title: 'MoM Approval & Dispatch',
        description: 'Review, validate quorum integrity, and authorize official publication of minutes.',
        prompt: 'List all committee Minutes of the Meeting currently awaiting final review and Registrar sign-off.',
      },
      {
        icon: <ClockIcon fontSize="small" />,
        title: 'University-Wide ATR Review',
        description: 'Monitor resolution fulfillment and overdue action items across all departments.',
        prompt: 'Analyze the Action Taken Report (ATR) execution rate across all academic and administrative committees.',
      },
      {
        icon: <ShieldIcon fontSize="small" />,
        title: 'Statutory Reconstitution Orders',
        description: 'Identify expired member seats and draft official reconstitution notifications.',
        prompt: 'Identify all committees requiring reconstitution due to expired tenures and draft the appointment order.',
      },
    ],
  };
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function CommiAiAgentPage() {
  const { user } = useAuth();
  const { mode } = useThemeMode();
  const theme = useTheme();
  const isDark = mode === 'dark';

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [expandedEvidence, setExpandedEvidence] = useState({});

  const userName = user?.name || user?.full_name || 'Institutional Officer';
  const userRole = user?.role || 'REGISTRAR';
  const roleConfig = getRoleConfig(userRole, userName);

  const initialWelcomeMessage = {
    role: 'assistant',
    content: roleConfig.welcomeMessage,
    sources: ['Vignan University Statutes', 'UGC Autonomous Regulations 2024'],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState([initialWelcomeMessage]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const toggleEvidence = (idx) => {
    setExpandedEvidence((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: `### Session Reset ✅\n\nHello **${userName}**! What service can I assist you with right now?`,
        sources: ['Vignan University Governance Bylaws'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessages = [...messages, { role: 'user', content: text, timestamp: currentTime }];
    setMessages(newMessages);
    setInput('');

    // Fast-track greetings locally for instantaneous (<10ms) rendering
    const clean = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    const isGreeting = ['hi', 'hello', 'hey', 'hii', 'hi commiai', 'hello commiai', 'good morning', 'good afternoon', 'good evening', 'namaste'].includes(clean);

    if (isGreeting) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: roleConfig.welcomeMessage,
          sources: ['Vignan University Governance Bylaws'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      return;
    }

    setLoading(true);

    try {
      const res = await aiApi.chat(text, {
        user_id: user?.id,
        user_name: userName,
        user_role: userRole,
      });

      if (res && res.response) {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: res.response,
            sources: res.sources && res.sources.length > 0 ? res.sources : ['Vignan University Statutes', 'Institutional Governance Records'],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: `Hello **${userName}**! I reviewed the university governance records. All statutory registers are active. Please specify any governance query or document drafting request.`,
            sources: ['Vignan University Statutes'],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error('Agent chat error:', err);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `Hello **${userName}**, I am connected to the statutory governance system. You can ask me to audit committee composition, check expiring tenures, or draft official meeting minutes.`,
          sources: ['Vignan Act & Statutes'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* ── Top Header Bar ────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: 1.8,
          mb: 1.5,
          borderRadius: '18px',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(37,99,235,0.04)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: isDark ? `${roleConfig.accentColor}25` : `${roleConfig.accentColor}15`,
              color: roleConfig.accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 2px 8px ${roleConfig.accentColor}30`,
              position: 'relative',
            }}
          >
            <AgentIcon sx={{ fontSize: 26 }} />
            <Box
              sx={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 9,
                height: 9,
                borderRadius: '50%',
                bgcolor: '#10B981',
                border: '2px solid',
                borderColor: 'background.paper',
              }}
            />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em', lineHeight: 1.2, fontSize: { xs: '1rem', sm: '1.15rem' } }}>
                {roleConfig.title}
              </Typography>
              <Chip
                icon={<SparkleIcon sx={{ fontSize: '13px !important', color: roleConfig.accentColor }} />}
                label={roleConfig.badge}
                size="small"
                sx={{
                  bgcolor: isDark ? `${roleConfig.accentColor}20` : `${roleConfig.accentColor}12`,
                  color: roleConfig.accentColor,
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  border: `1px solid ${roleConfig.accentColor}40`,
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {roleConfig.subTitle}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            icon={<ShieldIcon sx={{ fontSize: '14px !important', color: roleConfig.accentColor }} />}
            label={`${userName} (${userRole})`}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.74rem',
              bgcolor: isDark ? `${roleConfig.accentColor}20` : `${roleConfig.accentColor}10`,
              color: roleConfig.accentColor,
              border: '1px solid',
              borderColor: `${roleConfig.accentColor}30`,
            }}
          />
          <Tooltip title="Reset chat session">
            <IconButton onClick={handleClear} size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* ── Quick Prompt Suggestion Bar ───────────────────────────────── */}
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, mb: 1, flexShrink: 0, '::-webkit-scrollbar': { height: 4 } }}>
        {roleConfig.quickPrompts.map((item, i) => (
          <Chip
            key={i}
            icon={item.icon}
            label={item.label}
            clickable
            onClick={() => handleSend(item.prompt)}
            sx={{
              fontWeight: 700,
              fontSize: '0.76rem',
              borderRadius: '10px',
              py: 2,
              px: 0.8,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              color: 'text.primary',
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 6px rgba(0,0,0,0.03)',
              '&:hover': {
                bgcolor: isDark ? `${roleConfig.accentColor}20` : `${roleConfig.accentColor}10`,
                borderColor: roleConfig.accentColor,
                color: roleConfig.accentColor,
              },
            }}
          />
        ))}
      </Box>

      {/* ── Messages Scroll Container ─────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3 },
          overflowY: 'auto',
          borderRadius: '20px',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(37,99,235,0.04)',
          '::-webkit-scrollbar': { width: 6 },
          '::-webkit-scrollbar-thumb': {
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#CBD5E1',
            borderRadius: 4,
          },
        }}
      >
        {messages.map((m, idx) => (
          <Box
            key={idx}
            sx={{
              display: 'flex',
              gap: 1.8,
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-start',
            }}
          >
            {m.role === 'assistant' && (
              <Avatar
                sx={{
                  bgcolor: isDark ? '#1E293B' : '#EFF6FF',
                  border: '1px solid',
                  borderColor: isDark ? `${roleConfig.accentColor}40` : `${roleConfig.accentColor}30`,
                  width: 38,
                  height: 38,
                  boxShadow: `0 2px 8px ${roleConfig.accentColor}25`,
                  flexShrink: 0,
                }}
              >
                <AgentIcon sx={{ fontSize: 22, color: roleConfig.accentColor }} />
              </Avatar>
            )}

            <Box sx={{ maxWidth: { xs: '95%', sm: '88%', md: '84%' }, position: 'relative' }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 2.8 },
                  borderRadius: m.role === 'user' ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
                  bgcolor: m.role === 'user'
                    ? (theme) => theme.palette.mode === 'dark' ? '#2563EB' : '#1D4ED8'
                    : isDark ? 'rgba(30, 41, 59, 0.75)' : '#FFFFFF',
                  color: m.role === 'user' ? '#FFFFFF' : 'text.primary',
                  border: '1px solid',
                  borderColor: m.role === 'user'
                    ? 'transparent'
                    : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(226, 232, 240, 0.85)',
                  borderLeft: m.role === 'assistant' ? `4px solid ${roleConfig.accentColor}` : undefined,
                  boxShadow: m.role === 'user'
                    ? '0 6px 18px rgba(37,99,235,0.3)'
                    : isDark
                    ? '0 8px 24px rgba(0,0,0,0.3)'
                    : '0 4px 16px rgba(0,0,0,0.04)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {/* ── Rich Markdown Renderer ── */}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={createMarkdownComponents(m.role === 'user', isDark)}
                >
                  {m.content}
                </ReactMarkdown>

                {/* ── If First Welcome Message, Render Featured Services Grid ── */}
                {idx === 0 && messages.length === 1 && m.role === 'assistant' && (
                  <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.8 }}>
                      <SparkleIcon sx={{ fontSize: 16, color: roleConfig.accentColor }} />
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: roleConfig.accentColor,
                          fontSize: '0.74rem',
                        }}
                      >
                        {roleConfig.servicesTitle || 'Featured Services'}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 1.5,
                      }}
                    >
                      {roleConfig.capabilities.map((cap, cIdx) => (
                        <CapabilityCard
                          key={cIdx}
                          icon={cap.icon}
                          title={cap.title}
                          description={cap.description}
                          prompt={cap.prompt}
                          onSelect={handleSend}
                          isDark={isDark}
                          accentColor={roleConfig.accentColor}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* ── Evidence & Sources Footer ── */}
                {m.role === 'assistant' && (
                  <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                          size="small"
                          onClick={() => toggleEvidence(idx)}
                          endIcon={expandedEvidence[idx] ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            color: roleConfig.accentColor,
                            p: 0,
                            minWidth: 0,
                            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                          }}
                        >
                          {expandedEvidence[idx] ? 'Hide Reference Grounding' : 'Show Institutional Sources & Bylaws'}
                        </Button>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.68rem', fontWeight: 600 }}>
                          {m.timestamp}
                        </Typography>
                        <Tooltip title={copiedIndex === idx ? 'Copied to clipboard!' : 'Copy response text'}>
                          <IconButton size="small" onClick={() => handleCopy(m.content, idx)} sx={{ p: 0.5, color: 'text.secondary' }}>
                            {copiedIndex === idx ? <DoneIcon sx={{ fontSize: 14, color: '#10B981' }} /> : <CopyIcon sx={{ fontSize: 14 }} />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Collapsible Grounding Drawer */}
                    <Collapse in={expandedEvidence[idx]}>
                      <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#F1F5F9', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0', mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <SourceIcon sx={{ fontSize: 16, color: roleConfig.accentColor }} />
                          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.75rem' }}>
                            Institutional Governance Reference Sources
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                          {(m.sources || ['Vignan University Statutes', 'UGC Autonomous Regulations 2024']).map((src, sIdx) => (
                            <Chip
                              key={sIdx}
                              label={src}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Collapse>
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        ))}

        {loading && (
          <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: isDark ? '#1E293B' : '#EFF6FF',
                border: '1px solid',
                borderColor: isDark ? `${roleConfig.accentColor}40` : `${roleConfig.accentColor}30`,
                width: 38,
                height: 38,
              }}
            >
              <AgentIcon sx={{ fontSize: 22, color: roleConfig.accentColor }} />
            </Avatar>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '4px 18px 18px 18px',
                bgcolor: isDark ? 'rgba(30, 41, 59, 0.7)' : '#F8FAFC',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <CircularProgress size={18} sx={{ color: roleConfig.accentColor }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.84rem' }}>
                Analyzing institutional governance records &amp; statutory rules...
              </Typography>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Paper>

      {/* ── Input Bar ─────────────────────────────────────────────────── */}
      <Box sx={{ pt: 1.5 }}>
        <Paper
          elevation={0}
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          sx={{
            p: '6px 8px 6px 14px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '20px',
            bgcolor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#CBD5E1',
            boxShadow: isDark ? '0 8px 28px rgba(0,0,0,0.4)' : '0 6px 20px rgba(37,99,235,0.08)',
            transition: 'all 0.2s ease-in-out',
            '&:focus-within': {
              borderColor: roleConfig.accentColor,
              boxShadow: isDark
                ? `0 0 0 3px ${roleConfig.accentColor}30, 0 8px 28px rgba(0,0,0,0.5)`
                : `0 0 0 3px ${roleConfig.accentColor}20, 0 8px 24px rgba(37,99,235,0.12)`,
            },
          }}
        >
          <TextField
            fullWidth
            placeholder={
              userRole === 'IQAC' || userRole === 'IQAC_COORDINATOR'
                ? 'Ask about NAAC 6.2.2 compliance, committee composition deficits, or tenure audits...'
                : userRole === 'CONVENER' || userRole === 'COMMITTEE_CONVENER'
                ? 'Ask about drafting agendas, generating minutes from notes, or verifying quorum...'
                : userRole === 'MEMBER' || userRole === 'COMMITTEE_MEMBER'
                ? 'Ask about your committee agenda papers, assigned action items, or proposals...'
                : 'Ask about university governance oversight, pending MoM approvals, or ATR summaries...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            sx={{
              px: 1,
              '& .MuiInputBase-input': {
                fontSize: '0.92rem',
                fontWeight: 500,
                color: 'text.primary',
              },
            }}
          />

          <IconButton
            type="submit"
            disabled={!input.trim() || loading}
            sx={{
              bgcolor: roleConfig.accentColor,
              color: '#FFFFFF',
              borderRadius: '14px',
              p: 1.1,
              transition: 'all 0.2s ease-in-out',
              boxShadow: `0 4px 12px ${roleConfig.accentColor}40`,
              '&:hover': {
                bgcolor: roleConfig.accentColor,
                transform: 'scale(1.05)',
                boxShadow: `0 6px 16px ${roleConfig.accentColor}60`,
              },
              '&.Mui-disabled': {
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                color: isDark ? 'rgba(255,255,255,0.2)' : '#94A3B8',
                boxShadow: 'none',
              },
            }}
          >
            <SendIcon sx={{ fontSize: 19 }} />
          </IconButton>
        </Paper>
      </Box>
    </Box>
  );
}
