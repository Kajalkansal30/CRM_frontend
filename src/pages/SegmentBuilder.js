// pages/SegmentBuilder.js
import React from 'react';
// import axios from '../../api/axios'; // Update this import
import { Box, Container } from '@mui/material';
import SegmentBuilderComponent from '../components/segments/SegmentBuilder';

const SegmentBuilder = () => {
  return (
    <Box>
      <Container maxWidth="lg">
        <SegmentBuilderComponent />
      </Container>
    </Box>
  );
};

export default SegmentBuilder;