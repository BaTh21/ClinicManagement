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
  Avatar
} from '@mui/material';
import {
  PersonAdd,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  Wc as GenderIcon
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
    address: ''
  });

  useEffect(() => {
    if (patient) {
      setForm({
        ...patient,
        date_of_birth: patient.date_of_birth?.slice(0, 10) || ''
      });
    }
  }, [patient]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (patient) await updatePatient(patient.id, form);
    else await createPatient(form);
    onClose();
  };

  return (
    <>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          fontWeight: 700,
          fontSize: '1.2rem',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 1.5
        }}
      >
        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
          <PersonAdd fontSize="small" />
        </Avatar>
        {patient ? 'Edit Patient' : 'Add New Patient'}
      </DialogTitle>
      <DialogContent sx={{ p: 2.5, background: '#fafbfc' }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={1.5}>
            {/* Row 1 */}
            <Grid item xs={6}>
              <TextField fullWidth size="small" name="first_name" label="First Name" value={form.first_name} onChange={handleChange} required variant="filled" InputProps={{ disableUnderline: true, startAdornment: (<InputAdornment position="start"><PersonIcon color="primary" fontSize="small" /></InputAdornment>) }} sx={inputStyle} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" name="last_name" label="Last Name" value={form.last_name} onChange={handleChange} required variant="filled" InputProps={{ disableUnderline: true, startAdornment: (<InputAdornment position="start"><PersonIcon color="primary" fontSize="small" /></InputAdornment>) }} sx={inputStyle} />
            </Grid>
            {/* Row 2 */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                name="date_of_birth"
                type="date"
                value={form.date_of_birth || ''}
                onChange={handleChange}
                required
                variant="filled"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                  placeholder: '',
                }}
                sx={inputStyle}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" select name="gender" label="Gender" value={form.gender} onChange={handleChange} variant="filled" InputProps={{ disableUnderline: true, startAdornment: (<InputAdornment position="start"><GenderIcon color="primary" fontSize="small" /></InputAdornment>) }} sx={inputStyle}>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            {/* Row 3 */}
            <Grid item xs={6}>
              <TextField fullWidth size="small" name="phone" label="Phone" value={form.phone} onChange={handleChange} variant="filled" InputProps={{ disableUnderline: true, startAdornment: (<InputAdornment position="start"><PhoneIcon color="primary" fontSize="small" /></InputAdornment>) }} sx={inputStyle} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" name="email" label="Email" type="email" value={form.email} onChange={handleChange} variant="filled" InputProps={{ disableUnderline: true, startAdornment: (<InputAdornment position="start"><EmailIcon color="primary" fontSize="small" /></InputAdornment>) }} sx={inputStyle} />
            </Grid>
            {/* Row 4 */}
            <Grid item xs={12}>
              <TextField fullWidth size="small" name="address" label="Address" value={form.address} onChange={handleChange} multiline rows={2} variant="filled" InputProps={{ disableUnderline: true, startAdornment: (<InputAdornment position="start"><HomeIcon color="primary" fontSize="small" /></InputAdornment>) }} sx={inputStyle} />
            </Grid>
          </Grid>
          <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
            <Button onClick={onClose} variant="outlined" size="small" sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, px: 2 }}>Cancel</Button>
            <Button type="submit" variant="contained" size="small" sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, px: 2.5, boxShadow: '0 6px 14px rgba(25,118,210,0.3)' }}>Save</Button>
          </Box>
        </Box>
      </DialogContent>
    </>
  );
}

const inputStyle = {
  '& .MuiFilledInput-root': {
    borderRadius: 2,
    backgroundColor: 'white',
    border: '1px solid',
    borderColor: 'divider',
    '&:hover': { borderColor: 'primary.light' },
    '&.Mui-focused': {
      borderColor: 'primary.main',
      boxShadow: '0 0 0 2px rgba(25,118,210,0.15)'
    }
  }
};