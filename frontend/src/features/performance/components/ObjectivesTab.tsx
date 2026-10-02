import React, { useState, useEffect } from 'react';
import { Target, Plus, X } from 'lucide-react';
import { performanceApi } from '../api/performance.api';
import type { PerformanceObjective } from '../types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const ObjectivesTab: React.FC = () => {
  const { user } = useAuth();
  const [objectives, setObjectives] = useState<PerformanceObjective[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'INDIVIDUAL',
    weight: 1,
    targetValue: 100,
    unit: '%',
    dueDate: '',
  });

  useEffect(() => {
    loadObjectives();
  }, []);

  const loadObjectives = async () => {
    try {
      setLoading(true);
      const data = await performanceApi.getObjectives();
      setObjectives(data);
    } catch {
      toast.error('Erreur lors du chargement des objectifs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.employee_id) {
      toast.error('Aucun identifiant collaborateur associé à ce compte');
      return;
    }

    try {
      setSubmitting(true);
      await performanceApi.createObjective({
        employeeId: user.employee_id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        weight: Number(formData.weight),
        targetValue: Number(formData.targetValue),
        unit: formData.unit,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      });

      toast.success('Objectif fixé avec succès !');
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'INDIVIDUAL',
        weight: 1,
        targetValue: 100,
        unit: '%',
        dueDate: '',
      });
      loadObjectives();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProgress = async (id: string, newProgress: number) => {
    try {
      await performanceApi.updateObjective(id, { progress: newProgress });
      setObjectives((prev) =>
        prev.map((obj) => (obj.id === id ? { ...obj, progress: newProgress } : obj)),
      );
      toast.success('Progression mise à jour');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-on-surface">Objectifs & Résultats Clés (OKRs)</h3>
          <p className="text-xs text-on-surface-variant">
            Alignement stratégique, pondération et suivi de progression continue
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Fixer un Objectif
        </button>
      </div>

      {/* Grid of Objectives */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : objectives.length === 0 ? (
        <div className="p-8 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant">
          <Target size={36} className="mx-auto text-on-surface-variant/40 mb-3" />
          <p className="text-sm font-semibold text-on-surface">Aucun objectif défini pour le moment</p>
          <p className="text-xs text-on-surface-variant mt-1">
            Fixez des objectifs mesurables pour orienter et récompenser la performance.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {objectives.map((obj) => (
            <div
              key={obj.id}
              className="p-5 rounded-2xl border border-outline-variant bg-surface space-y-4 shadow-xs hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {obj.category}
                    </span>
                    <span className="text-[10px] font-medium text-on-surface-variant">
                      Poids : x{obj.weight}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-on-surface mt-1.5">{obj.title}</h4>
                  {obj.description && (
                    <p className="text-xs text-on-surface-variant mt-1">{obj.description}</p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-lg font-bold text-primary">{obj.progress}%</span>
                </div>
              </div>

              {/* Progress Bar & Slider */}
              <div className="space-y-2">
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: `${Math.min(obj.progress, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>Progression :</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={obj.progress}
                    onChange={(e) => handleUpdateProgress(obj.id, Number(e.target.value))}
                    className="w-32 accent-primary cursor-pointer"
                  />
                </div>
              </div>

              {obj.dueDate && (
                <div className="pt-2 border-t border-outline-variant text-[11px] text-on-surface-variant flex items-center justify-between">
                  <span>Échéance prévue</span>
                  <span className="font-semibold text-on-surface">
                    {new Date(obj.dueDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Création Objectif */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-surface rounded-2xl shadow-2xl border border-outline-variant p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <h3 className="text-base font-bold text-on-surface">Nouvel Objectif</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Titre de l'objectif *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-outline bg-surface text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Ex: Réduire le délai de livraison de 20%"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-outline bg-surface text-xs resize-none"
                  placeholder="Critères d'évaluation..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Catégorie</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-outline bg-surface text-xs"
                  >
                    <option value="INDIVIDUAL">Individuel</option>
                    <option value="TEAM">Équipe</option>
                    <option value="STRATEGIC">Stratégique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Poids relatif</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-outline bg-surface text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Échéance</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-outline bg-surface text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-on-surface-variant hover:bg-surface-container rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl disabled:opacity-50"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
