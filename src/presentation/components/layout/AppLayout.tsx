'use client';

import React, { useState } from 'react';
import { AppHeader } from './AppHeader';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  onOpenAddModal?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  onOpenAddModal,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-full bg-[#f8f9ff] text-[#0b1c30] flex flex-row font-sans overflow-hidden">
      {/* 1. Left Sidebar (Desktop Fixed & Mobile Overlay Drawer) */}
      <Sidebar
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenAddModal={onOpenAddModal}
      />

      {/* 2. Main Application Area (Header + Scrollable Content) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <AppHeader
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenAddModal={onOpenAddModal}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

