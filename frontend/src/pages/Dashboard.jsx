import React, { useEffect, useState, useCallback } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress, Alert } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    receptionists: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [patientsRes, doctorsRes, appointmentsRes, userCountsRes] = await Promise.all([
        api.get('/patients/?limit=1000'),
        api.get('/doctors/?limit=1000'),
        api.get('/appointments/?limit=1000'),
        api.get('/users/counts'),
      ]);

      const newStats = {
        patients: patientsRes.data?.length || 0,
        doctors: doctorsRes.data?.length || 0,
        appointments: appointmentsRes.data?.length || 0,
        receptionists: userCountsRes.data?.receptionist || 0,
        revenue: 0,
      };

      if (user?.role === 'admin') {
        try {
          const revenueRes = await api.get('/reports/revenue');
          newStats.revenue = revenueRes.data?.total_revenue || 0;
        } catch (err) {
          console.warn('Revenue fetch failed:', err);
        }
      }

      setStats(newStats);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const cards = [
    { title: 'Total Patients', value: stats.patients, icon: <PeopleIcon fontSize="large" />, color: '#1976d2' },
    { title: 'Total Doctors', value: stats.doctors, icon: <LocalHospitalIcon fontSize="large" />, color: '#2e7d32' },
    { title: 'Appointments', value: stats.appointments, icon: <CalendarTodayIcon fontSize="large" />, color: '#ed6c02' },
    { title: 'Total Receptionists', value: stats.receptionists, icon: <PersonAddIcon fontSize="large" />, color: '#ff9800' },
  ];

  if (user?.role === 'admin') {
    cards.push({
      title: 'Revenue (USD)',
      value: `$${stats.revenue.toFixed(2)}`,
      icon: <ReceiptIcon fontSize="large" />,
      color: '#9c27b0',
    });
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && !stats.patients && !stats.doctors && !stats.appointments ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {cards.map((card, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        {card.title}
                      </Typography>
                      <Typography variant="h5">{card.value}</Typography>
                    </Box>
                    <Box sx={{ color: card.color }}>{card.icon}</Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}