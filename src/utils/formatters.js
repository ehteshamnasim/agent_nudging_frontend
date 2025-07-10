export const formatDate = (dateString) => {
 if (!dateString) return 'Never';
 return new Date(dateString).toLocaleString();
};

export const formatRelativeTime = (dateString) => {
 if (!dateString) return 'Never';
 
 const date = new Date(dateString);
 const now = new Date();
 const diffInMinutes = Math.floor((now - date) / (1000 * 60));
 
 if (diffInMinutes < 1) return 'Just now';
 if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
 
 const diffInHours = Math.floor(diffInMinutes / 60);
 if (diffInHours < 24) return `${diffInHours}h ago`;
 
 const diffInDays = Math.floor(diffInHours / 24);
 return `${diffInDays}d ago`;
};

export const formatNumber = (num) => {
 if (num >= 1000000) {
   return (num / 1000000).toFixed(1) + 'M';
 }
 if (num >= 1000) {
   return (num / 1000).toFixed(1) + 'K';
 }
 return num.toString();
};

export const formatPercentage = (decimal) => {
 return `${(decimal * 100).toFixed(1)}%`;
};
