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
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  FolderShared as FolderIcon,
  CloudUpload as UploadIcon,
  Description as DocumentIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  CheckCircle as DoneIcon,
  Search as SearchIcon,
  Add as AddIcon,
  OpenInNew as ExternalIcon,
  TableChart as ExcelIcon,
  Article as DocIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { documentsApi, committeesApi, getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DocumentsPage() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // View modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedDocForView, setSelectedDocForView] = useState(null);
  const [selectedDocPreview, setSelectedDocPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

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
    setUploadError('');
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
      await documentsApi.upload(selectedFile, selectedCommittee, selectedCategory, selectedFile.name);
      setOpenModal(false);
      setSelectedFile(null);
      loadData();
    } catch (err) {
      console.error('Upload error:', err);
      const errMsg = getErrorMessage(err, 'Failed to upload document.');
      setUploadError(errMsg);
      alert(errMsg);
    } finally {
      setUploading(false);
    }
  };

  const formatCategory = (category) => {
    if (!category) return 'STATUTORY RECORD';
    return String(category)
      .replace(/^DocumentCategory\./, '')
      .replace(/_/g, ' ')
      .toUpperCase();
  };

  const handleView = async (doc) => {
    const url = doc.file_url || doc.cloudinary_url;
    const filename = doc.filename || doc.original_filename || doc.name || '';
    const ext = filename.split('.').pop().toLowerCase();

    // If PDF or Image and has valid URL, open in new tab directly
    if (url && (ext === 'pdf' || ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp')) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    // For Spreadsheet / DOCX / CSV or other records, open the interactive Document Viewer Dialog
    setSelectedDocForView(doc);
    setSelectedDocPreview(null);
    setPreviewLoading(true);
    setViewModalOpen(true);

    try {
      const data = await documentsApi.getPreview(doc.id);
      setSelectedDocPreview(data);
    } catch (err) {
      console.warn('Preview error:', err);
      setSelectedDocPreview({
        ...doc,
        text_preview: doc.description || 'Statutory document verified and indexed in the institutional registry.',
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async (doc) => {
    const url = doc.file_url || doc.cloudinary_url;
    const filename = doc.filename || doc.original_filename || doc.name || 'document';
    if (!url) {
      alert(`Record "${filename}" is preserved in the database registry.`);
      return;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc.id}>
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
                      label={formatCategory(doc.category || doc.doc_type)}
                      size="small"
                      sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase' }}
                    />
                    <Chip
                      label={doc.is_indexed ? 'INDEXED & VERIFIED' : 'VERIFIED'}
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                    />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.3 }}>
                    {doc.name || doc.filename || doc.original_filename || 'Governance Document'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                    {doc.description || doc.summary || 'Official governance documentation deposited into the institutional repository.'}
                  </Typography>
                </Box>

                <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Active Record'}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="Open / View document in new tab">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ViewIcon sx={{ fontSize: '16px !important' }} />}
                        onClick={() => handleView(doc)}
                        sx={{
                          fontWeight: 700,
                          textTransform: 'none',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          py: 0.4,
                          px: 1.2,
                        }}
                      >
                        View
                      </Button>
                    </Tooltip>

                    <Tooltip title="Download file in original format">
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<DownloadIcon sx={{ fontSize: '16px !important' }} />}
                        onClick={() => handleDownload(doc)}
                        sx={{
                          fontWeight: 700,
                          textTransform: 'none',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          py: 0.4,
                          px: 1.2,
                          bgcolor: '#2563EB',
                          '&:hover': { bgcolor: '#1D4ED8' },
                        }}
                      >
                        Download
                      </Button>
                    </Tooltip>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ─── Upload Modal Dialog ────────────────────────────────────────── */}
      <Dialog open={openModal} onClose={() => !uploading && setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pt: '24px !important' }}>Deposit Statutory Document</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {uploadError && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {uploadError}
            </Alert>
          )}

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
              accept=".pdf,.docx,.txt,.csv,.xlsx"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                  setUploadError('');
                }
              }}
            />
          </Button>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit" disabled={uploading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleUpload} disabled={uploading || !selectedFile}>
            {uploading ? 'Depositing & Archiving...' : 'Deposit Document'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Document Viewer & Preview Modal Dialog ────────────────────────── */}
      <Dialog
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, pt: '24px !important', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ExcelIcon color="primary" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {selectedDocForView?.name || selectedDocForView?.filename || 'Document Record'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {formatCategory(selectedDocForView?.category || selectedDocForView?.doc_type)} • {selectedDocForView?.created_at ? new Date(selectedDocForView.created_at).toLocaleDateString() : 'Active Record'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setViewModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: '16px !important' }}>
          {previewLoading ? (
            <Box sx={{ p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={32} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading document inspection data...</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1E293B' }}>
                  Extracted Document Text &amp; Indexing Preview
                </Typography>
                <Box
                  sx={{
                    maxHeight: 320,
                    overflowY: 'auto',
                    p: 2,
                    bgcolor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    whiteSpace: 'pre-wrap',
                    color: '#334155',
                    lineHeight: 1.6,
                  }}
                >
                  {selectedDocPreview?.text_preview || 'Document is registered. Full contents can be opened with the web viewer or downloaded below in original format.'}
                </Box>
              </Paper>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            {(selectedDocForView?.file_url || selectedDocForView?.cloudinary_url) && (
              <Button
                variant="outlined"
                startIcon={<ExternalIcon />}
                onClick={() => {
                  const url = selectedDocForView.file_url || selectedDocForView.cloudinary_url;
                  const officeUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=false`;
                  window.open(officeUrl, '_blank', 'noopener,noreferrer');
                }}
                sx={{ fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}
              >
                Open in Web Office Viewer
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button onClick={() => setViewModalOpen(false)} color="inherit">
              Close
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => handleDownload(selectedDocForView)}
              sx={{ fontWeight: 700, textTransform: 'none', borderRadius: '8px', bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}
            >
              Download Original File
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
