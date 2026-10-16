import React from 'react';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';

export default function App() {
  return (
    <ToastProvider>
      <AppLayout>
        {({ isCreateModalOpen, setIsCreateModalOpen }) => (
          <DashboardPage
            isCreateModalOpen={isCreateModalOpen}
            setIsCreateModalOpen={setIsCreateModalOpen}
          />
        )}
      </AppLayout>
    </ToastProvider>
  );
}
