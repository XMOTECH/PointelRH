import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  Bell,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Tableau de bord', path: '/dashboard', roles: ['admin', 'manager'] },
    { icon: <Users size={18} />, label: 'Équipe', path: '/employees', roles: ['admin'] },
    { icon: <Clock size={18} />, label: 'Pointage', path: '/clock-in', roles: ['admin', 'manager', 'employee'] },
    { icon: <Bell size={18} />, label: 'Notifications', path: '/notifications', roles: ['admin', 'manager', 'employee'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className="layout-container" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{
        width: '240px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 50
      }}>
        <div className="sidebar-header" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'var(--primary)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: '1rem'
          }}>P</div>
          <h1 style={{ fontSize: '1.125rem', color: 'var(--text-header)', margin: 0, fontWeight: 700 }}>
            Pointel<span style={{ color: 'var(--primary)' }}>RH</span>
          </h1>
        </div>

        <nav className="sidebar-nav" style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '0.75rem', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Menu Principal</p>
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ padding: '1rem', borderTop: '1px solid var(--border-light)' }}>
          <button 
            onClick={handleLogout}
            className="sidebar-link" 
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: '#E74C3C' }}
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{
        flex: 1,
        marginLeft: '240px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-main)'
      }}>
        {/* Header */}
        <header className="header" style={{
          height: '64px',
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div className="header-left">
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-header)' }}>
              {navItems.find(item => item.path === location.pathname)?.label || 'Aujourd\'hui'}
            </h2>
          </div>

          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: '#F8F9FA', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-header)', margin: 0 }}>{user?.name}</p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'capitalize', margin: 0 }}>{user?.role}</p>
              </div>
              <div className="avatar" style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#EDF2F7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--secondary)',
                border: '1px solid #E2E8F0'
              }}>
                <User size={16} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="content-inner animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

