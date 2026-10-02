import React, { useState, useEffect } from 'react';
import { X, Calendar, Layers, CheckCircle2 } from 'lucide-react';
import { performanceApi } from '../api/performance.api';
import type { PerformanceTemplate } from '../types';
import { toast } from 'sonner';

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CampaignModal: React.FC<CampaignModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [templates, setTemplates] = useState<PerformanceTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    title: `Campagne d'Évaluation Annuelle ${currentYear}`,
    templateId: '',
    year: currentYear,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Campagne officielle pour les entretiens annuels, bilans de compétences et fixation des objectifs.',
  });

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await performanceApi.getTemplates();
      setTemplates(data);
      if (data.length > 0 && !formData.templateId) {
        setFormData((prev) => ({ ...prev, templateId: data[0].id }));
      }
    } catch {
      toast.error('Erreur lors du chargement des modèles d\'évaluation');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.templateId) {
      toast.error('Veuillez sélectionner un modèle d\'évaluation');
      return;
    }

    try {
      setSubmitting(true);
      await performanceApi.createCampaign({
        title: formData.title,
        templateId: formData.templateId,
        year: Number(formData.year),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        description: formData.description,
      });

      toast.success('Campagne d\'évaluation lancée avec succès !');
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur lors du lancement de la campagne';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-2xl border border-outline-variant overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Calendar size={22} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-on-surface">Lancer une Campagne d'Évaluation</h3>
              <p className="text-xs text-on-surface-variant">
                Génère automatiquement les sessions d'entretien pour les salariés actifs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Titre */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5">
              Titre de la campagne <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-outline bg-surface text-on-surface text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Ex: Entretiens Annuels 2026"
            />
          </div>

          {/* Template & Année */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Modèle d'entretien <span className="text-error">*</span>
              </label>
              {loading ? (
                <div className="h-10 rounded-xl bg-surface-container animate-pulse" />
              ) : (
                <select
                  value={formData.templateId}
                  onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline bg-surface text-on-surface text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.title} ({tpl.category})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Année de référence
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline bg-surface text-on-surface text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Date de début
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline bg-surface text-on-surface text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Date limite (clôture)
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline bg-surface text-on-surface text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5">
              Consignes et instructions pour les managers & collaborateurs
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-outline bg-surface text-on-surface text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="Ex: Merci de renseigner l'auto-évaluation avant le face-à-face..."
            />
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant flex items-start gap-3 text-xs text-on-surface-variant">
            <Layers size={18} className="text-primary shrink-0 mt-0.5" />
            <span>
              Au lancement, le système créera automatiquement les fiches d'entretien individuelles pour l'ensemble des salariés éligibles et leur assignera leur manager respectif.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Lancer la campagne
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
