import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  useTheme,
  useMediaQuery,
  Skeleton,
  Stack,
  Avatar,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  LocalShipping as ShippingIcon,
  ArrowForward as ArrowForwardIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';

const OrderList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/orders', {
          headers: {
            'x-auth-token': token,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon fontSize="small" />;
      case 'cancelled':
        return <CancelIcon fontSize="small" />;
      case 'shipped':
        return <ShippingIcon fontSize="small" />;
      default:
        return <PendingIcon fontSize="small" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return theme.palette.success.light;
      case 'cancelled':
        return theme.palette.error.light;
      case 'shipped':
        return theme.palette.info.light;
      default:
        return theme.palette.warning.light;
    }
  };

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
    <Box sx={{ 
      py: 5, 
      px: 2,
      backgroundColor: theme.palette.grey[50], 
      minHeight: '100vh' 
    }}>
      <Container maxWidth="lg">
        <Box sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h4" sx={{
            fontWeight: 700,
            color: theme.palette.text.primary
          }}>
            🧾 Order Management
          </Typography>
        </Box>

        {loading ? (
          <Stack spacing={2}>
            {[...Array(5)].map((_, index) => (
              <Skeleton 
                key={index} 
                variant="rounded" 
                height={60} 
                animation="wave" 
              />
            ))}
          </Stack>
        ) : (
          <Paper elevation={3} sx={{
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: theme.palette.background.paper,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <TableContainer>
              <Table>
                <TableHead sx={{
                  backgroundColor: theme.palette.grey[100]
                }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Order #</TableCell>
                    {!isMobile && <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>}
                    <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Stack alignItems="center" spacing={1}>
                          <ShoppingCartIcon sx={{ fontSize: 48, color: theme.palette.grey[400] }} />
                          <Typography variant="body1" color="text.secondary">
                            No orders found.
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow
                        key={order._id}
                        hover
                        sx={{
                          '&:hover': { backgroundColor: theme.palette.action.hover },
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            #{order._id.slice(-6).toUpperCase()}
                          </Typography>
                        </TableCell>
                        {!isMobile && (
                          <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar 
                                src={order.customer?.avatar} 
                                alt={order.customer?.name}
                                sx={{ width: 36, height: 36 }}
                              >
                                {order.customer?.name?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography fontWeight={500}>
                                  {order.customer?.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {order.customer?.email}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                        )}
                        <TableCell>
                          <Typography fontWeight={500}>
                            ${order.amount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(order.status)}
                            label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            size="small"
                            sx={{
                              backgroundColor: getStatusColor(order.status),
                              color: theme.palette.getContrastText(getStatusColor(order.status)),
                              fontWeight: 500,
                              textTransform: 'capitalize',
                              px: 1.5
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(order.orderDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View order details">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/orders/${order._id}`);
                              }}
                              sx={{
                                color: theme.palette.primary.main
                              }}
                              size="small"
                            >
                              <ArrowForwardIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default OrderList;
