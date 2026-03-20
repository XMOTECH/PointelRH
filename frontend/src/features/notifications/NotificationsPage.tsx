import { Bell } from 'lucide-react';

export function NotificationsPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-500 text-sm mt-1">Centre de notifications et alertes.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <Bell size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Aucune notification pour le moment.</p>
      </div>
    </div>
  );
}
