'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from './AppHeader';
import { Sidebar } from './Sidebar';
import { logout } from '@/infrastructure/api/authApi';
import { AuthLoadingOverlay } from '@/presentation/components/ui/AuthLoadingOverlay';

interface AppLayoutProps {
  children: React.ReactNode;
  onOpenAddModal?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  onOpenAddModal,
}) => {
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
  };

  const handleLogoutComplete = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="h-screen w-full bg-[#f8f9ff] text-[#0b1c30] flex flex-row font-sans overflow-hidden">
      {/* 1. Left Sidebar (Desktop Fixed & Mobile Overlay Drawer) */}
      <Sidebar
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenAddModal={onOpenAddModal}
        onLogout={handleLogout}
      />

      {/* 2. Main Application Area (Header + Scrollable Content) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <AppHeader
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenAddModal={onOpenAddModal}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Modern Auroka Frosted Logout Loading Overlay */}
      <AuthLoadingOverlay
        isOpen={isLoggingOut}
        mode="logout"
        onComplete={handleLogoutComplete}
      />
    </div>
  );
};

