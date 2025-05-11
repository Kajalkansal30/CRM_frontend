import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, CircularProgress, Fade, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { Edit, ArrowBack, Delete } from '@mui/icons-material';
import axios from '../api/axios';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`/campaigns/${id}`, {
          headers: { 'x-auth-token': token },
        });
        setCampaign(res.data);
      } catch (error) {
        console.error('Error fetching campaign:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/campaigns/${id}`, {
        headers: { 'x-auth-token': token },
      });
      setDeleting(false);
      setDeleteDialogOpen(false);
      navigate('/campaigns');
    } catch (error) {
      setDeleting(false);
      setDeleteDialogOpen(false);
      console.error('Error deleting campaign:', error);
      alert('Failed to delete campaign. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!campaign) {
    return (
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Campaign not found</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/campaigns')}>
          <ArrowBack sx={{ mr: 1 }} />
          Back to Campaigns
        </Button>
      </Box>
    );
  }

  return (
    <Fade in>
      <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Campaign Details
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" color="primary">Name:</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {campaign.name}
          </Typography>

          <Typography variant="h6" color="primary" sx={{ mt: 3 }}>Description:</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {campaign.description}
          </Typography>

          <Typography variant="h6" color="primary" sx={{ mt: 3 }}>Type:</Typography>
          <Typography variant="body1" sx={{ mb: 1, textTransform: 'capitalize' }}>
            {campaign.type}
          </Typography>

          <Typography variant="h6" color="primary" sx={{ mt: 3 }}>Status:</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {campaign.status}
          </Typography>

          <Typography variant="h6" color="primary" sx={{ mt: 3 }}>Scheduled Date:</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {campaign.scheduleDate ? new Date(campaign.scheduleDate).toLocaleString() : 'Not scheduled'}
          </Typography>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => navigate(`/campaigns/${id}/edit`)}
          >
            Edit Campaign
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDeleteClick}
            disabled={deleting}
          >
            Delete Campaign
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/campaigns')}
          >
            Back to Campaigns
          </Button>
        </Box>

        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          aria-labelledby="delete-campaign-dialog-title"
          aria-describedby="delete-campaign-dialog-description"
        >
          <DialogTitle id="delete-campaign-dialog-title">Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-campaign-dialog-description">
              Are you sure you want to permanently delete this campaign? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} disabled={deleting}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" disabled={deleting} autoFocus>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Fade>
  );
};

export default CampaignDetails;
