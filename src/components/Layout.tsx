import { Outlet } from 'react-router-dom';

import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-950/70 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-center px-6">
          <h1 className="text-xl font-bold tracking-tight text-[#cafd00] uppercase font-['Space_Grotesk']">
            KINETIC LAB
          </h1>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden md:block md:w-20 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto pt-16 pb-24 md:pt-0 md:pb-0">
        <div className="flex-1 flex flex-col gap-6 p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Layout;
