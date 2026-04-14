import Sidebar from '@/components/Sidebar';

const SidebarTest = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-[200px] p-8">
        <h1 className="text-2xl font-bold text-foreground mb-4">Sidebar Test Page</h1>
        <p className="text-muted-foreground mb-8">
          This page shows the sidebar in isolation for testing purposes.
        </p>

        {/* Tailwind Test Box */}
        <div className="p-8 m-8 bg-red-500 border-4 border-blue-500">
          <p className="text-white font-bold">
            If this box has padding (red background), margin, and blue border - Tailwind works!
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="h-32 bg-surface-container rounded-lg" />
          <div className="h-32 bg-surface-container rounded-lg" />
          <div className="h-32 bg-surface-container rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default SidebarTest;
