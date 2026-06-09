import React, { useState, useEffect } from 'react';
import { DialogTitle, DialogContent, TextField, Button, Box, MenuItem } from '@mui/material';
import { createMedicalRecord, updateMedicalRecord } from '../../services/medicalRecord';
import { getPatients } from '../../services/patient';

export default function MedicalRecordForm({ record, onClose }) {
  const [form, setForm] = useState({
    patient_id: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    created_by: 1  // will be overwritten by backend; set temporary value
  });
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const res = await getPatients();
      setPatients(res.data);
    };
    fetchPatients();
    if (record) {
      setForm(record);
    }
  }, [record]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (record) {
      await updateMedicalRecord(record.id, form);
    } else {
      await createMedicalRecord(form);
    }
    onClose();
  };

  return (
    <>
      <DialogTitle>{record ? 'Edit Medical Record' : 'New Medical Record'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField select fullWidth name="patient_id" label="Patient" margin="normal" value={form.patient_id} onChange={handleChange} required>
            {patients.map(p => <MenuItem key={p.id} value={p.id}>{p.first_name} {p.last_name}</MenuItem>)}
          </TextField>
          <TextField fullWidth name="diagnosis" label="Diagnosis" margin="normal" value={form.diagnosis} onChange={handleChange} multiline rows={2} />
          <TextField fullWidth name="treatment" label="Treatment" margin="normal" value={form.treatment} onChange={handleChange} multiline rows={2} />
          <TextField fullWidth name="notes" label="Notes" margin="normal" value={form.notes} onChange={handleChange} multiline rows={3} />
          <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </Box>
        </Box>
      </DialogContent>
    </>
  );
}