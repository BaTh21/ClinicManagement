import React, { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Grid,
} from '@mui/material';

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

  useEffect(() => {
    if (doctor) {
      setForm(doctor);
    }
  }, [doctor]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
      {/* HEADER */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg,#1976d2,#42a5f5)',
          color: '#fff',
          fontWeight: 'bold',
        }}
      >
        {doctor ? 'Edit Doctor' : 'Add Doctor'}
      </DialogTitle>

      {/* FORM */}
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Specialization"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Qualification"
                name="qualification"
                value={form.qualification}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          {/* BUTTONS */}
          <Box
            mt={3}
            display="flex"
            justifyContent="flex-end"
            gap={2}
          >
            <Button onClick={onClose} variant="outlined">
              Cancel
            </Button>

            <Button type="submit" variant="contained">
              Save
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </>
  );
}