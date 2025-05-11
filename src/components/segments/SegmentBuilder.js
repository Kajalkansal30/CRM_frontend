// components/segments/SegmentBuilder.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Paper, Typography, Button, TextField, 
  FormControl, InputLabel, Select, MenuItem,
  IconButton, Divider, Grid, CircularProgress 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../../api/axios';

const ConditionBuilder = ({ condition, onChange, onDelete, isRoot }) => {
  const handleFieldChange = (e) => {
    onChange({ ...condition, field: e.target.value });
  };

  const handleOperatorChange = (e) => {
    onChange({ ...condition, operator: e.target.value });
  };

  const handleValueChange = (e) => {
    onChange({ ...condition, value: e.target.value });
  };

  if (condition.operator === 'AND' || condition.operator === 'OR') {
    return (
      <Box sx={{ border: '1px dashed #ccc', p: 2, mb: 2, borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Operator</InputLabel>
            <Select
              value={condition.operator}
              label="Operator"
              onChange={handleOperatorChange}
            >
              <MenuItem value="AND">AND</MenuItem>
              <MenuItem value="OR">OR</MenuItem>
            </Select>
          </FormControl>
          {!isRoot && (
            <IconButton color="error" onClick={onDelete}>
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
        
        {condition.conditions.map((subCondition, index) => (
          <ConditionBuilder
            key={index}
            condition={subCondition}
            onChange={(newCondition) => {
              const newConditions = [...condition.conditions];
              newConditions[index] = newCondition;
              onChange({ ...condition, conditions: newConditions });
            }}
            onDelete={() => {
              const newConditions = condition.conditions.filter((_, i) => i !== index);
              onChange({ ...condition, conditions: newConditions });
            }}
            isRoot={false}
          />
        ))}
        
        <Button
          startIcon={<AddIcon />}
          onClick={() => {
            onChange({
              ...condition,
              conditions: [
                ...condition.conditions,
                { field: 'totalSpend', operator: '>', value: 0 }
              ]
            });
          }}
          sx={{ mt: 1 }}
        >
          Add Condition
        </Button>

        <Button
          onClick={() => {
            onChange({
              ...condition,
              conditions: [
                ...condition.conditions,
                { operator: 'AND', conditions: [] }
              ]
            });
          }}
          sx={{ mt: 1, ml: 1 }}
        >
          Add Group
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
        <InputLabel>Field</InputLabel>
        <Select
          value={condition.field}
          label="Field"
          onChange={handleFieldChange}
        >
          <MenuItem value="totalSpend">Total Spend</MenuItem>
          <MenuItem value="visits">Visits</MenuItem>
          <MenuItem value="lastActive">Last Active</MenuItem>
        </Select>
      </FormControl>
      
      <FormControl size="small" sx={{ minWidth: 80, mr: 1 }}>
        <InputLabel>Operator</InputLabel>
        <Select
          value={condition.operator}
          label="Operator"
          onChange={handleOperatorChange}
        >
          <MenuItem value=">">{'>'}</MenuItem>
          <MenuItem value="<">{'<'}</MenuItem>
          <MenuItem value="=">{'='}</MenuItem>
          <MenuItem value="!=">{'!='}</MenuItem>
          <MenuItem value=">=">{'≥'}</MenuItem>
          <MenuItem value="<=">{'≤'}</MenuItem>
        </Select>
      </FormControl>
      
      <TextField
        size="small"
        label="Value"
        value={condition.value}
        onChange={handleValueChange}
        sx={{ mr: 1 }}
      />
      
      <IconButton color="error" onClick={onDelete}>
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};

const SegmentBuilder = ({ segmentId = null, initialData = null }) => {
  const [segmentName, setSegmentName] = useState(initialData ? initialData.name : '');
  const [rule, setRule] = useState(initialData ? initialData.rules : {
    operator: 'AND',
    conditions: []
  });
  const [audienceSize, setAudienceSize] = useState(null);
  const [audienceNames, setAudienceNames] = useState([]); // New state for audience names
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handlePreview = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      console.log('Preview token:', token);  // Debug log for token
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };
      
      const res = await axios.post('/segments/preview', { rules: rule }, config);
      setAudienceSize(res.data.audienceSize);
      setAudienceNames(res.data.sampleCustomers.map(cust => cust.name)); // Set audience names
    } catch (err) {
      setError('Failed to preview segment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!segmentName.trim()) {
      setError('Segment name is required');
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };

      let response;
      if (segmentId) {
        // Update existing segment
        response = await axios.put(`/segments/${segmentId}`, {
          name: segmentName,
          rules: rule
        }, config);
      } else {
        // Create new segment
        response = await axios.post('/segments', {
          name: segmentName,
          rules: rule
        }, config);
      }
      
      // Use the response data (created or updated segment)
      console.log('Segment saved:', response.data);
      
      // Navigate to segment list page after saving
      navigate('/segments');
    } catch (err) {
      console.log('Error response:', err.response);
      if (err.response && err.response.data && err.response.data.errors) {
        const duplicateNameError = err.response.data.errors.find(e => e.msg.trim().toLowerCase() === 'segment name already exists');
        if (duplicateNameError) {
          console.log('Setting duplicate name error');
          setError('Segment name already exists');
        } else {
          setError('Failed to save segment');
        }
      } else {
        setError('Failed to save segment');
      }
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create Customer Segment
      </Typography>
      
      <TextField
        fullWidth
        label="Segment Name"
        value={segmentName}
        onChange={(e) => setSegmentName(e.target.value)}
        margin="normal"
        error={error === 'Segment name already exists'}
        helperText={error === 'Segment name already exists' ? error : ''}
        FormHelperTextProps={{ style: { color: 'red' } }}
      />
      
      <Box sx={{ my: 3 }}>
        <Typography variant="h6" gutterBottom>
          Define Segment Rules
        </Typography>
        
        <ConditionBuilder
          condition={rule}
          onChange={setRule}
          onDelete={() => {}}
          isRoot={true}
        />
        
        {rule.conditions.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography color="textSecondary">
              Start building your segment by adding a condition or group
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  setRule({
                    ...rule,
                    conditions: [
                      { field: 'totalSpend', operator: '>', value: 0 }
                    ]
                  });
                }}
                sx={{ mr: 1 }}
              >
                Add Condition
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => {
                  setRule({
                    ...rule,
                    conditions: [
                      { operator: 'AND', conditions: [] }
                    ]
                  });
                }}
              >
                Add Group
              </Button>
            </Box>
          </Box>
        )}
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 2 }}>
      {audienceSize !== null && !loading && (
        <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
          Estimated audience size: <strong>{audienceSize.toLocaleString()}</strong> customers
        </Typography>
      )}

      {audienceNames.length > 0 && !loading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
            Audience Name:
          </Typography>
          {audienceNames.map((name, index) => (
            <Typography key={index} variant="body2">
              - {name}
            </Typography>
          ))}
        </Box>
      )}
      
      {error && error !== 'Segment name already exists' && (
        <Typography color="error" sx={{ mb: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
    
    <Grid container spacing={2}>
      <Grid item>
        {(loading || saving) ? (
          <CircularProgress size={20} />
        ) : (
          <Box>
            <Button onClick={handlePreview} disabled={rule.conditions.length === 0}>
              Preview Audience
            </Button>
            <Button onClick={handleSave} disabled={rule.conditions.length === 0}>
              Save Segment
            </Button>
          </Box>
        )}
      </Grid>
    </Grid>
  </Paper>
);
};

export default SegmentBuilder;