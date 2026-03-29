import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Trash2, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { notificationsApi, type Notification } from './api/notifications.api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Toutes les notifications sont marquées comme lues');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: notificationsApi.deleteNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const filteredNotifications = notifications?.filter((n: Notification) => 
    filter === 'all' ? true : !n.is_read
  );

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-green-500" size={20} />;
      case 'warning': return <AlertCircle className="text-amber-500" size={20} />;
      case 'error': return <AlertCircle className="text-red-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-on-surface tracking-tighter uppercase italic">
            Notifications
          </h1>
          <p className="text-on-surface-variant mt-1 font-medium text-sm">
            Restez informé des activités importantes de l'entreprise.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
            variant="tertiary" 
            size="sm" 
            className="btn-ghost text-xs uppercase tracking-widest font-bold"
            onClick={() => markAllReadMutation.mutate()}
           >
              Tout marquer comme lu
           </Button>
           <div className="bg-surface-container-low p-1 rounded-xl border border-outline-variant flex gap-1">
              <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant/40'}`}
              >
                Toutes
              </button>
              <button 
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'unread' ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant/40'}`}
              >
                Non lues
              </button>
           </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredNotifications?.map((notif: Notification) => (
          <Card 
            key={notif.id} 
            className={`premium-card p-4 flex gap-4 transition-all group relative overflow-hidden ${!notif.is_read ? 'bg-primary/5 border-primary/20' : ''}`}
          >
            <div className="mt-1">
               {getIcon(notif.type)}
            </div>
            <div className="flex-1 space-y-1">
               <div className="flex items-start justify-between">
                  <h3 className={`font-bold text-base ${!notif.is_read ? 'text-primary' : 'text-on-surface'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] font-bold text-on-surface-variant/30 uppercase tracking-widest">
                    {format(new Date(notif.created_at), 'HH:mm', { locale: fr })}
                  </span>
               </div>
               <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
                 {notif.message}
               </p>
               <div className="flex items-center gap-4 pt-2">
                  <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
                    {format(new Date(notif.created_at), 'dd MMMM yyyy', { locale: fr })}
                  </span>
                  {!notif.is_read && (
                    <button 
                      onClick={() => markReadMutation.mutate(notif.id)}
                      className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      Marquer comme lu
                    </button>
                  )}
               </div>
            </div>

            {/* Status Indicator Bar */}
            {!notif.is_read && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
            )}

            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
               <Button 
                variant="tertiary" 
                size="sm" 
                className="!p-2 text-on-surface-variant/40 hover:text-red-500"
                onClick={() => deleteMutation.mutate(notif.id)}
               >
                  <Trash2 size={16} />
               </Button>
            </div>
          </Card>
        ))}

        {filteredNotifications?.length === 0 && (
          <div className="py-20 text-center space-y-4 bg-surface-container-low/30 rounded-3xl border-2 border-dashed border-outline-variant/30 italic">
            <Bell size={48} className="mx-auto text-on-surface-variant opacity-20" />
            <p className="text-on-surface-variant opacity-40 font-medium">
              Aucune notification à afficher.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
