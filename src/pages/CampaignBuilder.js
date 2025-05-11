// pages/CampaignBuilder.js
import React, { useState, useEffect } from 'react';
import formatRule from '../utils/segmentRuleFormatter';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Divider,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { Save, Send, ArrowBack, Add } from '@mui/icons-material';

const CampaignBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [segments, setSegments] = useState([]);
  const [messageSuggestions, setMessageSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  
  const [campaign, setCampaign] = useState({
    name: '',
    description: '',
    type: 'email',
    status: 'draft',
    segmentId: '',
    content: {
      subject: '',
      body: '',
    },
    scheduleDate: '',
    sendTestTo: ''
  });

  useEffect(() => {
    // Load segments
    const fetchSegments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/segments', {
          headers: {
            'x-auth-token': token
          }
        });
        const data = await response.json();
        setSegments(data);
      } catch (error) {
        console.error('Error fetching segments:', error);
        setNotification({
          open: true,
          message: 'Failed to load segments',
          severity: 'error'
        });
      }
    };

    fetchSegments();

    // If editing, load the campaign data
    if (isEditing) {
      const fetchCampaign = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/campaigns/${id}`, {
            headers: {
              'x-auth-token': token
            }
          });
          const data = await response.json();
          setCampaign(data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching campaign:', error);
          setLoading(false);
          setNotification({
            open: true,
            message: 'Failed to load campaign',
            severity: 'error'
          });
        }
      };
      
      fetchCampaign();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCampaign({
        ...campaign,
        [parent]: {
          ...campaign[parent],
          [child]: value
        }
      });
    } else {
      setCampaign({
        ...campaign,
        [name]: value
      });
    }
  };

  const handleSave = async (isDraft = true) => {
    if (!isDraft && !campaign.segmentId) {
      setNotification({
        open: true,
        message: 'Please select a segment before scheduling',
        severity: 'error'
      });
      return;
    }
    try {
      setLoading(true);

      // Map frontend campaign fields to backend expected fields
      const campaignToSave = {
        name: campaign.name,
        segment: campaign.segmentId,
        content: {
          subject: campaign.content.subject,
          body: campaign.content.body,
        },
        status: isDraft ? 'draft' : 'scheduled',
        scheduleDate: campaign.scheduleDate,
        description: campaign.description,
        type: campaign.type,
      };

      const token = localStorage.getItem('token');
      const response = await fetch(isEditing ? `/api/campaigns/${id}` : '/api/campaigns', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(campaignToSave),
      });

      if (!response.ok) {
        throw new Error('Failed to save campaign');
      }

      setLoading(false);
      setNotification({
        open: true,
        message: `Campaign ${isDraft ? 'saved as draft' : 'scheduled for sending'}`,
        severity: 'success'
      });

      if (!isDraft) {
        setTimeout(() => {
          navigate('/campaigns');
          // Optionally, you can add code here to refresh campaign list if needed
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      setLoading(false);
      setNotification({
        open: true,
        message: error.message || 'Failed to save campaign',
        severity: 'error'
      });
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!campaign.name) {
      setNotification({
        open: true,
        message: 'Please enter campaign name before generating suggestions',
        severity: 'warning'
      });
      return;
    }
    setLoadingSuggestions(true);
    setMessageSuggestions([]);
    setSelectedSuggestionIndex(-1);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/campaigns/generate-message-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
      body: JSON.stringify({
          campaignObjective: campaign.name,
          segmentDescription: segments.find(s => s._id === campaign.segmentId)?.name || ''
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to generate suggestions');
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.suggestions)) {
        setMessageSuggestions(data.suggestions);
      } else {
        setNotification({
          open: true,
          message: 'No suggestions received',
          severity: 'info'
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || 'Error generating suggestions',
        severity: 'error'
      });
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSendTest = async () => {
    if (!campaign.sendTestTo) {
      setNotification({
        open: true,
        message: 'Please enter test email address',
        severity: 'warning'
      });
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/campaigns/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          campaignId: id,
          testEmail: campaign.sendTestTo
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send test');
      }
      
      setLoading(false);
      setNotification({
        open: true,
        message: 'Test sent successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error sending test:', error);
      setLoading(false);
      setNotification({
        open: true,
        message: error.message || 'Failed to send test',
        severity: 'error'
      });
    }
  };


  const handleNext = () => {
    if (activeStep === 0 && !campaign.name) {
      setNotification({
        open: true,
        message: 'Please enter campaign name',
        severity: 'error'
      });
      return;
    }
    if (activeStep === 1 && !campaign.segmentId) {
      setNotification({
        open: true,
        message: 'Please select a segment',
        severity: 'error'
      });
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  const steps = ['Campaign Details', 'Audience Selection', 'Content Creation', 'Review & Schedule'];

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Campaign Name"
                name="name"
                value={campaign.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={campaign.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Campaign Type</InputLabel>
                <Select
                  name="type"
                  value={campaign.type}
                  onChange={handleChange}
                  label="Campaign Type"
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="sms">SMS</MenuItem>
                  <MenuItem value="push">Push Notification</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Select Target Audience
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Segment</InputLabel>
                <Select
                  name="segmentId"
                  value={campaign.segmentId}
                  onChange={handleChange}
                  label="Segment"
                >
                  {segments.map((segment) => (
                  <MenuItem key={segment._id} value={String(segment._id)}>
                    {segment.name}
                  </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button 
                variant="outlined" 
                startIcon={<Add />}
                onClick={() => navigate('/segments/new')}
              >
                Create New Segment
              </Button>
            </Grid>
            {campaign.segmentId && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Segment Details
                  </Typography>
                  <Typography variant="body2">
                    {campaign.segmentId ? formatRule(segments.find(s => s._id === campaign.segmentId)?.rules) : 'No description available'}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={`Estimated recipients: ${segments.find(s => s._id === campaign.segmentId)?.audienceSize || 0}`} 
                      color="primary" 
                      size="small" 
                    />
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject Line"
                name="content.subject"
                value={campaign.content.subject}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
          label="Email Body"
          name="content.body"
          value={campaign.content.body}
          onChange={handleChange}
          multiline
          rows={10}
          required
        />
      </Grid>
      <Grid item xs={12} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          onClick={handleGenerateSuggestions}
          disabled={loadingSuggestions}
        >
          {loadingSuggestions ? 'Generating...' : 'Generate Suggestions'}
        </Button>
      </Grid>
      {messageSuggestions.length > 0 && (
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            AI Generated Suggestions
          </Typography>
          {messageSuggestions.map((suggestion, index) => (
            <Paper
              key={index}
              variant="outlined"
              sx={{
                p: 2,
                mb: 2,
                cursor: 'pointer',
                borderColor: selectedSuggestionIndex === index ? 'primary.main' : 'divider',
                backgroundColor: selectedSuggestionIndex === index ? 'action.selected' : 'background.paper',
              }}
              onClick={() => {
                setSelectedSuggestionIndex(index);
                setCampaign({
                  ...campaign,
                  content: {
                    subject: suggestion.subject,
                    body: suggestion.body,
                  },
                });
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                {suggestion.subject}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {suggestion.body}
              </Typography>
            </Paper>
          ))}
        </Grid>
      )}
      <Grid item xs={12}>
        <Typography variant="caption" color="textSecondary">
          Supports Markdown formatting and basic HTML
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1">Send Test</Typography>
      </Grid>
      <Grid item xs={8}>
        <TextField
          fullWidth
          label="Send test to email"
          name="sendTestTo"
          value={campaign.sendTestTo}
          onChange={handleChange}
          placeholder="email@example.com"
        />
      </Grid>
      <Grid item xs={4}>
        <Button
          variant="outlined"
          onClick={handleSendTest}
          disabled={!campaign.sendTestTo || loading}
          sx={{ height: '100%' }}
        >
          Send Test
        </Button>
      </Grid>
    </Grid>
  );
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Campaign Summary</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Name:</Typography>
                    <Typography variant="body1">{campaign.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Type:</Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{campaign.type}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Description:</Typography>
                    <Typography variant="body1">{campaign.description}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                  <Typography variant="subtitle2">Target Segment:</Typography>
                  <Typography variant="body1">
                    {segments.find(s => s._id === campaign.segmentId)?.name || 'No segment selected'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Subject:</Typography>
                    <Typography variant="body1">{campaign.content.subject}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'background.default' }}>
                      <Typography variant="body2" component="div">
                        {campaign.content.body}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Schedule Date"
                name="scheduleDate"
                type="datetime-local"
                value={campaign.scheduleDate}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  if (loading && isEditing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/campaigns')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5" component="h1">
            {isEditing ? 'Edit Campaign' : 'Create New Campaign'}
          </Typography>
        </Box>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Box sx={{ mt: 2 }}>
            {renderStepContent(activeStep)}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              <Button 
                variant="outlined" 
                onClick={() => handleSave(true)}
                startIcon={<Save />}
                sx={{ mr: 1 }}
                disabled={loading}
              >
                Save Draft
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSave(false)}
                  startIcon={<Send />}
                  disabled={!campaign.name || !campaign.content.subject || !campaign.content.body || loading}
                >
                  Schedule Campaign
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={activeStep === 0 && !campaign.name}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
      <Alert 
        severity={notification.severity} 
        sx={{ width: '100%' }}
        onClick={() => setNotification({ open: true, message: 'Feature coming soon', severity: 'info' })}
      >
        {notification.message}
      </Alert>
      </Snackbar>
    </Box>
  );
};

export default CampaignBuilder;
