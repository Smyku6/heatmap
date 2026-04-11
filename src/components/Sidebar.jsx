import React from 'react';
import './Sidebar.css';

const Sidebar = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'analysis', label: 'Analysis', icon: 'analytics' },
    { id: 'history', label: 'History', icon: 'history' },
    { id: 'squad-maker', label: 'Squad Maker', icon: 'groups', badge: 'WIP' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-logo">KINETIC LAB</h1>
        <p className="sidebar-subtitle">Elite Performance</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && <span className="sidebar-nav-badge">{item.badge}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">Użytkownik</p>
            <p className="sidebar-user-role">Pro Athlete</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;