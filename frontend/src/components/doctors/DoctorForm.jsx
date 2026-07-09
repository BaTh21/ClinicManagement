import React, { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
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
          background: 'linear-gradient(135deg, #004d7a 0%, #008793 100%)',
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

      <DialogContent sx={{ p: 0, bgcolor: '#f9fafb' }}>
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

            {/* Full-width single-column fields – clean and simple */}
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
                    <Person color="primary" fontSize="small" />
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
                    <Person color="primary" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Specialization"
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              variant="outlined"
              size="small"
              placeholder="e.g. Cardiology"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MedicalServices color="primary" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              variant="outlined"
              size="small"
              placeholder="+855 123-4567"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="primary" fontSize="small" />
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
              placeholder="name@example.com"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Qualification"
              name="qualification"
              value={form.qualification}
              onChange={handleChange}
              multiline
              rows={2}
              variant="outlined"
              size="small"
              placeholder="MD, PhD, certifications..."
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                    <School color="primary" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Buttons – clean and minimal */}
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
                {submitting ? 'Saving...' : isEdit ? 'Update Doctor' : 'Save Doctor'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
    </>
  );
}