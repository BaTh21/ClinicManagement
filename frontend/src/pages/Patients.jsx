import React, { useState, useEffect } from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getPatients, deletePatient } from '../services/patient';
import PatientForm from '../components/patients/PatientForm';
import { useAuth } from '../context/AuthContext';

export default function Patients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  const fetchPatients = async () => {
    const res = await getPatients();
    setPatients(res.data);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this patient?')) {
      await deletePatient(id);
      fetchPatients();
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingPatient(null);
    fetchPatients();
  };

  const canAdd = user?.role === 'admin' || user?.role === 'receptionist';
  const canModify = user?.role === 'admin';   // only admin can edit/delete

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Patients</Typography>
        {canAdd && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            Add Patient
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              {canModify && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.first_name}</TableCell>
                <TableCell>{p.last_name}</TableCell>
                <TableCell>{p.email}</TableCell>
                <TableCell>{p.phone}</TableCell>
                {canModify && (
                  <TableCell>
                    <IconButton onClick={() => handleEdit(p)}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(p.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <PatientForm patient={editingPatient} onClose={handleClose} />
      </Dialog>
    </Box>
  );
}