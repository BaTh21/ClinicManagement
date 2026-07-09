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
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { getMedicalRecords, deleteMedicalRecord } from '../services/medicalRecord';
import { getPatients } from '../services/patient';
import MedicalRecordForm from '../components/medicalRecords/MedicalRecordForm';
import { useAuth } from '../context/AuthContext';

export default function MedicalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    recordId: null,
  });

  const fetchRecords = async () => {
    try {
      const res = await getMedicalRecords();
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await getPatients();
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchRecords(), fetchPatients()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Delete handlers
  const handleDeleteClick = (record) => {
    setDeleteDialog({
      open: true,
      recordId: record.id,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMedicalRecord(deleteDialog.recordId);
      fetchRecords();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteDialog({ open: false, recordId: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, recordId: null });
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
    return patient ? `${patient.first_name} ${patient.last_name}` : `Patient #${patientId}`;
  };

  const canAdd = user?.role === 'admin' || user?.role === 'doctor';
  const canEdit = user?.role === 'admin' || user?.role === 'doctor';
  const canDelete = user?.role === 'admin';

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
            <Typography variant="h4" fontWeight={700}>Medical Records</Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>Manage patient diagnoses and treatments</Typography>
          </Box>
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
              Add Record
            </Button>
          )}
        </Box>
      </Paper>

      {/* Table */}
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
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Diagnosis</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Treatment</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Record Date</TableCell>
                  {(canEdit || canDelete) && (
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id} hover sx={{ '&:hover': { backgroundColor: '#f0f8ff' } }}>
                    <TableCell>{r.id}</TableCell>
                    <TableCell>{getPatientName(r.patient_id)}</TableCell>
                    <TableCell>{r.diagnosis || '—'}</TableCell>
                    <TableCell>{r.treatment || '—'}</TableCell>
                    <TableCell>{new Date(r.record_date).toLocaleDateString()}</TableCell>
                    {(canEdit || canDelete) && (
                      <TableCell align="center">
                        {canEdit && (
                          <IconButton
                            onClick={() => handleEdit(r)}
                            sx={{ color: '#008793', '&:hover': { bgcolor: '#e0f7fa' } }}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                        {canDelete && (
                          <IconButton
                            onClick={() => handleDeleteClick(r)}
                            sx={{ color: '#d32f2f', '&:hover': { bgcolor: '#ffebee' } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {records.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={(canEdit || canDelete) ? 6 : 5} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">No medical records found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <MedicalRecordForm record={editingRecord} onClose={handleClose} />
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
            Are you sure you want to permanently delete this medical record? This action cannot be undone.
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