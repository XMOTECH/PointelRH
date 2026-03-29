import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  FileText, 
  Plus,
  Check,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { missionsApi } from '../api/missions.api';
import type { CreateMissionDTO } from '../api/missions.api';
import { employeesApi } from '../../employees/api/employees.api';
import type { Employee } from '../../employees/types';

interface MissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MissionForm({ isOpen, onClose, onSuccess }: MissionFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<Partial<CreateMissionDTO>>({
    title: '',
    description: '',
    location: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    status: 'draft',
    employee_ids: []
  });

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
      setStep(1);
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    try {
      const data = await employeesApi.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to load employees', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await missionsApi.createMission({
        ...formData,
        employee_ids: selectedEmployees
      } as CreateMissionDTO);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create mission', error);
      alert('Erreur lors de la création de la mission');
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployee = (id: string) => {
    setSelectedEmployees(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass w-full max-w-2xl overflow-hidden rounded-3xl shadow-2xl border border-white/20 bg-surface/80"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-primary/5">
            <div>
              <h2 className="text-2xl font-display font-bold text-on-surface tracking-tight">
                Nouvelle Mission
              </h2>
              <p className="text-sm text-on-surface-variant opacity-70">
                Étape {step} sur 3 • {step === 1 ? 'Détails' : step === 2 ? 'Planning' : 'Équipe'}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-on-surface-variant" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8 max-h-[70vh] overflow-y-auto">
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary opacity-80">Titre de la mission</label>
                  <div className="relative group">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant opacity-40 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text"
                      placeholder="Ex: Intervention Client - Site A"
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-lg"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary opacity-80">Lieu d'intervention</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant opacity-40 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text"
                      placeholder="Adresse ou site"
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 transition-all outline-none"
                      value={formData.location || ''}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary opacity-80">Description (Optionnel)</label>
                  <textarea 
                    rows={3}
                    placeholder="Détails de la mission, matériel requis..."
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 transition-all outline-none resize-none"
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary opacity-80">Date de début</label>
                  <input 
                    type="date"
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 outline-none"
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary opacity-80">Date de fin</label>
                  <input 
                    type="date"
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 outline-none"
                    value={formData.end_date || ''}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
                <div className="col-span-2 p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                  <Calendar className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <p className="font-bold text-on-surface">Planification suggérée</p>
                    <p className="text-sm text-on-surface-variant opacity-70">
                      La mission s'étalera sur {formData.start_date === formData.end_date ? 'une journée' : 'plusieurs jours'}.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant opacity-40 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text"
                    placeholder="Rechercher un membre de l'équipe..."
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 transition-all outline-none"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredEmployees.map(emp => (
                    <div 
                      key={emp.id}
                      onClick={() => toggleEmployee(emp.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedEmployees.includes(emp.id) 
                        ? 'bg-primary/10 border-primary shadow-sm' 
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                          {emp.first_name[0]}{emp.last_name[0]}
                        </div>
                        <div>
                          <div className="font-bold">{emp.first_name} {emp.last_name}</div>
                          <div className="text-xs text-on-surface-variant opacity-60 capitalize">{emp.role}</div>
                        </div>
                      </div>
                      {selectedEmployees.includes(emp.id) ? (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <Plus className="w-6 h-6 text-on-surface-variant opacity-40" />
                      )}
                    </div>
                  ))}
                </div>
                
                {selectedEmployees.length > 0 && (
                  <p className="text-sm text-primary font-medium">
                    {selectedEmployees.length} employé(s) sélectionné(s)
                  </p>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer Persistence */}
          <div className="p-6 border-t border-white/10 bg-white/5 flex gap-4">
            {step > 1 && (
              <Button 
                variant="secondary" 
                className="flex-1 rounded-2xl h-14"
                onClick={() => setStep(step - 1)}
              >
                Précédent
              </Button>
            )}
            {step < 3 ? (
              <Button 
                disabled={!formData.title}
                className="flex-1 btn-primary rounded-2xl h-14"
                onClick={() => setStep(step + 1)}
              >
                Suivant
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button 
                disabled={loading || selectedEmployees.length === 0}
                className="flex-1 btn-primary rounded-2xl h-14"
                onClick={handleSubmit}
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Créer la mission'}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
