import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-surface">
      {/* Structural Sidebar */}
      <Sidebar />

      {/* Main Execution Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header />

        {/* Dynamic Page Scroll Zone */}
        <div className="flex-1 p-8 mt-4">
          <div className="max-w-[1400px] mx-auto animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
