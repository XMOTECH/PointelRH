import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building2, Briefcase, Calendar, Clock, QrCode, ScanFace, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useMyProfile } from './hooks/useMyProfile';
import { useAuth } from '@/hooks/useAuth';
import { useFaceEnrollmentStatus } from '@/features/employees/hooks/useFaceEnrollment';
import { FaceEnrollmentModal } from '@/features/employees/components/FaceEnrollmentModal';

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
        <Card className="flex flex-col items-center text-center py-8">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <User size={36} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-on-surface">
            {profile?.first_name} {profile?.last_name}
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">{profile?.email}</p>
          <div className="flex gap-2 mt-3">
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
