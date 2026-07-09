import React, { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  InputAdornment,
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
      {/* Title – same gradient as new Patients header */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #004d7a 0%, #008793 100%)',
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

      <DialogContent sx={{ p: 0, bgcolor: '#f9fafb' }}>
        {/* Clean card wrapper */}
        <Paper
          elevation={0}
          sx={{
            m: 3,
            p: 3,
            borderRadius: 3,
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Full‑width fields, simple and consistent */}
            <TextField
              fullWidth
              label="First Name"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
              variant="outlined"
              size="small"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Last Name"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              required
              variant="outlined"
              size="small"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

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
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon color="primary" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              select
              label="Gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              variant="outlined"
              size="small"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <GenderIcon color="primary" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              variant="outlined"
              size="small"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="primary" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              variant="outlined"
              size="small"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              multiline
              rows={2}
              variant="outlined"
              size="small"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                    <HomeIcon color="primary" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Buttons – cleaner, minimal transforms */}
            <Box
              display="flex"
              justifyContent="flex-end"
              gap={2}
              sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider', mt: 2 }}
            >
              <Button
                onClick={onClose}
                variant="outlined"
                startIcon={<Cancel />}
                disabled={submitting}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#d0d7e0',
                  color: '#5a6a7a',
                  '&:hover': { backgroundColor: '#f1f5f9', borderColor: '#b0bcc8' },
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
                  background: 'linear-gradient(135deg, #004d7a 0%, #008793 100%)',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(0, 141, 145, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #003a5c 0%, #006b7a 100%)',
                    boxShadow: '0 6px 16px rgba(0, 141, 145, 0.4)',
                  },
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