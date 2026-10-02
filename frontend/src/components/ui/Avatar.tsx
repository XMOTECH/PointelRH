import React, { useState } from 'react';
import { cn } from '../../lib/utils';

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}

const PASTEL_PALETTES = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-violet-100 text-violet-700 border-violet-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-sky-100 text-sky-700 border-sky-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-rose-100 text-rose-700 border-rose-200',
];

function getPaletteFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PASTEL_PALETTES.length;
  return PASTEL_PALETTES[index];
}

function getInitials(name?: string | null, first?: string | null, last?: string | null): string {
  if (first || last) {
    const f = (first || '').trim().charAt(0);
    const l = (last || '').trim().charAt(0);
    return `${f}${l}`.toUpperCase() || 'U';
  }
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  firstName,
  lastName,
  size = 'md',
  status,
  className,
}) => {
  const [imageError, setImageError] = useState(false);

  const fullName = name || `${firstName || ''} ${lastName || ''}`.trim() || 'Utilisateur';
  const initials = getInitials(name, firstName, lastName);
  const colorStyle = getPaletteFromName(fullName);

  const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm font-semibold',
    lg: 'h-12 w-12 text-base font-bold',
    xl: 'h-16 w-16 text-xl font-bold',
  };

  const statusSizeClasses = {
    xs: 'h-1.5 w-1.5 ring-1',
    sm: 'h-2 w-2 ring-1.5',
    md: 'h-2.5 w-2.5 ring-2',
    lg: 'h-3 w-3 ring-2',
    xl: 'h-4 w-4 ring-2',
  };

  const statusColorClasses = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    busy: 'bg-rose-500',
    away: 'bg-amber-500',
  };

  return (
    <div className={cn('relative inline-flex shrink-0 select-none items-center justify-center', className)}>
      <div
        className={cn(
          'relative flex items-center justify-center overflow-hidden rounded-full border tracking-tight',
          sizeClasses[size],
          colorStyle
        )}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={fullName}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-white',
            statusSizeClasses[size],
            statusColorClasses[status]
          )}
        />
      )}
    </div>
  );
};
