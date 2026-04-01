import { clsx, type ClassValue } from 'clsx';

/**
 * Utility: cn()
 * Combines class names conditionally using clsx.
 * Single source of truth — import from here everywhere.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
