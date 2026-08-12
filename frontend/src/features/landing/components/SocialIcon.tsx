import { cn } from '@/lib/utils';

interface SocialIconProps {
  spriteId: string;
  size?: number;
  className?: string;
}

export function SocialIcon({ spriteId, size = 16, className }: SocialIconProps) {
  return (
    <svg
      width={size}
      height={size}
      className={cn('[&_path]:fill-current', className)}
      aria-hidden="true"
    >
      <use href={`/icons.svg#${spriteId}`} />
    </svg>
  );
}
