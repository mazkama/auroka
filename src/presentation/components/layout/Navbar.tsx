'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coins, Menu, X, LogIn, UserPlus } from 'lucide-react';

const NAV_LINKS = [
  { name: 'Beranda', href: '#hero', id: 'hero' },
  { name: 'Preview Dashboard', href: '#mockup', id: 'mockup' },
  { name: 'Keunggulan', href: '#features', id: 'features' },
  { name: 'Filosofi Auroka', href: '#about', id: 'about' },
];

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
      
      // Only track active sections on the landing page
      if (pathname === '/') {
        const sections = NAV_LINKS.map(link => document.getElementById(link.id));
        let currentActive = 'hero';
        
        // Find which section is currently most visible in viewport
        for (const section of sections) {
          if (section) {
            const rect = section.getBoundingClientRect();
            // If the top of the section is at least 150px into the viewport, it's considered active
            if (rect.top <= 150 && rect.bottom >= 150) {
              currentActive = section.id;
              break;
            }
          }
        }
        
        // Special case: if scrolled to very top, it's hero
        if (window.scrollY < 100) {
          currentActive = 'hero';
        }
        
        setActiveSection(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, id: string) => {
    // If not on landing page, let Next.js handle navigation
    if (pathname !== '/') return;
    
    // Smooth scroll for hash links on the same page
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#f8f9ff]/90 backdrop-blur-md shadow-sm border-b border-[#c3c6d7]/40 py-3'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white shadow-md shadow-[#004ac6]/20 group-hover:scale-105 transition-transform">
            <Coins className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#004ac6]">
            Auroka
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-[#e5eeff]/60 p-1.5 rounded-full border border-[#c3c6d7]/30 backdrop-blur-sm">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === '/' && activeSection === link.id;
            return (
              <a
                key={link.id}
                href={pathname === '/' ? link.href : `/${link.href}`}
                onClick={(e) => handleLinkClick(e, link.href, link.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#004ac6] text-white shadow-sm'
                    : 'text-[#434655] hover:text-[#004ac6]'
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </div>

        {/* Authentication CTA Buttons (Login & Register) */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-xs font-bold text-[#004ac6] hover:text-[#2563eb] px-3.5 py-2 rounded-xl hover:bg-[#eff4ff] transition-colors"
          >
            <LogIn className="h-4 w-4" />
            <span>Masuk</span>
          </Link>

          <Link
            href="/register"
            className="flex items-center gap-1.5 bg-[#004ac6] hover:bg-[#2563eb] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg shadow-[#004ac6]/20 transform hover:-translate-y-0.5"
          >
            <UserPlus className="h-4 w-4" />
            <span>Daftar Akun</span>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#0b1c30] hover:bg-[#e5eeff] rounded-lg"
          aria-label="Buka Menu Navigasi"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#f8f9ff] border-b border-[#c3c6d7] px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top duration-200">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === '/' && activeSection === link.id;
            return (
              <a
                key={link.id}
                href={pathname === '/' ? link.href : `/${link.href}`}
                onClick={(e) => handleLinkClick(e, link.href, link.id)}
                className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#004ac6] text-white font-bold'
                    : 'text-[#434655] hover:bg-[#e5eeff]'
                }`}
              >
                {link.name}
              </a>
            );
          })}

          <div className="pt-2 grid grid-cols-2 gap-2 border-t border-[#c3c6d7]/40">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 border border-[#004ac6] text-[#004ac6] py-2.5 rounded-xl text-xs font-bold"
            >
              <LogIn className="h-4 w-4" />
              <span>Masuk</span>
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 bg-[#004ac6] text-white py-2.5 rounded-xl text-xs font-bold shadow-md"
            >
              <UserPlus className="h-4 w-4" />
              <span>Daftar Akun</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
