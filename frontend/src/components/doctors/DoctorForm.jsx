import React, { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Grid,
  CircularProgress,
  Alert,
  InputAdornment,
  Typography,
  Divider,
  Paper,
} from '@mui/material';
import {
  Person,
  MedicalServices,
  Phone,
  Email,
  School,
  Save,
  Cancel,
  LocalHospital,
} from '@mui/icons-material';
import { createDoctor, updateDoctor } from '../../services/doctor';

export default function DoctorForm({ doctor, onClose }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    specialization: '',
    phone: '',
    email: '',
    qualification: '',
    user_id: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (doctor) {
      setForm(doctor);
    }
  }, [doctor]);

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
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      if (doctor) {
        await updateDoctor(doctor.id, form);
      } else {
        await createDoctor(form);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save doctor. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = !!doctor;

  return (
    <>
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
        <LocalHospital sx={{ fontSize: 28 }} />
        <Typography variant="h6" component="span" fontWeight="bold">
          {isEdit ? 'Edit Doctor' : 'Add New Doctor'}
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 0, bgcolor: '#f8faff' }}>
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

            {/* First Name */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
              <Grid item xs={4} sm={3}>
                <Typography variant="body2" fontWeight={600} color="text.secondary" align="right">
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
                        <Person color="primary" fontSize="small" />
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

            {/* Last Name */}
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
                        <Person color="primary" fontSize="small" />
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

            {/* Specialization */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
              <Grid item xs={4} sm={3}>
                <Typography variant="body2" fontWeight={600} color="text.secondary" align="right">
                  Specialization
                </Typography>
              </Grid>
              <Grid item xs={8} sm={9}>
                <TextField
                  fullWidth
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  placeholder="e.g. Cardiology"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MedicalServices color="primary" fontSize="small" />
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

            {/* Phone */}
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
                        <Phone color="primary" fontSize="small" />
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

            {/* Email */}
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
                        <Email color="primary" fontSize="small" />
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

            {/* Qualification */}
            <Grid container spacing={2} alignItems="flex-start" sx={{ mb: 1.5 }}>
              <Grid item xs={4} sm={3}>
                <Typography variant="body2" fontWeight={600} color="text.secondary" align="right" sx={{ mt: 1 }}>
                  Qualification
                </Typography>
              </Grid>
              <Grid item xs={8} sm={9}>
                <TextField
                  fullWidth
                  name="qualification"
                  value={form.qualification}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  variant="outlined"
                  size="small"
                  placeholder="MD, PhD, certifications..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <School color="primary" fontSize="small" />
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
                {submitting ? 'Saving...' : isEdit ? 'Update Doctor' : 'Save Doctor'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
    </>
  );
}