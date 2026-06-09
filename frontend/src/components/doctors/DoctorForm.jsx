import React, { useState, useEffect } from 'react';
import { DialogTitle, DialogContent, TextField, Button, Box } from '@mui/material';
import { createDoctor, updateDoctor } from '../../services/doctor';

export default function DoctorForm({ doctor, onClose }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    specialization: '',
    phone: '',
    email: '',
    qualification: '',
    user_id: null
  });

  useEffect(() => {
    if (doctor) {
      setForm(doctor);
    }
  }, [doctor]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (doctor) {
      await updateDoctor(doctor.id, form);
    } else {
      await createDoctor(form);
    }
    onClose();
  };

  return (
    <>
      <DialogTitle>{doctor ? 'Edit Doctor' : 'New Doctor'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField fullWidth name="first_name" label="First Name" margin="normal" value={form.first_name} onChange={handleChange} required />
          <TextField fullWidth name="last_name" label="Last Name" margin="normal" value={form.last_name} onChange={handleChange} required />
          <TextField fullWidth name="specialization" label="Specialization" margin="normal" value={form.specialization} onChange={handleChange} />
          <TextField fullWidth name="phone" label="Phone" margin="normal" value={form.phone} onChange={handleChange} />
          <TextField fullWidth name="email" label="Email" margin="normal" value={form.email} onChange={handleChange} />
          <TextField fullWidth name="qualification" label="Qualification" margin="normal" value={form.qualification} onChange={handleChange} />
          <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </Box>
        </Box>
      </DialogContent>
    </>
  );
}