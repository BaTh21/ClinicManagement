import React, { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  MenuItem,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Paper,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  CalendarMonth as CalendarIcon,
  Save,
  Cancel,
} from '@mui/icons-material';
import { createAppointment, updateAppointment } from '../../services/appointment';
import { getPatients } from '../../services/patient';
import { getDoctors } from '../../services/doctor';

export default function AppointmentForm({ appointment, onClose }) {
  const [form, setForm] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_time: new Date(),
    reason: '',
    notes: '',
    status: 'scheduled',
  });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [pRes, dRes] = await Promise.all([getPatients(), getDoctors()]);
        setPatients(pRes.data);
        setDoctors(dRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOptions();

    if (appointment) {
      setForm({
        ...appointment,
        appointment_time: new Date(appointment.appointment_time),
      });
    }
  }, [appointment]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleDateChange = (val) => {
    setForm({ ...form, appointment_time: val });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (appointment) {
        await updateAppointment(appointment.id, form);
      } else {
        await createAppointment(form);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = !!appointment;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
        <CalendarIcon sx={{ fontSize: 28 }} />
        <Typography variant="h6" component="span" fontWeight="bold">
          {isEdit ? 'Edit Appointment' : 'New Appointment'}
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

            <TextField
              select
              fullWidth
              label="Patient"
              name="patient_id"
              value={form.patient_id}
              onChange={handleChange}
              required
              variant="outlined"
              size="small"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              {patients.map(p => (
                <MenuItem key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Doctor"
              name="doctor_id"
              value={form.doctor_id}
              onChange={handleChange}
              required
              variant="outlined"
              size="small"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              {doctors.map(d => (
                <MenuItem key={d.id} value={d.id}>
                  Dr. {d.first_name} {d.last_name}
                </MenuItem>
              ))}
            </TextField>

            <DateTimePicker
              label="Appointment Time"
              value={form.appointment_time}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  sx: { mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                },
              }}
            />

            <TextField
              fullWidth
              label="Reason"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              variant="outlined"
              size="small"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              multiline
              rows={2}
              variant="outlined"
              size="small"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <TextField
              select
              fullWidth
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              variant="outlined"
              size="small"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="no_show">No Show</MenuItem>
            </TextField>

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
                {submitting ? 'Saving...' : isEdit ? 'Update Appointment' : 'Save Appointment'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
    </LocalizationProvider>
  );
}