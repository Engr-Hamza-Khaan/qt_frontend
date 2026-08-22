export function formatCurrency(value) {
  if (value === undefined || value === null) return '';
  const num = parseFloat(value);
  if (isNaN(num)) return '';
  const formatted = num.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `Rs ${formatted}`;
}

export function formatNumber(value) {
  if (value === undefined || value === null) return '';
  const num = parseInt(value, 10);
  return isNaN(num) ? '' : num.toLocaleString();
}

export function formatDate(date, options = {}) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
}

export function formatRelativeTime(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
