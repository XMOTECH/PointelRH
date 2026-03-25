import { AlertTriangle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface Props {
  open: boolean;
  siteName: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteSiteDialog({ open, siteName, onClose, onConfirm, isLoading }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface w-full max-w-sm rounded-2xl shadow-2xl border border-on-surface/5 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-500" />
          </div>
          <h3 className="text-lg font-display font-bold text-on-surface">Supprimer ce site ?</h3>
          <p className="text-sm text-on-surface-variant">
            Le site <strong>{siteName}</strong> et son terminal QR seront définitivement supprimés. Cette action est irréversible.
          </p>
          <div className="flex gap-3 w-full pt-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>Annuler</Button>
            <Button variant="danger" className="flex-1" onClick={onConfirm} isLoading={isLoading}>Supprimer</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
