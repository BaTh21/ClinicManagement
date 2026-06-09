import React, { useState, useEffect } from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getDoctors, deleteDoctor } from '../services/doctor';
import DoctorForm from '../components/doctors/DoctorForm';
import { useAuth } from '../context/AuthContext';

export default function Doctors() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const fetchDoctors = async () => {
    const res = await getDoctors();
    setDoctors(res.data);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this doctor?')) {
      await deleteDoctor(id);
      fetchDoctors();
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingDoctor(null);
    fetchDoctors();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Doctors</Typography>
        {user?.role === 'admin' && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            Add Doctor
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
              <TableCell>Specialization</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              {user?.role === 'admin' && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {doctors.map((d) => (
              <TableRow key={d.id}>
                <TableCell>{d.id}</TableCell>
                <TableCell>{d.first_name}</TableCell>
                <TableCell>{d.last_name}</TableCell>
                <TableCell>{d.specialization}</TableCell>
                <TableCell>{d.email}</TableCell>
                <TableCell>{d.phone}</TableCell>
                {user?.role === 'admin' && (
                  <TableCell>
                    <IconButton onClick={() => handleEdit(d)}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(d.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DoctorForm doctor={editingDoctor} onClose={handleClose} />
      </Dialog>
    </Box>
  );
}