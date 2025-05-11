import React, { useState } from 'react';
import { Box, Button, Typography, Paper, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

// Simple visual rule block component
const RuleBlock = ({ rule, onChange, onRemove }) => {
  const handleFieldChange = (e) => {
    onChange({ ...rule, field: e.target.value });
  };
  const handleOperatorChange = (e) => {
    onChange({ ...rule, operator: e.target.value });
  };
  const handleValueChange = (e) => {
    onChange({ ...rule, value: e.target.value });
  };

  return (
    <Paper variant="outlined" sx={{ p: 1, mb: 1, display: 'flex', alignItems: 'center' }}>
      <input
        type="text"
        placeholder="Field"
        value={rule.field}
        onChange={handleFieldChange}
        style={{ marginRight: 8 }}
      />
      <select value={rule.operator} onChange={handleOperatorChange} style={{ marginRight: 8 }}>
        <option value="&gt;">&gt;</option>
        <option value="&lt;">&lt;</option>
        <option value="=">=</option>
        <option value="!=">!=</option>
      </select>
      <input
        type="text"
        placeholder="Value"
        value={rule.value}
        onChange={handleValueChange}
        style={{ marginRight: 8 }}
      />
      <IconButton onClick={onRemove} size="small" color="error">
        <RemoveCircleOutlineIcon />
      </IconButton>
    </Paper>
  );
};

const VisualRuleBuilder = ({ rules, setRules }) => {
  const [operator, setOperator] = useState(rules.operator || 'AND');

  const handleAddRule = () => {
    const newCondition = { field: '', operator: '>', value: '' };
    setRules({
      operator,
      conditions: [...(rules.conditions || []), newCondition],
    });
  };

  const handleRuleChange = (index, updatedRule) => {
    const newConditions = [...rules.conditions];
    newConditions[index] = updatedRule;
    setRules({ operator, conditions: newConditions });
  };

  const handleRuleRemove = (index) => {
    const newConditions = [...rules.conditions];
    newConditions.splice(index, 1);
    setRules({ operator, conditions: newConditions });
  };

  const handleOperatorChange = (e) => {
    setOperator(e.target.value);
    setRules({ operator: e.target.value, conditions: rules.conditions });
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Combine conditions with:
      </Typography>
      <select value={operator} onChange={handleOperatorChange} style={{ marginBottom: 16 }}>
        <option value="AND">AND</option>
        <option value="OR">OR</option>
      </select>
      {rules.conditions && rules.conditions.map((rule, idx) => (
        <RuleBlock
          key={idx}
          rule={rule}
          onChange={(updatedRule) => handleRuleChange(idx, updatedRule)}
          onRemove={() => handleRuleRemove(idx)}
        />
      ))}
      <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={handleAddRule}>
        Add Condition
      </Button>
    </Box>
  );
};

export default VisualRuleBuilder;
