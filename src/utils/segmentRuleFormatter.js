/**
 * Utility to convert segment rules object into a human-readable logical expression string.
 */

const formatRule = (rule) => {
  if (!rule) return '';

  if (rule.operator === 'AND' || rule.operator === 'OR') {
    const conditions = rule.conditions || [];
    const formattedConditions = conditions.map(formatRule).filter(Boolean);
    return '(' + formattedConditions.join(` ${rule.operator} `) + ')';
  } else {
    // Simple condition
    const field = rule.field || '';
    const operator = rule.operator || '';
    const value = rule.value !== undefined ? rule.value : '';
    return `${field} ${operator} ${value}`;
  }
};

export default formatRule;
