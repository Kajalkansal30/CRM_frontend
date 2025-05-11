import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, CircularProgress, Grid,
  List, ListItem, ListItemText, Divider, Select, MenuItem,
  FormControl, InputLabel, Chip, Stack
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import axios from '../api/axios';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`/orders/${id}`, {
          headers: { 'x-auth-token': token },
        });
        setOrder(res.data);
        setStatus(res.data.status);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleUpdateClick = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `/orders/${id}/status`,
        { status },
        {
          headers: { 'x-auth-token': token },
        }
      );
      if (response.status === 200) {
        setOrder((prevOrder) => ({ ...prevOrder, status }));
        navigate('/orders', { state: { updatedOrderId: id, updatedStatus: status } });
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'sent': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Order not found</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/orders')}>
          <ArrowBack sx={{ mr: 1 }} />
          Back to Orders
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={() => navigate('/orders')}
        sx={{ mb: 3 }}
      >
        Back to Orders
      </Button>

      <Paper elevation={4} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Order #{order.orderNumber || order._id}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>Order Date</Typography>
            <Typography variant="body1">{new Date(order.orderDate).toLocaleString()}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>Status</Typography>
            <Chip
              label={status}
              color={getStatusColor(status)}
              sx={{ textTransform: 'capitalize' }}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="status-label">Update Status</InputLabel>
              <Select
                labelId="status-label"
                id="status-select"
                value={status}
                label="Update Status"
                onChange={handleStatusChange}
                sx={{ textTransform: 'capitalize' }}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleUpdateClick}>
              Save Status
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>Total Amount</Typography>
            <Typography variant="body1">${order.amount.toFixed(2)}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>Customer Information</Typography>
            <Typography variant="body1">
              {order.customer?.name} &nbsp; (<i>{order.customer?.email}</i>)
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Items Ordered</Typography>
            {order.items && order.items.length > 0 ? (
              <List disablePadding>
                {order.items.map((item, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={`${item.name} × ${item.quantity}`}
                      secondary={`$${item.price.toFixed(2)} each`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">No items found</Typography>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default OrderDetail;
