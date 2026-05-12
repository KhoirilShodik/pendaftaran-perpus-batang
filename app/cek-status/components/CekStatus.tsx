'use client'

import { useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useStatusSearch } from '@/hooks/useStatusSearch'
import { STATUS_CONFIG } from '@/lib/constants'
import { StatusCard } from '@/app/components/status/StatusCard'
import { Search, ArrowLeft, XCircle, Loader2, BookOpen } from 'lucide-react'

function CekStatusInner() {
  const searchParams = useSearchParams()
  const {
    ticketInput,
    setTicketInput,
    searchState,
    result,
    qrCodeData,
    handleSearch,
    generateQRCode
  } = useStatusSearch(searchParams.get('tiket')?.toUpperCase() || '')

  // Auto-search jika ada ?tiket= di URL
  useEffect(() => {
    const tiketFromUrl = searchParams.get('tiket')
    if (tiketFromUrl) {
      handleSearch(tiketFromUrl)
    }
  }, [searchParams, handleSearch])

  useEffect(() => {
    if (result && result.status === 'Disetujui' && result.ticketNumber) {
      generateQRCode(result.ticketNumber)
    }
  }, [result, generateQRCode])

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const getImageUrl = (path: string, folder: 'pas-foto' | 'foto-ktp') => {
    if (!path) return null;
    const cleanPath = path.trim();
    const finalPath = cleanPath.includes('/') ? cleanPath : `${folder}/${cleanPath}`;
    return `${supabaseUrl}/storage/v1/object/public/${STATUS_CONFIG.STORAGE_BUCKET}/${finalPath}`;
  };

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return '-'
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] font-sans">
      {/* HEADER - Consistent with Landing Page */}
      <div className="relative overflow-hidden bg-[#1e3a5f] pt-12 pb-24 md:pt-16 md:pb-32 px-4">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-white to-transparent blur-3xl" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-tl from-[#c8a84b] to-transparent blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
                <BookOpen className="text-[#c8a84b]" size={40} />
              </div>
              <div className="h-12 w-[1px] bg-white/20" />
              <div className="text-left">
                <h2 className="text-[#c8a84b] font-black tracking-[0.2em] text-xs uppercase">DISPUSPA</h2>
                <h2 className="text-white font-black tracking-[0.1em] text-xs uppercase">KAB. BATANG</h2>
              </div>
            </div>
            
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none uppercase">
                CEK STATUS <span className="text-[#c8a84b]">PENDAFTARAN</span>
              </h1>
              <p className="text-blue-100/70 text-sm md:text-base font-medium max-w-xl mx-auto uppercase tracking-widest">
                Dinas Perpustakaan dan Kearsipan Kabupaten Batang
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="relative z-20 max-w-3xl mx-auto px-4 -mt-16 md:-mt-24 pb-20 space-y-8">
        {/* SEARCH CARD */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-gray-100 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-50 text-[#1e3a5f] rounded-2xl">
              <Search size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1e3a5f]">Masukkan Nomor Tiket</h2>
              <p className="text-sm text-gray-400 font-medium">Contoh: REG-2026-XXXXX</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative group">
              <input
                type="text"
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="REG-2026-XXXXX"
                className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-lg font-bold text-[#1e3a5f] focus:outline-none focus:ring-4 focus:ring-blue-900/5 focus:border-[#1e3a5f] transition-all placeholder:text-gray-300 placeholder:font-normal uppercase tracking-widest"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={searchState === 'loading' || !ticketInput.trim()}
              className="px-8 py-4 rounded-2xl bg-[#1e3a5f] text-white font-bold text-base transition-all duration-300 active:scale-95 shadow-xl shadow-blue-900/20 hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
            >
              {searchState === 'loading' ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Search size={20} className="group-hover:scale-110 transition-transform" />
              )}
              <span>CEK STATUS</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {searchState === 'loading' && (
          <div className="bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-gray-100 p-16 flex flex-col items-center justify-center gap-6 animate-pulse">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-100 rounded-full" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-t-[#1e3a5f] rounded-full animate-spin" />
            </div>
            <p className="text-[#1e3a5f] font-black tracking-widest text-xs uppercase">Mencari data pendaftaran...</p>
          </div>
        )}

        {/* Not Found State */}
        {searchState === 'not_found' && (
          <div className="bg-rose-50 border-2 border-rose-100 rounded-[2.5rem] p-10 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} />
            </div>
            <h3 className="text-xl font-bold text-rose-900 mb-2 uppercase tracking-tight">Tiket Tidak Ditemukan</h3>
            <p className="text-rose-700/70 text-sm font-medium max-w-xs mx-auto leading-relaxed">
              Pastikan nomor tiket sudah benar. Cek kembali email konfirmasi yang kami kirimkan.
            </p>
          </div>
        )}

        {/* Found Result */}
        {searchState === 'found' && result && (
          <StatusCard 
            result={result} 
            qrCodeData={qrCodeData} 
            getImageUrl={getImageUrl} 
            formatDate={formatDate} 
          />
        )}

        {/* FOOTER NAVIGATION */}
        <div className="flex justify-center pt-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-[#1e3a5f] text-sm font-bold hover:bg-gray-200 transition-all active:scale-95 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>KEMBALI KE PENDAFTARAN</span>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default function CekStatus() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-50 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-t-[#1e3a5f] rounded-full animate-spin" />
        </div>
      </div>
    }>
      <CekStatusInner />
    </Suspense>
  )
}
