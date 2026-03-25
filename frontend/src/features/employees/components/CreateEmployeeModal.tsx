import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useCreateEmployee } from '../hooks/useCreateEmployee';
import { employeesApi } from '../api/employees.api';
import type { CreateEmployeePayload } from '../types';

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateEmployeeModal({ isOpen, onClose }: CreateEmployeeModalProps) {
  const { mutate: createEmployee, isPending } = useCreateEmployee();
  
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: employeesApi.getDepartments, enabled: isOpen });
  const { data: schedules = [] } = useQuery({ queryKey: ['schedules'], queryFn: employeesApi.getSchedules, enabled: isOpen });
  
  const [formData, setFormData] = useState<Partial<CreateEmployeePayload>>({
    role: 'employee',
    contract_type: 'cdi',
    status: 'active',
  } as any);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEmployee(formData as CreateEmployeePayload, {
      onSuccess: (data: any) => {
        if (data._temp_password) {
          alert(`Employé créé avec succès !\n\nLes identifiants de connexion ont été envoyés par email à :\n${formData.email}`);
        }
        onClose();
      },
      onError: (err: any) => {
        alert("Erreur lors de la création : " + (err.response?.data?.message || err.message));
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Ajouter un employé</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prénom" name="first_name" required onChange={handleChange} />
            <Input label="Nom" name="last_name" required onChange={handleChange} />
            <Input label="Email" type="email" name="email" required onChange={handleChange} />
            <Input label="Téléphone" name="phone" onChange={handleChange} />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Rôle (Système)</label>
              <select name="role" required className="w-full rounded-md border border-gray-300 p-2" onChange={handleChange} defaultValue="employee">
                <option value="employee">Employé (Basique)</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Type de contrat</label>
              <select name="contract_type" required className="w-full rounded-md border border-gray-300 p-2" onChange={handleChange} defaultValue="cdi">
                <option value="cdi">CDI</option>
                <option value="cdd">CDD</option>
                <option value="freelance">Freelance</option>
                <option value="intern">Stagiaire</option>
              </select>
            </div>
            
            <Input label="Date d'embauche" type="date" name="hire_date" required onChange={handleChange} />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Département</label>
              <select name="department_id" required className="w-full rounded-md border border-gray-300 p-2" onChange={handleChange} defaultValue="">
                <option value="" disabled>Sélectionner...</option>
                {departments.map((dept: any) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Horaire</label>
              <select name="schedule_id" required className="w-full rounded-md border border-gray-300 p-2" onChange={handleChange} defaultValue="">
                <option value="" disabled>Sélectionner...</option>
                {schedules.map((sch: any) => (
                  <option key={sch.id} value={sch.id}>{sch.name} ({sch.start_time})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="tertiary" onClick={onClose}>Annuler</Button>
            <Button type="submit" isLoading={isPending}>Créer Employé & Accès</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
