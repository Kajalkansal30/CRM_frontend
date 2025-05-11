import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Layout from './components/ui/Layout';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import CustomerList from './pages/CustomerList';
import CustomerDetail from './pages/CustomerDetail';
import AddCustomer from './pages/AddCustomer';
import SegmentList from './pages/SegmentList';
import SegmentBuilder from './pages/SegmentBuilder';
import SegmentDetail from './pages/SegmentDetail';
import CampaignList from './pages/CampaignList';
import CampaignBuilder from './pages/CampaignBuilder';
import Dashboard from './pages/Dashboard';
import MinimalGoogleLoginTest from './components/auth/MinimalGoogleLoginTest';
import OrderList from './pages/OrderList';
import OrderBuilder from './pages/OrderBuilder';
import OrderDetail from './pages/OrderDetail';
import CampaignDetails from './pages/CampaignDetails';
const queryClient = new QueryClient();

const App = () => {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/google-login-test" element={<MinimalGoogleLoginTest />} />
              <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/customers" element={<CustomerList />} />
                <Route path="/customers/new" element={<AddCustomer />} />
                <Route path="/customers/:id" element={<CustomerDetail />} />
                <Route path="/segments" element={<SegmentList />} />
                <Route path="/segments/new" element={<SegmentBuilder />} />
                <Route path="/segments/:id" element={<SegmentDetail />} />
                <Route path="/campaigns" element={<CampaignList />} />
                <Route path="/campaigns/new" element={<CampaignBuilder />} />
                <Route path="/campaigns/:id/edit" element={<CampaignBuilder />} />
                <Route path="/campaigns/:id" element={<CampaignDetails />} />
                <Route path="/orders" element={<OrderList />} />
                <Route path="/orders/new" element={<OrderBuilder />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
              </Route>
              <Route path="*" element={<Navigate to="/auth/callback" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
