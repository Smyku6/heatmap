import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { id: 'analysis', label: 'Analysis', icon: 'analytics', path: '/analysis' },
    { id: 'history', label: 'History', icon: 'history', path: '/history' },
    { id: 'squad-maker', label: 'Squad Maker', icon: 'groups', path: '/squad-maker', badge: 'WIP' },
    { id: 'settings', label: 'Settings', icon: 'settings', path: '/settings' }
  ];

  return (
    <aside
      className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="sidebar-header">
        <div className="sidebar-logo-wrapper">
          <span className="material-symbols-outlined sidebar-logo-icon">bolt</span>
          <div className="sidebar-logo-text">
            <h1 className="sidebar-logo">ADAMA LAB</h1>
            <p className="sidebar-subtitle">Elite Adana Football</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            title={!isExpanded ? item.label : ''}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="sidebar-nav-label">{item.label}</span>
            {item.badge && <span className="sidebar-nav-badge">{item.badge}</span>}
          </NavLink>
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
