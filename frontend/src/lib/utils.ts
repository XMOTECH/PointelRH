import { clsx, type ClassValue } from 'clsx';

/**
 * Utility: cn()
 * Combines class names conditionally using clsx.
 * Single source of truth — import from here everywhere.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
