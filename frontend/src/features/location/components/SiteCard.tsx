import { MapPin, Pencil, Trash2, QrCode } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Site } from '../api/locations.api';

interface Props {
  site: Site;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function SiteCard({ site, isSelected, onSelect, onEdit, onDelete }: Props) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'group p-4 rounded-xl cursor-pointer transition-all border',
        isSelected
          ? 'bg-primary/5 border-primary shadow-sm'
          : 'bg-surface-container-low border-transparent hover:bg-surface-container hover:border-on-surface/5'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={14} className={isSelected ? 'text-primary' : 'text-on-surface-variant'} />
            <span className="text-sm font-bold text-on-surface truncate">{site.name}</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${site.is_active ? 'bg-emerald-500' : 'bg-red-400'}`} />
              <span className="text-[10px] font-bold uppercase text-on-surface-variant">
                {site.is_active ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-on-surface-variant">
              <QrCode size={10} />
              <span className="text-[10px] font-bold uppercase">Terminal QR</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => { e.stopPropagation(); onEdit(); }}
            className="p-1.5 rounded-lg hover:bg-on-surface/5 text-on-surface-variant hover:text-primary transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-on-surface-variant hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
