import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';

interface SidebarProps {
  onNavigate?: () => void;
}

const Sidebar = ({ onNavigate }: SidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { id: 'analysis', label: 'Analysis', icon: 'analytics', path: '/analysis' },
    { id: 'goal-analysis', label: 'Goal Analysis', icon: 'sports_soccer', path: '/goal-analysis' },
    { id: 'history', label: 'History', icon: 'history', path: '/history' },
    {
      id: 'squad-maker',
      label: 'Squad Maker',
      icon: 'groups',
      path: '/squad-maker',
      badge: 'WIP'
    },
    { id: 'settings', label: 'Settings', icon: 'settings', path: '/settings' }
  ];

  const handleNavClick = () => {
    onNavigate?.();
  };

  return (
    <aside
      className={cn(
        // Base styles
        'fixed left-0 top-0 z-50',
        'h-screen overflow-hidden',
        'flex flex-col',
        'py-8',
        // Oryginalne kolory!
        'bg-[rgb(18,18,20)]',
        'border-r border-[rgba(202,253,0,0.05)]',
        'transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',

        // Width - collapsed/expanded
        isExpanded ? 'w-64' : 'w-20'
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Header - Logo */}
      <div className="px-6 mb-12">
        <div className="flex items-center gap-3 whitespace-nowrap">
          <span
            className={cn(
              'material-symbols-outlined text-[rgb(202,253,0)] text-2xl flex-shrink-0',
              'transition-transform duration-300',
              isExpanded && 'rotate-[360deg]'
            )}
          >
            bolt
          </span>
          <div
            className={cn(
              'min-w-0',
              'transition-opacity duration-200',
              isExpanded ? 'opacity-100 delay-100' : 'opacity-0'
            )}
          >
            <h1 className="text-xl font-bold tracking-widest text-[rgb(202,253,0)]">ADAMA LAB</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-1">
              Elite Adana Football
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={handleNavClick}
            className={({ isActive }) =>
              cn(
                // Base styles
                'flex items-center gap-4 px-6 py-4',
                'transition-all duration-300',
                'font-medium text-sm',
                'text-[#64748b]',
                'relative whitespace-nowrap',
                'group',

                // Hover state
                'hover:text-[rgb(202,253,0)] hover:bg-[rgba(255,255,255,0.05)]',

                // Active state
                isActive && [
                  'text-[rgb(202,253,0)]',
                  'bg-[rgba(202,253,0,0.1)]',
                  'border-r-2 border-[rgb(202,253,0)]'
                ]
              )
            }
            title={!isExpanded ? item.label : ''}
          >
            <span
              className={cn(
                'material-symbols-outlined text-2xl flex-shrink-0',
                'transition-transform duration-200'
              )}
            >
              {item.icon}
            </span>

            <span
              className={cn(
                'flex-1 min-w-0 text-sm font-normal',
                'transition-opacity duration-200',
                isExpanded ? 'opacity-100 delay-100' : 'opacity-0'
              )}
            >
              {item.label}
            </span>

            {item.badge && (
              <span
                className={cn(
                  'ml-auto px-2 py-1 text-[10px] font-bold uppercase tracking-wider',
                  'bg-[rgba(202,253,0,0.15)] text-[rgb(202,253,0)]',
                  'flex-shrink-0',
                  'transition-opacity duration-200',
                  isExpanded ? 'opacity-100 delay-100' : 'opacity-0'
                )}
              >
                {item.badge}
              </span>
            )}

            {/* Tooltip for collapsed state - removed as it's not in the reference design */}
          </NavLink>
        ))}
      </nav>

      {/* Footer - User */}
      <div className="px-6 pt-8 mt-auto border-t border-[rgba(116,117,121,0.1)]">
        <div className="flex items-center gap-3 whitespace-nowrap">
          <div className="w-10 h-10 rounded-full bg-[rgba(202,253,0,0.1)] border border-[rgba(202,253,0,0.3)] flex items-center justify-center text-[rgb(202,253,0)] flex-shrink-0">
            <span className="material-symbols-outlined text-xl">person</span>
          </div>
          <div
            className={cn(
              'flex-1 min-w-0 transition-opacity duration-200',
              isExpanded ? 'opacity-100 delay-100' : 'opacity-0'
            )}
          >
            <p className="text-xs font-bold text-white overflow-hidden text-ellipsis">Użytkownik</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter overflow-hidden text-ellipsis">
              Pro Athlete
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
