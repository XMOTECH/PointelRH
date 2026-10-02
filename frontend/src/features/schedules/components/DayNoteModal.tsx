import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DayNoteModalProps {
  isOpen: boolean;
  dateStr: string;
  initialNote?: string;
  onClose: () => void;
  onSave: (dateStr: string, note: string) => void;
  onDelete?: (dateStr: string) => void;
}

const QUICK_EMOJIS = ['🍸', '😍', '👨‍🍳', '⚠️', '🎉', '📦', '🧹', '⭐'];

export const DayNoteModal: React.FC<DayNoteModalProps> = ({
  isOpen,
  dateStr,
  initialNote = '',
  onClose,
  onSave,
  onDelete,
}) => {
  const [note, setNote] = useState(initialNote);

  useEffect(() => {
    setNote(initialNote);
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  const dateObj = new Date(dateStr + 'T00:00:00');
  const formattedDate = isNaN(dateObj.getTime())
    ? dateStr
    : format(dateObj, 'EEEE d MMMM yyyy', { locale: fr });

  const handleEmojiClick = (emoji: string) => {
    setNote((prev) => `${emoji} ${prev.replace(/^[\p{Emoji}\u200d]+\s*/u, '')}`.trim());
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Note de journée"
      subtitle={`Pour le ${formattedDate}`}
      className="sm:max-w-md"
    >
      <div className="space-y-4">

        {/* Emojis rapides */}
        <div>
          <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
            Icône rapide :
          </span>
          <div className="flex items-center gap-1.5">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm flex items-center justify-center transition-colors cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Saisie de la note */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Intitulé de l'événement ou consigne :
          </label>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex : Soirée cocktail, Visite d'audit, Rush du soir..."
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          {initialNote && onDelete ? (
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => {
                onDelete(dateStr);
                onClose();
              }}
              className="text-rose-600 hover:bg-rose-50"
            >
              Supprimer
            </Button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button variant="tertiary" size="sm" onClick={onClose}>
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onSave(dateStr, note.trim());
                onClose();
              }}
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
