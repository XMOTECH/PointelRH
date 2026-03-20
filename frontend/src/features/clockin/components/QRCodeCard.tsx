/**
 * Component: QRCodeCard
 * Affiche le QR Code avec l'ID utilisateur
 */

import { Scan } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { SPACING, COLORS, BORDER_RADIUS, QR_CONFIG, TEXT_LIMITS } from '../constants';

interface QRCodeCardProps {
  qrValue: string;
  userId: string | undefined;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({ qrValue, userId }) => {
  const displayUserId = userId?.substring(0, TEXT_LIMITS.userIdDisplayLength) ?? 'N/A';

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.lg,
      }}
    >
      {/* QR Code Container */}
      <div
        style={{
          padding: SPACING.md,
          backgroundColor: COLORS.white,
          borderRadius: BORDER_RADIUS.md,
          border: `1px solid ${COLORS.borderLight}`,
          boxShadow: COLORS.shadowSm,
        }}
      >
        <QRCodeSVG
          value={qrValue}
          size={QR_CONFIG.size}
          level={QR_CONFIG.level}
        />
      </div>

      {/* User ID Display */}
      <div
        style={{
          marginTop: SPACING.md,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          gap: SPACING.xs,
          color: COLORS.textMuted,
        }}
      >
        <Scan size={18} />
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          ID: {displayUserId}...
        </span>
      </div>
    </div>
  );
};
