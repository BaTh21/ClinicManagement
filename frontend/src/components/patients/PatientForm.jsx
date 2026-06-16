import React, { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  InputAdornment,
  Grid,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  PersonAdd,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  Wc as GenderIcon,
  Save,
  Cancel,
} from '@mui/icons-material';
import { createPatient, updatePatient } from '../../services/patient';

export default function PatientForm({ patient, onClose }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patient) {
      setForm({
        ...patient,
        date_of_birth: patient.date_of_birth?.slice(0, 10) || '',
      });
    }
  }, [patient]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validateForm = () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('First name and last name are required');
      return false;
    }
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (form.date_of_birth && isNaN(new Date(form.date_of_birth).getTime())) {
      setError('Please enter a valid date of birth');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      if (patient) {
        await updatePatient(patient.id, form);
      } else {
        await createPatient(form);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save patient. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = !!patient;

  return (
    <>
      {/* Dialog Title – already clean */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          fontWeight: 'bold',
          py: 2,
        }}
      >
        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 36, height: 36 }}>
          <PersonAdd />
        </Avatar>
        <Typography variant="h6" component="span" fontWeight="bold">
          {isEdit ? 'Edit Patient' : 'Add New Patient'}
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 0, bgcolor: '#f8faff' }}>
        {/* Card-like Paper wrapper for the form */}
        <Paper
          elevation={0}
          sx={{
            m: 3,
            p: 3,
            borderRadius: 3,
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            border: '1px solid #eef2f6',
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Fields – each row with label on left, input on right */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
              <Grid item xs={4} sm={3}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.secondary"
                  align="right"
                  sx={{ letterSpacing: 0.3 }}
                >
                  First Name
                </Typography>
              </Grid>
              <Grid item xs={8} sm={9}>
                <TextField
                  fullWidth
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g. John"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" fontSize="small" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fafcff',
                      '&:hover fieldset': { borderColor: '#90caf9' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
              <Grid item xs={4} sm={3}>
                <Typography variant="body2" fontWeight={600} color="text.secondary" align="right">
                  Last Name
                </Typography>
              </Grid>
              <Grid item xs={8} sm={9}>
                <TextField
                  fullWidth
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g. Doe"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" fontSize="small" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fafcff',
                      '&:hover fieldset': { borderColor: '#90caf9' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
              <Grid item xs={4} sm={3}>
                <Typography variant="body2" fontWeight={600} color="text.secondary" align="right">
                  Date of Birth
                </Typography>
              </Grid>
              <Grid item xs={8} sm={9}>
                <TextField
                  fullWidth
                  name="date_of_birth"
                  type="date"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon color="primary" fontSize="small" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fafcff',
                      '&:hover fieldset': { borderColor: '#90caf9' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
              <Grid item xs={4} sm={3}>
                <Typography variant="body2" fontWeight={600} color="text.secondary" align="right">
                  Gender
                </Typography>
              </Grid>
              <Grid item xs={8} sm={9}>
                <TextField
                  fullWidth
                  select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  placeholder="Select"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GenderIcon color="primary" fontSize="small" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fafcff',
                      '&:hover fieldset': { borderColor: '#90caf9' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                    },
                  }}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Grid container spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
              <Grid item xs={4} sm={3}>
                <Typography variant="body2" fontWeight={600} color="text.secondary" align="right">
                  Phone
                </Typography>
              </Grid>
              <Grid item xs={8} sm={9}>
                <TextField
                  fullWidth
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  placeholder="+855 123-4567"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="primary" fontSize="small" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fafcff',
                      '&:hover fieldset': { borderColor: '#90caf9' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
              <Grid item xs={4} sm={3}>
                <Typography variant="body2" fontWeight={600} color="text.secondary" align="right">
                  Email
                </Typography>
              </Grid>
              <Grid item xs={8} sm={9}>
                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  placeholder="name@example.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" fontSize="small" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fafcff',
                      '&:hover fieldset': { borderColor: '#90caf9' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} alignItems="flex-start" sx={{ mb: 1.5 }}>
              <Grid item xs={4} sm={3}>
                <Typography variant="body2" fontWeight={600} color="text.secondary" align="right" sx={{ mt: 1 }}>
                  Address
                </Typography>
              </Grid>
              <Grid item xs={8} sm={9}>
                <TextField
                  fullWidth
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  variant="outlined"
                  size="small"
                  placeholder="Street, Address, City"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <HomeIcon color="primary" fontSize="small" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fafcff',
                      '&:hover fieldset': { borderColor: '#90caf9' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                    },
                  }}
                />
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box
              mt={4}
              display="flex"
              justifyContent="flex-end"
              gap={2}
              sx={{
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Button
                onClick={onClose}
                variant="outlined"
                startIcon={<Cancel />}
                disabled={submitting}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#d0d7e0',
                  color: '#5a6a7a',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: 1,
                    borderColor: '#b0bcc8',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Save />}
                disabled={submitting}
                sx={{
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  borderRadius: 2,
                  px: 4,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #1e88e5 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {submitting ? 'Saving...' : isEdit ? 'Update Patient' : 'Save Patient'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
    </>
  );
}