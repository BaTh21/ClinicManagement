import React, { useState, useEffect } from 'react';
import { DialogTitle, DialogContent, TextField, Button, Box, MenuItem } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { createAppointment, updateAppointment } from '../../services/appointment';
import { getPatients } from '../../services/patient';
import { getDoctors } from '../../services/doctor';

export default function AppointmentForm({ appointment, onClose }) {
  const [form, setForm] = useState({ patient_id: '', doctor_id: '', appointment_time: new Date(), reason: '', notes: '', status: 'scheduled' });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const [pRes, dRes] = await Promise.all([getPatients(), getDoctors()]);
      setPatients(pRes.data);
      setDoctors(dRes.data);
    };
    fetchOptions();
    if (appointment) setForm({ ...appointment, appointment_time: new Date(appointment.appointment_time) });
  }, [appointment]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleDateChange = (val) => setForm({ ...form, appointment_time: val });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (appointment) await updateAppointment(appointment.id, form);
    else await createAppointment(form);
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DialogTitle>{appointment ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField select fullWidth name="patient_id" label="Patient" margin="normal" value={form.patient_id} onChange={handleChange} required>
            {patients.map(p => <MenuItem key={p.id} value={p.id}>{p.first_name} {p.last_name}</MenuItem>)}
          </TextField>
          <TextField select fullWidth name="doctor_id" label="Doctor" margin="normal" value={form.doctor_id} onChange={handleChange} required>
            {doctors.map(d => <MenuItem key={d.id} value={d.id}>{d.first_name} {d.last_name}</MenuItem>)}
          </TextField>
          <DateTimePicker label="Appointment Time" value={form.appointment_time} onChange={handleDateChange} slotProps={{ textField: { fullWidth: true, margin: 'normal' } }} />
          <TextField fullWidth name="reason" label="Reason" margin="normal" value={form.reason} onChange={handleChange} />
          <TextField fullWidth name="notes" label="Notes" margin="normal" value={form.notes} onChange={handleChange} multiline rows={2} />
          <TextField select fullWidth name="status" label="Status" margin="normal" value={form.status} onChange={handleChange}>
            <MenuItem value="scheduled">Scheduled</MenuItem><MenuItem value="completed">Completed</MenuItem><MenuItem value="cancelled">Cancelled</MenuItem><MenuItem value="no_show">No Show</MenuItem>
          </TextField>
          <Box mt={2} display="flex" justifyContent="flex-end" gap={1}><Button onClick={onClose}>Cancel</Button><Button type="submit" variant="contained">Save</Button></Box>
        </Box>
      </DialogContent>
    </LocalizationProvider>
  );
}