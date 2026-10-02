import React from 'react';

export type NumberFormatType =
  | 'duration'          // 35 h, 37h30, 0 h
  | 'currency'          // 150 000 FCFA
  | 'percentage'        // 100 %, 85,5 %
  | 'count'             // 7, 1 500
  | 'decimal';          // 12,50

export interface FormattedNumberProps {
  /** Valeur numérique ou chaîne convertible */
  value: number | string | null | undefined;
  /** Type de formatage sémantique */
  type?: NumberFormatType;
  /** Devise si type="currency" (défaut: FCFA) */
  currency?: string;
  /** Nombre de décimales (optionnel) */
  decimals?: number;
  /** Comportement lorsque la valeur est égale à 0 */
  zeroDisplay?: 'standard' | 'dash' | 'dimmed';
  /** Unité additionnelle personnalisée (ex: "pers.", "jours") */
  unit?: string;
  /** Afficher le signe positif (+ / -) */
  showSign?: boolean;
  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Moteur de formatage universel basé sur l'API native ECMAScript Intl.NumberFormat
 * Garantit les espaces insécables typographiques et le respect de la locale française.
 */
function formatNumberValue({
  val,
  type,
  currency = 'FCFA',
  decimals,
  unit,
  showSign = false,
}: {
  val: number;
  type: NumberFormatType;
  currency?: string;
  decimals?: number;
  unit?: string;
  showSign?: boolean;
}): string {
  // 1. Formatage Durée (WFM, Planning, Pointage)
  if (type === 'duration') {
    if (val === 0) return '0\u00A0h';
    const sign = val < 0 ? '-' : showSign ? '+' : '';
    const absVal = Math.abs(val);
    const h = Math.floor(absVal);
    const m = Math.round((absVal - h) * 60);

    if (m === 0) {
      return `${sign}${h}\u00A0h`;
    }
    return `${sign}${h}h${m.toString().padStart(2, '0')}`;
  }

  // 2. Formatage Devise (Paie, Salaires, Primes)
  if (type === 'currency') {
    const formatted = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: decimals ?? 0,
      maximumFractionDigits: decimals ?? 2,
    }).format(val);
    return `${formatted}\u00A0${currency}`;
  }

  // 3. Formatage Pourcentage (Taux, KPI conformité)
  if (type === 'percentage') {
    const formatted = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: decimals ?? (Number.isInteger(val) ? 0 : 1),
      maximumFractionDigits: decimals ?? 2,
    }).format(val);
    return `${formatted}\u00A0%`;
  }

  // 4. Nombre entier / Comptage (Collaborateurs, créneaux)
  if (type === 'count') {
    const formatted = new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
    }).format(Math.round(val));
    return unit ? `${formatted}\u00A0${unit}` : formatted;
  }

  // 5. Décimal classique
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 2,
  }).format(val);

  return unit ? `${formatted}\u00A0${unit}` : formatted;
}

/**
 * Composant FormattedNumber
 * Normalise tous les chiffres de l'application avec la typographie tabular-nums professionnelle.
 */
export const FormattedNumber: React.FC<FormattedNumberProps> = ({
  value,
  type = 'count',
  currency = 'FCFA',
  decimals,
  zeroDisplay = 'standard',
  unit,
  showSign = false,
  className = '',
}) => {
  const numericValue =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
      ? parseFloat(value)
      : null;

  // Cas valeur manquante ou invalide
  if (numericValue === null || isNaN(numericValue)) {
    return (
      <span className={`inline-block tabular-nums text-slate-400 font-mono ${className}`}>
        —
      </span>
    );
  }

  const isZero = Math.abs(numericValue) < 0.0001;

  // Cas où la valeur est zéro avec tiret cadratin demandé
  if (isZero && zeroDisplay === 'dash') {
    return (
      <span className={`inline-block tabular-nums text-slate-400 font-mono ${className}`}>
        —
      </span>
    );
  }

  const formattedText = formatNumberValue({
    val: numericValue,
    type,
    currency,
    decimals,
    unit,
    showSign,
  });

  const dimmedClass = isZero && zeroDisplay === 'dimmed' ? 'text-slate-400 font-normal' : '';

  return (
    <span className={`inline-block tabular-nums font-mono ${dimmedClass} ${className}`}>
      {formattedText}
    </span>
  );
};
