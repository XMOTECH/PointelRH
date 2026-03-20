import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (dateString: string, dateFormat = 'dd MMM yyyy') => {
  if (!dateString) return '';
  return format(parseISO(dateString), dateFormat, { locale: fr });
};

export const formatTime = (dateString: string) => {
  if (!dateString) return '';
  return format(parseISO(dateString), 'HH:mm', { locale: fr });
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF', // Or EUR depending on your region
  }).format(amount);
};
