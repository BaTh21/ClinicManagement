import React, { useState, useEffect } from 'react';
import { DialogTitle, DialogContent, TextField, Button, Box, MenuItem } from '@mui/material';
import { createInvoice, updateInvoice } from '../../services/invoice';
import { getPatients } from '../../services/patient';

export default function InvoiceForm({ invoice, onClose }) {
  const [form, setForm] = useState({
    patient_id: '',
    amount: '',
    status: 'unpaid',
    description: '',
    appointment_id: null
  });
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const res = await getPatients();
      setPatients(res.data);
    };
    fetchPatients();
    if (invoice) {
      setForm(invoice);
    }
  }, [invoice]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (invoice) {
      await updateInvoice(invoice.id, form);
    } else {
      await createInvoice(form);
    }
    onClose();
  };

  return (
    <>
      <DialogTitle>{invoice ? 'Edit Invoice' : 'New Invoice'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField select fullWidth name="patient_id" label="Patient" margin="normal" value={form.patient_id} onChange={handleChange} required>
            {patients.map(p => <MenuItem key={p.id} value={p.id}>{p.first_name} {p.last_name}</MenuItem>)}
          </TextField>
          <TextField fullWidth name="amount" label="Amount" type="number" margin="normal" value={form.amount} onChange={handleChange} required />
          <TextField select fullWidth name="status" label="Status" margin="normal" value={form.status} onChange={handleChange}>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="unpaid">Unpaid</MenuItem>
            <MenuItem value="partial">Partial</MenuItem>
          </TextField>
          <TextField fullWidth name="description" label="Description" margin="normal" value={form.description} onChange={handleChange} multiline rows={2} />
          <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </Box>
        </Box>
      </DialogContent>
    </>
  );
}