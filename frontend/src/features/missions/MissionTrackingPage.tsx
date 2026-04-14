import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Target,
  TrendingUp,
  FileText,
  Image as ImageIcon,
  Video,
  File,
  Download,
  Upload,
  Trash2,
  X,
  Loader2,
  LogIn,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { missionsApi } from './api/missions.api';
import type { Mission, MissionDocument, AttendanceRecord } from './api/missions.api';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// ── Helpers ─────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatElapsed(startDate: string): string {
  const start = new Date(startDate);
  const now = new Date();
  const diff = Math.abs(now.getTime() - start.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  if (days > 0) return `${days}j ${hours}h`;
  return `${hours}h ${minutes}m`;
}

const FILE_ICONS: Record<string, typeof FileText> = {
  image: ImageIcon,
  pdf: FileText,
  video: Video,
  document: File,
};

const FILE_COLORS: Record<string, string> = {
  image: 'bg-blue-100 text-blue-600',
  pdf: 'bg-red-100 text-red-600',
  video: 'bg-purple-100 text-purple-600',
  document: 'bg-amber-100 text-amber-600',
};

const ATTENDANCE_STATUS: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  present: { label: 'Present', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2 },
  late: { label: 'En retard', color: 'text-amber-600 bg-amber-50', icon: AlertTriangle },
  absent: { label: 'Absent', color: 'text-red-600 bg-red-50', icon: X },
  excused: { label: 'Excuse', color: 'text-blue-600 bg-blue-50', icon: AlertCircle },
  holiday: { label: 'Ferie', color: 'text-indigo-600 bg-indigo-50', icon: AlertCircle },
};

const TIMELINE_COLORS: Record<string, string> = {
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  indigo: 'bg-indigo-500',
  slate: 'bg-slate-400',
};

// ── Sub-components ──────────────────────────────────────

function StatCard({ icon, label, value, subValue, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue: string;
  color: 'blue' | 'emerald' | 'amber' | 'indigo';
}) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-600',
    emerald: 'bg-emerald-500/10 text-emerald-600',
    amber: 'bg-amber-500/10 text-amber-600',
    indigo: 'bg-indigo-500/10 text-indigo-600',
  };

  return (
    <div className="premium-card p-6 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300">
      <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', colors[color])}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-on-surface-variant font-bold uppercase tracking-widest opacity-60 mb-1">{label}</div>
        <div className="text-3xl font-display font-bold tracking-tight text-on-surface">{value}</div>
        <div className="text-[10px] text-on-surface-variant font-medium mt-1">{subValue}</div>
      </div>
    </div>
  );
}

function TimelineItem({ time, title, description, color, isCurrent }: {
  time: string;
  title: string;
  description: string;
  color: string;
  isCurrent: boolean;
}) {
  return (
    <div className="relative pl-10 flex flex-col gap-1">
      <div className={cn(
        'absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-surface-container-lowest shadow-md z-10',
        TIMELINE_COLORS[color] || 'bg-slate-400',
        isCurrent && 'animate-pulse ring-4 ring-primary/20'
      )} />
      <span className="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">{time}</span>
      <h4 className={cn('font-bold text-sm', isCurrent ? 'text-primary' : 'text-on-surface')}>{title}</h4>
      <p className="text-xs text-on-surface-variant font-medium opacity-70">{description}</p>
    </div>
  );
}

