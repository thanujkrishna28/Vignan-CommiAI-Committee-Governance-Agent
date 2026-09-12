import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
  Button,
  Badge,
  InputBase,
  Paper,
  useTheme,
  CircularProgress,
  Popper,
  ClickAwayListener,
  Fade,
} from '@mui/material';
import {
  HomeRounded as DashboardIcon,
  AccountBalanceRounded as CommitteeIcon,
  PeopleRounded as PeopleIcon,
  EventNoteRounded as MeetingIcon,
  AssignmentTurnedInRounded as ActionIcon,
  VerifiedUserRounded as ComplianceIcon,
  SmartToyRounded as AgentIcon,
  AssessmentRounded as ReportIcon,
  FolderSharedRounded as DocumentIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AutoAwesome as SparkleIcon,
  NotificationsRounded as NotificationsIcon,
  EmailRounded as EmailIcon,
  SearchRounded as SearchIcon,
  LightModeRounded as LightModeIcon,
  DarkModeRounded as DarkModeIcon,
  KeyboardArrowDownRounded as ChevronDownIcon,
  SettingsRounded as SettingsIcon,
  DescriptionRounded as MinutesIcon,
  CloseRounded as ClearIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { useSocket, useRealtime } from '../../context/SocketContext';
import { notificationsApi, committeesApi, meetingsApi, documentsApi } from '../../services/api';

const DRAWER_WIDTH = 250;

const getNavItems = (role) => {
  const normRole = (role || 'REGISTRAR').toUpperCase();

  if (normRole === 'CONVENER' || normRole === 'COMMITTEE_CONVENER') {
    return [
      { label: 'Convener Hub', path: '/', icon: <DashboardIcon /> },
      { label: 'My Committees', path: '/committees', icon: <CommitteeIcon /> },
      { label: 'Schedule Meetings', path: '/meetings', icon: <MeetingIcon /> },
      { label: 'Minutes & Signatures', path: '/minutes', icon: <MinutesIcon /> },
      { label: 'Action Items & ATR', path: '/actions', icon: <ActionIcon /> },
      { label: 'Statutory Compliance', path: '/compliance', icon: <ComplianceIcon /> },
      { label: 'CommiAI Copilot', path: '/agent', icon: <AgentIcon />, special: true },
      { label: 'Reports Generator', path: '/reports', icon: <ReportIcon /> },
      { label: 'Documents & Evidences', path: '/documents', icon: <DocumentIcon /> },
      { label: 'Notifications', path: '/notifications', icon: <EmailIcon />, badge: '5' },
    ];
  }

  if (normRole === 'MEMBER' || normRole === 'COMMITTEE_MEMBER') {
    return [
      { label: 'Member Workspace', path: '/', icon: <DashboardIcon /> },
      { label: 'My Committees', path: '/committees', icon: <CommitteeIcon /> },
      { label: 'Assigned Actions (ATR)', path: '/actions', icon: <ActionIcon /> },
      { label: 'Meeting Sessions', path: '/meetings', icon: <MeetingIcon /> },
      { label: 'Review Minutes', path: '/minutes', icon: <MinutesIcon /> },
      { label: 'AI Assistant', path: '/agent', icon: <AgentIcon />, special: true },
      { label: 'Evidences & Policies', path: '/documents', icon: <DocumentIcon /> },
      { label: 'Notifications', path: '/notifications', icon: <EmailIcon />, badge: '2' },
    ];
  }

  if (normRole === 'IQAC' || normRole === 'IQAC_COORDINATOR') {
    return [
      { label: 'IQAC Audit Hub', path: '/', icon: <DashboardIcon /> },
      { label: 'All Committees', path: '/committees', icon: <CommitteeIcon /> },
      { label: 'Institutional Quorum', path: '/meetings', icon: <MeetingIcon /> },
      { label: 'Compliance Audit Matrix', path: '/compliance', icon: <ComplianceIcon /> },
      { label: 'ATR Governance', path: '/actions', icon: <ActionIcon /> },
      { label: 'NAAC / NBA Reports', path: '/reports', icon: <ReportIcon /> },
      { label: 'CommiAI Auditor', path: '/agent', icon: <AgentIcon />, special: true },
      { label: 'Accreditation Evidence', path: '/documents', icon: <DocumentIcon /> },
    ];
  }

  // Default / REGISTRAR / SUPER_ADMIN
  return [
    { label: 'Executive Dashboard', path: '/', icon: <DashboardIcon /> },
    { label: 'Statutory Committees', path: '/committees', icon: <CommitteeIcon /> },
    { label: 'Institutional Members', path: '/members', icon: <PeopleIcon /> },
    { label: 'Meetings & Quorum', path: '/meetings', icon: <MeetingIcon /> },
    { label: 'Minutes & Sign-offs', path: '/minutes', icon: <MinutesIcon /> },
    { label: 'Statutory Actions', path: '/actions', icon: <ActionIcon /> },
    { label: 'Compliance Hub', path: '/compliance', icon: <ComplianceIcon /> },
    { label: 'Official Notifications', path: '/notifications', icon: <EmailIcon />, badge: '13' },
    { label: 'CommiAI Agent', path: '/agent', icon: <AgentIcon />, special: true },
    { label: 'Accreditation Reports', path: '/reports', icon: <ReportIcon /> },
    { label: 'Document Gazette', path: '/documents', icon: <DocumentIcon /> },
    { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
  ];
};

export default function AppLayout() {
  const { user, logout, loginAsDemo, demoAccounts } = useAuth();
  const { mode, toggleColorMode } = useThemeMode();
  const { isConnected } = useSocket();
  const theme = useTheme();
  const isDark = mode === 'dark';
  const navItems = getNavItems(user?.role);

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElDemo, setAnchorElDemo] = useState(null);
  const [unreadCount, setUnreadCount] = useState(3);

  // Live global search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ committees: [], meetings: [], documents: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchAnchorRef = React.useRef(null);

  // Debounced live search across committees, meetings, documents
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults({ committees: [], meetings: [], documents: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchOpen(true);

    const timer = setTimeout(async () => {
      try {
        const [commRes, meetRes, docRes] = await Promise.allSettled([
          committeesApi.list({ search: q }),
          meetingsApi.list({ search: q }),
          documentsApi.list({ search: q }),
        ]);

        const comms = commRes.status === 'fulfilled' && Array.isArray(commRes.value) ? commRes.value.slice(0, 4) : [];
        const meets = meetRes.status === 'fulfilled' && Array.isArray(meetRes.value) ? meetRes.value.slice(0, 4) : [];
        const docs = docRes.status === 'fulfilled' && Array.isArray(docRes.value) ? docRes.value.slice(0, 4) : [];

        setSearchResults({ committees: comms, meetings: meets, documents: docs });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSelect = (path) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.committees.length > 0) {
        handleSearchSelect('/committees');
      } else if (searchResults.meetings.length > 0) {
        handleSearchSelect('/meetings');
      } else if (searchResults.documents.length > 0) {
        handleSearchSelect('/documents');
      } else if (searchQuery.trim()) {
        handleSearchSelect('/committees');
      }
    }
  };

  const totalResultsCount =
    searchResults.committees.length +
    searchResults.meetings.length +
    searchResults.documents.length;

  const fetchUnread = React.useCallback(async () => {
    try {
      const res = await notificationsApi.list({ limit: 1 });
      if (res && res.unread_count !== undefined) {
        setUnreadCount(res.unread_count);
      }
    } catch (err) {
      // quiet catch
    }
  }, []);

  React.useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user, fetchUnread]);

  // Live notification update
  useRealtime(['notifications', 'actions', 'minutes'], () => {
    fetchUnread();
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDemoSwitch = async (account) => {
    setAnchorElDemo(null);
    await loginAsDemo(account);
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
        backgroundImage: isDark
          ? 'linear-gradient(180deg, #0F172A 0%, #0B1120 100%)'
          : 'linear-gradient(180deg, #F8FAFC 0%, #EEF5FF 100%)',
        borderRight: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
        color: isDark ? '#F8FAFC' : '#0F172A',
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#CBD5E1',
          borderRadius: 4,
        },
      }}
    >
      <Box>
        {/* Top Official Vignan Logo Banner in Sidebar */}
        <Box sx={{ p: 2, pb: 1.5, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          <Box
            component="img"
            src="/vignan-official-logo.png"
            alt="Vignan University"
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: 46,
              objectFit: 'contain',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.95)' : '#FFFFFF',
              borderRadius: '10px',
              p: 0.8,
              border: '1px solid',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#E2E8F0',
              boxShadow: isDark ? '0 2px 10px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          />
        </Box>

        <Divider sx={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0', mx: 2, mb: 1 }} />

        {/* Navigation Links */}
        <List sx={{ px: 1.5, py: 0.5 }}>
          {navItems.map((item) => {
            const isActive =
              (item.path === '/' && location.pathname === '/') ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={isActive}
                  sx={{
                    borderRadius: '12px',
                    py: 0.9,
                    px: 1.5,
                    color: isActive ? '#FFFFFF' : isDark ? '#94A3B8' : '#475569',
                    background: isActive
                      ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%) !important'
                      : 'transparent',
                    boxShadow: isActive ? '0 4px 14px rgba(37, 99, 235, 0.35)' : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: isActive
                        ? '#2563EB'
                        : isDark
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(59, 130, 246, 0.08)',
                      color: isActive ? '#FFFFFF' : '#3B82F6',
                      transform: 'translateX(2px)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? '#FFFFFF' : isDark ? '#64748B' : '#64748B',
                      minWidth: 34,
                      '& svg': { fontSize: 20 },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        fontSize: '0.84rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#FFFFFF' : 'inherit',
                      },
                    }}
                  />
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: isActive
                          ? 'rgba(255, 255, 255, 0.25)'
                          : isDark
                          ? 'rgba(59, 130, 246, 0.2)'
                          : '#DBEAFE',
                        color: isActive ? '#FFFFFF' : isDark ? '#93C5FD' : '#1D4ED8',
                      }}
                    />
                  )}
                  {item.special && (
                    <SparkleIcon sx={{ fontSize: 16, color: isActive ? '#FDE047' : '#F59E0B' }} />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: isDark ? '#0B1120' : '#EEF5FF',
        color: isDark ? '#F8FAFC' : '#0F172A',
        transition: 'background-color 0.25s ease',
      }}
    >
      {/* Top App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          color: isDark ? '#F8FAFC' : '#0F172A',
          borderBottom: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
          boxShadow: isDark
            ? '0 1px 3px rgba(0, 0, 0, 0.3)'
            : '0 1px 3px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Toolbar
          sx={{
            minHeight: 68,
            px: { xs: 2, md: 3 },
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {/* Left: Mobile Toggle & Vignan CommiAI Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 0.5, display: { sm: 'none' } }}
              aria-label="Open navigation menu"
            >
              <MenuIcon />
            </IconButton>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.05rem', md: '1.2rem' },
                  letterSpacing: '-0.02em',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  lineHeight: 1.1,
                }}
              >
                Vignan CommiAI
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: isDark ? '#94A3B8' : '#64748B',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  display: 'block',
                }}
              >
                Committee Governance Agent
              </Typography>
            </Box>
          </Box>

          {/* Center: Search Input Bar with Live Results Dropdown */}
          <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
            <Box sx={{ position: 'relative', display: { xs: 'none', md: 'block' } }}>
              <Box
                ref={searchAnchorRef}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: isDark ? '#1E293B' : '#F8FAFC',
                  border: '1px solid',
                  borderColor: searchOpen && searchQuery.trim().length >= 2
                    ? '#3B82F6'
                    : isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
                  borderRadius: '24px',
                  px: 2,
                  py: 0.5,
                  width: { md: 290, lg: 390 },
                  transition: 'all 0.2s',
                  boxShadow: searchOpen && searchQuery.trim().length >= 2
                    ? isDark ? '0 0 0 3px rgba(59, 130, 246, 0.25)' : '0 0 0 3px rgba(59, 130, 246, 0.1)'
                    : 'none',
                  '&:hover, &:focus-within': {
                    borderColor: '#3B82F6',
                    bgcolor: isDark ? '#273549' : '#FFFFFF',
                    boxShadow: isDark
                      ? '0 0 0 3px rgba(59, 130, 246, 0.25)'
                      : '0 0 0 3px rgba(59, 130, 246, 0.1)',
                  },
                }}
              >
                <SearchIcon sx={{ color: isDark ? '#64748B' : '#94A3B8', fontSize: 20, mr: 1 }} />
                <InputBase
                  placeholder="Search Committees, meetings, documents..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!searchOpen) setSearchOpen(true);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 2) setSearchOpen(true);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  sx={{
                    fontSize: '0.84rem',
                    color: isDark ? '#F1F5F9' : '#1E293B',
                    width: '100%',
                    '& ::placeholder': {
                      color: isDark ? '#94A3B8' : '#94A3B8',
                      opacity: 1,
                    },
                  }}
                />
                {isSearching ? (
                  <CircularProgress size={16} sx={{ color: '#3B82F6', ml: 0.5 }} />
                ) : searchQuery ? (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchOpen(false);
                    }}
                    sx={{ p: 0.2, color: isDark ? '#94A3B8' : '#64748B' }}
                  >
                    <ClearIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                ) : null}
              </Box>

              {/* Floating Live Search Dropdown */}
              <Popper
                open={Boolean(searchOpen && searchAnchorRef.current && searchQuery.trim().length >= 2)}
                anchorEl={searchAnchorRef.current}
                placement="bottom-start"
                transition
                style={{ zIndex: 1400, width: searchAnchorRef.current ? Math.max(searchAnchorRef.current.clientWidth, 400) : 400 }}
              >
                {({ TransitionProps }) => (
                  <Fade {...TransitionProps} timeout={150}>
                    <Paper
                      elevation={8}
                      sx={{
                        mt: 1,
                        borderRadius: '16px',
                        overflow: 'hidden',
                        bgcolor: isDark ? '#0F172A' : '#FFFFFF',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
                        boxShadow: isDark
                          ? '0 12px 36px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)'
                          : '0 12px 36px rgba(15,23,42,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
                        maxHeight: '440px',
                        overflowY: 'auto',
                      }}
                    >
                      {/* Dropdown Content */}
                      {isSearching && totalResultsCount === 0 ? (
                        <Box sx={{ p: 2.5, textAlign: 'center' }}>
                          <CircularProgress size={24} sx={{ color: '#3B82F6', mb: 1 }} />
                          <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: '0.82rem' }}>
                            Searching university committees, meetings, and documents...
                          </Typography>
                        </Box>
                      ) : totalResultsCount === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                          <SearchIcon sx={{ fontSize: 36, color: isDark ? '#475569' : '#CBD5E1', mb: 1 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? '#F1F5F9' : '#1E293B', mb: 0.5 }}>
                            No results found
                          </Typography>
                          <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                            No committees, meetings, or documents matched "{searchQuery}"
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ py: 1 }}>
                          {/* Committees Results */}
                          {searchResults.committees.length > 0 && (
                            <Box sx={{ mb: 1 }}>
                              <Box sx={{ px: 2, py: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#3B82F6', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                                  Committees ({searchResults.committees.length})
                                </Typography>
                                <Button
                                  size="small"
                                  onClick={() => handleSearchSelect('/committees')}
                                  sx={{ fontSize: '0.7rem', py: 0, textTransform: 'none', color: '#3B82F6', minWidth: 'auto' }}
                                >
                                  View all
                                </Button>
                              </Box>
                              <List dense disablePadding>
                                {searchResults.committees.map((comm) => (
                                  <ListItem key={comm.id} disablePadding>
                                    <ListItemButton
                                      onClick={() => handleSearchSelect('/committees')}
                                      sx={{
                                        px: 2,
                                        py: 0.8,
                                        gap: 1.5,
                                        '&:hover': {
                                          bgcolor: isDark ? 'rgba(59, 130, 246, 0.12)' : '#EFF6FF',
                                        },
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          width: 32,
                                          height: 32,
                                          borderRadius: '8px',
                                          bgcolor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: '#3B82F6',
                                          flexShrink: 0,
                                        }}
                                      >
                                        <CommitteeIcon sx={{ fontSize: 18 }} />
                                      </Box>
                                      <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontWeight: 600,
                                            fontSize: '0.82rem',
                                            color: isDark ? '#F1F5F9' : '#0F172A',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                          }}
                                        >
                                          {comm.name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: '0.72rem' }}>
                                          {comm.authority || 'Institutional'} • {comm.member_count || 0} Members
                                        </Typography>
                                      </Box>
                                      {comm.status && (
                                        <Chip
                                          label={comm.status}
                                          size="small"
                                          sx={{
                                            fontSize: '0.65rem',
                                            height: 20,
                                            bgcolor: comm.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(148, 163, 184, 0.12)',
                                            color: comm.status === 'ACTIVE' ? '#10B981' : '#64748B',
                                            fontWeight: 700,
                                          }}
                                        />
                                      )}
                                    </ListItemButton>
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}

                          {/* Meetings Results */}
                          {searchResults.meetings.length > 0 && (
                            <Box sx={{ mb: 1 }}>
                              {searchResults.committees.length > 0 && <Divider sx={{ my: 0.5, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0' }} />}
                              <Box sx={{ px: 2, py: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#10B981', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                                  Meetings ({searchResults.meetings.length})
                                </Typography>
                                <Button
                                  size="small"
                                  onClick={() => handleSearchSelect('/meetings')}
                                  sx={{ fontSize: '0.7rem', py: 0, textTransform: 'none', color: '#10B981', minWidth: 'auto' }}
                                >
                                  View all
                                </Button>
                              </Box>
                              <List dense disablePadding>
                                {searchResults.meetings.map((m) => (
                                  <ListItem key={m.id} disablePadding>
                                    <ListItemButton
                                      onClick={() => handleSearchSelect('/meetings')}
                                      sx={{
                                        px: 2,
                                        py: 0.8,
                                        gap: 1.5,
                                        '&:hover': {
                                          bgcolor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5',
                                        },
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          width: 32,
                                          height: 32,
                                          borderRadius: '8px',
                                          bgcolor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: '#10B981',
                                          flexShrink: 0,
                                        }}
                                      >
                                        <MeetingIcon sx={{ fontSize: 18 }} />
                                      </Box>
                                      <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontWeight: 600,
                                            fontSize: '0.82rem',
                                            color: isDark ? '#F1F5F9' : '#0F172A',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                          }}
                                        >
                                          {m.title}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: '0.72rem' }}>
                                          {m.committee_name || 'Committee'} • {m.meeting_date || 'Date TBD'}
                                        </Typography>
                                      </Box>
                                      {m.status && (
                                        <Chip
                                          label={m.status}
                                          size="small"
                                          sx={{
                                            fontSize: '0.65rem',
                                            height: 20,
                                            bgcolor: 'rgba(59, 130, 246, 0.1)',
                                            color: '#3B82F6',
                                            fontWeight: 700,
                                          }}
                                        />
                                      )}
                                    </ListItemButton>
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}

                          {/* Documents Results */}
                          {searchResults.documents.length > 0 && (
                            <Box>
                              {(searchResults.committees.length > 0 || searchResults.meetings.length > 0) && (
                                <Divider sx={{ my: 0.5, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0' }} />
                              )}
                              <Box sx={{ px: 2, py: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#8B5CF6', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                                  Documents ({searchResults.documents.length})
                                </Typography>
                                <Button
                                  size="small"
                                  onClick={() => handleSearchSelect('/documents')}
                                  sx={{ fontSize: '0.7rem', py: 0, textTransform: 'none', color: '#8B5CF6', minWidth: 'auto' }}
                                >
                                  View all
                                </Button>
                              </Box>
                              <List dense disablePadding>
                                {searchResults.documents.map((doc) => (
                                  <ListItem key={doc.id} disablePadding>
                                    <ListItemButton
                                      onClick={() => handleSearchSelect('/documents')}
                                      sx={{
                                        px: 2,
                                        py: 0.8,
                                        gap: 1.5,
                                        '&:hover': {
                                          bgcolor: isDark ? 'rgba(139, 92, 246, 0.12)' : '#F5F3FF',
                                        },
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          width: 32,
                                          height: 32,
                                          borderRadius: '8px',
                                          bgcolor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: '#8B5CF6',
                                          flexShrink: 0,
                                        }}
                                      >
                                        <DocumentIcon sx={{ fontSize: 18 }} />
                                      </Box>
                                      <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontWeight: 600,
                                            fontSize: '0.82rem',
                                            color: isDark ? '#F1F5F9' : '#0F172A',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                          }}
                                        >
                                          {doc.original_filename || doc.name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: '0.72rem' }}>
                                          {doc.category || 'General Document'} {doc.committee_name ? `• ${doc.committee_name}` : ''}
                                        </Typography>
                                      </Box>
                                    </ListItemButton>
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Footer Tip */}
                      <Box
                        sx={{
                          px: 2,
                          py: 0.8,
                          bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
                          borderTop: '1px solid',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="caption" sx={{ color: isDark ? '#64748B' : '#94A3B8', fontSize: '0.68rem' }}>
                          Press <kbd style={{ padding: '2px 4px', borderRadius: 4, background: isDark ? '#334155' : '#E2E8F0' }}>Enter</kbd> to explore or <kbd style={{ padding: '2px 4px', borderRadius: 4, background: isDark ? '#334155' : '#E2E8F0' }}>Esc</kbd> to close
                        </Typography>
                      </Box>
                    </Paper>
                  </Fade>
                )}
              </Popper>
            </Box>
          </ClickAwayListener>

          {/* Right: Notifications, Theme Switcher & User Profile Pill */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>

            {/* Notification Bell */}
            <Tooltip title="Notifications & System Alerts">
              <IconButton
                component={Link}
                to="/notifications"
                aria-label="View notifications"
                sx={{
                  color: isDark ? '#E2E8F0' : '#475569',
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F8FAFC',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
                  borderRadius: '10px',
                  p: 0.8,
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(59, 130, 246, 0.18)' : '#EFF6FF',
                    borderColor: isDark ? '#3B82F6' : '#BFDBFE',
                  },
                }}
              >
                <Badge badgeContent={unreadCount || 3} color="error">
                  <NotificationsIcon sx={{ fontSize: 20 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Dark/Light Mode Accessible Toggle Button */}
            <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton
                onClick={toggleColorMode}
                aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                sx={{
                  color: isDark ? '#FDE047' : '#475569',
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F8FAFC',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(253, 224, 71, 0.35)' : '#E2E8F0',
                  borderRadius: '10px',
                  p: 0.8,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(253, 224, 71, 0.18)' : '#EFF6FF',
                    borderColor: isDark ? '#FDE047' : '#3B82F6',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                {isDark ? (
                  <LightModeIcon sx={{ fontSize: 20, color: '#FDE047' }} />
                ) : (
                  <DarkModeIcon sx={{ fontSize: 20, color: '#475569' }} />
                )}
              </IconButton>
            </Tooltip>

            {/* User Profile Pill Button (with Role Switching Menu) */}
            <Button
              onClick={(e) => setAnchorElUser(e.currentTarget)}
              aria-label="User profile and role menu"
              aria-haspopup="true"
              aria-expanded={Boolean(anchorElUser)}
              sx={{
                p: 0.6,
                px: 1.2,
                borderRadius: '12px',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
                bgcolor: isDark ? '#1E293B' : '#FFFFFF',
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                '&:hover': {
                  bgcolor: isDark ? '#273549' : '#F8FAFC',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#CBD5E1',
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: '#3B82F6',
                  width: 32,
                  height: 32,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(59, 130, 246, 0.35)',
                }}
              >
                {user?.role ? user.role[0] : 'R'}
              </Avatar>
              <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    lineHeight: 1.1,
                  }}
                >
                  {user?.role?.replace(/_/g, ' ') || 'Registrar'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: isDark ? '#94A3B8' : '#64748B',
                    fontSize: '0.68rem',
                    display: 'block',
                  }}
                >
                  Office of the{' '}
                  {user?.role?.includes('CONVENER')
                    ? 'Convener'
                    : user?.role?.includes('IQAC')
                    ? 'IQAC'
                    : 'Registrar'}
                </Typography>
              </Box>
              <ChevronDownIcon sx={{ color: isDark ? '#94A3B8' : '#94A3B8', fontSize: 18 }} />
            </Button>

            {/* User Profile Dropdown Menu with Switch Role Options */}
            <Menu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={() => setAnchorElUser(null)}
              PaperProps={{
                sx: {
                  width: 280,
                  p: 1,
                  borderRadius: '16px',
                  boxShadow: isDark
                    ? '0 12px 36px rgba(0,0,0,0.6)'
                    : '0 12px 36px rgba(0,0,0,0.12)',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                  bgcolor: isDark ? '#1E293B' : '#FFFFFF',
                },
              }}
            >
              <Box sx={{ px: 1.5, py: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: isDark ? '#F8FAFC' : '#0F172A', fontWeight: 800 }}
                >
                  {user?.name || user?.full_name || 'Prof. Dr. K. V. Krishna Kishore'}
                </Typography>
                <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  {user?.email || '231fa04e50@gmail.com'}
                </Typography>
              </Box>
              <Divider sx={{ my: 1, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : undefined }} />

              <Box sx={{ px: 1.5, py: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={user?.role?.replace(/_/g, ' ') || 'REGISTRAR'}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 800, fontSize: '0.68rem' }}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Active Session
                </Typography>
              </Box>

              <Divider sx={{ my: 1, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : undefined }} />
              <MenuItem
                onClick={handleLogout}
                sx={{
                  py: 1,
                  color: isDark ? '#F87171' : '#DC2626',
                  borderRadius: '8px',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isDark ? '#F87171' : '#DC2626', minWidth: 32 }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer: Mobile and Desktop */}
      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
            },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Viewport */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 3.5 },
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '68px',
          minHeight: 'calc(100vh - 68px)',
          backgroundColor: isDark ? '#0B1120' : '#EEF5FF',
          color: isDark ? '#F8FAFC' : '#0F172A',
          transition: 'background-color 0.25s ease',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
