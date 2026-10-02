import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  backUrl?: string | (() => void);
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  breadcrumbs,
  backUrl,
  actions,
  children,
  className,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof backUrl === 'function') {
      backUrl();
    } else if (typeof backUrl === 'string') {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={cn('space-y-4 mb-6', className)}>
      {/* Breadcrumbs or Back Link */}
      {(backUrl || (breadcrumbs && breadcrumbs.length > 0)) && (
        <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant/80">
          {backUrl && (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer mr-2"
            >
              <ArrowLeft size={14} />
              <span>Retour</span>
            </button>
          )}

          {breadcrumbs && breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="opacity-40">/</span>}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-on-surface font-semibold">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface font-display">
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {subtitle && (
            <p className="text-sm text-on-surface-variant max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>

      {/* Optional Filter or Toolbar Slot */}
      {children && <div className="pt-2">{children}</div>}
    </div>
  );
};
