import React, { useState, useEffect } from 'react';
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, Typography, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getMedicalRecords, deleteMedicalRecord } from '../services/medicalRecord';
import { getPatients } from '../services/patient';
import MedicalRecordForm from '../components/medicalRecords/MedicalRecordForm';
import { useAuth } from '../context/AuthContext';

export default function MedicalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const fetchRecords = async () => {
    const res = await getMedicalRecords();
    setRecords(res.data);
  };

  const fetchPatients = async () => {
    const res = await getPatients();
    setPatients(res.data);
  };

  useEffect(() => {
    fetchRecords();
    fetchPatients();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this medical record?')) {
      await deleteMedicalRecord(id);
      fetchRecords();
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingRecord(null);
    fetchRecords();
  };

  // Helper to get patient name by ID
  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : `Patient ${patientId}`;
  };

  const canAdd = user?.role === 'admin' || user?.role === 'doctor';
  const canEdit = user?.role === 'admin' || user?.role === 'doctor';
  const canDelete = user?.role === 'admin';

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Medical Records</Typography>
        {canAdd && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            Add Record
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Diagnosis</TableCell>
              <TableCell>Treatment</TableCell>
              <TableCell>Record Date</TableCell>
              {(canEdit || canDelete) && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{getPatientName(r.patient_id)}</TableCell>
                <TableCell>{r.diagnosis}</TableCell>
                <TableCell>{r.treatment}</TableCell>
                <TableCell>{new Date(r.record_date).toLocaleDateString()}</TableCell>
                {(canEdit || canDelete) && (
                  <TableCell>
                    {canEdit && (
                      <IconButton onClick={() => handleEdit(r)}><EditIcon /></IconButton>
                    )}
                    {canDelete && (
                      <IconButton onClick={() => handleDelete(r.id)}><DeleteIcon /></IconButton>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <MedicalRecordForm record={editingRecord} onClose={handleClose} />
      </Dialog>
    </Box>
  );
}