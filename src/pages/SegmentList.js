import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, Skeleton, Stack, Avatar,
  useTheme, useMediaQuery, IconButton, Tooltip
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Add as AddIcon,
  Campaign as CampaignIcon,
  People as PeopleIcon,
  Event as EventIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import axios from '../api/axios';

const SegmentList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'x-auth-token': token,
          },
        };
        
        const res = await axios.get('/segments', config);
        setSegments(res.data);
      } catch (error) {
        console.error('Error fetching segments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSegments();
  }, [location.key]);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4
      }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 600,
          color: theme.palette.text.primary
        }}>
          Customer Segments
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/segments/new')}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            py: 1
          }}
        >
          New Segment
        </Button>
      </Box>
      
      <Paper elevation={0} sx={{ 
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden'
      }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: theme.palette.background.paper }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Segment</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Audience</TableCell>
                {!isMobile && <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>}
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={isMobile ? 3 : 4}>
                      <Skeleton variant="rectangular" height={60} />
                    </TableCell>
                  </TableRow>
                ))
              ) : segments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 3 : 4} align="center" sx={{ py: 4 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      color: theme.palette.text.secondary
                    }}>
                      <FilterListIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                      <Typography variant="body1">No segments found</Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/segments/new')}
                        sx={{ mt: 2 }}
                      >
                        Create Your First Segment
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                segments.map((segment) => (
                  <TableRow 
                    key={segment._id}
                    hover
                    onClick={() => navigate(`/segments/${segment._id}`)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover
                      }
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ 
                          width: 40, 
                          height: 40,
                          bgcolor: theme.palette.primary.main
                        }}>
                          {segment.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {segment.name}
                          </Typography>
                          {isMobile && (
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(segment.createdAt)}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Chip 
                        icon={<PeopleIcon fontSize="small" />}
                        label={`${segment.audienceSize.toLocaleString()}`}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{
                          fontWeight: 500,
                          minWidth: 100
                        }}
                      />
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(segment.createdAt)}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/campaigns/new?segmentId=${segment._id}`);
                        }}
                        sx={{
                          textTransform: 'none',
                          borderRadius: 2,
                          px: 2,
                          py: 0.5
                        }}
                      >
                        Add Campaign
                      </Button>
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

export default SegmentList;