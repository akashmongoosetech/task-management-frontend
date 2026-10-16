import React, { useState } from 'react';
import { Navbar } from './Navbar';

interface AppLayoutProps {
  children: (props: { isCreateModalOpen: boolean; setIsCreateModalOpen: (open: boolean) => void }) => React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <Navbar onOpenCreateModal={() => setIsCreateModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {children({ isCreateModalOpen, setIsCreateModalOpen })}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-2">
          <span className="font-semibold text-slate-700">TaskFlow</span>
          <span>·</span>
          <span>Design and develop by Akash Raikwar</span>
        </div>
      </footer>
    </div>
  );
};
