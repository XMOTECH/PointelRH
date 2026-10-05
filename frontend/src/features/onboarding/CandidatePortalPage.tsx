import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { useCandidateSession, useSubmitCandidateData, useUploadCandidateDocument } from './hooks/useOnboarding';
import { toast } from 'sonner';

import { PortalHeader } from './portal/PortalHeader';
import { PortalLiveMirror } from './portal/PortalLiveMirror';
import { IdentityStep } from './portal/steps/IdentityStep';
import { CompensationStep } from './portal/steps/CompensationStep';
import { DocumentsStep } from './portal/steps/DocumentsStep';
import { SuccessStep } from './portal/steps/SuccessStep';
import type { CandidateFormData, UploadedDocMeta } from './portal/types';

function calculateSenegalTaxParts(maritalStatus: string, childrenCount: number): number {
  let base = maritalStatus === 'married' ? 1.5 : 1.0;
  base += Math.max(0, childrenCount) * 0.5;
  return Math.min(5.0, base);
}

export const CandidatePortalPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [paymentMode, setPaymentMode] = useState<'bank' | 'mobile'>('bank');
  const [showMobilePreview, setShowMobilePreview] = useState<boolean>(false);

  const { data: session, isLoading, isError } = useCandidateSession(token);
  const submitData = useSubmitCandidateData(token || '');
  const uploadDoc = useUploadCandidateDocument(token || '');

  const [formData, setFormData] = useState<CandidateFormData>({
    birthDate: '1995-01-01',
    birthPlace: 'Dakar',
    nationality: 'Sénégalaise',
    gender: 'male',
    nationalIdNumber: '',
    address: '',
    maritalStatus: 'single',
    childrenCount: 0,
    bankName: 'CBAO',
    bankRib: '',
    mobileMoneyProvider: 'wave',
    mobileMoneyNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    shoeSize: '43',
    clothingSize: 'L',
  });

  const [uploadedCni, setUploadedCni] = useState<UploadedDocMeta | null>(null);
  const [uploadedRib, setUploadedRib] = useState<UploadedDocMeta | null>(null);

  useEffect(() => {
    if (session?.documents && Array.isArray(session.documents)) {
      const cni = session.documents.find((d: any) => (d.documentType || d.document_type) === 'cni');
      if (cni) {
        setUploadedCni({
          fileName: cni.fileName || (cni as any).file_name,
          fileSize: cni.fileSize ?? (cni as any).file_size ?? 0,
        });
      }
      const rib = session.documents.find((d: any) => (d.documentType || d.document_type) === 'rib');
      if (rib) {
        setUploadedRib({
          fileName: rib.fileName || (rib as any).file_name,
          fileSize: rib.fileSize ?? (rib as any).file_size ?? 0,
        });
      }
    }
  }, [session?.documents]);

  const staging = (session?.stagingData as Record<string, any>) || (session as any)?.staging_data || {};
  const candidateFirstName = staging.candidateFirstName || staging.candidate_first_name || '';
  const candidateLastName = staging.candidateLastName || staging.candidate_last_name || '';
  const candidateFullName = `${candidateFirstName} ${candidateLastName}`.trim() || 'Nouveau Collaborateur';
  const candidateEmail = staging.candidateEmail || staging.candidate_email || session?.employee?.email || '';
  const companyName = session?.company?.name || 'LuminaRH';
  const contractType = (staging.contractType || 'CDI').toUpperCase();

  const targetDateFormatted = useMemo(() => {
    const raw = session?.targetStartDate || staging.targetStartDate;
    if (!raw) return 'À définir';
    const date = new Date(raw);
    return isNaN(date.getTime())
      ? 'À définir'
      : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }, [session?.targetStartDate, staging.targetStartDate]);

  const taxParts = useMemo(() => {
    return calculateSenegalTaxParts(formData.maritalStatus, formData.childrenCount);
  }, [formData.maritalStatus, formData.childrenCount]);

  const initials = useMemo(() => {
    const p = candidateFirstName ? candidateFirstName[0].toUpperCase() : '';
    const n = candidateLastName ? candidateLastName[0].toUpperCase() : '';
    return p + n || 'RH';
  }, [candidateFirstName, candidateLastName]);

  const handleFieldChange = (field: keyof CandidateFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: 'cni' | 'rib') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(`Fichier trop volumineux (max 10 Mo).`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string) || '';
      uploadDoc.mutate(
        {
          documentType: docType,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
          storageKey: base64Data,
        },
        {
          onSuccess: () => {
            if (docType === 'cni') {
              setUploadedCni({ fileName: file.name, fileSize: file.size });
            } else {
              setUploadedRib({ fileName: file.name, fileSize: file.size });
            }
            toast.success(`Fichier "${file.name}" importé.`);
          },
          onError: () => {
            toast.error(`Erreur d'import.`);
          },
        }
      );
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleFinalSubmit = () => {
    if (!formData.nationalIdNumber.trim()) {
      toast.error('Numéro de CNI / NIN requis');
      return;
    }
    if (!uploadedCni) {
      toast.error("Pièce d'identité requise avant validation.");
      return;
    }

    submitData.mutate(formData, {
      onSuccess: () => {
        setCurrentStep(4);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-surface">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-surface p-4">
        <Card className="max-w-md p-7 text-center bg-white dark:bg-surface-container-lowest border-slate-200 dark:border-on-surface/10 rounded-2xl shadow-sm">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-on-surface">Lien expiré ou invalide</h2>
          <p className="text-xs text-slate-500 mt-2">
            Ce lien sécurisé n'est plus actif. Contactez la Direction RH de <strong>{companyName}</strong>.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-surface flex flex-col items-center justify-between p-3 sm:p-6 lg:p-8 font-sans antialiased text-slate-800 dark:text-on-surface">
      {/* ── 1. Header ── */}
      <PortalHeader
        currentStep={currentStep}
        companyName={companyName}
        showMobilePreview={showMobilePreview}
        onToggleMobilePreview={() => setShowMobilePreview(!showMobilePreview)}
      />

      {/* ── 2. Dual-Pane Container ── */}
      <main className="w-full max-w-5xl my-4 flex-1 flex flex-col justify-center">
        <div className="bg-white dark:bg-surface-container-lowest border border-slate-200/80 dark:border-on-surface/10 rounded-3xl shadow-xl shadow-slate-900/[0.04] overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[520px]">
          
          {/* Left Pane: Interactive Step Form (50% Width) */}
          <div className="p-7 sm:p-10 flex flex-col justify-between">
            {currentStep === 1 && (
              <IdentityStep
                formData={formData}
                onChange={handleFieldChange}
                onNext={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 2 && (
              <CompensationStep
                formData={formData}
                paymentMode={paymentMode}
                setPaymentMode={setPaymentMode}
                onChange={handleFieldChange}
                onNext={() => setCurrentStep(3)}
                onPrev={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && (
              <DocumentsStep
                uploadedCni={uploadedCni}
                uploadedRib={uploadedRib}
                onUploadFile={handleFileUpload}
                onSubmit={handleFinalSubmit}
                onPrev={() => setCurrentStep(2)}
                isUploading={uploadDoc.isPending}
                isSubmitting={submitData.isPending}
              />
            )}

            {currentStep === 4 && (
              <SuccessStep
                candidateFirstName={candidateFirstName}
                companyName={companyName}
                targetDate={targetDateFormatted}
              />
            )}
          </div>

          {/* Right Pane: Live Mirror Preview (50% Width) */}
          <div
            className={`border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-on-surface/10 overflow-hidden ${
              showMobilePreview ? 'block' : 'hidden lg:block'
            }`}
          >
            <PortalLiveMirror
              currentStep={currentStep}
              formData={formData}
              candidateName={candidateFullName}
              candidateEmail={candidateEmail}
              contractType={contractType}
              targetDate={targetDateFormatted}
              paymentMode={paymentMode}
              uploadedCni={uploadedCni}
              uploadedRib={uploadedRib}
              taxParts={taxParts}
              initials={initials}
            />
          </div>
        </div>
      </main>

      {/* ── 3. Footer ── */}
      <footer className="text-xs text-slate-400 py-2 flex items-center gap-1.5">
        <ShieldCheck size={13} className="text-slate-400" />
        <span>Portail sécurisé LuminaRH</span>
      </footer>
    </div>
  );
};
