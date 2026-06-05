import React from 'react'
import Link from 'next/link'
import { ProgressSteps } from '@/app/components/ui/ProgressSteps'
import { Registration } from '@/types'
import { Clock, CheckCircle2, XCircle, Info, Download, Mail, RotateCcw, Loader2 } from 'lucide-react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { LibraryCardPDF } from '@/app/components/LibraryCardPDF'

interface StatusCardProps {
  result: Partial<Registration>
  barcodeData: string
  formatDate: (iso: string | null | undefined) => string
}

export function StatusCard({ result, barcodeData, formatDate }: StatusCardProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
      {/* MENUNGGU */}
      {result.status === 'Menunggu' && (
        <div className="bg-white border border-yellow-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-yellow-900/5">
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4 text-white">
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                <Clock size={24} />
              </div>
              <h3 className="font-bold text-lg uppercase tracking-tight">Menunggu Verifikasi</h3>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
              Processing
            </span>
          </div>
          
          <div className="p-8 md:p-10 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Nama Lengkap</p>
                <p className="font-bold text-[#1e3a5f]">{result.fullname}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Nomor Tiket</p>
                <p className="font-black text-[#1e3a5f] tracking-tighter">{result.ticketNumber}</p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Tanggal Pendaftaran</p>
                <p className="font-bold text-[#1e3a5f]">{formatDate(result.createdAt)}</p>
              </div>
            </div>

            <div className="flex gap-4 p-5 bg-yellow-50 border border-yellow-100 rounded-2xl text-sm text-yellow-800 italic font-medium">
              <div className="p-2 bg-yellow-200/50 rounded-lg h-fit">
                <Info size={18} className="text-yellow-700" />
              </div>
              <p>Pendaftaran Anda sedang diverifikasi oleh petugas. Mohon tunggu 1–3 hari kerja.</p>
            </div>

            <div className="pt-4">
              <ProgressSteps steps={[
                { label: 'Diterima', state: 'done' },
                { label: 'Verifikasi', state: 'active' },
                { label: 'Selesai', state: 'pending' },
              ]} />
            </div>
          </div>
        </div>
      )}

      {/* DISETUJUI */}
      {result.status === 'Disetujui' && (
        <div className="bg-white border border-green-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-green-900/5">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4 text-white">
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-bold text-lg uppercase tracking-tight">Pendaftaran Disetujui</h3>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
              Approved
            </span>
          </div>

          <div className="p-8 md:p-10 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Nama Lengkap</p>
                <p className="font-bold text-[#1e3a5f]">{result.fullname}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Nomor Tiket</p>
                <p className="font-black text-[#1e3a5f] tracking-tighter">{result.ticketNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Tanggal Daftar</p>
                <p className="font-bold text-[#1e3a5f]">{formatDate(result.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Tanggal Disetujui</p>
                <p className="font-bold text-emerald-600">{formatDate(result.approvedAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-800 font-medium italic">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <p>Selamat! Pendaftaran Anda telah disetujui. Kartu sedang disiapkan.</p>
              </div>
              <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-800 font-medium italic">
                <Mail size={16} className="text-blue-600 shrink-0" />
                <p>Kartu digital dikirim ke email atau ambil fisik di Perpustakaan Batang.</p>
              </div>
            </div>

            {/* AREA UTAMA DOWNLOAD KARTU DENGAN PROXY IMAGE */}
            <div className="pt-4">
              {barcodeData ? (
                (() => {
                  const originalFotoUrl = result.pasFotoUrl || '';
                  const proxiedFotoUrl = originalFotoUrl 
                    ? `/api/proxy-image?url=${encodeURIComponent(originalFotoUrl)}` 
                    : '';

                  return (
                    <PDFDownloadLink
                      document={
                        <LibraryCardPDF
                          member={{
                            fullname: result.fullname || '',
                            memberNo: result.memberNo || result.ticketNumber || '',
                            jenisAnggota: (() => {
                              const jenisAnggotaMapping: Record<string, string> = {
                                '1': 'PELAJAR',
                                '2': 'UMUM',
                                '13': 'UMUM',
                              };
                              return jenisAnggotaMapping[String(result.jobId)] || 'UMUM';
                            })(),
                            endDate: result.endDate 
                              ? (() => {
                                  const dateObj = new Date(result.endDate);
                                  return `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;
                                })()
                              : '-',
                          }}
                          barcodeUrl={barcodeData}
                          pasFotoUrl={proxiedFotoUrl}
                          baseUrl={typeof window !== 'undefined' ? window.location.origin : ''}
                        />
                      }
                      fileName={`KARTU-PERPUS-${(result.fullname || 'UNKNOWN').toUpperCase().replace(/\s+/g, '-')}.pdf`}
                      className="group relative w-full py-5 rounded-2xl bg-[#1e3a5f] hover:bg-blue-900 hover:shadow-blue-900/20 text-white font-black text-lg overflow-hidden transition-all duration-300 active:scale-95 shadow-xl flex items-center justify-center gap-3"
                    >
                      {({ loading }) => (
                        <>
                          {loading ? (
                            <>
                              <Loader2 className="animate-spin" size={24} />
                              <span>MERAKIT KARTU PDF...</span>
                            </>
                          ) : (
                            <>
                              <Download size={24} className="group-hover:translate-y-1 transition-transform" />
                              <span>DOWNLOAD KARTU DIGITAL</span>
                            </>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </>
                      )}
                    </PDFDownloadLink>
                  )
                })()
              ) : (
                <div className="w-full py-5 bg-gray-50 border border-gray-100 text-gray-400 font-bold rounded-2xl flex items-center justify-center gap-3">
                  <Loader2 className="animate-spin text-gray-300" size={24} />
                  <span>MEMUAT DATA KARTU...</span>
                </div>
              )}
            </div>

            <div className="pt-4">
              <ProgressSteps steps={[
                { label: 'Diterima', state: 'done' },
                { label: 'Terverifikasi', state: 'done' },
                { label: 'Selesai', state: 'done' },
              ]} />
            </div>
          </div>
        </div>
      )}

      {/* DITOLAK */}
      {result.status === 'Ditolak' && (
        <div className="bg-white border border-rose-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-rose-900/5">
          <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4 text-white">
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                <XCircle size={24} />
              </div>
              <h3 className="font-bold text-lg uppercase tracking-tight">Pendaftaran Ditolak</h3>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
              Rejected
            </span>
          </div>

          <div className="p-8 md:p-10 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Nama Lengkap</p>
                <p className="font-bold text-[#1e3a5f]">{result.fullname}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Nomor Tiket</p>
                <p className="font-black text-[#1e3a5f] tracking-tighter">{result.ticketNumber}</p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Tanggal Daftar</p>
                <p className="font-bold text-[#1e3a5f]">{formatDate(result.createdAt)}</p>
              </div>
            </div>

            {result.rejectReason && (
              <div className="p-6 bg-rose-50 border-l-4 border-rose-500 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-black text-xs uppercase tracking-widest">
                  <Info size={14} />
                  <span>Alasan Penolakan</span>
                </div>
                <p className="text-rose-900/80 font-medium italic text-sm leading-relaxed">"{result.rejectReason}"</p>
              </div>
            )}

            <div className="flex gap-4 p-5 bg-orange-50 border border-orange-100 rounded-2xl text-xs text-orange-800 font-bold italic">
              <Info size={18} className="text-orange-600 shrink-0" />
              <p>Anda dapat mendaftar kembali dengan memperbaiki poin-poin penolakan di atas.</p>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="group relative flex items-center justify-center gap-3 w-full py-4 bg-[#1e3a5f] text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-900/10 hover:bg-blue-900 transition-all duration-300 active:scale-95"
              >
                <RotateCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                <span className="uppercase tracking-widest">DAFTAR ULANG SEKARANG</span>
              </Link>
            </div>

            <div className="pt-4 opacity-50 grayscale">
              <ProgressSteps steps={[
                { label: 'Diterima', state: 'done' },
                { label: 'Ditolak', state: 'rejected' },
                { label: 'Selesai', state: 'pending' },
              ]} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}