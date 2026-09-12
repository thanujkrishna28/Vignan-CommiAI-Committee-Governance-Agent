import React, { useState } from 'react';
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
} from '@mui/material';
import PortalGreetingBanner from '../../components/common/PortalGreetingBanner';

export default function MemberDashboard() {
  const [actions] = useState([
    {
      id: 'act-01',
      title: 'Submit revised CSE 2026 Curriculum structure for BoS approval',
      committee: 'Board of Studies (CSE)',
      dueDate: 'Sep 20, 2026',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
    },
    {
      id: 'act-02',
      title: 'Review Ph.D. Scholar progress reports for Departmental Research Committee',
      committee: 'Research Advisory Committee',
      dueDate: 'Sep 25, 2026',
      status: 'PENDING',
      priority: 'MEDIUM',
    },
  ]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>
      {/* Member Header Banner */}
      <PortalGreetingBanner
        roleTitle="Dr. J. Veeranjaneyulu"
        badgeText="COMMITTEE MEMBER • ASST. PROFESSOR, CSE"
        statusText="Asst. Professor CSE • Member Workspace & Action Desk • Access committee agenda papers, track your assigned institutional action items, and confirm meeting attendance."
        quoteText="“Collaborative Deliberation. Timely Execution. Academic Excellence.” — Vignan CommiAI Governance Engine"
        accentColor="#0284C7"
        actionButtons={
          <Chip
            label="2 Active Committee Memberships"
            sx={{
              bgcolor: 'rgba(2, 132, 199, 0.12)',
              color: '#0284C7',
              fontWeight: 700,
              border: '1px solid rgba(2, 132, 199, 0.3)',
            }}
          />
        }
      />

      {/* Member Metrics */}
      <Grid container spacing={1.5} sx={{ width: '100%' }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ p: 1.8, borderRadius: '14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              My Assigned Action Items
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.65rem', my: 0.4 }}>
              {actions.length}
            </Typography>
            <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 600, fontSize: '0.74rem' }}>
              • 1 high priority task due in 9 days
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ p: 1.8, borderRadius: '14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Next Committee Session
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.35rem', my: 0.4 }}>
              Academic Council #42
            </Typography>
            <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, fontSize: '0.74rem' }}>
              Tomorrow at 10:30 AM • Confirmed
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ p: 1.8, borderRadius: '14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              My Attendance Reliability
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#059669', fontSize: '1.65rem', my: 0.4 }}>
              92%
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.74rem' }}>
              11 of 12 statutory sessions attended
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Main Sections: Action Items & Upcoming Sessions */}
      <Grid container spacing={2.5} sx={{ width: '100%' }}>
        {/* Left: My Action Items */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  My Assigned Action Items
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Deliverables assigned from ratified minutes
                </Typography>
              </Box>
              <Chip label="Personal Tracker" size="small" color="primary" sx={{ fontWeight: 700 }} />
            </Box>

            <Divider sx={{ mb: 2 }} />

            {actions.map((act) => (
              <Paper
                key={act.id}
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 2.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {act.title}
                    </Typography>
                    <Chip
                      label={act.priority}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        bgcolor: act.priority === 'HIGH' ? '#FEF2F2' : '#EFF6FF',
                        color: act.priority === 'HIGH' ? '#991B1B' : '#1E40AF',
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Origin: <strong>{act.committee}</strong> • Due: <strong>{act.dueDate}</strong>
                  </Typography>
                </Box>
                <Chip
                  label={act.status === 'IN_PROGRESS' ? 'In Progress' : 'Pending'}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    bgcolor: act.status === 'IN_PROGRESS' ? '#FEF3C7' : (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                    color: act.status === 'IN_PROGRESS' ? '#92400E' : 'text.secondary',
                  }}
                />
              </Paper>
            ))}
          </Card>
        </Grid>

        {/* Right: My Committees */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              My Committee Appointments
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              Official institutional appointments under university charter
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Academic Council
                  </Typography>
                  <Chip label="Internal Faculty Member" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                  Tenure: 2024 - 2027 (Year 2 of 3)
                </Typography>
                <Button size="small" variant="text" component={Link} to="/committees/ac" sx={{ p: 0, textTransform: 'none', fontWeight: 600 }}>
                  View Committee Documents & Minutes →
                </Button>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Board of Studies (CSE)
                  </Typography>
                  <Chip label="Internal Expert" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                  Tenure: 2025 - 2027 (Year 1 of 2)
                </Typography>
                <Button size="small" variant="text" component={Link} to="/committees/bos-cse" sx={{ p: 0, textTransform: 'none', fontWeight: 600 }}>
                  View Syllabus & Agendas →
                </Button>
              </Paper>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
