import React, { useState, useEffect } from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getAppointments, deleteAppointment } from '../services/appointment';
import AppointmentForm from '../components/appointments/AppointmentForm';
import AppointmentCalendar from '../components/appointments/AppointmentCalendar';
import { useAuth } from '../context/AuthContext';

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [view, setView] = useState('list');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const fetchAppointments = async () => {
    const res = await getAppointments();
    setAppointments(res.data);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this appointment?')) {
      await deleteAppointment(id);
      fetchAppointments();
    }
  };

  const handleEdit = (appt) => {
    setEditingAppointment(appt);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingAppointment(null);
    fetchAppointments();
  };

  const canAdd = user?.role === 'admin' || user?.role === 'receptionist';
  const canModify = user?.role === 'admin';   // only admin can edit/delete (backed by backend)

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Appointments</Typography>
        <Box>
          <Button variant={view === 'list' ? 'contained' : 'outlined'} onClick={() => setView('list')} sx={{ mr: 1 }}>
            List
          </Button>
          <Button variant={view === 'calendar' ? 'contained' : 'outlined'} onClick={() => setView('calendar')} sx={{ mr: 1 }}>
            Calendar
          </Button>
          {canAdd && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
              Add Appointment
            </Button>
          )}
        </Box>
      </Box>

      {view === 'list' ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Patient ID</TableCell>
                <TableCell>Doctor ID</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
                {canModify && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.id}</TableCell>
                  <TableCell>{a.patient_id}</TableCell>
                  <TableCell>{a.doctor_id}</TableCell>
                  <TableCell>{new Date(a.appointment_time).toLocaleString()}</TableCell>
                  <TableCell>{a.status}</TableCell>
                  {canModify && (
                    <TableCell>
                      <IconButton onClick={() => handleEdit(a)}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(a.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <AppointmentCalendar appointments={appointments} />
      )}

      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <AppointmentForm appointment={editingAppointment} onClose={handleClose} />
      </Dialog>
    </Box>
  );
}