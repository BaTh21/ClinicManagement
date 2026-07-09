import React, { useState, useEffect, useMemo } from 'react';
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
  DialogContentText,
  DialogTitle,
  Typography,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  Stack,
  InputAdornment,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { getDoctors, deleteDoctor } from '../services/doctor';
import DoctorForm from '../components/doctors/DoctorForm';
import { useAuth } from '../context/AuthContext';

export default function Doctors() {
  const { user } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('first_name');
  const [sortOrder, setSortOrder] = useState('asc');

  const [snack, setSnack] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    doctorId: null,
    doctorName: '',
  });

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await getDoctors();
      setDoctors(res.data);
    } catch (err) {
      setSnack({ open: true, message: 'Failed to load doctors', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDeleteClick = (doctor) => {
    setDeleteDialog({
      open: true,
      doctorId: doctor.id,
      doctorName: `Dr. ${doctor.first_name} ${doctor.last_name}`,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteDoctor(deleteDialog.doctorId);
      fetchDoctors();
      setSnack({ open: true, message: 'Doctor deleted successfully', severity: 'success' });
    } catch (err) {
      setSnack({ open: true, message: 'Failed to delete doctor', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, doctorId: null, doctorName: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, doctorId: null, doctorName: '' });
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

  const filteredDoctors = useMemo(() => {
    let data = [...doctors];
    if (search) {
      data = data.filter((d) =>
        Object.values(d).join(' ').toLowerCase().includes(search.toLowerCase())
      );
    }
    data.sort((a, b) => {
      const valA = (a[sortField] || '').toString().toLowerCase();
      const valB = (b[sortField] || '').toString().toLowerCase();
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
    return data;
  }, [doctors, search, sortField, sortOrder]);

  return (
    <Box sx={{ p: 3, bgcolor: '#f0f4f8', minHeight: '100vh' }}>
      {/* Header */}
      <Paper
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
            <Typography variant="h4" fontWeight={700}>Doctors</Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>Search, filter and manage doctors</Typography>
          </Box>
          {user?.role === 'admin' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{
                borderRadius: 3, px: 3, textTransform: 'none', fontWeight: 600,
                background: 'linear-gradient(135deg, #004d7a 0%, #008793 100%)',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(0,141,145,0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #003a5c 0%, #006b7a 100%)',
                  boxShadow: '0 6px 20px rgba(0,141,145,0.35)'
                },
              }}
            >
              Add Doctor
            </Button>
          )}
        </Box>
      </Paper>

      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Search doctors..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3, backgroundColor: '#f8fafc',
                '&:hover fieldset': { borderColor: '#90caf9' },
                '&.Mui-focused fieldset': { borderColor: '#008793' },
              },
            }}
          />
          <Button
            variant="outlined"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            startIcon={sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            sx={{
              borderRadius: 3, textTransform: 'none', fontWeight: 600,
              color: '#004d7a', borderColor: '#d0d7e0',
              '&:hover': { backgroundColor: '#f1f5f9', borderColor: '#008793' },
            }}
          >
            {sortOrder.toUpperCase()}
          </Button>
        </Stack>
      </Paper>

      {/* Table */}
      <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#004d7a' }}>
                  {['ID', 'First Name', 'Last Name', 'Specialization', 'Email', 'Phone'].map((h) => (
                    <TableCell key={h} sx={{ color: '#fff', fontWeight: 700 }}>{h}</TableCell>
                  ))}
                  {user?.role === 'admin' && (
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">No results found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDoctors.map((d) => (
                    <TableRow key={d.id} hover sx={{ '&:hover': { backgroundColor: '#f0f8ff' } }}>
                      <TableCell>{d.id}</TableCell>
                      <TableCell>{d.first_name}</TableCell>
                      <TableCell>{d.last_name}</TableCell>
                      <TableCell>
                        <Chip label={d.specialization || 'General'} color="primary" size="small" sx={{ fontWeight: 500 }} />
                      </TableCell>
                      <TableCell>{d.email}</TableCell>
                      <TableCell>{d.phone}</TableCell>
                      {user?.role === 'admin' && (
                        <TableCell align="center">
                          <IconButton onClick={() => handleEdit(d)} sx={{ color: '#008793', '&:hover': { bgcolor: '#e0f7fa' } }}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteClick(d)} sx={{ color: '#d32f2f', '&:hover': { bgcolor: '#ffebee' } }}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add/Edit Doctor Dialog */}
      <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
        <DoctorForm doctor={editingDoctor} onClose={handleClose} />
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-doctor-dialog-title"
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle id="delete-doctor-dialog-title" sx={{ fontWeight: 700, color: '#d32f2f' }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete <strong>{deleteDialog.doctorName}</strong>? This action cannot be undone.
          </DialogContentText>
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

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} variant="filled" sx={{ width: '100%' }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}