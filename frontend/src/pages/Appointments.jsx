import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ViewListIcon from '@mui/icons-material/ViewList';
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
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    appointmentId: null,
  });

  const fetchAppointments = async () => {
    try {
      const res = await getAppointments();
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPatientsAndDoctors = async () => {
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        getPatients(),
        getDoctors(),
      ]);
      setPatients(patientsRes.data);
      setDoctors(doctorsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchAppointments(), fetchPatientsAndDoctors()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Delete handlers
  const handleDeleteClick = (appointment) => {
    setDeleteDialog({
      open: true,
      appointmentId: appointment.id,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteAppointment(deleteDialog.appointmentId);
      fetchAppointments();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteDialog({ open: false, appointmentId: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, appointmentId: null });
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

  // Helper to get patient name
  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : `Patient ${patientId}`;
  };

  // Helper to get doctor name
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
    <Box sx={{ p: 3, bgcolor: '#f0f4f8', minHeight: '100vh' }}>
      {/* Header – teal gradient */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #004d7a 0%, #008793 100%)',
          color: '#fff',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight={700}>Appointments</Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>Manage and schedule appointments</Typography>
          </Box>
          <Box display="flex" gap={1} flexWrap="wrap">
            {/* View toggle buttons */}
            <Button
              variant={view === 'list' ? 'contained' : 'outlined'}
              onClick={() => setView('list')}
              startIcon={<ViewListIcon />}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                ...(view === 'list'
                  ? { background: 'rgba(255,255,255,0.9)', color: '#004d7a', '&:hover': { background: '#fff' } }
                  : { color: '#fff', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: '#fff' } }),
              }}
            >
              List
            </Button>
            <Button
              variant={view === 'calendar' ? 'contained' : 'outlined'}
              onClick={() => setView('calendar')}
              startIcon={<CalendarMonthIcon />}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                ...(view === 'calendar'
                  ? { background: 'rgba(255,255,255,0.9)', color: '#004d7a', '&:hover': { background: '#fff' } }
                  : { color: '#fff', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: '#fff' } }),
              }}
            >
              Calendar
            </Button>

            {canAdd && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #004d7a 0%, #008793 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 14px rgba(0,141,145,0.25)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #003a5c 0%, #006b7a 100%)',
                    boxShadow: '0 6px 20px rgba(0,141,145,0.35)',
                  },
                }}
              >
                Add Appointment
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Content area */}
      {view === 'list' ? (
        <Paper
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          {loading ? (
            <Box sx={{ p: 5, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#004d7a' }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>ID</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Patient</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Doctor</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Time</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Reason</TableCell>
                    {canModify && (
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">
                        Actions
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.map((a) => (
                    <TableRow key={a.id} hover sx={{ '&:hover': { backgroundColor: '#f0f8ff' } }}>
                      <TableCell>{a.id}</TableCell>
                      <TableCell>{getPatientName(a.patient_id)}</TableCell>
                      <TableCell>{getDoctorName(a.doctor_id)}</TableCell>
                      <TableCell>{new Date(a.appointment_time).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={a.status}
                          color={getStatusColor(a.status)}
                          size="small"
                          sx={{ fontWeight: 500, textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>{a.reason || '—'}</TableCell>
                      {canModify && (
                        <TableCell align="center">
                          <IconButton
                            onClick={() => handleEdit(a)}
                            sx={{ color: '#008793', '&:hover': { bgcolor: '#e0f7fa' } }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteClick(a)}
                            sx={{ color: '#d32f2f', '&:hover': { bgcolor: '#ffebee' } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {appointments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={canModify ? 7 : 6} align="center" sx={{ py: 5 }}>
                        <Typography color="text.secondary">No appointments found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      ) : (
        <Paper sx={{ p: 2, borderRadius: 4, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <AppointmentCalendar appointments={appointments} patients={patients} doctors={doctors} />
        </Paper>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <AppointmentForm appointment={editingAppointment} onClose={handleClose} />
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#d32f2f' }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete this appointment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDeleteCancel} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}