import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';

const BottomNav = () => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { id: 'analysis', label: 'Analysis', icon: 'analytics', path: '/analysis' },
    { id: 'goal-analysis', label: 'Goals', icon: 'sports_soccer', path: '/goal-analysis' },
    { id: 'history', label: 'History', icon: 'history', path: '/history' },
    { id: 'settings', label: 'Settings', icon: 'settings', path: '/settings' }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-2 pb-6 bg-slate-950/80 backdrop-blur-2xl rounded-t-xl border-t border-slate-800/50 shadow-[0_-4px_40px_rgba(202,253,0,0.04)]">
      {navItems.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center transition-all duration-200',
              isActive
                ? 'text-[#cafd00] bg-[#cafd00]/10 rounded-xl px-4 py-1 transform translate-y-[-2px]'
                : 'text-slate-500 hover:text-[#f3ffca]'
            )
          }
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="font-['Inter'] text-[10px] uppercase tracking-widest font-bold">
            {item.label}
          </span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
