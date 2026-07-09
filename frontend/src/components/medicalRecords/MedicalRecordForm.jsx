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
import {
  MedicalServices as MedicalServicesIcon,
  Save,
  Cancel,
} from '@mui/icons-material';
import { createMedicalRecord, updateMedicalRecord } from '../../services/medicalRecord';
import { getPatients } from '../../services/patient';

export default function MedicalRecordForm({ record, onClose }) {
  const [form, setForm] = useState({
    patient_id: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    created_by: 1, // will be overwritten by backend
  });
  const [patients, setPatients] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await getPatients();
        setPatients(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPatients();

    if (record) {
      setForm(record);
    }
  }, [record]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validateForm = () => {
    if (!form.patient_id) {
      setError('Please select a patient');
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
      if (record) {
        await updateMedicalRecord(record.id, form);
      } else {
        await createMedicalRecord(form);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save medical record.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = !!record;

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
        <MedicalServicesIcon sx={{ fontSize: 28 }} />
        <Typography variant="h6" component="span" fontWeight="bold">
          {isEdit ? 'Edit Medical Record' : 'New Medical Record'}
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
              fullWidth
              label="Diagnosis"
              name="diagnosis"
              value={form.diagnosis}
              onChange={handleChange}
              multiline
              rows={2}
              variant="outlined"
              size="small"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <TextField
              fullWidth
              label="Treatment"
              name="treatment"
              value={form.treatment}
              onChange={handleChange}
              multiline
              rows={2}
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
              rows={3}
              variant="outlined"
              size="small"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

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
                {submitting ? 'Saving...' : isEdit ? 'Update Record' : 'Save Record'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
    </>
  );
}