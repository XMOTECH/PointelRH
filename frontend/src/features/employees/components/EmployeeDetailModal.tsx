import { useState } from 'react';
import { X, User, Building2, Calendar, QrCode, ScanFace, KeyRound, Mail, Loader2, FileText, Printer } from 'lucide-react';
import type { Employee } from '../types';
import { Badge } from '../../../components/ui/Badge';
import { FaceEnrollmentModal } from './FaceEnrollmentModal';
import { useFaceEnrollmentStatus } from '../hooks/useFaceEnrollment';
import { useGeneratePin } from '../hooks/useGeneratePin';
import api from '../../../lib/axios';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
}

function getDeptName(department: Employee['department']): string {
  if (!department) return 'Non assigné';
  if (typeof department === 'string') return department;
  return department.name;
}

function getStatusBadge(status: Employee['status']) {
  switch (status) {
    case 'active': return <Badge variant="success" className="uppercase tracking-tighter text-[9px]">Actif</Badge>;
    case 'suspended': return <Badge variant="warning" className="uppercase tracking-tighter text-[9px]">Suspendu</Badge>;
    case 'inactive': return <Badge variant="error" className="uppercase tracking-tighter text-[9px]">Inactif</Badge>;
    default: return <Badge variant="default" className="uppercase tracking-tighter text-[9px]">{status}</Badge>;
  }
}

const contractLabels: Record<string, string> = {
  cdi: 'CDI',
  cdd: 'CDD',
  freelance: 'Freelance',
  intern: 'Stagiaire',
};

const roleLabels: Record<string, string> = {
  admin: 'Administrateur',
  manager: 'Manager',
  employee: 'Employé',
};

