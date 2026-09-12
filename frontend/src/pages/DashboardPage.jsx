import React from 'react';
import { Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import RegistrarDashboard from './roles/RegistrarDashboard';
import ConvenerDashboard from './roles/ConvenerDashboard';
import MemberDashboard from './roles/MemberDashboard';
import IqacDashboard from './roles/IqacDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  const role = user?.role;

  return (
    <Box>
      {(role === 'SUPER_ADMIN' || role === 'REGISTRAR') && <RegistrarDashboard />}
      {(role === 'COMMITTEE_CONVENER' || role === 'CONVENER') && <ConvenerDashboard />}
      {(role === 'COMMITTEE_MEMBER' || role === 'MEMBER') && <MemberDashboard />}
      {(role === 'IQAC_COORDINATOR' || role === 'IQAC') && <IqacDashboard />}
      {!role && <RegistrarDashboard />}
    </Box>
  );
}

