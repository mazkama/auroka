'use client';

import React from 'react';
import { PlusCircle, Database, ShieldCheck, Coins } from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal }) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 shadow-md shadow-amber-500/20 text-white font-bold">
          <Coins className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-white font-sans">
              Auroka
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Aurum
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Pahami Uang, Bangun Masa Depan
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 rounded-lg bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 border border-slate-700/50">
          <ShieldCheck className="h-4 w-4 text-indigo-400" />
          <span>Ledger System Active</span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
          <Database className="h-3.5 w-3.5" />
          <span>Mock Repository</span>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:brightness-110 transition-all duration-200"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Catat Transaksi</span>
        </button>
      </div>
    </header>
  );
};
