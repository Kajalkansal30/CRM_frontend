import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';

const OrderBuilder = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [order, setOrder] = useState({
    customer: '',
    amount: '',
    items: '',
    status: 'pending',
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/customers', {
          headers: {
            'x-auth-token': token,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setNotification({ open: true, message: 'Failed to load customers', severity: 'error' });
      }
    };

    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrder({
      ...order,
      [name]: value,
    });
  };

  const handleSave = async () => {
    if (!order.customer || !order.amount || !order.items) {
      setNotification({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      body: JSON.stringify({
        customer: order.customer,
        amount: parseFloat(order.amount),
        items: order.items.split(',').map(item => ({
          name: item.trim(),
          price: 0,
          quantity: 1
        })),
        status: order.status,
      }),
      });

      if (!response.ok) {
        throw new Error('Failed to save order');
      }

      setLoading(false);
      setNotification({ open: true, message: 'Order saved successfully', severity: 'success' });
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (error) {
      console.error('Error saving order:', error);
      setLoading(false);
      setNotification({ open: true, message: error.message || 'Failed to save order', severity: 'error' });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="sm">
        <Typography variant="h5" gutterBottom>
          Create New Order
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Customer</InputLabel>
              <Select
                name="customer"
                value={order.customer}
                onChange={handleChange}
                label="Customer"
              >
                {customers.map((customer) => (
                  <MenuItem key={customer._id} value={customer._id}>
                    {customer.name} ({customer.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Amount"
              name="amount"
              type="number"
              fullWidth
              value={order.amount}
              onChange={handleChange}
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Items (comma separated)"
              name="items"
              fullWidth
              value={order.items}
              onChange={handleChange}
              required
              placeholder="item1, item2, item3"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={order.status}
                onChange={handleChange}
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={handleSave} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Save Order'}
            </Button>
          </Grid>
        </Grid>
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default OrderBuilder;
