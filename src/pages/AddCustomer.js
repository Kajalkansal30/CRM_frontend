import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from '../api/axios';

const AddCustomer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    totalSpend: 0,
    visits: 0,
    lastActive: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };
      await axios.post('/customers', formData, config);
      navigate('/customers');
    } catch (err) {
      setError('Failed to add customer. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Add New Customer
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Total Spend"
                name="totalSpend"
                type="number"
                value={formData.totalSpend}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Visits"
                name="visits"
                type="number"
                value={formData.visits}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Last Active Date"
                name="lastActive"
                type="date"
                value={formData.lastActive}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Add Customer'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddCustomer;
