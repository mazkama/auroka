import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Navbar } from '@/presentation/components/layout/Navbar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Navbar Component', () => {
  it('renders brand logo, public landing links, and auth buttons', () => {
    render(<Navbar />);

    expect(screen.getByText('Auroka')).toBeInTheDocument();
    expect(screen.getByText('Beranda')).toBeInTheDocument();
    expect(screen.getByText('Masuk')).toBeInTheDocument();
    expect(screen.getByText('Daftar Akun')).toBeInTheDocument();
  });
});
