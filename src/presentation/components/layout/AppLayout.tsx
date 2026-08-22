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
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-row font-sans">
      {/* 1. Left Sidebar (Desktop Persistent & Mobile Overlay Drawer) */}
      <Sidebar
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Application Area (Header + Content) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AppHeader
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenAddModal={onOpenAddModal}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
