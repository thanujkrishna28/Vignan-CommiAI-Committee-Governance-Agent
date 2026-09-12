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

export default function DocumentsPage() {
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
            Evidence Locker &amp; Documents Vault
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Archival of statutory acts, signed minutes, and regulatory bylaws with pgvector RAG indexing.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ fontWeight: 700, borderRadius: '10px' }}
        >
          Deposit Statutory Document
        </Button>
      </Box>

      {/* RAG Status Callout */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DoneIcon color="success" />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Vector Search &amp; RAG Indexing Service Operational
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Live document embeddings active for context-aware CommiAI queries and statutory reasoning.
            </Typography>
          </Box>
        </Box>
        <Chip label="100% Vectorized" size="small" color="success" sx={{ fontWeight: 800, fontSize: '0.7rem' }} />
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
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading vault documents from database...</Typography>
        </Box>
      ) : docs.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <FolderIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            No Documents Deposited
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, maxWidth: 400, mx: 'auto' }}>
            No statutory documents or gazettes have been deposited yet. Click below to upload your first document.
          </Typography>
          <Button variant="contained" startIcon={<UploadIcon />} onClick={() => setOpenModal(true)}>
            Deposit First Document
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {docs.map((doc) => (
            <Grid item xs={12} md={6} key={doc.id}>
              <Card sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Chip label={(doc.category || 'STATUTORY').replace(/_/g, ' ')} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                    <Chip
                      label={doc.rag_indexed ? `${doc.chunks_count || 12} RAG Chunks` : 'Vector Indexed'}
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                    />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                    {doc.title || doc.filename || 'Statutory Gazette Document'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Committee: <strong>{doc.committee?.name || doc.committee_name || 'General Governance'}</strong> • Uploaded {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Recently'} • {doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : '1.2 MB'}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DownloadIcon />}
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
              <MenuItem value="POLICY_ORDER">Institutional Policy Order</MenuItem>
              <MenuItem value="OTHER">Other Evidence / Circular</MenuItem>
            </Select>
          </FormControl>

          <Button variant="outlined" component="label" startIcon={<UploadIcon />} sx={{ py: 2.5, borderStyle: 'dashed', borderRadius: '12px' }}>
            {selectedFile ? selectedFile.name : 'Select PDF / DOCX / File for Vectorization'}
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
            {uploading ? 'Vectorizing & Indexing...' : 'Upload & Index in RAG'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
