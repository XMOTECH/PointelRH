import React from 'react';
import { cn } from '@/lib/utils';

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-xs font-black uppercase tracking-widest text-on-surface-variant/70 ml-1",
        className
      )}
      {...props}
    />
  );
}
