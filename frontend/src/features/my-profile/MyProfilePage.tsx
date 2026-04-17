import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building2, Briefcase, Calendar, Clock, QrCode, ScanFace, CheckCircle2, XCircle, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useMyProfile } from './hooks/useMyProfile';
import { useAuth } from '@/hooks/useAuth';
import { useFaceEnrollmentStatus } from '@/features/employees/hooks/useFaceEnrollment';
import { FaceEnrollmentModal } from '@/features/employees/components/FaceEnrollmentModal';
import { useMutation } from '@tanstack/react-query';
import { profileApi } from './api/profile.api';
import { toast } from 'sonner';

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon size={16} className="text-on-surface-variant/60 shrink-0" />
      <span className="text-sm text-on-surface-variant">{label}</span>
      <span className="text-sm font-medium text-on-surface ml-auto">{value || '—'}</span>
    </div>
  );
}

export default function MyProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useMyProfile();
  const employeeId = user?.employee_id;
  const { data: faceStatus } = useFaceEnrollmentStatus(employeeId);
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  const [showPasswords, setShowPasswords] = useState(false);

  const changePasswordMutation = useMutation({
    mutationFn: () => profileApi.changePassword(pwForm),
    onSuccess: () => {
      toast.success('Mot de passe modifie avec succes');
      setPwForm({ current_password: '', new_password: '', new_password_confirmation: '' });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Erreur lors du changement de mot de passe';
      toast.error(msg);
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-48 bg-surface-container rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-surface-container rounded-2xl animate-pulse" />
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-surface-container rounded-2xl animate-pulse" />
            <div className="h-48 bg-surface-container rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const statusVariant = profile?.status === 'active' ? 'success' : profile?.status === 'inactive' ? 'error' : 'default';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 space-y-6"
    >
      <h1 className="text-2xl font-display font-bold text-on-surface">Mon Profil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Avatar & Identity */}
        <Card className="flex flex-col items-center text-center py-8 bg-surface-container-lowest">
          <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center mb-4 border-2 border-primary/10">
            <User size={40} className="text-on-surface-variant" />
          </div>
          <h2 className="text-2xl font-semibold text-on-surface">
            {profile?.first_name} {profile?.last_name}
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">{profile?.email}</p>
          <div className="flex gap-2 mt-4">
            <Badge variant={statusVariant}>{profile?.status_label || profile?.status || 'N/A'}</Badge>
            <Badge variant="info">{profile?.contract_type || 'CDI'}</Badge>
          </div>
        </Card>

        {/* Right Column - Detail Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-surface-container/50">
              <InfoRow icon={Mail} label="Email" value={profile?.email} />
              <InfoRow icon={Phone} label="Téléphone" value={profile?.phone} />
            </CardContent>
          </Card>

          {/* Structure */}
          <Card>
            <CardHeader>
              <CardTitle>Structure</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-surface-container/50">
              <InfoRow icon={Building2} label="Département" value={profile?.department?.name} />
              <InfoRow icon={Briefcase} label="Type de contrat" value={profile?.contract_type} />
              <InfoRow icon={Calendar} label="Date d'embauche" value={profile?.hire_date} />
            </CardContent>
          </Card>

          {/* Schedule */}
          {profile?.schedule && (
            <Card>
              <CardHeader>
                <CardTitle>Planning assigné</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-surface-container/50">
                <InfoRow icon={Clock} label="Planning" value={profile.schedule.name} />
                <InfoRow icon={Clock} label="Horaires" value={`${profile.schedule.start_time} → ${profile.schedule.end_time}`} />
              </CardContent>
            </Card>
          )}

          {/* QR Token */}
          {profile?.qr_token && (
            <Card>
              <CardHeader>
                <CardTitle>QR Token</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <QrCode size={18} className="text-on-surface-variant/60" />
                  <code className="text-sm font-mono bg-surface-container px-3 py-1.5 rounded-lg select-all">
                    {profile.qr_token}
                  </code>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Changer le mot de passe</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (pwForm.new_password !== pwForm.new_password_confirmation) {
                    toast.error('Les mots de passe ne correspondent pas');
                    return;
                  }
                  if (pwForm.new_password.length < 8) {
                    toast.error('Le mot de passe doit contenir au moins 8 caracteres');
                    return;
                  }
                  changePasswordMutation.mutate();
                }}
                className="space-y-4"
              >
                <div className="relative">
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    placeholder="Mot de passe actuel"
                    value={pwForm.current_password}
                    onChange={(e) => setPwForm(p => ({ ...p, current_password: e.target.value }))}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-on-surface-variant"
                  >
                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    placeholder="Nouveau mot de passe"
                    value={pwForm.new_password}
                    onChange={(e) => setPwForm(p => ({ ...p, new_password: e.target.value }))}
                    required
                    minLength={8}
                  />
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    placeholder="Confirmer le mot de passe"
                    value={pwForm.new_password_confirmation}
                    onChange={(e) => setPwForm(p => ({ ...p, new_password_confirmation: e.target.value }))}
                    required
                    minLength={8}
                  />
                </div>
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="btn btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2"
                >
                  {changePasswordMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Lock size={16} />
                  )}
                  {changePasswordMutation.isPending ? 'Modification...' : 'Modifier le mot de passe'}
                </button>
              </form>
            </CardContent>
          </Card>

          {/* Face Enrollment */}
          {employeeId && (
            <Card>
              <CardHeader>
                <CardTitle>Reconnaissance Faciale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ScanFace size={18} className="text-on-surface-variant/60" />
                    <div>
                      <p className="text-sm font-medium text-on-surface">
                        {faceStatus?.enrolled ? 'Visage enregistre' : 'Non enregistre'}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {faceStatus?.enrolled
                          ? `${faceStatus.count} capture(s) - Pointage facial actif`
                          : 'Enregistrez votre visage pour pointer par reconnaissance faciale'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {faceStatus?.enrolled ? (
                      <CheckCircle2 size={20} className="text-green-600" />
                    ) : (
                      <XCircle size={20} className="text-on-surface-variant/40" />
                    )}
                    <button
                      onClick={() => setFaceModalOpen(true)}
                      className="btn btn-primary text-sm px-4 py-2"
                    >
                      {faceStatus?.enrolled ? 'Gerer' : 'Enregistrer'}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Face Enrollment Modal */}
      {employeeId && (
        <FaceEnrollmentModal
          open={faceModalOpen}
          onClose={() => setFaceModalOpen(false)}
          employeeId={employeeId}
          employeeName={`${profile?.first_name || ''} ${profile?.last_name || ''}`}
        />
      )}
    </motion.div>
  );
}
