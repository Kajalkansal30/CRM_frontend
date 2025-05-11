// pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Divider, 
  CircularProgress,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  WatchLater as WatchLaterIcon
} from '@mui/icons-material';
import axios from '../api/axios';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalSpend: 0,
    activeCustomers: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'x-auth-token': token
          }
        };
        
        const [customersRes, ordersRes] = await Promise.all([
          axios.get('/customers', config),
          axios.get('/orders', config)
        ]);
        
        const customers = customersRes.data;
        const orders = ordersRes.data;
        
        const activeCustomers = customers.filter(c => {
          const lastActive = new Date(c.lastActive);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return lastActive > thirtyDaysAgo;
        });
        
        setStats({
          totalCustomers: customers.length,
          totalSpend: customers.reduce((sum, customer) => sum + customer.totalSpend, 0),
          activeCustomers: activeCustomers.length,
          recentOrders: orders.slice(0, 5)
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CheckCircleIcon fontSize="small" />;
      case 'cancelled':
        return <CancelIcon fontSize="small" />;
      default:
        return <WatchLaterIcon fontSize="small" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '80vh'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant="h4" gutterBottom sx={{ 
        fontWeight: 600,
        mb: 4,
        color: theme.palette.text.primary
      }}>
        Dashboard Overview
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ 
            p: 3, 
            borderRadius: 2,
            background: theme.palette.mode === 'dark' 
              ? theme.palette.background.paper 
              : theme.palette.primary.light,
            color: theme.palette.mode === 'dark' 
              ? theme.palette.common.white 
              : theme.palette.primary.contrastText
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ 
                mr: 2,
                bgcolor: theme.palette.mode === 'dark' 
                  ? theme.palette.primary.dark 
                  : theme.palette.primary.main
              }}>
                <PeopleIcon />
              </Avatar>
              <Typography variant="h6">Total Customers</Typography>
            </Box>
            <Typography variant="h3" sx={{ 
              mt: 1,
              fontWeight: 700
            }}>
              {stats.totalCustomers.toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ 
              opacity: 0.8,
              display: 'block',
              mt: 1
            }}>
              All registered customers
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ 
            p: 3, 
            borderRadius: 2,
            background: theme.palette.mode === 'dark' 
              ? theme.palette.background.paper 
              : theme.palette.secondary.light,
            color: theme.palette.mode === 'dark' 
              ? theme.palette.common.white 
              : theme.palette.secondary.contrastText
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ 
                mr: 2,
                bgcolor: theme.palette.mode === 'dark' 
                  ? theme.palette.secondary.dark 
                  : theme.palette.secondary.main
              }}>
                <AttachMoneyIcon />
              </Avatar>
              <Typography variant="h6">Total Revenue</Typography>
            </Box>
            <Typography variant="h3" sx={{ 
              mt: 1,
              fontWeight: 700
            }}>
              ${stats.totalSpend.toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ 
              opacity: 0.8,
              display: 'block',
              mt: 1
            }}>
              Lifetime value
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ 
            p: 3, 
            borderRadius: 2,
            background: theme.palette.mode === 'dark' 
              ? theme.palette.background.paper 
              : theme.palette.success.light,
            color: theme.palette.mode === 'dark' 
              ? theme.palette.common.white 
              : theme.palette.success.contrastText
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ 
                mr: 2,
                bgcolor: theme.palette.mode === 'dark' 
                  ? theme.palette.success.dark 
                  : theme.palette.success.main
              }}>
                <TrendingUpIcon />
              </Avatar>
              <Typography variant="h6">Active Customers</Typography>
            </Box>
            <Typography variant="h3" sx={{ 
              mt: 1,
              fontWeight: 700
            }}>
              {stats.activeCustomers.toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ 
              opacity: 0.8,
              display: 'block',
              mt: 1
            }}>
              Last 30 days
            </Typography>
          </Paper>
        </Grid>
        
        {/* Recent Orders */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ 
            p: 3, 
            borderRadius: 2,
            background: theme.palette.background.paper
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2 
            }}>
              <ReceiptIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Orders
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            {stats.recentOrders.length > 0 ? (
              <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ minWidth: 600 }}>
                  {stats.recentOrders.map((order) => (
                    <Box key={order._id} sx={{ 
                      py: 2, 
                      px: 1,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      '&:last-child': {
                        borderBottom: 'none'
                      },
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover
                      }
                    }}>
                      <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {order.customer?.name || 'Unknown Customer'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(order.orderDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            ${order.amount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Chip
                            icon={getStatusIcon(order.status)}
                            label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            size="small"
                            sx={{
                              textTransform: 'capitalize',
                              backgroundColor: 
                                order.status === 'completed' ? theme.palette.success.light :
                                order.status === 'cancelled' ? theme.palette.error.light :
                                theme.palette.warning.light,
                              color: 
                                order.status === 'completed' ? theme.palette.success.dark :
                                order.status === 'cancelled' ? theme.palette.error.dark :
                                theme.palette.warning.dark,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={2} sx={{ 
                          textAlign: isMobile ? 'left' : 'right',
                          pl: isMobile ? 0 : 'auto'
                        }}>
                          <Typography variant="caption" color="text.secondary">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box sx={{ 
                py: 4, 
                textAlign: 'center',
                color: theme.palette.text.secondary
              }}>
                <ReceiptIcon sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
                <Typography variant="body1">
                  No recent orders found
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;