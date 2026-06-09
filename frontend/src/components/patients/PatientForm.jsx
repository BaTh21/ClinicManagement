import React, { useState, useEffect } from 'react';
import { DialogTitle, DialogContent, TextField, Button, Box } from '@mui/material';
import { createPatient, updatePatient } from '../../services/patient';

export default function PatientForm({ patient, onClose }) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', date_of_birth: '', gender: '', phone: '', email: '', address: ''
  });

  useEffect(() => {
    if (patient) setForm(patient);
  }, [patient]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (patient) await updatePatient(patient.id, form);
    else await createPatient(form);
    onClose();
  };

  return (
    <>
      <DialogTitle>{patient ? 'Edit Patient' : 'New Patient'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField fullWidth name="first_name" label="First Name" margin="normal" value={form.first_name} onChange={handleChange} required />
          <TextField fullWidth name="last_name" label="Last Name" margin="normal" value={form.last_name} onChange={handleChange} required />
          <TextField fullWidth name="date_of_birth" type="date" margin="normal" value={form.date_of_birth?.slice(0,10)} onChange={handleChange} required InputLabelProps={{ shrink: true }} />
          <TextField fullWidth name="gender" label="Gender" margin="normal" value={form.gender} onChange={handleChange} />
          <TextField fullWidth name="phone" label="Phone" margin="normal" value={form.phone} onChange={handleChange} />
          <TextField fullWidth name="email" label="Email" margin="normal" value={form.email} onChange={handleChange} />
          <TextField fullWidth name="address" label="Address" margin="normal" value={form.address} onChange={handleChange} multiline rows={2} />
          <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </Box>
        </Box>
      </DialogContent>
    </>
  );
}