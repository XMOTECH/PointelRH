import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building2, 
  Clock, 
  Calendar, 
  Save, 
  Info,
  ShieldCheck,
  Globe,
  MapPin
} from 'lucide-react';
import { settingsApi } from './api/settings.api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from 'sonner';

type SettingsTab = 'profile' | 'policies' | 'holidays';

export function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<SettingsTab>('profile');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
  });

  const updateMutation = useMutation({
    mutationFn: ({ data, group }: { data: any, group: string }) => 
      settingsApi.updateSettings(data, group),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Paramètres enregistrés');
    },
    onError: () => {
      toast.error('Erreur lors de l’enregistrement');
    }
  });

  const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    updateMutation.mutate({ data, group: 'company' });
  };

  const handleSavePolicies = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    updateMutation.mutate({ data, group: 'rh_policy' });
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const companySettings = settings?.company || {};
  const rhSettings = settings?.rh_policy || {};

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-black text-on-surface tracking-tighter uppercase italic">
          Paramètres Système
        </h1>
        <p className="text-on-surface-variant mt-1 font-medium">
          Configurez l'identité et les règles globales de votre plateforme.
        </p>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left ${
              activeTab === 'profile' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'hover:bg-surface-container text-on-surface-variant'
            }`}
          >
            <Building2 size={20} />
            Profil Entreprise
          </button>
          <button 
            onClick={() => setActiveTab('policies')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left ${
              activeTab === 'policies' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'hover:bg-surface-container text-on-surface-variant'
            }`}
          >
            <ShieldCheck size={20} />
            Politique RH
          </button>
          <button 
            onClick={() => setActiveTab('holidays')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left ${
              activeTab === 'holidays' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'hover:bg-surface-container text-on-surface-variant'
            }`}
          >
            <Calendar size={20} />
            Jours Fériés
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card className="premium-card p-8 space-y-8">
              <div className="flex items-center gap-4 text-primary border-b border-outline-variant pb-6">
                 <div className="p-3 bg-primary/10 rounded-2xl"><Building2 size={24} /></div>
                 <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tight">Profil de la Société</h3>
                    <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest mt-0.5">Identité visuelle et contact</p>
                 </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] ml-1">Nom de l'Entreprise</label>
                      <Input name="company_name" defaultValue={companySettings.company_name} placeholder="Ex: Pointel Tech" required />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] ml-1">SIRET / Identifiant</label>
                      <Input name="siret" defaultValue={companySettings.siret} placeholder="Ex: 802 110 523 00010" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] ml-1">Email de Contact</label>
                      <Input name="contact_email" type="email" defaultValue={companySettings.contact_email} placeholder="hr@pointel.com" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] ml-1">Fuseau Horaire</label>
                      <select name="timezone" defaultValue={companySettings.timezone || 'Europe/Paris'} className="w-full px-4 h-12 bg-surface-container border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none">
                         <option value="Europe/Paris">(GMT+01:00) Paris</option>
                         <option value="Africa/Abidjan">(GMT+00:00) Abidjan</option>
                         <option value="UTC">(GMT+00:00) UTC</option>
                      </select>
                   </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                   <Button type="submit" className="px-8" isLoading={updateMutation.isPending}>
                      <Save size={18} className="mr-2" />
                      Enregistrer
                   </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'policies' && (
            <Card className="premium-card p-8 space-y-8">
              <div className="flex items-center gap-4 text-primary border-b border-outline-variant pb-6">
                 <div className="p-3 bg-primary/10 rounded-2xl"><ShieldCheck size={24} /></div>
                 <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tight">Règles de Pointage</h3>
                    <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest mt-0.5">Tolérances et seuils globaux</p>
                 </div>
              </div>

              <form onSubmit={handleSavePolicies} className="space-y-6">
                <div className="space-y-6">
                   <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <Info className="text-amber-600 mt-1 shrink-0" size={20} />
                      <p className="text-sm text-amber-900 leading-relaxed">
                         <span className="font-bold">Note sur la tolérance :</span> Ces paramètres s'appliquent à tous les employés n'ayant pas de règle spécifique définie dans leur planning individuel.
                      </p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                           <Clock size={12} /> Tolérance Retard (minutes)
                         </label>
                         <Input name="default_grace_minutes" type="number" defaultValue={rhSettings.default_grace_minutes || '15'} required />
                         <p className="text-[10px] text-on-surface-variant/60 font-medium">Temps accordé après l'heure officielle sans marquer de retard.</p>
                      </div>

                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                           <MapPin size={12} /> Rayon Géofencing (mètres)
                         </label>
                         <Input name="default_geofencing_radius" type="number" defaultValue={rhSettings.default_geofencing_radius || '100'} />
                         <p className="text-[10px] text-on-surface-variant/60 font-medium">Distance maximale autorisée pour pointer via mobile.</p>
                      </div>
                   </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                   <Button type="submit" className="px-8" isLoading={updateMutation.isPending}>
                      <Save size={18} className="mr-2" />
                      Enregistrer
                   </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'holidays' && (
            <Card className="premium-card p-8 flex flex-col items-center justify-center py-20 opacity-40 italic">
               <Calendar size={48} className="mb-4 text-primary" />
               <p className="text-lg">Module Jours Fériés (Prochainement)</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