export function EmployeeDetailModal({ open, onClose, employee }: Props) {
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const { data: faceStatus } = useFaceEnrollmentStatus(employee?.id);
  const generatePin = useGeneratePin();

  if (!open || !employee) return null;

  const sectionClass = 'flex flex-col gap-3';
  const fieldClass = 'flex justify-between items-center';
  const labelClass = 'text-xs font-bold text-on-surface-variant';
  const valueClass = 'text-sm font-medium text-on-surface';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl border border-on-surface/5 overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-on-surface/5">
          <h2 className="text-lg font-display font-bold text-on-surface">Détails de l'employé</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Avatar + Name + Status */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary font-bold text-xl">
              {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xl font-bold text-on-surface">{employee.first_name} {employee.last_name}</span>
              {getStatusBadge(employee.status)}
            </div>
          </div>

          {/* Infos personnelles */}
          <div className={sectionClass}>
            <div className="flex items-center gap-2 text-primary mb-1">
              <User size={14} />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Informations personnelles</span>
            </div>
            <div className={fieldClass}>
              <span className={labelClass}>Email</span>
              <span className={valueClass}>{employee.email}</span>
            </div>
            {employee.phone && (
              <div className={fieldClass}>
                <span className={labelClass}>Téléphone</span>
                <span className={valueClass}>{employee.phone}</span>
              </div>
            )}
          </div>

          <hr className="border-on-surface/5" />

          {/* Structure */}
          <div className={sectionClass}>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Building2 size={14} />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Structure</span>
            </div>
            <div className={fieldClass}>
              <span className={labelClass}>Département</span>
              <span className={valueClass}>{getDeptName(employee.department)}</span>
            </div>
            <div className={fieldClass}>
              <span className={labelClass}>Rôle</span>
              <span className={valueClass}>{roleLabels[employee.role] || employee.role}</span>
            </div>
            {employee.contract_type && (
              <div className={fieldClass}>
                <span className={labelClass}>Type de contrat</span>
                <span className={valueClass}>{contractLabels[employee.contract_type] || employee.contract_type}</span>
              </div>
            )}
          </div>

          <hr className="border-on-surface/5" />

          {/* Dates */}
          <div className={sectionClass}>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Calendar size={14} />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Dates</span>
            </div>
            {employee.hire_date && (
              <div className={fieldClass}>
                <span className={labelClass}>Date d'embauche</span>
                <span className={valueClass}>{new Date(employee.hire_date).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
            {employee.created_at && (
              <div className={fieldClass}>
                <span className={labelClass}>Créé le</span>
                <span className={valueClass}>{new Date(employee.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
          </div>

          {/* QR Token */}
          {employee.qr_token && (
            <>
              <hr className="border-on-surface/5" />
              <div className={sectionClass}>
                <div className="flex items-center gap-2 text-primary mb-1">
                  <QrCode size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em]">QR Token</span>
                </div>
                <div className="px-3 py-2 bg-surface-container-low rounded-lg">
                  <code className="text-xs text-on-surface-variant font-mono break-all">{employee.qr_token}</code>
                </div>
              </div>
            </>
          )}

          {/* Acces & Credentials */}
          <hr className="border-on-surface/5" />
          <div className={sectionClass}>
            <div className="flex items-center gap-2 text-primary mb-1">
              <KeyRound size={14} />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Accès & Code PIN Kiosque</span>
            </div>

            {((employee as any).pinCode || (employee as any).pin_code) ? (
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-surface-container-low rounded-xl border border-on-surface/10 mb-2">
                <span className="text-xs text-on-surface-variant font-medium">Code PIN actuel :</span>
                <span className="text-base font-mono font-bold tracking-widest text-primary">
                  {(employee as any).pinCode || (employee as any).pin_code}
                </span>
              </div>
            ) : (
              <div className="px-3.5 py-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-700 text-xs font-medium mb-2">
                Aucun code PIN attribué. L'employé ne peut pas pointer sur le kiosque.
              </div>
            )}

            <p className="text-xs text-on-surface-variant mb-2">
              Générer un nouveau code PIN à 4 chiffres et l'envoyer par email à l'employé pour le pointage sur borne Kiosque.
            </p>
            <button
              onClick={() => generatePin.mutate(employee.id)}
              disabled={generatePin.isPending || !employee.email}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-primary/20 bg-primary/5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {generatePin.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Mail size={16} />
              )}
              {generatePin.isPending ? 'Génération en cours...' : 'Générer & Envoyer PIN par email'}
            </button>
            {!employee.email && (
              <p className="text-xs text-red-500 mt-1">Cet employé n'a pas d'adresse email configurée.</p>
            )}
          </div>

          {/* Reconnaissance Faciale */}
          <hr className="border-on-surface/5" />
          <div className={sectionClass}>
            <div className="flex items-center gap-2 text-primary mb-1">
              <ScanFace size={14} />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Reconnaissance Faciale</span>
            </div>
            <div className={fieldClass}>
              <span className={labelClass}>Statut</span>
              <span className={valueClass}>
                {faceStatus?.enrolled ? (
                  <Badge variant="success" className="uppercase tracking-tighter text-[9px]">Enregistré ({faceStatus.count})</Badge>
                ) : (
                  <Badge variant="default" className="uppercase tracking-tighter text-[9px]">Non enregistré</Badge>
                )}
              </span>
            </div>
            <button
              onClick={() => setFaceModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-primary/20 bg-primary/5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              <ScanFace size={16} />
              {faceStatus?.enrolled ? 'Gérer le visage' : 'Enregistrer le visage'}
            </button>
          </div>

          {/* Documents Administratifs */}
          <hr className="border-on-surface/5" />
          <div className={sectionClass}>
            <div className="flex items-center gap-2 text-primary mb-1">
              <FileText size={14} />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Documents de Sortie (Sénégal)</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  try {
                    const response = await api.get(`/api/employees/${employee.id}/documents/work-certificate`, {
                      responseType: 'blob',
                    });
                    const blob = new Blob([response.data], { type: response.headers['content-type'] || 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const printWindow = window.open(url, '_blank');
                    if (!printWindow) {
                      toast.error("Veuillez autoriser les fenêtres surgissantes pour imprimer.");
                    }
                  } catch (err) {
                    toast.error("Erreur lors de la génération du certificat.");
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-on-surface/10 bg-surface-container-low text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
              >
                <Printer size={13} />
                Certificat de Travail
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await api.get(`/api/employees/${employee.id}/documents/solde-de-tout-compte`, {
                      responseType: 'blob',
                    });
                    const blob = new Blob([response.data], { type: response.headers['content-type'] || 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const printWindow = window.open(url, '_blank');
                    if (!printWindow) {
                      toast.error("Veuillez autoriser les fenêtres surgissantes pour imprimer.");
                    }
                  } catch (err) {
                    toast.error("Erreur lors de la génération du solde de tout compte.");
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-on-surface/10 bg-surface-container-low text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
              >
                <Printer size={13} />
                Reçu STC
              </button>
            </div>
          </div>

          {/* Close button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>

        {/* Face Enrollment Modal */}
        <FaceEnrollmentModal
          open={faceModalOpen}
          onClose={() => setFaceModalOpen(false)}
          employeeId={employee.id}
          employeeName={`${employee.first_name} ${employee.last_name}`}
        />
      </div>
    </div>
  );
}
