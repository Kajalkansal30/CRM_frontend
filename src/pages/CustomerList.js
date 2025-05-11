import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, TextField, InputAdornment,
  Skeleton, Avatar, Chip, useTheme, useMediaQuery, Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  MonetizationOn as MonetizationOnIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  ShoppingBasket as ShoppingBasketIcon
} from '@mui/icons-material';
import axios from '../api/axios';

const CustomerList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'x-auth-token': token
          }
        };
        
        const res = await axios.get('/customers', config);
        setCustomers(res.data);
        setFilteredCustomers(res.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);

  useEffect(() => {
    const results = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm))
    );
    setFilteredCustomers(results);
    setPage(0);
  }, [searchTerm, customers]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
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

  const getActivityStatus = (lastActive) => {
    const lastActiveDate = new Date(lastActive);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return lastActiveDate > thirtyDaysAgo ? 'active' : 'inactive';
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant="h4" sx={{ 
        fontWeight: 600,
        mb: 4,
        color: theme.palette.text.primary
      }}>
        Customer Management
      </Typography>
      
      <Paper elevation={0} sx={{ 
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        mb: 3
      }}>
        <Box sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="Search customers by name, email or phone..."
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper
              }
            }}
          />
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: theme.palette.background.paper }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                {!isMobile && <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>}
                <TableCell sx={{ fontWeight: 600 }}>Total Spend</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Visits</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Activity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(rowsPerPage)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={isMobile ? 4 : 5}>
                      <Skeleton variant="rectangular" height={60} />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 4 : 5} align="center" sx={{ py: 4 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      color: theme.palette.text.secondary
                    }}>
                      <PersonIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                      <Typography variant="body1">No customers found</Typography>
                      {searchTerm && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Try adjusting your search query
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((customer) => {
                    const activityStatus = getActivityStatus(customer.lastActive);
                    return (
                      <TableRow 
                        key={customer._id}
                        hover
                        onClick={() => navigate(`/customers/${customer._id}`)}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover
                          }
                        }}
                      >
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar 
                              sx={{ 
                                width: 40, 
                                height: 40,
                                bgcolor: theme.palette.primary.main
                              }}
                            >
                              {customer.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {customer.name}
                              </Typography>
                              {isMobile && (
                                <Typography variant="caption" color="text.secondary">
                                  {customer.email}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                        </TableCell>
                        {!isMobile && (
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <EmailIcon color="action" fontSize="small" />
                                <Typography variant="body2">{customer.email}</Typography>
                              </Stack>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <PhoneIcon color="action" fontSize="small" />
                                <Typography variant="body2">
                                  {customer.phone || 'Not provided'}
                                </Typography>
                              </Stack>
                            </Stack>
                          </TableCell>
                        )}
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <MonetizationOnIcon color="action" fontSize="small" />
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              ${customer.totalSpend.toLocaleString()}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <ShoppingBasketIcon color="action" fontSize="small" />
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {customer.visits}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <AccessTimeIcon 
                              fontSize="small" 
                              color={activityStatus === 'active' ? 'success' : 'disabled'} 
                            />
                            <Box>
                              <Typography variant="body2">
                                {formatDate(customer.lastActive)}
                              </Typography>
                              <Chip
                                label={activityStatus === 'active' ? 'Active' : 'Inactive'}
                                size="small"
                                color={activityStatus === 'active' ? 'success' : 'default'}
                                variant="outlined"
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCustomers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              mt: 1.5
            }
          }}
        />
      </Paper>
    </Box>
  );
};

export default CustomerList;