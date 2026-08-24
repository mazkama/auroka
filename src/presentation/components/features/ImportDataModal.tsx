'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  DownloadCloud,
} from 'lucide-react';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (fileName: string, rowCount: number) => void;
}

export const ImportDataModal: React.FC<ImportDataModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const hasValidExtension = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      alert('Format file tidak didukung. Harap unggah file dengan format .xlsx, .xls, atau .csv');
      return;
    }

    setSelectedFile(file);
  };

  const handleProcessImport = () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    // Simulate parsing and importing process
    setTimeout(() => {
      setIsProcessing(false);
      const simulatedRows = Math.floor(Math.random() * 15) + 12;
      onSuccess(selectedFile.name, simulatedRows);
      setSelectedFile(null);
      onClose();
    }, 1200);
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Tanggal,Judul_Transaksi,Tipe,Dompet,Kategori,Nominal,Nitip_Teman,Rating\n2026-08-20,Gaji Pokok Agustus,IN,Bank BCA Utama,Pendapatan,18500000,,\n2026-08-21,Makan Siang Sate,OUT,GoPay Premium,Makan & Minum,380000,,5\n2026-08-22,Es Kopi Susu,OUT,Bank Mandiri,Makan & Minum,85000,Budi,4\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'template_transaksi_auroka.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#eff4ff] text-[#004ac6]">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0f172a]">
                Import Transaksi Excel / CSV
              </h3>
              <p className="text-xs text-[#64748b]">
                Unggah berkas pembukuan untuk diintegrasikan ke Ledger
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Upload Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#004ac6] bg-[#eff4ff]/60'
                : selectedFile
                ? 'border-[#006c49] bg-[#f0fdf4]/50'
                : 'border-[#cbd5e1] hover:border-[#004ac6] hover:bg-[#f8fafc]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#006c49]/10 text-[#006c49] flex items-center justify-center mx-auto">
                  <FileCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0f172a] truncate max-w-xs mx-auto">
                    {selectedFile.name}
                  </p>
                  <p className="text-[10px] text-[#64748b]">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Siap diproses
                  </p>
                </div>
                <span className="inline-block text-[10px] font-bold text-[#006c49] bg-[#006c49]/15 px-2 py-0.5 rounded-full">
                  Format Valid
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center mx-auto">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0f172a]">
                    Klik untuk memilih berkas atau tarik ke sini
                  </p>
                  <p className="text-[10px] text-[#64748b] mt-0.5">
                    Mendukung format .XLSX, .XLS, dan .CSV (Maks. 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Column Guidelines & Template Download */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0f172a] text-[11px]">
                Format Kolom yang Dibutuhkan:
              </span>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-[#004ac6] hover:underline"
              >
                <DownloadCloud className="h-3 w-3" />
                <span>Unduh Template CSV</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['Tanggal', 'Judul_Transaksi', 'Tipe (IN/OUT)', 'Dompet', 'Kategori', 'Nominal', 'Nitip_Teman', 'Rating'].map(
                (col) => (
                  <span
                    key={col}
                    className="text-[10px] bg-white border border-[#e2e8f0] px-2 py-0.5 rounded-md font-mono text-[#475569]"
                  >
                    {col}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#f1f5f9] bg-[#f8fafc]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#64748b] hover:text-[#0f172a] transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!selectedFile || isProcessing}
            onClick={handleProcessImport}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
              !selectedFile || isProcessing
                ? 'bg-[#94a3b8] cursor-not-allowed'
                : 'bg-[#004ac6] hover:bg-[#2563eb] shadow-[#004ac6]/20'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Memproses Data...</span>
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                <span>Import ke Ledger</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
