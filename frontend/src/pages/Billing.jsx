import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, Typography, Chip,
  DialogTitle, DialogContent, DialogActions, CircularProgress,
  Divider, Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { getInvoices, deleteInvoice } from '../services/invoice';
import { getPatient, getPatients } from '../services/patient';
import { getMedicalRecords } from '../services/medicalRecord';
import InvoiceForm from '../components/billing/InvoiceForm';
import { useAuth } from '../context/AuthContext';

export default function Billing() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [patientsMap, setPatientsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [printInvoice, setPrintInvoice] = useState(null);
  const [printPatient, setPrintPatient] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const printRef = useRef();

  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    invoiceId: null,
  });

  const fetchInvoices = async () => {
    try {
      const res = await getInvoices();
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await getPatients();
      const map = {};
      res.data.forEach((p) => {
        map[p.id] = `${p.first_name} ${p.last_name}`;
      });
      setPatientsMap(map);
    } catch (err) {
      console.error('Failed to load patients', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
  }, []);

  // Delete handlers
  const handleDeleteClick = (invoice) => {
    setDeleteDialog({
      open: true,
      invoiceId: invoice.id,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteInvoice(deleteDialog.invoiceId);
      fetchInvoices();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteDialog({ open: false, invoiceId: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, invoiceId: null });
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
    try {
      const patientRes = await getPatient(invoice.patient_id);
      setPrintPatient(patientRes.data);
      setPrintInvoice(invoice);

      const recordsRes = await getMedicalRecords({ patient_id: invoice.patient_id });
      setMedicalRecords(recordsRes.data || []);
    } catch (err) {
      console.error('Failed to load print data', err);
    }
  };

  const closePrintDialog = () => {
    setPrintInvoice(null);
    setPrintPatient(null);
    setMedicalRecords([]);
  };

  // Print via a new window – only the invoice appears, but headers/footers are browser‑dependent
  const handlePrintInvoice = () => {
    if (!printInvoice || !printPatient) return;

    const invoiceHTML = document.getElementById('print-area')?.innerHTML;
    if (!invoiceHTML) return;

    const printWindow = window.open('', 'InvoicePrint', 'width=900,height=700');
    if (!printWindow) {
      alert('Please allow pop-ups to print the invoice');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${printInvoice.id}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #1e293b;
              background: white;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            @media print {
              body { padding: 0; }
              @page { size: A4; margin: 15mm; }
            }
          </style>
        </head>
        <body>
          ${invoiceHTML}
          <script>
            setTimeout(() => { window.print(); }, 200);
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
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

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

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
            <Typography variant="h4" fontWeight={700}>Billing / Invoices</Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>Manage payments and invoices</Typography>
          </Box>
          {canModify && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{
                borderRadius: 3, px: 3, textTransform: 'none', fontWeight: 600,
                background: 'linear-gradient(135deg, #004d7a 0%, #008793 100%)',
                color: '#fff', boxShadow: '0 4px 14px rgba(0,141,145,0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #003a5c 0%, #006b7a 100%)',
                  boxShadow: '0 6px 20px rgba(0,141,145,0.35)'
                },
              }}
            >
              Create Invoice
            </Button>
          )}
        </Box>
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
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Patient</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Amount</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Description</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id} hover sx={{ '&:hover': { backgroundColor: '#f0f8ff' } }}>
                    <TableCell>{inv.id}</TableCell>
                    <TableCell>{patientsMap[inv.patient_id] || `Patient #${inv.patient_id}`}</TableCell>
                    <TableCell>${Number(inv.amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={inv.status}
                        color={getStatusColor(inv.status)}
                        size="small"
                        sx={{ fontWeight: 500, textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>{inv.description || '—'}</TableCell>
                    <TableCell>{new Date(inv.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handlePrint(inv)} title="Print Invoice" sx={{ color: '#008793', '&:hover': { bgcolor: '#e0f7fa' } }}>
                        <PrintIcon />
                      </IconButton>
                      {canModify && (
                        <>
                          <IconButton onClick={() => handleEdit(inv)} sx={{ color: '#008793', '&:hover': { bgcolor: '#e0f7fa' } }}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteClick(inv)} sx={{ color: '#d32f2f', '&:hover': { bgcolor: '#ffebee' } }}>
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {invoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">No invoices found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add/Edit Invoice Dialog */}
      <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
        <InvoiceForm invoice={editingInvoice} onClose={handleClose} />
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#d32f2f' }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to permanently delete this invoice? This action cannot be undone.</Typography>
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

      {/* Print Preview Dialog */}
      <Dialog
        open={!!printInvoice}
        onClose={closePrintDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
      >
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
          <ReceiptIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700}>Invoice Preview</Typography>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 0, bgcolor: '#f5f7fb' }}>
          {/* Instruction to remove headers/footers when printing */}
          <Alert severity="info" sx={{ mx: 3, mt: 2, borderRadius: 2 }}>
            To get a clean PDF, please <strong>uncheck “Headers and footers”</strong> in the print dialog.
          </Alert>

          {printInvoice && printPatient && (
            <Box ref={printRef} id="print-area">
              <Paper
                elevation={0}
                sx={{
                  m: 3,
                  p: 4,
                  borderRadius: 3,
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
                  {/* Header Section */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 30,
                    borderBottom: '2px solid #008793',
                    paddingBottom: 20,
                  }}>
                    <div>
                      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#004d7a' }}>YOUR CLINIC</h1>
                      <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>Professional Healthcare Services</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#004d7a', letterSpacing: 1 }}>INVOICE</h2>
                      <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}># {printInvoice.id}</p>
                    </div>
                  </div>

                  {/* Invoice Meta & Patient Info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
                    <div>
                      <div style={{ marginBottom: 12 }}>
                        <span style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Invoice Date</span><br />
                        <span style={{ fontWeight: 600 }}>{formatDate(printInvoice.created_at)}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</span><br />
                        <span style={{
                          display: 'inline-block',
                          background: printInvoice.status === 'paid' ? '#dcfce7' : printInvoice.status === 'partial' ? '#fef9c3' : '#fee2e2',
                          color: printInvoice.status === 'paid' ? '#16a34a' : printInvoice.status === 'partial' ? '#ca8a04' : '#dc2626',
                          fontWeight: 600,
                          padding: '2px 12px',
                          borderRadius: 20,
                          fontSize: 13,
                          textTransform: 'uppercase',
                        }}>
                          {printInvoice.status}
                        </span>
                      </div>
                    </div>
                    <div style={{
                      background: '#f0f8ff',
                      borderRadius: 12,
                      padding: '16px 24px',
                      minWidth: 220,
                    }}>
                      <p style={{ margin: '0 0 4px', fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Patient</p>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#1e293b' }}>
                        {printPatient.first_name} {printPatient.last_name}
                      </p>
                      {printPatient.phone && (
                        <p style={{ margin: '8px 0 0', fontSize: 14, color: '#475569' }}>
                          Phone: {printPatient.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Medical Records Section */}
                  {medicalRecords.length > 0 && (
                    <div style={{ marginBottom: 30 }}>
                      <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', marginBottom: 12, borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>
                        Medical Records
                      </h3>
                      {medicalRecords.map((record, idx) => (
                        <div key={record.id || idx} style={{
                          background: '#f8fafc',
                          borderRadius: 8,
                          padding: '12px 16px',
                          marginBottom: 8,
                          borderLeft: '4px solid #008793',
                        }}>
                          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                            {formatDate(record.record_date || record.created_at)}
                          </div>
                          {record.diagnosis && (
                            <div style={{ marginBottom: 4 }}>
                              <span style={{ fontWeight: 600, fontSize: 13, color: '#004d7a' }}>Diagnosis:</span>{' '}
                              <span style={{ fontSize: 14, color: '#334155' }}>{record.diagnosis}</span>
                            </div>
                          )}
                          {record.treatment && (
                            <div style={{ marginBottom: 4 }}>
                              <span style={{ fontWeight: 600, fontSize: 13, color: '#004d7a' }}>Treatment:</span>{' '}
                              <span style={{ fontSize: 14, color: '#334155' }}>{record.treatment}</span>
                            </div>
                          )}
                          {record.notes && (
                            <div>
                              <span style={{ fontWeight: 600, fontSize: 13, color: '#004d7a' }}>Notes:</span>{' '}
                              <span style={{ fontSize: 14, color: '#334155' }}>{record.notes}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Invoice Description */}
                  <div style={{ marginBottom: 30 }}>
                    <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', marginBottom: 8 }}>
                      Invoice Description
                    </h3>
                    <p style={{
                      fontSize: 15,
                      lineHeight: 1.5,
                      color: '#334155',
                      background: '#f8fafc',
                      padding: '12px 16px',
                      borderRadius: 8,
                      margin: 0,
                    }}>
                      {printInvoice.description || 'Medical services'}
                    </p>
                  </div>

                  {/* Total Amount */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: 20,
                  }}>
                    <span style={{ fontSize: 14, color: '#64748b', marginRight: 20 }}>Total Amount</span>
                    <span style={{ fontSize: 26, fontWeight: 700, color: '#004d7a' }}>
                      ${Number(printInvoice.amount).toFixed(2)}
                    </span>
                  </div>

                  {/* Footer */}
                  <div style={{
                    marginTop: 40,
                    textAlign: 'center',
                    fontSize: 13,
                    color: '#94a3b8',
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: 20,
                  }}>
                    Thank you for choosing our clinic.<br />
                    This is a computer‑generated invoice.
                  </div>
                </div>
              </Paper>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, bgcolor: '#f5f7fb' }}>
          <Button onClick={closePrintDialog} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handlePrintInvoice}
            startIcon={<PrintIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #004d7a 0%, #008793 100%)',
              boxShadow: '0 4px 12px rgba(0,141,145,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #003a5c 0%, #006b7a 100%)',
                boxShadow: '0 6px 16px rgba(0,141,145,0.4)',
              },
            }}
          >
            Print Invoice
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}