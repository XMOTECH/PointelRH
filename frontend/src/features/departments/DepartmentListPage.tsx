import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Building2, Search, Users, ArrowRight, Edit2, Trash2 } from 'lucide-react';
import { departmentsApi } from './api/departments.api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Spinner } from '@/components/ui/Spinner';
import { DepartmentForm } from './components/DepartmentForm';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const DepartmentListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingDepartment, setEditingDepartment] = React.useState<any>(null);

  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getDepartments,
  });

  const createMutation = useMutation({
    mutationFn: departmentsApi.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Département créé avec succès');
      setIsFormOpen(false);
    },
    onError: () => {
      toast.error('Erreur lors de la création du département');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => departmentsApi.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Département mis à jour avec succès');
      setIsFormOpen(false);
      setEditingDepartment(null);
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: departmentsApi.deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Département supprimé avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    }
  });

  const handleEdit = (dept: any) => {
    setEditingDepartment(dept);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormSubmit = (data: any) => {
    if (editingDepartment) {
      updateMutation.mutate({ id: editingDepartment.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-on-surface tracking-tighter uppercase italic">
            Départements
          </h1>
          <p className="text-on-surface-variant mt-1 font-medium">
            Gérez la structure organisationnelle de votre entreprise.
          </p>
        </div>
        <Button className="btn-primary" onClick={() => setIsFormOpen(true)}>
          <Plus size={20} />
          Nouveau Département
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="premium-card p-6 accent-bar relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider opacity-60">Total Départements</p>
              <h3 className="text-2xl font-black">{departments?.length || 0}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="premium-card p-6 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 text-green-600 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider opacity-60">Total Employés</p>
              <h3 className="text-2xl font-black">--</h3>
            </div>
          </div>
        </Card>

        <Card className="premium-card p-6 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
              <ArrowRight size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider opacity-60">Activité Récente</p>
              <h3 className="text-2xl font-black">Stable</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="premium-card overflow-hidden">
        <div className="card-header bg-surface-container-low/50">
          <div className="flex items-center gap-4 flex-1">
             <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
             </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-surface-container-low/30 hover:bg-transparent border-b border-outline-variant">
              <TableHead className="py-4 font-bold text-on-surface-variant uppercase tracking-widest text-[10px]">Nom du Département</TableHead>
              <TableHead className="py-4 font-bold text-on-surface-variant uppercase tracking-widest text-[10px]">Manager</TableHead>
              <TableHead className="py-4 font-bold text-on-surface-variant uppercase tracking-widest text-[10px]">ID Interne</TableHead>
              <TableHead className="py-4 font-bold text-on-surface-variant uppercase tracking-widest text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments?.map((dept: any) => (
              <TableRow key={dept.id} className="group hover:bg-surface-container-low/50 transition-colors border-b border-outline-variant/30 last:border-0">
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-container-highest rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Building2 size={20} />
                    </div>
                    <span className="font-semibold text-on-surface">{dept.name}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    {dept.manager_name ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {dept.manager_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-on-surface">{dept.manager_name}</span>
                      </>
                    ) : (
                      <span className="text-xs text-on-surface-variant italic opacity-50">Non assigné</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <code className="text-xs bg-surface-container px-2 py-1 rounded border border-outline-variant text-on-surface-variant">
                    {dept.id.substring(0, 8)}...
                  </code>
                </TableCell>
                <TableCell className="py-4 text-right">
                  <div className="flex items-center justify-end gap-2 pr-4">
                    <Button 
                      variant="tertiary" 
                      size="sm" 
                      className="btn-ghost !p-2 text-primary hover:bg-primary/5"
                      onClick={() => handleEdit(dept)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button 
                      variant="tertiary" 
                      size="sm" 
                      className="btn-ghost !p-2 text-red-500 hover:bg-red-50"
                      onClick={() => handleDelete(dept.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {departments?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-on-surface-variant opacity-60 italic">
                  Aucun département trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <DepartmentForm 
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDepartment(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingDepartment}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
