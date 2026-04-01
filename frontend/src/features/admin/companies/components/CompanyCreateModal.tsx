import React, { useState } from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Label } from '../../../../components/ui/Label';
import type { CreateCompanyData } from '../../api/admin.api';
import { Building2, User, Key, Globe, ShieldCheck, Mail, Briefcase } from 'lucide-react';

interface CompanyCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCompanyData) => void;
  isLoading: boolean;
}

const initialFormData: CreateCompanyData = {
  company_name: '',
  plan: 'pro',
  admin_name: '',
  admin_email: '',
  admin_password: '',
};

export function CompanyCreateModal({ open, onClose, onSubmit, isLoading }: CompanyCreateModalProps) {
  const [formData, setFormData] = useState<CreateCompanyData>(initialFormData);
  const [prevOpen, setPrevOpen] = useState(open);

  // Reset form when modal opens (render phase update instead of effect)
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setFormData(initialFormData);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      title="DÉPLOIEMENT NOUVELLE INSTANCE"
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-8 py-4">
        {/* Section: Organisation */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Building2 size={18} strokeWidth={2.5} />
            </div>
            <h3 className="font-display font-black text-sm uppercase tracking-[0.2em] text-on-surface/60 italic">Configuration Organisation</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-surface-container-low/50 rounded-3xl border border-outline-variant/30">
            <div className="space-y-3">
              <Label htmlFor="company_name" className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Nom de l'Entité</Label>
              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40 group-focus-within:text-primary transition-colors" size={18} />
                <Input
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="EX: POINTEL SOLUTIONS S.A."
                  className="pl-12 h-14 bg-surface-container-lowest border-outline-variant/50 focus:border-primary/50 text-xs font-bold uppercase tracking-tight"
                  required
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="plan" className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Offre de Services</Label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40 group-focus-within:text-primary transition-colors" size={18} />
                <select
                  id="plan"
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  className="w-full pl-12 h-14 bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-xs font-black uppercase tracking-tight focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all outline-none cursor-pointer appearance-none"
                >
                  <option value="free">PACK DÉCOUVERTE (FREE)</option>
                  <option value="pro">PACK PROFESSIONAL (PRO)</option>
                  <option value="enterprise">PACK CORPORATE (ENTERPRISE)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative h-px bg-outline-variant/30">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-surface text-[9px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 italic">
            Security Layer
          </div>
        </div>

        {/* Section: Admin */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
              <ShieldCheck size={18} strokeWidth={2.5} />
            </div>
            <h3 className="font-display font-black text-sm uppercase tracking-[0.2em] text-on-surface/60 italic">Identité Administrateur</h3>
          </div>

          <div className="space-y-6 p-6 bg-surface-container-low/50 rounded-3xl border border-outline-variant/30">
            <div className="space-y-3">
              <Label htmlFor="admin_name" className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Responsable Instance</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40 group-focus-within:text-amber-500 transition-colors" size={18} />
                <Input
                  id="admin_name"
                  name="admin_name"
                  value={formData.admin_name}
                  onChange={handleChange}
                  placeholder="NOM PRÉNOM DU TITULAIRE"
                  className="pl-12 h-14 bg-surface-container-lowest border-outline-variant/50 focus:border-amber-500/50 text-xs font-bold uppercase tracking-tight"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="admin_email" className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">E-mail Officiel</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40 group-focus-within:text-amber-500 transition-colors" size={18} />
                  <Input
                    id="admin_email"
                    name="admin_email"
                    type="email"
                    value={formData.admin_email}
                    onChange={handleChange}
                    placeholder="ADMIN@DOMAIN.COM"
                    className="pl-12 h-14 bg-surface-container-lowest border-outline-variant/50 focus:border-amber-500/50 text-xs font-bold uppercase tracking-tight"
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="admin_password" className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Clé de Sécurité</Label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40 group-focus-within:text-amber-500 transition-colors" size={18} />
                  <Input
                    id="admin_password"
                    name="admin_password"
                    type="password"
                    value={formData.admin_password}
                    onChange={handleChange}
                    placeholder="MIN. 12 CARACTÈRES"
                    minLength={8}
                    className="pl-12 h-14 bg-surface-container-lowest border-outline-variant/50 focus:border-amber-500/50 text-xs font-bold uppercase tracking-tight"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose}
            className="px-8 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]"
          >
            Annuler l'opération
          </Button>
          <Button 
            type="submit" 
            isLoading={isLoading} 
            className="px-12 h-14 rounded-2xl shadow-premium hover:shadow-primary/30 transition-all font-display font-black uppercase tracking-tighter text-lg italic"
          >
            Démarrer Déploiement
          </Button>
        </div>
      </form>
    </Modal>
  );
}
