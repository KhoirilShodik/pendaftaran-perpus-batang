import React from 'react'
import { CheckCircle2, Copy, ShieldAlert, Search, PlusCircle, BookOpen } from 'lucide-react'

interface SuccessStateProps {
  ticketNumber: string
  email: string
}

export function SuccessState({ ticketNumber, email }: SuccessStateProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(ticketNumber)
    // Custom toast or alert could go here
  }

  return (  
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-500">
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-900/10 border border-gray-100 p-8 md:p-12 text-center max-w-lg w-full relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
        
        <div className="relative z-10">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-xl shadow-emerald-500/10 border-4 border-white">
            <CheckCircle2 size={48} className="-rotate-3" />
          </div>

          <h2 className="text-3xl font-black text-[#1e3a5f] mb-2 uppercase tracking-tight">Pendaftaran <span className="text-[#c8a84b]">Berhasil!</span></h2>
          <p className="text-gray-400 text-sm font-medium mb-10 max-w-xs mx-auto leading-relaxed">
            Formulir Anda telah diterima. Mohon simpan nomor tiket di bawah ini.
          </p>

          <div className="relative group rounded-[2rem] p-8 mb-8 overflow-hidden bg-[#1e3a5f] shadow-2xl shadow-blue-900/20">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1e3a5f] via-[#c8a84b] to-[#1e3a5f]" />
            <p className="text-blue-100/40 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Nomor Tiket Anda</p>
            <p className="text-white text-3xl font-black tracking-widest mb-6 font-mono select-all group-hover:scale-110 transition-transform duration-500">{ticketNumber}</p>
            
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 mx-auto bg-[#c8a84b] text-[#1e3a5f] px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95 shadow-lg group/btn"
            >
              <Copy size={14} className="group-hover/btn:rotate-12 transition-transform" />
              <span>Salin Nomor</span>
            </button>
          </div>

          <div className="bg-rose-50 border-2 border-rose-100 rounded-2xl p-5 mb-8 text-left flex gap-4">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-xl shrink-0 h-fit">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-rose-900 font-black text-xs uppercase tracking-widest mb-1">Simpan Nomor Tiket!</p>
              <p className="text-rose-700/70 text-[11px] font-medium leading-relaxed italic">
                Nomor tiket diperlukan untuk mengecek status pendaftaran dan mengambil kartu fisik di perpustakaan.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <a
              href={`/cek-status?tiket=${ticketNumber}`}
              className="group relative flex items-center justify-center gap-3 w-full py-5 bg-[#1e3a5f] rounded-2xl text-white font-black text-sm tracking-widest transition-all duration-300 active:scale-95 shadow-xl hover:bg-blue-900"
            >
              <Search size={20} className="group-hover:scale-110 transition-transform" />
              <span>CEK STATUS PENDAFTARAN</span>
            </a>
            <button
              onClick={() => window.location.reload()}
              className="group flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-black text-sm text-[#1e3a5f] border-2 border-gray-100 hover:bg-gray-50 transition-all active:scale-95"
            >
              <PlusCircle size={18} className="group-hover:rotate-90 transition-transform" />
              <span>DAFTAR ANGGOTA BARU</span>
            </button>
          </div>
          
          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col items-center gap-2">
            <BookOpen className="text-gray-200" size={24} />
            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">Dispuspa Kabupaten Batang</p>
          </div>
        </div>
      </div>
    </div>
  )
}