function EmployeeRow({ emp, attendance }: {
  emp: any;
  attendance?: AttendanceRecord;
}) {
  const statusInfo = attendance
    ? ATTENDANCE_STATUS[attendance.status] || ATTENDANCE_STATUS.absent
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 rounded-2xl hover:bg-surface-container transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary ring-2 ring-surface-container-lowest">
          {emp.first_name?.[0]}{emp.last_name?.[0]}
        </div>
        <div>
          <h4 className="font-semibold text-on-surface text-sm">{emp.first_name} {emp.last_name}</h4>
          <p className="text-xs text-on-surface-variant capitalize">{emp.role || 'Employe'}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {attendance ? (
          <div className="flex flex-col items-end gap-1">
            <div className={cn('flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full', statusInfo?.color)}>
              {statusInfo && <statusInfo.icon size={12} />}
              {statusInfo?.label}
            </div>
            <div className="flex items-center gap-3 text-[10px] text-on-surface-variant">
              {attendance.checked_in_at && (
                <span className="flex items-center gap-1">
                  <LogIn size={10} />
                  {format(new Date(attendance.checked_in_at), 'HH:mm')}
                </span>
              )}
              {attendance.checked_out_at && (
                <span className="flex items-center gap-1">
                  <LogOut size={10} />
                  {format(new Date(attendance.checked_out_at), 'HH:mm')}
                </span>
              )}
              {attendance.late_minutes > 0 && (
                <span className="text-amber-600 font-semibold">+{attendance.late_minutes}min retard</span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-xs text-on-surface-variant/50 italic">Pas de pointage</span>
        )}
      </div>
    </motion.div>
  );
}

function DocumentCard({ doc, missionId, canDelete }: {
  doc: MissionDocument;
  missionId: string;
  canDelete: boolean;
}) {
  const queryClient = useQueryClient();
  const Icon = FILE_ICONS[doc.file_type] || File;
  const colorClass = FILE_COLORS[doc.file_type] || 'bg-gray-100 text-gray-600';

  const deleteMutation = useMutation({
    mutationFn: () => missionsApi.deleteDocument(missionId, doc.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission', missionId] });
      toast.success('Document supprime');
    },
  });

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all group">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', colorClass)}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-on-surface truncate">{doc.file_name}</p>
        <p className="text-[10px] text-on-surface-variant">
          {formatBytes(doc.file_size)}
          {doc.uploaded_by_name && ` — ${doc.uploaded_by_name}`}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
          title="Telecharger"
        >
          <Download size={14} />
        </a>
        {canDelete && (
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            title="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────

export const MissionTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [incidentData, setIncidentData] = useState({ title: '', description: '', severity: 'medium' });

  // Fetch mission with auto-refresh every 60s
  const { data: mission, isLoading } = useQuery({
    queryKey: ['mission', id],
    queryFn: () => missionsApi.getMission(id!).then(r => r.data?.data ?? r.data),
    enabled: !!id,
    refetchInterval: 60_000,
  });

  // Fetch attendance for assigned employees
  const employeeIds = mission?.employees?.map((e: any) => e.id) || [];
  const { data: attendances } = useQuery({
    queryKey: ['mission-attendance', id, employeeIds.join(',')],
    queryFn: () => missionsApi.getAttendanceByEmployees(employeeIds).then(r => r.data?.data ?? r.data),
    enabled: employeeIds.length > 0,
    refetchInterval: 60_000,
  });

  // Build attendance lookup map
  const attendanceMap = new Map<string, AttendanceRecord>();
  if (attendances) {
    (attendances as AttendanceRecord[]).forEach(a => attendanceMap.set(a.employee_id, a));
  }

  // Upload documents mutation
  const uploadDocs = useMutation({
    mutationFn: (files: File[]) => missionsApi.uploadDocuments(id!, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission', id] });
      toast.success('Documents uploades');
    },
    onError: () => toast.error('Erreur lors de l\'upload'),
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const oversized = files.filter(f => f.size > 20 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error(`Fichier(s) trop volumineux (max 20 MB)`);
      return;
    }
    uploadDocs.mutate(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <AlertCircle size={48} className="text-on-surface-variant/40" />
        <p className="text-on-surface-variant font-medium">Mission non trouvee</p>
        <Button variant="secondary" onClick={() => navigate('/missions')}>Retour</Button>
      </div>
    );
  }

  const m = mission as Mission;
  const checkedInCount = employeeIds.filter((eid: string) => attendanceMap.has(eid)).length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/missions')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors w-fit font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux missions
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-display font-bold text-on-surface tracking-tight">
                {m.title}
              </h1>
              <span className={cn(
                'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                m.status === 'active' ? 'bg-primary/10 text-primary' :
                m.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                m.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                'bg-surface-container text-on-surface-variant'
              )}>
                {m.status === 'active' ? 'Active' : m.status === 'completed' ? 'Terminee' : m.status === 'cancelled' ? 'Annulee' : 'Brouillon'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-on-surface-variant text-sm">
              {m.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  {m.location}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                {format(new Date(m.start_date), 'dd MMMM yyyy', { locale: fr })}
                {m.end_date && ` — ${format(new Date(m.end_date), 'dd MMM yyyy', { locale: fr })}`}
              </div>
            </div>
            {m.description && (
              <p className="text-sm text-on-surface-variant/70 max-w-2xl">{m.description}</p>
            )}
          </div>

          <Button
            variant="secondary"
            className="rounded-xl px-6 h-11 shrink-0"
            onClick={() => setShowIncidentModal(true)}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Signaler un incident
          </Button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Equipe"
          value={`${checkedInCount}/${employeeIds.length}`}
          subValue={`${checkedInCount} pointe${checkedInCount > 1 ? 's' : ''} aujourd'hui`}
          color="blue"
        />
        <StatCard
          icon={<Target className="w-6 h-6" />}
          label="Progression"
          value={m.stats ? `${m.stats.progression_percentage}%` : '0%'}
          subValue={`${m.stats?.completed_tasks || 0} / ${m.stats?.total_tasks || 0} taches`}
          color="emerald"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          label="Duree"
          value={m.status === 'active' ? formatElapsed(m.start_date) : '-'}
          subValue={`Depuis le ${format(new Date(m.start_date), 'dd/MM/yyyy')}`}
          color="amber"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Productivite"
          value={m.stats && m.stats.total_tasks > 0
            ? `${m.stats.progression_percentage}%`
            : '-'
          }
          subValue={m.stats && m.stats.total_tasks > 0
            ? `${m.stats.completed_tasks} tache${m.stats.completed_tasks > 1 ? 's' : ''} terminee${m.stats.completed_tasks > 1 ? 's' : ''}`
            : 'Aucune tache assignee'
          }
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Team + Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Team */}
          <div className="premium-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-display font-bold text-on-surface">Personnel assigne</h3>
              <span className="text-xs text-on-surface-variant bg-surface-container px-3 py-1 rounded-full font-medium">
                {employeeIds.length} membre{employeeIds.length > 1 ? 's' : ''}
              </span>
            </div>

            {m.employees && m.employees.length > 0 ? (
              <div className="space-y-1">
                {m.employees.map((emp: any) => (
                  <EmployeeRow
                    key={emp.id}
                    emp={emp}
                    attendance={attendanceMap.get(emp.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-on-surface-variant/50 text-sm italic">
                Aucun employe assigne
              </p>
            )}
          </div>

          {/* Documents */}
          <div className="premium-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-display font-bold text-on-surface">Documents de mission</h3>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf,video/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadDocs.isPending}
                >
                  {uploadDocs.isPending ? (
                    <Loader2 size={14} className="animate-spin mr-1.5" />
                  ) : (
                    <Upload size={14} className="mr-1.5" />
                  )}
                  Ajouter
                </Button>
              </div>
            </div>

            {m.documents && m.documents.length > 0 ? (
              <div className="grid gap-2">
                {m.documents.map(doc => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    missionId={m.id}
                    canDelete={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <File size={32} className="mx-auto text-on-surface-variant/30 mb-3" />
                <p className="text-sm text-on-surface-variant/50">
                  Aucun document. Ajoutez des instructions, rapports ou photos.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Activity timeline */}
        <div className="space-y-6">
          <div className="premium-card p-6">
            <h3 className="text-lg font-display font-bold text-on-surface mb-6">Journal d'activite</h3>
            <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant">
              {m.activity_log && m.activity_log.length > 0 ? (
                m.activity_log.map((item, idx) => (
                  <TimelineItem
                    key={idx}
                    time={item.time}
                    title={item.title}
                    description={item.description}
                    color={item.color}
                    isCurrent={idx === 0}
                  />
                ))
              ) : (
                <div className="text-center py-10 text-on-surface-variant/40 text-sm italic">
                  Aucune activite enregistree
                </div>
              )}
            </div>
          </div>

          {/* Attendance summary */}
          <div className="premium-card p-6">
            <h3 className="text-lg font-display font-bold text-on-surface mb-4">Pointage du jour</h3>
            <div className="space-y-3">
              {[
                { key: 'present', label: 'Presents', count: Array.from(attendanceMap.values()).filter(a => a.status === 'present').length },
                { key: 'late', label: 'En retard', count: Array.from(attendanceMap.values()).filter(a => a.status === 'late').length },
                { key: 'absent', label: 'Non pointes', count: employeeIds.length - attendanceMap.size },
              ].map(row => {
                return (
                  <div key={row.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2.5 h-2.5 rounded-full', TIMELINE_COLORS[row.key === 'present' ? 'emerald' : row.key === 'late' ? 'amber' : 'slate'] || 'bg-slate-300')} />
                      <span className="text-sm text-on-surface">{row.label}</span>
                    </div>
                    <span className={cn('text-sm font-bold', row.count > 0 ? 'text-on-surface' : 'text-on-surface-variant/40')}>
                      {row.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Incident Modal */}
      <AnimatePresence>
        {showIncidentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIncidentModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-surface-container-lowest p-6 rounded-2xl shadow-xl space-y-5 border border-outline-variant"
              onClick={e => e.stopPropagation()}
            >
              <div>
                <h3 className="text-xl font-display font-bold text-on-surface">Signaler un Incident</h3>
                <p className="text-sm text-on-surface-variant mt-1">Decrivez la situation pour alerter les responsables.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Titre de l'incident</label>
                  <input
                    type="text"
                    className="w-full h-10 px-3 text-sm rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="Ex: Panne materiel, Obstruction..."
                    value={incidentData.title}
                    onChange={e => setIncidentData({ ...incidentData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Severite</label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high', 'critical'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setIncidentData({ ...incidentData, severity: s })}
                        className={cn(
                          'flex-1 py-2 rounded-lg text-xs font-semibold border transition-all capitalize',
                          incidentData.severity === s
                            ? 'bg-primary text-on-primary border-primary'
                            : 'bg-surface-container border-outline-variant text-on-surface-variant'
                        )}
                      >
                        {s === 'low' ? 'Faible' : s === 'medium' ? 'Moyenne' : s === 'high' ? 'Haute' : 'Critique'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Description detaillee</label>
                  <textarea
                    className="w-full h-28 px-3 py-2 text-sm rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                    placeholder="Decrivez precisement ce qui se passe..."
                    value={incidentData.description}
                    onChange={e => setIncidentData({ ...incidentData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="tertiary"
                  className="flex-1 rounded-xl h-11"
                  onClick={() => setShowIncidentModal(false)}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1 rounded-xl h-11"
                  isLoading={isReporting}
                  onClick={async () => {
                    if (!incidentData.title || !incidentData.description) {
                      toast.error('Veuillez remplir tous les champs');
                      return;
                    }
                    try {
                      setIsReporting(true);
                      await missionsApi.reportIncident({
                        mission_id: id,
                        ...incidentData,
                      });
                      toast.success('Incident signale avec succes');
                      setShowIncidentModal(false);
                      setIncidentData({ title: '', description: '', severity: 'medium' });
                    } catch {
                      toast.error('Erreur lors du signalement');
                    } finally {
                      setIsReporting(false);
                    }
                  }}
                >
                  Envoyer le rapport
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
