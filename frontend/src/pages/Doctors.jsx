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
  Typography,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  Stack,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
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

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await getDoctors();
      setDoctors(res.data);
    } catch (err) {
      setSnack({
        open: true,
        message: 'Failed to load doctors',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
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

  // SEARCH + SORT LOGIC
  const filteredDoctors = useMemo(() => {
    let data = [...doctors];

    if (search) {
      data = data.filter((d) =>
        Object.values(d)
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    data.sort((a, b) => {
      const valA = (a[sortField] || '').toString().toLowerCase();
      const valB = (b[sortField] || '').toString().toLowerCase();

      return sortOrder === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });

    return data;
  }, [doctors, search, sortField, sortOrder]);

  return (
    <Box sx={{ p: 2 }}>

      {/* HEADER */}
      <Paper
        sx={{
          p: 3,
          mb: 2,
          borderRadius: 3,
          background: 'linear-gradient(135deg,#1976d2,#42a5f5)',
          color: '#fff',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Doctors
            </Typography>
            <Typography variant="body2">
              Search, filter and manage doctors
            </Typography>
          </Box>

          {/* ✅ NEW MODERN ADD BUTTON */}
          {user?.role === 'admin' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)',
                color: '#1976d2',
                fontWeight: 700,
                borderRadius: 3,
                px: 2.5,
                py: 1,
                textTransform: 'none',
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  background: '#fff',
                },
              }}
            >
              Add Doctor
            </Button>
          )}

        </Box>
      </Paper>

      {/* SEARCH + SORT */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>

          <TextField
            fullWidth
            label="Search doctors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Button
            variant="outlined"
            onClick={() =>
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
            }
            startIcon={
              sortOrder === 'asc' ? (
                <ArrowUpwardIcon />
              ) : (
                <ArrowDownwardIcon />
              )
            }
          >
            {sortOrder.toUpperCase()}
          </Button>

        </Stack>
      </Paper>

      {/* TABLE */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>

              <TableHead>
                <TableRow sx={{ bgcolor: '#1976d2' }}>
                  {['ID','First Name','Last Name','Specialization','Email','Phone'].map((h)=>(
                    <TableCell key={h} sx={{ color:'#fff', fontWeight:'bold' }}>
                      {h}
                    </TableCell>
                  ))}

                  {user?.role === 'admin' && (
                    <TableCell sx={{ color:'#fff', fontWeight:'bold' }}>
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No results found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDoctors.map((d) => (
                    <TableRow key={d.id} hover>

                      <TableCell>{d.id}</TableCell>
                      <TableCell>{d.first_name}</TableCell>
                      <TableCell>{d.last_name}</TableCell>

                      <TableCell>
                        <Chip
                          label={d.specialization || 'General'}
                          color="primary"
                          size="small"
                        />
                      </TableCell>

                      <TableCell>{d.email}</TableCell>
                      <TableCell>{d.phone}</TableCell>

                      {user?.role === 'admin' && (
                        <TableCell>
                          <IconButton color="primary" onClick={() => handleEdit(d)}>
                            <EditIcon />
                          </IconButton>

                          <IconButton color="error" onClick={() => handleDelete(d.id)}>
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

      {/* DIALOG */}
      <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm">
        <DoctorForm doctor={editingDoctor} onClose={handleClose} />
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity}>
          {snack.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}