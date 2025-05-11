/**
 * Filters customers based on segment rules.
 * @param {Object} rules - Segment rules object with operator and conditions.
 * @param {Array} customers - Array of customer objects.
 * @returns {Array} Filtered customers matching the rules.
 */
export function getMatchingCustomers(rules, customers) {
  if (!rules || !rules.operator || !rules.conditions) {
    return customers;
  }

  const evaluateCondition = (customer, condition) => {
    const { field, operator, value } = condition;
    const customerValue = customer[field];

    switch (operator) {
      case 'EQUALS':
        return customerValue === value;
      case 'NOT_EQUALS':
        return customerValue !== value;
      case 'GREATER_THAN':
        return customerValue > value;
      case 'LESS_THAN':
        return customerValue < value;
      case 'CONTAINS':
        return typeof customerValue === 'string' && customerValue.includes(value);
      default:
        return false;
    }
  };

  const evaluateRules = (customer, rules) => {
    const { operator, conditions } = rules;

    if (operator === 'AND') {
      return conditions.every(cond => {
        if (cond.operator && cond.conditions) {
          return evaluateRules(customer, cond);
        }
        return evaluateCondition(customer, cond);
      });
    } else if (operator === 'OR') {
      return conditions.some(cond => {
        if (cond.operator && cond.conditions) {
          return evaluateRules(customer, cond);
        }
        return evaluateCondition(customer, cond);
      });
    }
    return false;
  };

  return customers.filter(customer => evaluateRules(customer, rules));
}
