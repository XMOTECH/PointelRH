import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';


export const DashboardLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Structural Sidebar */}
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />

      {/* Main Execution Area */}
      <main className="flex-1 flex flex-col min-h-screen min-w-0 relative">
        {/* Dynamic Page Scroll Zone */}
        <div className="flex-1 px-6 py-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
