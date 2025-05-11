import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Grid, Divider, List, ListItem, ListItemText,
  Button, Tabs, Tab, CircularProgress, Card, CardContent, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Avatar, Tooltip,
  useTheme, useMediaQuery, Stack, Badge, Skeleton
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  ShoppingBag as ShoppingBagIcon,
  CalendarToday as CalendarIcon,
  AccessTime as LastActiveIcon,
  Receipt as OrderIcon,
  Timeline as ActivityIcon,
  Category as SegmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocalAtm as TotalSpendIcon,
  AttachMoney as AvgOrderIcon,
  Store as VisitsIcon
} from '@mui/icons-material';
import axios from '../api/axios';

const stringToColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

const stringAvatar = (name) => ({
  sx: {
    bgcolor: stringToColor(name),
    width: 80,
    height: 80,
    fontSize: 32,
    fontWeight: 'bold',
  },
  children: `${name.split(' ')[0][0]}${name.split(' ')[1] ? name.split(' ')[1][0] : ''}`,
});

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const formatRules = (rules) => {
    if (!rules) return '';
    if (rules.operator === 'AND' || rules.operator === 'OR') {
      return rules.conditions.map(formatRules).join(` ${rules.operator} `);
    } else {
      return `${rules.field} ${rules.operator} ${rules.value}`;
    }
  };

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        const [customerRes, ordersRes, segmentsRes] = await Promise.all([
          axios.get(`/customers/${id}`, config),
          axios.get(`/orders/customer/${id}`, config),
          axios.get(`/customers/${id}/segments`, config)
        ]);
        setCustomer({ ...customerRes.data, segments: segmentsRes.data });
        setOrders(ordersRes.data);
        setFormData({
          name: customerRes.data.name,
          email: customerRes.data.email,
          phone: customerRes.data.phone || '',
          address: customerRes.data.address || ''
        });
      } catch (error) {
        console.error('Error fetching customer data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerData();
  }, [id]);

  const handleTabChange = (event, newValue) => setTabValue(newValue);
  const handleEditDialogOpen = () => setEditDialogOpen(true);
  const handleEditDialogClose = () => setEditDialogOpen(false);
  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdateCustomer = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Content-Type': 'application/json', 'x-auth-token': token } };
      const res = await axios.put(`/customers/${id}`, formData, config);
      setCustomer(res.data);
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  const handleDeleteCustomer = async () => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        await axios.delete(`/customers/${id}`, config);
        navigate('/customers');
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!customer) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Customer not found
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/customers')} 
          sx={{ mt: 3, px: 4, py: 1.5, borderRadius: 2 }}
        >
          Back to Customers
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ px: isMobile ? 2 : 4, py: isMobile ? 3 : 4 }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 0
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Avatar sx={{ 
                width: 24, 
                height: 24, 
                bgcolor: theme.palette.success.main,
                border: `2px solid ${theme.palette.background.paper}`
              }}>
                <CheckCircleIcon sx={{ fontSize: 14 }} />
              </Avatar>
            }
          >
            <Avatar {...stringAvatar(customer.name)} />
          </Badge>
          <Box>
            <Typography variant="h4" fontWeight="700">
              {customer.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Customer since {new Date(customer.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit Customer">
            <IconButton 
              onClick={handleEditDialogOpen}
              sx={{ 
                bgcolor: theme.palette.primary.light,
                color: theme.palette.primary.main,
                '&:hover': { bgcolor: theme.palette.primary.main, color: 'white' }
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Customer">
            <IconButton 
              onClick={handleDeleteCustomer}
              sx={{ 
                bgcolor: theme.palette.error.light,
                color: theme.palette.error.main,
                '&:hover': { bgcolor: theme.palette.error.main, color: 'white' }
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Left Column - Customer Info */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ 
            p: 3, 
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper
          }}>
            <Typography variant="h6" fontWeight="700" gutterBottom>
              Contact Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Stack spacing={2.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EmailIcon sx={{ color: theme.palette.text.secondary }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                    Email
                  </Typography>
                  <Typography variant="body1">{customer.email}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PhoneIcon sx={{ color: theme.palette.text.secondary }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {customer.phone || 'Not provided'}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <LocationIcon sx={{ color: theme.palette.text.secondary, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                    Address
                  </Typography>
                  <Typography variant="body1">
                    {customer.address || 'Not provided'}
                  </Typography>
                </Box>
              </Box>
            </Stack>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="600" gutterBottom>
                  Last Active
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LastActiveIcon fontSize="small" color="action" />
                  <Typography variant="body1">
                    {new Date(customer.lastActive).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
          
          {/* Metrics Card */}
          <Paper elevation={0} sx={{ 
            p: 3, 
            mt: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper
          }}>
            <Typography variant="h6" fontWeight="700" gutterBottom>
              Customer Metrics
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card elevation={0} sx={{ 
                  p: 2,
                  borderRadius: 2,
                  bgcolor: theme.palette.background.default
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <TotalSpendIcon color="primary" />
                    <Typography variant="subtitle2" fontWeight="600">
                      Total Spend
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight="700">
                    ${customer.totalSpend.toLocaleString()}
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card elevation={0} sx={{ 
                  p: 2,
                  borderRadius: 2,
                  bgcolor: theme.palette.background.default
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <ShoppingBagIcon color="primary" />
                    <Typography variant="subtitle2" fontWeight="600">
                      Orders
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight="700">
                    {orders.length}
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card elevation={0} sx={{ 
                  p: 2,
                  borderRadius: 2,
                  bgcolor: theme.palette.background.default
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <AvgOrderIcon color="primary" />
                    <Typography variant="subtitle2" fontWeight="600">
                      Avg. Order
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight="700">
                    ${orders.length > 0 ? (customer.totalSpend / orders.length).toFixed(2) : '0.00'}
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card elevation={0} sx={{ 
                  p: 2,
                  borderRadius: 2,
                  bgcolor: theme.palette.background.default
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <VisitsIcon color="primary" />
                    <Typography variant="subtitle2" fontWeight="600">
                      Visits
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight="700">
                    {customer.visits || 0}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Right Column - Tabs */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ 
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
            height: '100%'
          }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="fullWidth"
              sx={{ 
                '& .MuiTabs-indicator': {
                  height: 4,
                  borderRadius: '4px 4px 0 0'
                }
              }}
            >
              <Tab 
                icon={<OrderIcon />} 
                iconPosition="start" 
                label="Orders" 
                sx={{ 
                  fontWeight: '600',
                  py: 2.5,
                  minHeight: 'auto'
                }} 
              />
              <Tab 
                icon={<ActivityIcon />} 
                iconPosition="start" 
                label="Activity" 
                sx={{ 
                  fontWeight: '600',
                  py: 2.5,
                  minHeight: 'auto'
                }} 
              />
              <Tab 
                icon={<SegmentIcon />} 
                iconPosition="start" 
                label="Segments" 
                sx={{ 
                  fontWeight: '600',
                  py: 2.5,
                  minHeight: 'auto'
                }} 
              />
            </Tabs>
            
            <Divider />
            
            <Box sx={{ p: 3 }}>
              {tabValue === 0 && (
                <Box>
                  {orders.length === 0 ? (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      py: 6,
                      color: theme.palette.text.secondary
                    }}>
                      <OrderIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" gutterBottom>
                        No orders found
                      </Typography>
                      <Typography variant="body2">
                        This customer hasn't placed any orders yet
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      {orders.map((order) => (
                        <Card 
                          key={order._id} 
                          elevation={0}
                          sx={{ 
                            p: 2,
                            borderRadius: 2,
                            border: `1px solid ${theme.palette.divider}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              boxShadow: `0 0 0 1px ${theme.palette.primary.main}`
                            }
                          }}
                        >
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={8}>
                              <Typography variant="subtitle1" fontWeight="700">
                                Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <CalendarIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(order.orderDate).toLocaleDateString()} • {new Date(order.orderDate).toLocaleTimeString()}
                                </Typography>
                              </Box>
                              {order.items && (
                                <Chip
                                  label={`${order.items.length} ${order.items.length === 1 ? 'item' : 'items'}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ mt: 1 }}
                                />
                              )}
                            </Grid>
                            <Grid item xs={12} sm={4} sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: { xs: 'flex-start', sm: 'flex-end' } 
                            }}>
                              <Typography variant="h6" fontWeight="700" color="primary">
                                ${order.amount.toLocaleString()}
                              </Typography>
                              <Chip 
                                label={order.status}
                                color={
                                  order.status === 'completed' ? 'success' :
                                  order.status === 'cancelled' ? 'error' : 'warning'
                                }
                                size="small"
                                sx={{ 
                                  mt: 1,
                                  fontWeight: '600',
                                  alignSelf: { xs: 'flex-start', sm: 'flex-end' }
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Box>
              )}
              
              {tabValue === 1 && (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  py: 6,
                  color: theme.palette.text.secondary
                }}>
                  <ActivityIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" gutterBottom>
                    Activity Tracking
                  </Typography>
                  <Typography variant="body2" align="center" sx={{ maxWidth: 400 }}>
                    Customer activity timeline and engagement metrics will be displayed here
                  </Typography>
                </Box>
              )}
              
              {tabValue === 2 && (
                <Box>
                  {customer.segments && customer.segments.length > 0 ? (
                    <Stack spacing={2}>
                      {customer.segments.map((segment) => (
                        <Card 
                          key={segment._id} 
                          elevation={0}
                          sx={{ 
                            p: 2,
                            borderRadius: 2,
                            border: `1px solid ${theme.palette.divider}`
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="700" gutterBottom>
                            {segment.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatRules(segment.rules)}
                          </Typography>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      py: 6,
                      color: theme.palette.text.secondary
                    }}>
                      <SegmentIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" gutterBottom>
                        No Segments Found
                      </Typography>
                      <Typography variant="body2">
                        This customer is not part of any segments
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Edit Customer Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleEditDialogClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: '700',
          borderBottom: `1px solid ${theme.palette.divider}`,
          py: 2.5
        }}>
          Edit Customer Details
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              variant="outlined"
              size="medium"
            />
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
              variant="outlined"
              size="medium"
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              variant="outlined"
              size="medium"
            />
            <TextField
              fullWidth
              label="Address"
              name="address"
              multiline
              rows={3}
              value={formData.address}
              onChange={handleFormChange}
              variant="outlined"
              size="medium"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ 
          px: 3, 
          py: 2,
          borderTop: `1px solid ${theme.palette.divider}`
        }}>
          <Button 
            onClick={handleEditDialogClose}
            variant="outlined"
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateCustomer} 
            variant="contained"
            disableElevation
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerDetail;