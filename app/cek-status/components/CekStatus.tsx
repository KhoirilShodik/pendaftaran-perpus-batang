'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { LibraryCardPDF } from '@/app/components/LibraryCardPDF'
import QRCode from 'qrcode'

type RegistrationStatus = 'Menunggu' | 'Disetujui' | 'Ditolak'

interface SearchResult {
  ticket_no: string
  fullname: string
  status: RegistrationStatus
  created_at: string
  approved_at: string | null
  reject_reason: string | null
  pas_foto_url: string | null
}

type SearchState = 'idle' | 'loading' | 'not_found' | 'found'

function CekStatusInner() {
  const [ticketInput, setTicketInput] = useState('')
  const [searchState, setSearchState] = useState<SearchState>('idle')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [qrCodeData, setQrCodeData] = useState<string>('')
  const searchParams = useSearchParams()

  const handleSearch = async (overrideTicket?: string) => {
    const ticket = (overrideTicket || ticketInput).toUpperCase().trim()
    if (!ticket) return

    setSearchState('loading')
    setResult(null)

    const { data, error } = await supabase
      .from('registrations')
      .select('ticket_no, fullname, status, created_at, approved_at, reject_reason, pas_foto_url')
      .eq('ticket_no', ticket)
      .single()

    if (error || !data) {
      setSearchState('not_found')
    } else {
      setResult(data as SearchResult)
      setSearchState('found')
    }
  }



  const generateQRCode = async (ticketNo: string) => {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pendaftaran-perpus-batang.vercel.app'
      const url = `${baseUrl}/cek-status?tiket=${ticketNo}`
      const qrData = await QRCode.toDataURL(url, {
        margin: 1,
        width: 150,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#1e3a5f',
          light: '#ffffff'
        }
      })
      setQrCodeData(qrData)
    } catch (err) {
      console.error('Error generating QR code:', err)
    }
  }

  // Auto-search jika ada ?tiket= di URL
  useEffect(() => {
    const tiketFromUrl = searchParams.get('tiket')
    if (tiketFromUrl) {
      setTicketInput(tiketFromUrl.toUpperCase())
      handleSearch(tiketFromUrl)
    }
  }, [])

  useEffect(() => {
    if (result && result.status === 'Disetujui') {
      generateQRCode(result.ticket_no)
    }
  }, [result])

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const getImageUrl = (path: string, folder: 'pas-foto' | 'foto-ktp') => {
    if (!path) return null;
    const cleanPath = path.trim();
    const finalPath = cleanPath.includes('/') ? cleanPath : `${folder}/${cleanPath}`;
    return `${supabaseUrl}/storage/v1/object/public/dokumen-anggota/${finalPath}`;
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '-'
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* HEADER */}
      <header style={{ backgroundColor: '#1e3a5f' }} className="py-6 md:py-10 px-4 shadow-lg">
  <div className="max-w-3xl mx-auto text-center">
    {/* Menggunakan flex-col di mobile agar ikon di atas teks, lalu flex-row di desktop */}
    <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 mb-3">
      <span className="text-3xl md:text-4xl">🔍</span>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-[0.15em] md:tracking-[0.25em] text-white uppercase leading-tight">
        Cek Status Pendaftaran
      </h1>
    </div>
    
    {/* Ukuran teks instansi dibuat lebih kecil dan rapat di mobile */}
    <p className="text-[10px] sm:text-xs md:text-sm font-medium uppercase tracking-wider opacity-90 px-2" style={{ color: '#c8a84b' }}>
      Dinas Perpustakaan dan Kearsipan Kabupaten Batang
    </p>
  </div>
