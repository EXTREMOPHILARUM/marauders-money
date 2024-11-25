export const formatCurrency = (amount: number, currency: string = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (timestamp: number, format: 'short' | 'long' = 'short') => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: format === 'short' ? 'short' : 'long',
    day: 'numeric',
  });
};
