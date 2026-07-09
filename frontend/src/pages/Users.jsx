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
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import { getUsers, createUser, updateUser, deleteUser } from '../services/user';
import { useAuth } from '../context/AuthContext';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    username: '',
    email: '',
    full_name: '',
    role: 'receptionist',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    userId: null,
    userName: '',
  });

  const isAdmin = currentUser?.role === 'admin';

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete handlers
  const handleDeleteClick = (user) => {
    setDeleteDialog({
      open: true,
      userId: user.id,
      userName: user.full_name || user.username,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(deleteDialog.userId);
      fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteDialog({ open: false, userId: null, userName: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, userId: null, userName: '' });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      password: '', // password left empty for edit
    });
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setForm({
      username: '',
      email: '',
      full_name: '',
      role: 'receptionist',
      password: '',
    });
    setError('');
    fetchUsers();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.email.trim() || !form.full_name.trim()) {
      setError('Username, email, and full name are required');
      return;
    }
    if (!editingUser && !form.password) {
      setError('Password is required for new users');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (editingUser) {
        const updateData = { ...form };
        if (!updateData.password) delete updateData.password;
        await updateUser(editingUser.id, updateData);
      } else {
        await createUser(form);
      }
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'doctor': return 'primary';
      case 'receptionist': return 'info';
      default: return 'default';
    }
  };

  // If not admin, show restricted message
  if (!isAdmin) {
    return (
      <Box sx={{ p: 3, bgcolor: '#f0f4f8', minHeight: '100vh' }}>
        <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="text.secondary">
            You do not have permission to access this page.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f0f4f8', minHeight: '100vh' }}>
      {/* Header */}
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
            <Typography variant="h4" fontWeight={700}>User Management</Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>Manage system users and roles</Typography>
          </Box>
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
            New User
          </Button>
        </Box>
      </Paper>

      {/* Table */}
      <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
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
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Username</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Full Name</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Role</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} hover sx={{ '&:hover': { backgroundColor: '#f0f8ff' } }}>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.full_name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.role}
                        color={getRoleColor(u.role)}
                        size="small"
                        sx={{ fontWeight: 500, textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => handleEdit(u)}
                        sx={{ color: '#008793', '&:hover': { bgcolor: '#e0f7fa' } }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteClick(u)}
                        sx={{ color: '#d32f2f', '&:hover': { bgcolor: '#ffebee' } }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">No users found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Create/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #004d7a 0%, #008793 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            py: 2,
          }}
        >
          <PeopleIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight="bold">
            {editingUser ? 'Edit User' : 'Create New User'}
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ bgcolor: '#f9fafb', p: 0 }}>
          <Paper
            elevation={0}
            sx={{
              m: 3,
              p: 3,
              borderRadius: 3,
              backgroundColor: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <Box component="form" onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                fullWidth
                name="username"
                label="Username"
                size="small"
                value={form.username}
                onChange={handleChange}
                required
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                name="email"
                label="Email"
                type="email"
                size="small"
                value={form.email}
                onChange={handleChange}
                required
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                name="full_name"
                label="Full Name"
                size="small"
                value={form.full_name}
                onChange={handleChange}
                required
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                select
                fullWidth
                name="role"
                label="Role"
                size="small"
                value={form.role}
                onChange={handleChange}
                required
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="doctor">Doctor</MenuItem>
                <MenuItem value="receptionist">Receptionist</MenuItem>
              </TextField>
              <TextField
                fullWidth
                name="password"
                label={editingUser ? 'New Password (leave blank to keep)' : 'Password'}
                type="password"
                size="small"
                value={form.password}
                onChange={handleChange}
                required={!editingUser}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Box display="flex" justifyContent="flex-end" gap={2} sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider', mt: 2 }}>
                <Button
                  onClick={handleClose}
                  variant="outlined"
                  disabled={submitting}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: '#d0d7e0', color: '#5a6a7a', '&:hover': { backgroundColor: '#f1f5f9' } }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  sx={{
                    background: 'linear-gradient(135deg, #004d7a 0%, #008793 100%)',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(0,141,145,0.3)',
                    '&:hover': { background: 'linear-gradient(135deg, #003a5c 0%, #006b7a 100%)' },
                  }}
                >
                  {submitting ? <CircularProgress size={20} color="inherit" /> : editingUser ? 'Update User' : 'Create User'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </DialogContent>
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
            Are you sure you want to permanently delete user <strong>{deleteDialog.userName}</strong>? This action cannot be undone.
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