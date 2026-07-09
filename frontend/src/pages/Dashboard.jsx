import React, { useEffect, useState, useCallback } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, CircularProgress, Alert, Paper,
  ToggleButton, ToggleButtonGroup, IconButton, Tooltip as MuiTooltip, alpha
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Button } from '@mui/material';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Updated color palette – soft, modern, teal-accented
const COLORS = ['#008793', '#004d7a', '#ff9800', '#2e7d32', '#9c27b0'];

const CustomTooltip = ({ active, payload, label, currency = false }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{
        bgcolor: 'background.paper',
        p: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        boxShadow: 3,
      }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="body2" fontWeight="medium" sx={{ color: entry.color }}>
            {entry.name}: {currency ? `$${entry.value?.toLocaleString()}` : entry.value?.toLocaleString()}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    receptionists: 0,
    revenue: 0,
  });
  const [patientStats, setPatientStats] = useState({
    genderDistribution: [],
    newThisMonth: 0,
    monthlyRegistrations: [],
  });
  const [patientGrowth, setPatientGrowth] = useState([]);
  const [appointmentData, setAppointmentData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [appointmentRange, setAppointmentRange] = useState('week');
  const [revenueYear, setRevenueYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const [patientsRes, doctorsRes, appointmentsRes, userCountsRes] = await Promise.all([
        api.get('/patients/?limit=1000'),
        api.get('/doctors/?limit=1000'),
        api.get('/appointments/?limit=1000'),
        api.get('/users/counts'),
      ]);
      setStats({
        patients: patientsRes.data?.length || 0,
        doctors: doctorsRes.data?.length || 0,
        appointments: appointmentsRes.data?.length || 0,
        receptionists: userCountsRes.data?.receptionist || 0,
        revenue: 0,
      });
      if (user?.role === 'admin') {
        const revenueRes = await api.get('/reports/revenue');
        setStats(prev => ({ ...prev, revenue: revenueRes.data?.total_revenue || 0 }));
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
      setError('Failed to load statistics');
    }
  }, [user]);

  const fetchPatientStats = useCallback(async () => {
    try {
      const res = await api.get('/reports/patient-stats');
      setPatientStats({
        genderDistribution: res.data.gender_distribution || [],
        newThisMonth: res.data.new_this_month || 0,
        monthlyRegistrations: res.data.monthly_registrations || [],
      });
    } catch (err) {
      console.error('Patient stats error:', err);
      setPatientStats({
        genderDistribution: [],
        newThisMonth: 0,
        monthlyRegistrations: [],
      });
    }
  }, []);

  const fetchPatientGrowth = useCallback(async () => {
    try {
      const res = await api.get('/reports/patient-growth');
      setPatientGrowth(res.data.data || []);
    } catch (err) {
      console.error('Patient growth error:', err);
    }
  }, []);

  const fetchAppointmentTrend = useCallback(async () => {
    try {
      const res = await api.get(`/reports/appointments-trend?range=${appointmentRange}`);
      setAppointmentData(res.data.data || []);
    } catch (err) {
      console.error('Appointment trend error:', err);
    }
  }, [appointmentRange]);

  const fetchRevenueTrend = useCallback(async () => {
    if (user?.role !== 'admin') return;
    try {
      const res = await api.get(`/reports/revenue-trend?year=${revenueYear}`);
      setRevenueData(res.data.data || []);
    } catch (err) {
      console.error('Revenue trend error:', err);
    }
  }, [revenueYear, user]);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchPatientStats(),
      fetchPatientGrowth(),
      fetchAppointmentTrend(),
      user?.role === 'admin' && fetchRevenueTrend()
    ]);
    setLoading(false);
  }, [fetchStats, fetchPatientStats, fetchPatientGrowth, fetchAppointmentTrend, fetchRevenueTrend, user]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleAppointmentRangeChange = (event, newRange) => {
    if (newRange) setAppointmentRange(newRange);
  };
  const handleRevenueYearChange = (event, newYear) => {
    if (newYear) setRevenueYear(newYear);
  };

  // KPI cards with updated colors and soft background matching the teal theme
  const kpiCards = [
    { 
      title: 'Total Patients', 
      value: stats.patients, 
      icon: <PeopleIcon fontSize="large" />, 
      color: '#008793', 
      bg: alpha('#008793', 0.08) 
    },
    { 
      title: 'Total Doctors', 
      value: stats.doctors, 
      icon: <LocalHospitalIcon fontSize="large" />, 
      color: '#2e7d32', 
      bg: alpha('#2e7d32', 0.08) 
    },
    { 
      title: 'Appointments', 
      value: stats.appointments, 
      icon: <CalendarTodayIcon fontSize="large" />, 
      color: '#ed6c02', 
      bg: alpha('#ed6c02', 0.08) 
    },
    { 
      title: 'Receptionists', 
      value: stats.receptionists, 
      icon: <PersonAddIcon fontSize="large" />, 
      color: '#ff9800', 
      bg: alpha('#ff9800', 0.08) 
    },
  ];
  if (user?.role === 'admin') {
    kpiCards.push({
      title: 'Revenue (USD)',
      value: `$${stats.revenue.toFixed(2)}`,
      icon: <ReceiptIcon fontSize="large" />,
      color: '#9c27b0',
      bg: alpha('#9c27b0', 0.08),
    });
  }

  const handleRefresh = () => {
    loadAllData();
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f0f4f8', minHeight: '100vh', borderRadius: 4 }}>
      {/* Dashboard Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        sx={{
          background: 'linear-gradient(135deg, #004d7a 0%, #008793 100%)',
          color: '#fff',
          p: 2,
          borderRadius: 4,
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Dashboard
        </Typography>
        <MuiTooltip title="Refresh data">
          <IconButton onClick={handleRefresh} size="small" sx={{ color: '#fff' }}>
            <RefreshIcon />
          </IconButton>
        </MuiTooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* KPI Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {kpiCards.map((card, idx) => (
              <Grid item xs={12} sm={6} md={2.4} key={idx}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                    bgcolor: card.bg,
                    border: '1px solid',
                    borderColor: alpha(card.color, 0.2),
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography color="text.secondary" variant="body2" gutterBottom>
                          {card.title}
                        </Typography>
                        <Typography variant="h5" sx={{ color: card.color, fontWeight: 600 }}>
                          {card.value}
                        </Typography>
                      </Box>
                      <Box sx={{ color: card.color }}>{card.icon}</Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Patient Growth Chart – teal gradient */}
          <Paper
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 4,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              border: '1px solid #eef2f6',
            }}
          >
            <Typography variant="h6" fontWeight={600} color="#004d7a" gutterBottom>
              Total Patients Growth (Cumulative)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={patientGrowth}>
                <defs>
                  <linearGradient id="patientGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#008793" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#008793" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#008793"
                  strokeWidth={3}
                  fill="url(#patientGradient)"
                  name="Total Patients"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>

          {/* Appointment Trend – teal/cyan gradient */}
          <Paper
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 4,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              border: '1px solid #eef2f6',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" mb={2}>
              <Typography variant="h6" fontWeight={600} color="#004d7a">
                Appointment Trend
              </Typography>
              <ToggleButtonGroup value={appointmentRange} exclusive onChange={handleAppointmentRangeChange} size="small">
                <ToggleButton value="day" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Day</ToggleButton>
                <ToggleButton value="week" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Week</ToggleButton>
                <ToggleButton value="month" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Month</ToggleButton>
                <ToggleButton value="year" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Year</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={appointmentData}>
                <defs>
                  <linearGradient id="appointmentGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#004d7a" />
                    <stop offset="100%" stopColor="#008793" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="url(#appointmentGradient)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#008793', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#004d7a' }}
                  name="Appointments"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>

          {/* Revenue Trend – admin only, green/teal gradient */}
          {user?.role === 'admin' && (
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                border: '1px solid #eef2f6',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" mb={2}>
                <Typography variant="h6" fontWeight={600} color="#004d7a">
                  Revenue Trend (Monthly)
                </Typography>
                <ToggleButtonGroup value={revenueYear} exclusive onChange={handleRevenueYearChange} size="small">
                  {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => (
                    <ToggleButton key={y} value={y} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                      {y}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#008793" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#004d7a" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tickFormatter={(value) => `$${value}`} />
                  <Tooltip content={<CustomTooltip currency />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    dataKey="revenue"
                    fill="url(#revenueGradient)"
                    radius={[8, 8, 0, 0]}
                    name="Revenue (USD)"
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}