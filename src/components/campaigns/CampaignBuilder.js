// components/campaigns/CampaignBuilder.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, TextField, FormControl,
  InputLabel, Select, MenuItem, Divider, Grid, CircularProgress,
  Chip, FormHelperText
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from '../../api/axios';
import formatRule from '../../utils/segmentRuleFormatter';

const validationSchema = yup.object({
  name: yup.string().required('Campaign name is required'),
  segment: yup.string().required('Please select a segment'),
  subject: yup.string().required('Subject is required').max(100, 'Subject cannot exceed 100 characters'),
  message: yup.string().required('Message is required').max(500, 'Message cannot exceed 500 characters'),
});

const CampaignBuilder = () => {
  const [segments, setSegments] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [segmentsLoading, setSegmentsLoading] = useState(true);
  const [messageSuggestions, setMessageSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // Campaign ID for edit mode

  const queryParams = new URLSearchParams(location.search);
  const preselectedSegmentId = queryParams.get('segmentId');

  const formik = useFormik({
    initialValues: {
      name: '',
      segment: preselectedSegmentId || '',
      subject: '',
      message: '',
      status: 'draft'
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (segmentsLoading) {
        alert('Segments are still loading. Please wait.');
        return;
      }

      if (!values.segment) {
        alert('Please select a segment before saving.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };

        let response;
        if (id) {
          // Make endpoint consistent by using /api/ prefix
          response = await axios.put(`/campaigns/${id}`, values, config);
        } else {
          // Make endpoint consistent by using /api/ prefix
          response = await axios.post('/campaigns', values, config);
        }
        
        navigate('/campaigns');
      } catch (error) {
        console.error('Error saving campaign:', error);
      } finally {
        setLoading(false);
      }
    }
  });

  // Fetch all segments
  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        const res = await axios.get('/segments', config);
        setSegments(res.data);
      } catch (error) {
        console.error('Error fetching segments:', error);
      } finally {
        setSegmentsLoading(false);
      }
    };

    fetchSegments();
  }, []);

  // Handle preselected segment from URL
  useEffect(() => {
    if (preselectedSegmentId && segments.length > 0) {
      const segment = segments.find(s => s._id === preselectedSegmentId);
      if (segment) {
        setSelectedSegment(segment);
        formik.setFieldValue('segment', preselectedSegmentId);
      }
    }
  }, [preselectedSegmentId, segments, formik]);

  // Fetch campaign details for edit mode
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        const res = await axios.get(`/campaigns/${id}`, config);
        const campaign = res.data;

        formik.setValues({
          name: campaign.name || '',
          segment: campaign.segment?._id || '',
          message: campaign.message || '',
          status: campaign.status || 'draft'
        });

        setSelectedSegment(campaign.segment || null);
      } catch (error) {
        console.error('Error fetching campaign:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id, formik]);

  // Handle segment selection change
  const handleSegmentChange = async (e) => {
    const segmentId = e.target.value;
    formik.setFieldValue('segment', segmentId);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.get(`/segments/${segmentId}`, config);
      setSelectedSegment(res.data);
    } catch (error) {
      console.error('Error fetching segment details:', error);
      // Fallback to local segment data
      const segment = segments.find(s => s._id === segmentId);
      if (segment) {
        setSelectedSegment(segment);
      } else {
        console.error('Segment not found locally either');
        setSelectedSegment(null);
      }
    }
  };

  // Set default segment if none selected and segments are loaded
  useEffect(() => {
    if (!formik.values.segment && segments.length > 0) {
      formik.setFieldValue('segment', segments[0]._id);
      setSelectedSegment(segments[0]);
    }
  }, [segments, formik.values.segment, formik]);

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {id ? 'Edit Campaign' : 'Create Campaign'}
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          id="name"
          name="name"
          label="Campaign Name"
          value={formik.values.name}
          onChange={formik.handleChange}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
          margin="normal"
        />

        <FormControl
          fullWidth
          margin="normal"
          error={formik.touched.segment && Boolean(formik.errors.segment)}
        >
          <InputLabel id="segment-label">Customer Segment</InputLabel>
          <Select
            labelId="segment-label"
            id="segment"
            name="segment"
            value={formik.values.segment || ''}
            label="Customer Segment"
            onChange={handleSegmentChange}
            disabled={segmentsLoading}
          >
            {segments.map(segment => (
              <MenuItem key={segment._id} value={segment._id}>
                {segment.name}
              </MenuItem>
            ))}
          </Select>
          {formik.touched.segment && formik.errors.segment && (
            <FormHelperText>{formik.errors.segment}</FormHelperText>
          )}
        </FormControl>

        <TextField
          fullWidth
          id="subject"
          name="subject"
          label="Subject"
          value={formik.values.subject}
          onChange={formik.handleChange}
          error={formik.touched.subject && Boolean(formik.errors.subject)}
          helperText={formik.touched.subject && formik.errors.subject}
          margin="normal"
        />

        <Button
          variant="outlined"
          onClick={async () => {
            if (!formik.values.name) {
              alert('Please enter the campaign name (objective) before generating suggestions.');
              return;
            }
            if (!selectedSegment) {
              alert('Please select a segment before generating suggestions.');
              return;
            }
            setLoading(true);
            try {
              const token = localStorage.getItem('token');
              const config = { headers: { 'x-auth-token': token } };
              const response = await axios.post('/campaigns/generate-message-suggestions', {
                campaignObjective: formik.values.name,
                segmentDescription: selectedSegment.rules ? formatRule(selectedSegment.rules) : '',
              }, config);
              setMessageSuggestions(response.data.suggestions || []);
            } catch (error) {
              console.error('Error generating message suggestions:', error);
              alert('Failed to generate message suggestions. Please try again.');
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          sx={{ mt: 2, mb: 2 }}
        >
          {loading ? 'Generating...' : 'Generate Message Suggestions'}
        </Button>

        {messageSuggestions.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Message Suggestions:
            </Typography>
            {messageSuggestions.map((suggestion, index) => (
              <Paper
                key={index}
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 1,
                  cursor: 'pointer',
                  backgroundColor:
                    selectedSuggestionIndex === index ? 'primary.light' : 'background.paper',
                }}
                onClick={() => {
                  formik.setFieldValue('subject', suggestion.subject);
                  formik.setFieldValue('message', suggestion.body);
                  setSelectedSuggestionIndex(index);
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {suggestion.subject}
                </Typography>
                <Typography variant="body2">{suggestion.body}</Typography>
              </Paper>
            ))}
          </Box>
        )}

        {selectedSegment && (
          <Box sx={{ mt: 1, mb: 2 }}>
            <Chip
              label={`${selectedSegment.audienceSize.toLocaleString()} recipients`}
              color="primary"
              size="small"
            />
            <Box sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}>
              {selectedSegment.rules ? formatRule(selectedSegment.rules) : 'No description available'}
            </Box>
          </Box>
        )}

        <TextField
          fullWidth
          id="message"
          name="message"
          label="Message"
          multiline
          rows={6}
          value={formik.values.message}
          onChange={formik.handleChange}
          error={formik.touched.message && Boolean(formik.errors.message)}
          helperText={
            (formik.touched.message && formik.errors.message) ||
            `${formik.values.message.length}/500 characters`
          }
          margin="normal"
        />

        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Available variables: {'{name}'}, {'{email}'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Example: "Hi {'{name}'}, we have a special offer for you!"
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={2} justifyContent="flex-end">
          <Grid item>
            <Button variant="outlined" onClick={() => navigate('/campaigns')}>
              Cancel
            </Button>
          </Grid>
          <Grid item>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? (id ? 'Saving...' : 'Creating...') : (id ? 'Save Campaign' : 'Create Campaign')}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default CampaignBuilder;