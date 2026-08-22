import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from '@/presentation/components/layout/Sidebar';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('Sidebar Component', () => {
  it('renders menu items correctly on desktop view', () => {
    render(<Sidebar />);

    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Histori Transaksi')).toBeInTheDocument();
    expect(screen.getByText('Dompet Digital')).toBeInTheDocument();
    expect(screen.getByText('Anggaran Bulanan')).toBeInTheDocument();
    expect(screen.getByText('Analisis & Laporan')).toBeInTheDocument();
  });

  it('renders mobile overlay drawer when isOpenMobile is true', () => {
    const handleClose = vi.fn();
    render(<Sidebar isOpenMobile={true} onCloseMobile={handleClose} />);

    // Check menu items exist in mobile drawer
    const menuHeadings = screen.getAllByText('Menu Utama');
    expect(menuHeadings.length).toBeGreaterThanOrEqual(1);

    // Check close button triggers onCloseMobile
    const closeBtn = screen.getByLabelText('Tutup Menu');
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders mobile bottom navigation bar with 5 items including center floating add button', () => {
    const handleOpenAdd = vi.fn();
    render(<Sidebar onOpenAddModal={handleOpenAdd} />);

    const bottomNav = screen.getByRole('navigation', { name: 'Mobile Bottom Navigation' });
    expect(bottomNav).toBeInTheDocument();

    // Check shortened labels exist inside bottom nav
    expect(screen.getByText('Transaksi')).toBeInTheDocument();
    expect(screen.getByText('Dompet')).toBeInTheDocument();
    expect(screen.getByText('Analisis')).toBeInTheDocument();

    // Check floating add button triggers onOpenAddModal
    const addBtn = screen.getByLabelText('Tambah Transaksi Baru');
    expect(addBtn).toBeInTheDocument();
    fireEvent.click(addBtn);
    expect(handleOpenAdd).toHaveBeenCalledTimes(1);
  });
});
