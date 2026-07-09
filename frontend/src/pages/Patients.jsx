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
  Typography,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import { getPatients, deletePatient } from '../services/patient';
import PatientForm from '../components/patients/PatientForm';
import { useAuth } from '../context/AuthContext';

export default function Patients() {
  const { user } = useAuth();

  const [patients, setPatients] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  // Fetch patients with sorting parameters
  const fetchPatients = async () => {
    try {
      const params = {
        order_by: sortBy,
        desc: sortOrder === 'desc'
      };
      const res = await getPatients(params);
      setPatients(res.data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [sortBy, sortOrder]);

  const filteredPatients = patients.filter((patient) => {
    const search = searchTerm.toLowerCase();
    return (
      patient.first_name?.toLowerCase().includes(search) ||
      patient.last_name?.toLowerCase().includes(search) ||
      patient.email?.toLowerCase().includes(search) ||
      patient.phone?.toLowerCase().includes(search)
    );
  });

  const handleDelete = async (id) => {
    if (window.confirm('Delete this patient?')) {
      try {
        await deletePatient(id);
        fetchPatients();
      } catch (error) {
        console.error(error);
      }
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
  const canModify = user?.role === 'admin';

  return (
    <Box sx={{ p: 3, bgcolor: '#f0f4f8', minHeight: '100vh' }}>
      {/* Header – restyled with a soft gradient */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #004d7a 0%, #008793 100%)',
          color: 'white'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight={700}>Patient Management</Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>Manage and monitor patient records</Typography>
          </Box>
          <Chip
            icon={<PersonIcon />}
            label={`${filteredPatients.length} Patients`}
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
          />
        </Box>
      </Paper>

      {/* Toolbar – softer card, cleaner inputs */}
      <Paper
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <TextField
          placeholder="Search patients..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            flex: 1,
            minWidth: 250,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: '#f8fafc',
              '&:hover fieldset': { borderColor: '#90caf9' },
              '&.Mui-focused fieldset': { borderColor: '#008793' }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            )
          }}
        />
        <Box display="flex" gap={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              label="Sort by"
              onChange={(e) => setSortBy(e.target.value)}
              sx={{ borderRadius: 3 }}
            >
              <MenuItem value="id">ID</MenuItem>
              <MenuItem value="first_name">First Name</MenuItem>
              <MenuItem value="last_name">Last Name</MenuItem>
              <MenuItem value="email">Email</MenuItem>
            </Select>
          </FormControl>
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
                boxShadow: '0 4px 14px rgba(0,141,145,0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #003a5c 0%, #006b7a 100%)',
                  boxShadow: '0 6px 20px rgba(0,141,145,0.35)'
                }
              }}
            >
              Add Patient
            </Button>
          )}
        </Box>
      </Paper>

      {/* Table – softer header, rounded, subtle shadows */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#004d7a' }}>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>First Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Last Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Phone</TableCell>
              {canModify && (
                <TableCell align="center" sx={{ color: 'white', fontWeight: 700 }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((p) => (
                <TableRow
                  key={p.id}
                  hover
                  sx={{
                    transition: 'all 0.15s ease-in-out',
                    '&:hover': { backgroundColor: '#f0f8ff' }
                  }}
                >
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.first_name}</TableCell>
                  <TableCell>{p.last_name}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.phone}</TableCell>
                  {canModify && (
                    <TableCell align="center">
                      <IconButton
                        onClick={() => handleEdit(p)}
                        sx={{
                          color: '#008793',
                          '&:hover': { bgcolor: '#e0f7fa' }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(p.id)}
                        sx={{
                          color: '#d32f2f',
                          '&:hover': { bgcolor: '#ffebee' }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={canModify ? 6 : 5} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">No patients found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog – unchanged logic, just enhanced rounding */}
      <Dialog
        open={openDialog}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <PatientForm patient={editingPatient} onClose={handleClose} />
      </Dialog>
    </Box>
  );
}