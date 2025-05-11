// pages/CampaignList.js
import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Chip, CircularProgress, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import axios from '../api/axios';
import { format } from 'date-fns';

const getStatusColor = (status) => {
  switch (status) {
    case 'draft':
      return 'default';
    case 'scheduled':
      return 'info';
    case 'sending':
      return 'warning';
    case 'completed':
      return 'success';
    default:
      return 'default';
  }
};

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const config = {
          headers: { 'x-auth-token': token }
        };

        const [campaignRes, customerRes, segmentRes] = await Promise.all([
          axios.get('/campaigns', config),
          axios.get('/customers', config),
          axios.get('/segments', config),
        ]);

        setCampaigns(campaignRes.data);
        setCustomers(customerRes.data);
        setSegments(segmentRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleSendCampaign = async (campaignId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };

      await axios.post(`/campaigns/${campaignId}/send`, {}, config);

      setCampaigns(campaigns.map(campaign => 
        campaign._id === campaignId 
          ? { ...campaign, status: 'sending' }
          : campaign
      ));
    } catch (error) {
      console.error('Error sending campaign:', error);
    }
  };

  const getAudienceSize = (campaign) => {
    if (campaign.segment?.audienceSize) {
      return campaign.segment.audienceSize;
    }

    const segmentId = typeof campaign.segment === 'string' ? campaign.segment : campaign.segment?._id;
    const foundSegment = segments.find(s => s._id === segmentId);
    return foundSegment?.audienceSize || 0;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Campaigns
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => navigate('/campaigns/new')}
          sx={{
            fontWeight: 'bold',
            padding: '6px 12px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              backgroundColor: '#007BFF',
            }
          }}
        >
          Create Campaign
        </Button>
      </Box>

      <Paper elevation={2} sx={{ width: '100%', borderRadius: 2 }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Segment</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Recipients</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Sent</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">No campaigns found</TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => (
                  <TableRow 
                    key={campaign._id} 
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      if (!['BUTTON', 'svg', 'path'].includes(e.target.nodeName)) {
                        navigate(`/campaigns/${campaign._id}`);
                      }
                    }}
                  >
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell>{campaign.segment?.name || 'Unknown Segment'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={campaign.status}
                        color={getStatusColor(campaign.status)}
                        size="small"
                        sx={{ textTransform: 'uppercase' }}
                      />
                    </TableCell>
                    <TableCell align="right">{getAudienceSize(campaign)}</TableCell>
                    <TableCell align="right">{campaign.sentCount || 0}</TableCell>
                    <TableCell>{format(new Date(campaign.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Stack direction="column" spacing={1}>
                        <Chip 
                          label={`Sent: ${campaign.sentCount || 0}`} 
                          color="success" 
                          size="small" 
                        />
                        <Chip 
                          label={`Failed: ${campaign.failedCount || 0}`} 
                          color="error" 
                          size="small" 
                        />
                        <Chip 
                          label={`Pending: ${campaign.pendingCount || 0}`} 
                          color="warning" 
                          size="small" 
                        />
                        {campaign.status === 'draft' && (
                          <Button 
                            variant="outlined" 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendCampaign(campaign._id);
                            }}
                            sx={{
                              fontWeight: 'bold',
                              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                              '&:hover': {
                                backgroundColor: '#FFA500',
                              }
                            }}
                          >
                            Send Now
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default CampaignList;
