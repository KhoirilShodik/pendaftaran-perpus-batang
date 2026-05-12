import React from 'react';
import { CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';

interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  const isSuccess = message.includes('✅') || message.includes('Berhasil');
  const isError = message.includes('❌') || message.includes('Gagal');
  const isWarning = message.includes('⚠️');

  return (
    <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-10 fade-in duration-300">
      <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border ${
        isSuccess ? 'bg-emerald-500/90 border-emerald-400 text-white' :
        isError ? 'bg-rose-500/90 border-rose-400 text-white' :
        isWarning ? 'bg-amber-500/90 border-amber-400 text-white' :
        'bg-[#1e3a5f]/90 border-blue-400 text-white'
      }`}>
        {isSuccess && <CheckCircle2 size={20} />}
        {isError && <XCircle size={20} />}
        {isWarning && <ShieldAlert size={20} />}
        <span className="text-sm font-black uppercase tracking-widest">
          {message.replace(/[✅❌⚠️]/g, '').trim()}
        </span>
      </div>
    </div>
  );
}
