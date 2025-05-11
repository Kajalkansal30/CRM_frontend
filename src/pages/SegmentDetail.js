// pages/SegmentDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, CircularProgress, List, ListItem,
  ListItemText, Avatar, ListItemAvatar, Divider, Fade, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { Edit, ArrowBack, Delete } from '@mui/icons-material';
import axios from '../api/axios';
import SegmentBuilder from '../components/segments/SegmentBuilder';

const SegmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [segment, setSegment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatRules = (rules) => {
    if (!rules) return '';
    if (rules.operator === 'AND' || rules.operator === 'OR') {
      return rules.conditions.map(formatRules).join(` ${rules.operator} `);
    } else {
      return `${rules.field} ${rules.operator} ${rules.value}`;
    }
  };

  useEffect(() => {
    const fetchSegment = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`/segments/${id}`, {
          headers: { 'x-auth-token': token },
        });
        setSegment(res.data);
      } catch (error) {
        console.error('Error fetching segment:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSegment();
  }, [id]);

  const handleDeleteClick = () => setDeleteDialogOpen(true);
  const handleDeleteCancel = () => setDeleteDialogOpen(false);

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/segments/${id}`, {
        headers: { 'x-auth-token': token },
      });
      setDeleting(false);
      setDeleteDialogOpen(false);
      navigate('/segments');
    } catch (error) {
      setDeleting(false);
      setDeleteDialogOpen(false);
      console.error('Error deleting segment:', error);
      alert('Failed to delete segment. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!segment) {
    return (
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Segment not found</Typography>
        <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/segments')}>
          <ArrowBack sx={{ mr: 1 }} />
          Back to Segments
        </Button>
      </Box>
    );
  }

  if (editMode) {
    return <SegmentBuilder segmentId={segment._id} initialData={segment} />;
  }

  return (
    <Fade in>
      <Paper elevation={3} sx={{ p: 4, mt: 6, mx: 'auto', maxWidth: 800, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Segment Details
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} color="text.secondary">Name</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{segment.name}</Typography>

          <Typography variant="subtitle1" fontWeight={600} color="text.secondary">Audience Size</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {segment.audienceSize.toLocaleString()} customers
          </Typography>

          <Typography variant="subtitle1" fontWeight={600} color="text.secondary">Rules</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
            {formatRules(segment.rules)}
          </Typography>
        </Box>

        {segment.audienceNames?.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
              Audience Names
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#f5faff' }}>
              <List dense>
                {segment.audienceNames.map((name, index) => (
                  <React.Fragment key={index}>
                    <ListItem
                      sx={{
                        '&:hover': { backgroundColor: '#e3f2fd' },
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={name}
                        primaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                    </ListItem>
                    {index !== segment.audienceNames.length - 1 && (
                      <Divider variant="inset" component="li" />
                    )}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
          Created At: {new Date(segment.createdAt).toLocaleDateString()}
        </Typography>

        <Box sx={{ mt: 5, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => setEditMode(true)}
          >
            Edit Segment
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDeleteClick}
            disabled={deleting}
          >
            Delete Segment
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/segments')}
          >
            Back to Segments
          </Button>
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          aria-labelledby="delete-segment-dialog-title"
          aria-describedby="delete-segment-dialog-description"
        >
          <DialogTitle id="delete-segment-dialog-title">Delete Segment</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-segment-dialog-description">
              Are you sure you want to permanently delete this segment? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} disabled={deleting}>
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" autoFocus disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Fade>
  );
};

export default SegmentDetail;
