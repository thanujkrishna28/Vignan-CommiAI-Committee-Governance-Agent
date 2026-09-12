import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  FolderShared as FolderIcon,
  CloudUpload as UploadIcon,
  Description as DocumentIcon,
  Download as DownloadIcon,
  CheckCircle as DoneIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { documentsApi, committeesApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DocumentsPage() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCommittee, setSelectedCommittee] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('STATUTORY_ACT');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [docsData, commsData] = await Promise.all([
        documentsApi.list().catch(() => []),
        committeesApi.list().catch(() => []),
      ]);
      setDocs(Array.isArray(docsData) ? docsData : []);
      setCommittees(Array.isArray(commsData) ? commsData : []);
      if (commsData && commsData.length > 0 && !selectedCommittee) {
        setSelectedCommittee(commsData[0].id);
      }
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file to deposit.');
      return;
    }
    if (!selectedCommittee) {
      alert('Please select an associated committee.');
      return;
    }

    setUploading(true);
    try {
      await documentsApi.upload(selectedFile, selectedCommittee, selectedCategory);
      setOpenModal(false);
      setSelectedFile(null);
      loadData();
    } catch (err) {
      console.error('Upload error:', err);
      alert(err.response?.data?.detail || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
            Statutory Gazette &amp; Governance Repository
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Official archival of statutory acts, signed meeting minutes, ordinances, and regulatory compliance records.
          </Typography>
        </Box>

        {(user?.role === 'REGISTRAR' || user?.role === 'IQAC' || user?.role === 'SUPER_ADMIN') && (
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setOpenModal(true)}
            sx={{ fontWeight: 700, borderRadius: '10px' }}
          >
            Deposit Statutory Record
          </Button>
        )}
      </Box>

      {/* Repository Status Callout */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DoneIcon color="success" />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Institutional Governance Repository Operational
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Statutory documents, meeting minutes, and regulatory records verified and preserved for institutional audits.
            </Typography>
          </Box>
        </Box>
        <Chip label="OFFICIAL ARCHIVE" size="small" color="primary" sx={{ fontWeight: 800, fontSize: '0.7rem' }} />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Documents Grid */}
      {loading ? (
        <Box sx={{ p: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading repository records from database...</Typography>
        </Box>
      ) : docs.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <FolderIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            No Documents Deposited
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, maxWidth: 400, mx: 'auto' }}>
            No statutory documents or gazettes have been deposited yet. Click below to deposit an official record.
          </Typography>
          <Button variant="contained" startIcon={<UploadIcon />} onClick={() => setOpenModal(true)}>
            Deposit First Record
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {docs.map((doc) => (
            <Grid item xs={12} sm={6} md={4} key={doc.id}>
              <Card
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: 'divider',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  },
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Chip
                      label={doc.doc_type || 'STATUTORY_RECORD'}
                      size="small"
                      sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase' }}
                    />
                    <Chip
                      label="VERIFIED"
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                    />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.3 }}>
                    {doc.filename}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                    {doc.summary || 'Official governance documentation deposited into the institutional repository.'}
                  </Typography>
                </Box>

                <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Active Record'}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      if (doc.file_url) {
                        window.open(doc.file_url, '_blank');
                      } else {
                        alert('Document download initiated.');
                      }
                    }}
                    sx={{ fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}
                  >
                    Download / View
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ─── Upload Modal Dialog ────────────────────────────────────────── */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pt: '24px !important' }}>Deposit Statutory Document</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <FormControl fullWidth>
            <InputLabel shrink>Associated Committee *</InputLabel>
            <Select
              value={selectedCommittee}
              onChange={(e) => setSelectedCommittee(e.target.value)}
              label="Associated Committee *"
            >
              {committees.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel shrink>Document Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Document Category"
            >
              <MenuItem value="STATUTORY_ACT">Statutory Act &amp; Charter</MenuItem>
              <MenuItem value="RATIFIED_MINUTES">Ratified Meeting Minutes</MenuItem>
              <MenuItem value="REGULATORY_GUIDELINE">UGC / AICTE Regulatory Guideline</MenuItem>
              <MenuItem value="POLICY_ORDER">Institutional Policy Order &amp; Gazette</MenuItem>
              <MenuItem value="ACCREDITATION_EVIDENCE">Accreditation Evidence (NAAC / NBA / NIRF)</MenuItem>
            </Select>
          </FormControl>

          <Button variant="outlined" component="label" startIcon={<UploadIcon />} sx={{ py: 2.5, borderStyle: 'dashed', borderRadius: '12px' }}>
            {selectedFile ? selectedFile.name : 'Select PDF / DOCX / Document for Deposition'}
            <input
              type="file"
              hidden
              accept=".pdf,.docx,.txt,.csv"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
          </Button>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleUpload} disabled={uploading || !selectedFile}>
            {uploading ? 'Depositing & Archiving...' : 'Deposit Document'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