</header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* SEARCH CARD */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
          <h2 className="text-lg font-bold mb-1" style={{ color: '#1e3a5f' }}>
            Masukkan Nomor Tiket Anda
          </h2>
          <p className="text-xs text-gray-400 mb-5">
            Nomor tiket tercantum di halaman konfirmasi saat mendaftar dan dikirim ke email Anda
          </p>

          <div className="flex gap-3">
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Contoh: REG-2026-12345"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent uppercase tracking-widest"
              style={{ '--tw-ring-color': '#1e3a5f' } as React.CSSProperties}
            />
            <button
              onClick={() => handleSearch()}
              disabled={searchState === 'loading' || !ticketInput.trim()}
              className="px-6 py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 shadow-md"
              style={{ backgroundColor: '#1e3a5f' }}
            >
              CEK STATUS
            </button>
          </div>
        </div>

        {/* Loading */}
        {searchState === 'loading' && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 flex flex-col items-center gap-4">
            <div
              className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: '#1e3a5f', borderTopColor: 'transparent' }}
            />
            <p className="text-gray-500 text-sm font-medium">Mencari data...</p>
          </div>
        )}

        {/* Not Found */}
        {searchState === 'not_found' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">❌</div>
            <h3 className="font-bold text-red-700 text-lg mb-2">Nomor Tiket Tidak Ditemukan</h3>
            <p className="text-red-600 text-sm">
              Pastikan nomor tiket yang Anda masukkan sudah benar. Nomor tiket tercantum
              di halaman konfirmasi saat mendaftar.
            </p>
          </div>
        )}

        {/* Found */}
        {searchState === 'found' && result && (
          <>
            {/* MENUNGGU */}
            {result.status === 'Menunggu' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl overflow-hidden shadow-md">
                <div className="bg-yellow-400 px-6 py-4 flex items-center gap-3">
                  <span className="text-2xl">⏳</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-yellow-900 bg-yellow-200 px-2 py-0.5 rounded-full">
                    Menunggu Verifikasi
                  </span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <span className="text-gray-500">Nama Lengkap</span>
                    <span className="font-semibold text-gray-900">{result.fullname}</span>
                    <span className="text-gray-500">Nomor Tiket</span>
                    <span className="font-mono font-bold" style={{ color: '#1e3a5f' }}>{result.ticket_no}</span>
                    <span className="text-gray-500">Tanggal Daftar</span>
                    <span>{formatDate(result.created_at)}</span>
                  </div>
                  <div className="bg-yellow-100 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                    Pendaftaran Anda sedang dalam proses verifikasi oleh petugas. Estimasi{' '}
                    <strong>1–3 hari kerja</strong>.
                  </div>
                  <ProgressSteps steps={[
                    { label: 'Formulir Diterima', state: 'done' },
                    { label: 'Sedang Diverifikasi', state: 'active' },
                    { label: 'Selesai', state: 'pending' },
                  ]} />
                </div>
              </div>
            )}

            {/* DISETUJUI */}
            {result.status === 'Disetujui' && (
              <div className="bg-green-50 border border-green-200 rounded-2xl overflow-hidden shadow-md">
                <div className="bg-green-500 px-6 py-4 flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-white bg-green-700 px-2 py-0.5 rounded-full">
                    Pendaftaran Disetujui
                  </span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <span className="text-gray-500">Nama Lengkap</span>
                    <span className="font-semibold text-gray-900">{result.fullname}</span>
                    <span className="text-gray-500">Nomor Tiket</span>
                    <span className="font-mono font-bold" style={{ color: '#1e3a5f' }}>{result.ticket_no}</span>
                    <span className="text-gray-500">Tanggal Daftar</span>
                    <span>{formatDate(result.created_at)}</span>
                    <span className="text-gray-500">Tanggal Disetujui</span>
                    <span className="text-green-700 font-medium">{formatDate(result.approved_at)}</span>
                  </div>
                  <div className="bg-green-100 border border-green-200 rounded-xl p-4 text-sm text-green-800">
                    🎉 <strong>Selamat!</strong> Pendaftaran Anda telah disetujui. Kartu anggota
                    perpustakaan Anda sedang disiapkan.
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 flex gap-2">
                    <span className="text-base">📬</span>
                    <span>
                      Kartu anggota akan dikirimkan ke email Anda atau dapat diambil langsung di{' '}
                      <strong>Perpustakaan Daerah Kabupaten Batang</strong>.
                    </span>
                  </div>

                  {/* DOWNLOAD BUTTON */}
                  <div className="pt-2">
                    {qrCodeData ? (
                      <PDFDownloadLink
                        document={
                          <LibraryCardPDF 
                            registration={{
                              fullname: result.fullname,
                              ticketNo: result.ticket_no
                            }}
                            qrCodeUrl={qrCodeData}
                            pasFotoPublicUrl={getImageUrl(result.pas_foto_url || '', 'pas-foto') || ''}
                          />
                        }
                        fileName={`KARTU-PERPUS-${result.fullname.toUpperCase().replace(/\s+/g, '-')}.pdf`}
                      >
                        {({ loading }) => (
                          <button 
                            disabled={loading}
                            className="w-full py-4 bg-blue-900 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-800 transition-all shadow-lg active:scale-[0.98]"
                            style={{ backgroundColor: '#1e3a5f' }}
                          >
                            {loading ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                MENYIAPKAN KARTU...
                              </>
                            ) : (
                              <>
                                <span className="text-xl">📥</span>
                                DOWNLOAD KARTU DIGITAL
                              </>
                            )}
                          </button>
                        )}
                      </PDFDownloadLink>
                    ) : (
                      <div className="w-full py-4 bg-gray-100 text-gray-400 font-bold rounded-2xl flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                        MENYIAPKAN DATA...
                      </div>
                    )}
                  </div>
                  <ProgressSteps steps={[
                    { label: 'Formulir Diterima', state: 'done' },
                    { label: 'Terverifikasi', state: 'done' },
                    { label: 'Selesai', state: 'done' },
                  ]} />
                </div>
              </div>
            )}

            {/* DITOLAK */}
            {result.status === 'Ditolak' && (
              <div className="bg-red-50 border border-red-200 rounded-2xl overflow-hidden shadow-md">
                <div className="bg-red-500 px-6 py-4 flex items-center gap-3">
                  <span className="text-2xl">❌</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-white bg-red-700 px-2 py-0.5 rounded-full">
                    Pendaftaran Ditolak
                  </span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <span className="text-gray-500">Nama Lengkap</span>
                    <span className="font-semibold text-gray-900">{result.fullname}</span>
                    <span className="text-gray-500">Nomor Tiket</span>
                    <span className="font-mono font-bold" style={{ color: '#1e3a5f' }}>{result.ticket_no}</span>
                    <span className="text-gray-500">Tanggal Daftar</span>
                    <span>{formatDate(result.created_at)}</span>
                  </div>
                  {result.reject_reason && (
                    <div className="bg-red-100 border border-red-200 rounded-xl p-4 text-sm text-red-800">
                      <p className="font-bold mb-1">Alasan Penolakan:</p>
                      <p className="italic">{result.reject_reason}</p>
                    </div>
                  )}
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-orange-700">
                    ℹ️ Anda dapat mendaftar ulang dengan memperbaiki kekurangan di atas.
                  </div>
                  <ProgressSteps steps={[
                    { label: 'Formulir Diterima', state: 'done' },
                    { label: 'Ditolak', state: 'rejected' },
                    { label: 'Selesai', state: 'pending' },
                  ]} />
                  <Link
                    href="/"
                    className="block w-full text-center py-3 rounded-xl text-white font-bold text-sm transition-opacity hover:opacity-90 mt-2"
                    style={{ backgroundColor: '#1e3a5f' }}
                  >
                    DAFTAR ULANG
                  </Link>
                </div>
              </div>
            )}
          </>
        )}

        {/* BACK LINK */}
        <div className="text-center pt-2 pb-8">
          <Link
            href="/"
            className="text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: '#1e3a5f' }}
          >
            ← Kembali ke Halaman Pendaftaran
          </Link>
        </div>
      </main>
    </div>
  )
}

export default function CekStatus() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#1e3a5f', borderTopColor: 'transparent' }} />
      </div>
    }>
      <CekStatusInner />
    </Suspense>
  )
}

/* ─── Progress Steps Component ─── */
type StepState = 'done' | 'active' | 'pending' | 'rejected'

function ProgressSteps({ steps }: { steps: { label: string; state: StepState }[] }) {
  const icon = (s: StepState) => {
    if (s === 'done') return '✅'
    if (s === 'active') return '⏳'
    if (s === 'rejected') return '❌'
    return '⬜'
  }

  const labelColor = (s: StepState) => {
    if (s === 'done') return 'text-green-700'
    if (s === 'active') return 'text-yellow-700 font-bold'
    if (s === 'rejected') return 'text-red-700 font-bold'
    return 'text-gray-400'
  }

  return (
    <div className="flex items-center gap-1 pt-2">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <span className="text-lg">{icon(step.state)}</span>
            <span className={`text-[10px] text-center mt-1 leading-tight ${labelColor(step.state)}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="h-px flex-1 bg-gray-200 mb-4 mx-1" />
          )}
        </div>
      ))}
    </div>
  )
}
