import React, { useState, useEffect } from 'react';
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, Typography, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getAppointments, deleteAppointment } from '../services/appointment';
import { getPatients } from '../services/patient';
import { getDoctors } from '../services/doctor';
import AppointmentForm from '../components/appointments/AppointmentForm';
import AppointmentCalendar from '../components/appointments/AppointmentCalendar';
import { useAuth } from '../context/AuthContext';

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [view, setView] = useState('list');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const fetchAppointments = async () => {
    const res = await getAppointments();
    setAppointments(res.data);
  };

  const fetchPatientsAndDoctors = async () => {
    const [patientsRes, doctorsRes] = await Promise.all([
      getPatients(),
      getDoctors()
    ]);
    setPatients(patientsRes.data);
    setDoctors(doctorsRes.data);
  };

  useEffect(() => {
    fetchAppointments();
    fetchPatientsAndDoctors();
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

  // Helper to get patient name by ID
  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : `Patient ${patientId}`;
  };

  // Helper to get doctor name by ID
  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : `Doctor ${doctorId}`;
  };

  const canAdd = user?.role === 'admin' || user?.role === 'receptionist';
  const canModify = user?.role === 'admin';

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'no_show': return 'warning';
      default: return 'default';
    }
  };

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
                <TableCell>Patient</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reason</TableCell>
                {canModify && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.id}</TableCell>
                  <TableCell>{getPatientName(a.patient_id)}</TableCell>
                  <TableCell>{getDoctorName(a.doctor_id)}</TableCell>
                  <TableCell>{new Date(a.appointment_time).toLocaleString()}</TableCell>
                  <TableCell><Chip label={a.status} color={getStatusColor(a.status)} size="small" /></TableCell>
                  <TableCell>{a.reason}</TableCell>
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
        <AppointmentCalendar 
          appointments={appointments} 
          patients={patients} 
          doctors={doctors} 
        />
      )}

      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <AppointmentForm appointment={editingAppointment} onClose={handleClose} />
      </Dialog>
    </Box>
  );
}