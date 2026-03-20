export const formatTime = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date));
};
