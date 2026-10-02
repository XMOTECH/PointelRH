import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LuminaLogo } from '@/components/ui/LuminaLogo';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  CheckCircle2,
  UploadCloud,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  HardHat,
  FileText,
} from 'lucide-react';
import { useCandidateSession, useSubmitCandidateData, useUploadCandidateDocument } from './hooks/useOnboarding';
import { toast } from 'sonner';

export const CandidatePortalPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [currentStep, setCurrentStep] = useState<number>(1);

  const { data: session, isLoading, isError } = useCandidateSession(token);
  const submitData = useSubmitCandidateData(token || '');
  const uploadDoc = useUploadCandidateDocument(token || '');

  const cniInputRef = useRef<HTMLInputElement>(null);
  const ribInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
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

  const [uploadedCni, setUploadedCni] = useState<{ fileName: string; fileSize: number } | null>(null);
  const [uploadedRib, setUploadedRib] = useState<{ fileName: string; fileSize: number } | null>(null);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <Card className="max-w-md p-8 text-center bg-surface-container-lowest border-on-surface/10">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-on-surface">Lien d'intégration expiré ou invalide</h2>
          <p className="text-sm text-on-surface-variant mt-2">
            Ce lien sécurisé d'onboarding n'est plus actif. Veuillez vous rapprocher de la Direction des Ressources Humaines de votre entreprise d'accueil.
          </p>
        </Card>
      </div>
    );
  }

  const staging = (session.stagingData as Record<string, any>) || (session as any).staging_data || {};
  const candidateName =
    `${staging.candidateFirstName || staging.candidate_first_name || ''} ${staging.candidateLastName || staging.candidate_last_name || ''}`.trim() ||
    'Collaborateur';
  const companyName = session.company?.name || 'Votre Entreprise';

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRealFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: 'cni' | 'rib'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(`Le fichier ${file.name} est trop volumineux (max 10 Mo).`);
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
          storageKey: base64Data.length > 50000 ? `onboarding/${session?.id}/${docType}_${Date.now()}_${file.name}` : base64Data,
        },
        {
          onSuccess: () => {
            if (docType === 'cni') {
              setUploadedCni({ fileName: file.name, fileSize: file.size });
            } else {
              setUploadedRib({ fileName: file.name, fileSize: file.size });
            }
            toast.success(`Fichier "${file.name}" sélectionné et téléversé avec succès !`);
          },
          onError: () => {
            toast.error(`Erreur lors du téléversement de "${file.name}".`);
          },
        }
      );
    };
    reader.onerror = () => {
      toast.error('Erreur lors de la lecture du fichier sélectionné.');
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  const handleFinalSubmit = () => {
    if (!formData.nationalIdNumber.trim()) {
      toast.error('Veuillez renseigner votre numéro de CNI / NIN');
      return;
    }
    if (!formData.emergencyContactName.trim() || !formData.emergencyContactPhone.trim()) {
      toast.error('Le contact d\'urgence est obligatoire pour votre sécurité sur site');
      return;
    }
    if (!uploadedCni) {
      toast.error("Veuillez téléverser votre pièce d'identité (CNI ou Passeport) avant de valider votre dossier.");
      return;
    }

    submitData.mutate(formData, {
      onSuccess: () => {
        setCurrentStep(4);
      },
    });
  };

  const inputClass =
    'w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-on-surface/10 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20';
  const labelClass = 'block text-xs font-bold text-on-surface-variant mb-1.5';

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-between p-4 sm:p-8">
      {/* Top Brand Header */}
      <header className="w-full max-w-2xl flex items-center justify-between py-4">
        <LuminaLogo size="md" />
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
          Portail Collaborateur • {companyName}
        </span>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-2xl my-6">
        <Card className="p-6 sm:p-8 bg-surface-container-lowest border-on-surface/10 shadow-lg">
          {/* Step 1 : Accueil */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-lg">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-black text-on-surface">Bienvenue, {candidateName} !</h2>
                  <p className="text-sm text-on-surface-variant">
                    Vous avez été retenu(e) pour rejoindre les équipes de <strong>{companyName}</strong>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-container-low border border-on-surface/5 text-xs">
                <div>
                  <span className="text-on-surface-variant">Prise de poste prévue le :</span>
                  <p className="text-sm font-bold text-on-surface mt-0.5 font-mono">
                    {new Date(session.targetStartDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <span className="text-on-surface-variant">Type de contrat :</span>
                  <p className="text-sm font-bold text-on-surface mt-0.5 uppercase">
                    {staging.contractType || 'CDI'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                Afin de préparer votre premier jour, votre déclaration auprès de l'IPRES et de la Caisse de Sécurité Sociale (CSS), nous vous invitons à compléter ce court formulaire en 3 minutes.
              </p>

              <div className="flex justify-end pt-2">
                <Button variant="primary" onClick={() => setCurrentStep(2)}>
                  Démarrer mon intégration
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 : État Civil & Données Fiscales */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-xl font-bold text-on-surface">1. État Civil & Situation Familiale</h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Ces éléments déterminent vos parts fiscales pour le calcul exact de votre bulletin de paie.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Numéro CNI (NIN CEDEAO) *</label>
                  <input
                    value={formData.nationalIdNumber}
                    onChange={(e) => handleInputChange('nationalIdNumber', e.target.value)}
                    placeholder="1 755 1995 01234"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Date de naissance *</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Situation matrimoniale *</label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                    className={inputClass}
                  >
                    <option value="single">Célibataire (1.0 part)</option>
                    <option value="married">Marié(e) (1.5 parts)</option>
                    <option value="divorced">Divorcé(e)</option>
                    <option value="widowed">Veuf / Veuve</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Enfants à charge (+0.5 part / enfant) *</label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={formData.childrenCount}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      handleInputChange('childrenCount', isNaN(v) ? 0 : Math.max(0, Math.min(30, v)));
                    }}
                    className={inputClass}
                  />
                  <span className="text-[10px] text-on-surface-variant/70 block mt-1">
                    Plafonné à 5 parts fiscales maximum selon le CGI sénégalais
                  </span>
                </div>
              </div>

              <div>
                <label className={labelClass}>Adresse de résidence actuelle *</label>
                <input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Quartier Cité Lamy, Rufisque, Dakar"
                  className={inputClass}
                />
              </div>

              <hr className="border-on-surface/10" />

              <div>
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                  Contact d'Urgence (Sécurité Usine) *
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Nom du contact</label>
                    <input
                      value={formData.emergencyContactName}
                      onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                      placeholder="Fatou Ndiaye"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Téléphone</label>
                    <input
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                      placeholder="+221 77 ..."
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Lien de parenté</label>
                    <input
                      value={formData.emergencyContactRelation}
                      onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                      placeholder="Conjoint, Parent..."
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="tertiary" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft size={16} className="mr-2" /> Retour
                </Button>
                <Button variant="primary" onClick={() => setCurrentStep(3)}>
                  Suivant : Paiement & Équipements
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 : Paiement & EPI */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-xl font-bold text-on-surface">2. Rémunération & Dotation Usine</h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Mode de virement bancaire ou Mobile Money et tailles pour vos équipements de sécurité.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Relevé d'Identité Bancaire (RIB) ou Compte</label>
                  <input
                    value={formData.bankRib}
                    onChange={(e) => handleInputChange('bankRib', e.target.value)}
                    placeholder="SN012 01001 012345678901 45"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Ou Numéro Mobile Money (Wave / Orange Money)</label>
                  <input
                    value={formData.mobileMoneyNumber}
                    onChange={(e) => handleInputChange('mobileMoneyNumber', e.target.value)}
                    placeholder="+221 77 316 91 88"
                    className={inputClass}
                  />
                </div>
              </div>

              <hr className="border-on-surface/10" />

              <div>
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <HardHat size={14} /> Tailles Paquetage EPI (Chantier / Usine)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Pointure de chaussures de sécurité</label>
                    <select
                      value={formData.shoeSize}
                      onChange={(e) => handleInputChange('shoeSize', e.target.value)}
                      className={inputClass}
                    >
                      {['39', '40', '41', '42', '43', '44', '45', '46'].map((sz) => (
                        <option key={sz} value={sz}>
                          Pointure {sz}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Taille combinaison / Vêtements de travail</label>
                    <select
                      value={formData.clothingSize}
                      onChange={(e) => handleInputChange('clothingSize', e.target.value)}
                      className={inputClass}
                    >
                      {['S', 'M', 'L', 'XL', 'XXL', '3XL'].map((sz) => (
                        <option key={sz} value={sz}>
                          Taille {sz}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Justificatifs téléversement */}
              {/* Justificatifs téléversement */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-on-surface/10 flex flex-col gap-4">
                <div>
                  <span className="text-xs font-bold text-on-surface">Pièces Justificatives (Sélectionnez vos fichiers) :</span>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Formats acceptés : PDF, JPG, PNG (Max 10 Mo par document).
                  </p>
                </div>

                {/* Hidden File Inputs */}
                <input
                  type="file"
                  ref={cniInputRef}
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => handleRealFileUpload(e, 'cni')}
                />
                <input
                  type="file"
                  ref={ribInputRef}
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => handleRealFileUpload(e, 'rib')}
                />

                {/* 1. CNI */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-container-lowest border border-on-surface/10">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${uploadedCni ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                      {uploadedCni ? <CheckCircle2 size={18} /> : <FileText size={18} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">1. Pièce d'identité (CNI / Passeport) <span className="text-red-500">*</span></p>
                      {uploadedCni ? (
                        <p className="text-[11px] text-emerald-600 font-mono font-medium mt-0.5">
                          ✓ {uploadedCni.fileName} ({(uploadedCni.fileSize / 1024).toFixed(0)} Ko)
                        </p>
                      ) : (
                        <p className="text-[11px] text-on-surface-variant/70 italic mt-0.5">
                          Aucun fichier sélectionné
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={uploadedCni ? 'secondary' : 'primary'}
                    onClick={() => cniInputRef.current?.click()}
                    isLoading={uploadDoc.isPending}
                  >
                    <UploadCloud size={14} className="mr-1.5" />
                    {uploadedCni ? 'Changer de fichier' : 'Parcourir / Déposer'}
                  </Button>
                </div>

                {/* 2. RIB */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-container-lowest border border-on-surface/10">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${uploadedRib ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                      {uploadedRib ? <CheckCircle2 size={18} /> : <FileText size={18} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">2. Justificatif de compte (RIB / Capture Wave)</p>
                      {uploadedRib ? (
                        <p className="text-[11px] text-emerald-600 font-mono font-medium mt-0.5">
                          ✓ {uploadedRib.fileName} ({(uploadedRib.fileSize / 1024).toFixed(0)} Ko)
                        </p>
                      ) : (
                        <p className="text-[11px] text-on-surface-variant/70 italic mt-0.5">
                          Aucun fichier sélectionné
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={uploadedRib ? 'secondary' : 'primary'}
                    onClick={() => ribInputRef.current?.click()}
                    isLoading={uploadDoc.isPending}
                  >
                    <UploadCloud size={14} className="mr-1.5" />
                    {uploadedRib ? 'Changer de fichier' : 'Parcourir / Déposer'}
                  </Button>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="tertiary" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft size={16} className="mr-2" /> Retour
                </Button>
                <Button variant="primary" onClick={handleFinalSubmit} isLoading={submitData.isPending}>
                  Valider et transmettre mon dossier
                </Button>
              </div>
            </div>
          )}

          {/* Step 4 : Écran de Confirmation & Clôture */}
          {currentStep === 4 && (
            <div className="flex flex-col items-center text-center py-6 gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl font-bold text-on-surface">Dossier transmis avec succès !</h2>
              <p className="text-sm text-on-surface-variant max-w-md">
                Merci {candidateName}. Vos informations et justificatifs ont bien été enregistrés et transmis au service des Ressources Humaines de <strong>{companyName}</strong>.
              </p>
              <div className="p-4 bg-surface-container-low rounded-xl border border-on-surface/5 text-xs text-on-surface-variant max-w-md text-left">
                <p className="font-bold text-on-surface mb-1">Prochaines étapes :</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Vérification administrative de vos pièces par les RH.</li>
                  <li>Validation de votre aptitude médicale.</li>
                  <li>Attribution de vos accès Kiosque et remise de votre équipement le Jour J.</li>
                </ul>
              </div>
            </div>
          )}
        </Card>
      </main>

      <footer className="text-xs text-on-surface-variant py-2">
        Sécurisé par LuminaRH • Conforme au Code du Travail de la République du Sénégal
      </footer>
    </div>
  );
};
