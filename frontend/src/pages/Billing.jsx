import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, Typography, Chip,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import { getInvoices, deleteInvoice } from '../services/invoice';
import { getPatient } from '../services/patient';
import InvoiceForm from '../components/billing/InvoiceForm';
import { useAuth } from '../context/AuthContext';

export default function Billing() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [printInvoice, setPrintInvoice] = useState(null);
  const [printPatient, setPrintPatient] = useState(null);
  const printRef = useRef();

  const fetchInvoices = async () => {
    const res = await getInvoices();
    setInvoices(res.data);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this invoice?')) {
      await deleteInvoice(id);
      fetchInvoices();
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingInvoice(null);
    fetchInvoices();
  };

  const handlePrint = async (invoice) => {
    // Fetch patient details for this invoice
    try {
      const patientRes = await getPatient(invoice.patient_id);
      setPrintPatient(patientRes.data);
      setPrintInvoice(invoice);
    } catch (err) {
      console.error('Failed to load patient', err);
    }
  };

  const closePrintDialog = () => {
    setPrintInvoice(null);
    setPrintPatient(null);
  };

  const handlePrintDialogPrint = () => {
    window.print(); // prints the content of the print modal
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'unpaid': return 'error';
      case 'partial': return 'warning';
      default: return 'default';
    }
  };

  const isAdmin = user?.role === 'admin';
  const canModify = isAdmin;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Billing / Invoices</Typography>
        {canModify && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            Create Invoice
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Patient ID</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>{inv.id}</TableCell>
                <TableCell>{inv.patient_id}</TableCell>
                <TableCell>${inv.amount}</TableCell>
                <TableCell><Chip label={inv.status} color={getStatusColor(inv.status)} size="small" /></TableCell>
                <TableCell>{inv.description}</TableCell>
                <TableCell>{new Date(inv.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handlePrint(inv)} title="Print Invoice">
                    <PrintIcon />
                  </IconButton>
                  {canModify && (
                    <>
                      <IconButton onClick={() => handleEdit(inv)}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(inv.id)}><DeleteIcon /></IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <InvoiceForm invoice={editingInvoice} onClose={handleClose} />
      </Dialog>

      {/* Printable Invoice Dialog */}
      <Dialog
        open={!!printInvoice}
        onClose={closePrintDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { p: 2 } }}
      >
        <DialogTitle>Invoice Details</DialogTitle>
        <DialogContent dividers ref={printRef}>
          {printInvoice && printPatient && (
            <Box id="print-area" sx={{ fontFamily: 'monospace', p: 2 }}>
              <Typography variant="h5" align="center" gutterBottom>CLINIC INVOICE</Typography>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Box>
                  <Typography><strong>Invoice #:</strong> {printInvoice.id}</Typography>
                  <Typography><strong>Date:</strong> {new Date(printInvoice.created_at).toLocaleDateString()}</Typography>
                  <Typography><strong>Status:</strong> {printInvoice.status.toUpperCase()}</Typography>
                </Box>
                <Box textAlign="right">
                  <Typography><strong>Patient:</strong> {printPatient.first_name} {printPatient.last_name}</Typography>
                  <Typography><strong>Patient ID:</strong> {printPatient.id}</Typography>
                  {printPatient.phone && <Typography><strong>Phone:</strong> {printPatient.phone}</Typography>}
                </Box>
              </Box>
              <Box sx={{ borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc', py: 2, my: 2 }}>
                <Typography variant="h6">Description</Typography>
                <Typography>{printInvoice.description || 'Medical services'}</Typography>
              </Box>
              <Box display="flex" justifyContent="flex-end">
                <Typography variant="h6">Total Amount: ${printInvoice.amount}</Typography>
              </Box>
              <Box mt={4} textAlign="center">
                <Typography variant="caption">Thank you for choosing our clinic. This is a computer‑generated invoice.</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePrintDialog}>Close</Button>
          <Button variant="contained" onClick={handlePrintDialogPrint} startIcon={<PrintIcon />}>
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}