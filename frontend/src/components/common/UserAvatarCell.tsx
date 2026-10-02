import React from 'react';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../lib/utils';

export interface UserAvatarCellProps {
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  status?: 'online' | 'offline' | 'busy' | 'away';
  onClick?: () => void;
  className?: string;
}

export const UserAvatarCell: React.FC<UserAvatarCellProps> = ({
  name,
  firstName,
  lastName,
  avatarUrl,
  subtitle,
  badge,
  size = 'md',
  status,
  onClick,
  className,
}) => {
  const fullName = name || `${firstName || ''} ${lastName || ''}`.trim() || 'Collaborateur';

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 min-w-0',
        onClick && 'cursor-pointer group',
        className
      )}
    >
      <Avatar
        src={avatarUrl}
        name={fullName}
        firstName={firstName}
        lastName={lastName}
        size={size}
        status={status}
      />
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-semibold text-on-surface truncate text-xs sm:text-sm',
              onClick && 'group-hover:text-primary transition-colors'
            )}
          >
            {fullName}
          </span>
          {badge}
        </div>
        {subtitle && (
          <div className="text-xs text-on-surface-variant/80 truncate mt-0.5">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
