import React from 'react'
import {
  X, User, MapPin, Phone, Mail, School,
  CheckCircle2, XCircle, Download, Loader2,
  Info, Heart, ShieldAlert, CreditCard, Calendar, Eye
} from 'lucide-react'
import { Registration } from '@/types'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { LibraryCardPDF } from '@/app/components/LibraryCardPDF'

interface ActionModalsProps {
  selectedReg: Registration | null
  onClose: () => void
  onApprove: (reg: Registration) => void
  onReject: () => void
  qrCodeData: string
  getImageUrl: (path: string) => string | null
  showRejectForm: boolean
  setShowRejectForm: (show: boolean) => void
  rejectReason: string
  setRejectReason: (reason: string) => void
}

export function ActionModals({
  selectedReg,
  onClose,
  onApprove,
  onReject,
  qrCodeData,
  getImageUrl,
  showRejectForm,
  setShowRejectForm,
  rejectReason,
  setRejectReason
}: ActionModalsProps) {
  if (!selectedReg) return null

  // Helper untuk mendeteksi dan menangani URL absolut vs URL relatif dari database
  const resolveImageUrl = (path: string | null | undefined): string => {
    if (!path) return ''
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }
    return getImageUrl(path) || ''
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur-md w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-900">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-900">Detail Pendaftaran</h2>
              <p className="text-xs font-mono text-gray-500 tracking-wider uppercase">{selectedReg.ticketNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200/50 rounded-full transition-all duration-200 active:scale-90 text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Konten Utama */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Kolom Kiri: Data Teks */}
          <div className="space-y-8">
            <section>
              <h3 className="text-[10px] font-bold text-blue-900/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Info size={12} /> Data Pribadi
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-start group">
                  <span className="text-gray-400 flex items-center gap-2"><User size={14} /> Nama</span>
                  <span className="font-semibold text-gray-800 text-right">{selectedReg.fullname}</span>
                </div>
                <div className="flex justify-between items-start group">
                  <span className="text-gray-400 flex items-center gap-2"><CreditCard size={14} /> NIK</span>
                  <span className="font-mono text-gray-800">{selectedReg.identityNo}</span>
                </div>
                <div className="flex justify-between items-start group">
                  <span className="text-gray-400 flex items-center gap-2"><Calendar size={14} /> TTL</span>
                  <span className="text-gray-800 text-right">{selectedReg.placeOfBirth}, {selectedReg.dateOfBirth}</span>
                </div>
                <div className="flex justify-between items-start group">
                  <span className="text-gray-400 flex items-center gap-2"><MapPin size={14} /> Alamat</span>
                  <span className="text-gray-800 text-right max-w-[200px] leading-tight">
                    {selectedReg.address}, RT{selectedReg.rt}/RW{selectedReg.rw}, {selectedReg.kelurahan}, {selectedReg.kecamatan}
                  </span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-bold text-blue-900/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Phone size={12} /> Kontak & Instansi
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-2"><Phone size={14} /> No. HP</span>
                  <span className="font-bold text-green-700">{selectedReg.noHp}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-2"><Mail size={14} /> Email</span>
                  <span className="text-gray-800">{selectedReg.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-2"><School size={14} /> Instansi</span>
                  <span className="text-gray-800">{selectedReg.institutionName || '-'}</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-bold text-blue-900/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Heart size={12} /> Kontak Darurat
              </h3>
              <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Nama</span>
                  <span className="font-medium">{selectedReg.namaDarurat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Hubungan</span>
                  <span className="text-gray-600 italic">{selectedReg.statusHubunganDarurat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Telepon</span>
                  <span className="font-mono text-blue-700">{selectedReg.telpDarurat}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Kolom Kanan: Gambar Lampiran & Keterangan Tolak */}
          <div className="space-y-8">
            <section>
              <h3 className="text-[10px] font-bold text-blue-900/40 uppercase tracking-[0.2em] mb-4">Berkas Lampiran</h3>

              {/* Pas Foto - Vertikal */}
              <div className="mb-4">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <User size={10} /> Pas Foto
                  <span className="text-gray-300 font-normal">(Vertikal)</span>
                </p>
                <div className="relative group overflow-hidden rounded-2xl border-2 border-gray-100 bg-gray-50 aspect-[3/4] max-w-[160px]">
                  {selectedReg.pasFotoUrl ? (
                    <>
                      <img
                        src={resolveImageUrl(selectedReg.pasFotoUrl)}
                        alt="Pas Foto"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <a
                        href={resolveImageUrl(selectedReg.pasFotoUrl) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100"
                        title="Klik untuk lihat/unduh"
                      >
                        <div className="flex flex-col items-center gap-1 text-white">
                          <Eye size={20} />
                          <span className="text-[10px] font-bold">Lihat / Unduh</span>
                        </div>
                      </a>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                      <User size={32} strokeWidth={1} />
                      <span className="text-[10px]">Kosong</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Foto KTP - Horizontal */}
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <CreditCard size={10} /> Foto KTP / Identitas
                  <span className="text-gray-300 font-normal">(Horizontal)</span>
                </p>
                <div className="relative group overflow-hidden rounded-2xl border-2 border-gray-100 bg-gray-50 aspect-[16/9] w-full">
                  {selectedReg.fotoKtpUrl ? (
                    <>
                      <img
                        src={resolveImageUrl(selectedReg.fotoKtpUrl)}
                        alt="Foto KTP"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <a
                        href={resolveImageUrl(selectedReg.fotoKtpUrl) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100"
                        title="Klik untuk lihat/unduh"
                      >
                        <div className="flex flex-col items-center gap-1 text-white">
                          <Eye size={20} />
                          <span className="text-[10px] font-bold">Lihat / Unduh</span>
                        </div>
                      </a>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                      <CreditCard size={32} strokeWidth={1} />
                      <span className="text-[10px]">Kosong</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Jika status saat ini ditolak, tampilkan alasannya */}
            {selectedReg.status === 'Ditolak' && (
              <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex gap-4 items-start">
                <div className="p-2 bg-rose-100 rounded-lg text-rose-600 shrink-0">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-700 uppercase mb-1 tracking-wider">Alasan Penolakan</p>
                  <p className="text-sm text-rose-900/80 leading-relaxed italic">"{selectedReg.rejectReason}"</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Modal: Tombol Aksi Bersyarat */}
        <div className="p-6 border-t bg-gray-50/50 rounded-b-3xl">

          {/* KONDISI 1: Menunggu Persetujuan (Form Penolakan Belum Terbuka) */}
          {selectedReg.status === 'Menunggu' && !showRejectForm && (
            <div className="flex gap-4">
              <button
                onClick={() => setShowRejectForm(true)}
                className="flex-1 py-3.5 bg-white border border-rose-200 text-rose-600 font-bold rounded-2xl hover:bg-rose-50 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 shadow-sm shadow-rose-100/50"
              >
                <XCircle size={18} /> TOLAK
              </button>
              <button
                onClick={() => onApprove(selectedReg)}
                className="flex-[2] py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-2xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-green-200"
              >
                <CheckCircle2 size={18} /> SETUJUI & KIRIM
              </button>
            </div>
          )}

          {/* KONDISI 2: Form Pengisian Alasan Penolakan Sedang Terbuka */}
          {showRejectForm && (
            <div className="animate-in slide-in-from-bottom-4 duration-300">
              <label htmlFor="reject-textarea" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <ShieldAlert size={16} className="text-rose-500" /> Alasan Penolakan:
              </label>
              <textarea
                id="reject-textarea"
                className="w-full border-2 border-rose-50 rounded-2xl p-4 text-sm focus:border-rose-300 outline-none mb-4 bg-white transition-all focus:ring-4 focus:ring-rose-50"
                rows={3}
                placeholder="Jelaskan alasan penolakan secara jelas kepada pendaftar..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={onReject}
                  disabled={!rejectReason.trim()}
                  className={`px-8 py-2.5 text-sm font-bold text-white rounded-xl transition-all duration-200 active:scale-95 flex items-center gap-2 ${!rejectReason.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200'}`}
                >
                  <XCircle size={16} /> KONFIRMASI TOLAK
                </button>
              </div>
            </div>
          )}

          {/* KONDISI 3: Pendaftaran Sudah Disetujui */}
          {selectedReg.status === 'Disetujui' && (
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <div className="flex-1">
                {qrCodeData ? (
                  (() => {
                    const originalFotoUrl = selectedReg.pasFotoUrl
                      ? (selectedReg.pasFotoUrl.startsWith('http') ? selectedReg.pasFotoUrl : resolveImageUrl(selectedReg.pasFotoUrl))
                      : '';

                    const proxiedFotoUrl = originalFotoUrl
                      ? `/api/proxy-image?url=${encodeURIComponent(originalFotoUrl)}`
                      : '';

                    return (
                      <PDFDownloadLink
                        document={
                          <LibraryCardPDF
                            member={{
                              fullname: selectedReg.fullname,
                              memberNo: selectedReg.memberNo || selectedReg.ticketNumber,
                              jenisAnggota: (() => {
                                const jenisAnggotaMapping: Record<string, string> = {
                                  '1': 'PELAJAR',
                                  '2': 'UMUM',
                                  '13': 'UMUM',
                                };
                                return jenisAnggotaMapping[String(selectedReg.jobId)] || 'UMUM';
                              })(),
                              endDate: selectedReg.endDate
                                ? (() => {
                                  const dateObj = new Date(selectedReg.endDate);
                                  return `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;
                                })()
                                : '-',
                            }}
                            barcodeUrl={qrCodeData}
                            pasFotoUrl={proxiedFotoUrl}
                            baseUrl={typeof window !== 'undefined' ? window.location.origin : ''}
                          />
                        }
                        fileName={`KARTU-PERPUS-${selectedReg.fullname.toUpperCase().replace(/\s+/g, '-')}.pdf`}
                        className="w-full py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-95 transition-all duration-200 active:scale-95 shadow-xl shadow-blue-200"
                      >
                        {({ loading }) => loading ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            MEMPROSES DATA KARTU...
                          </>
                        ) : (
                          <>
                            <Download size={20} /> UNDUH KARTU DIGITAL
                          </>
                        )}
                      </PDFDownloadLink>
                    );
                  })()
                ) : (
                  <div className="w-full py-4 bg-gray-100 text-gray-400 font-bold rounded-2xl flex items-center justify-center gap-3">
                    <Loader2 className="animate-spin" size={20} />
                    MEMPROSES DATA...
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="py-4 px-8 bg-gray-200/60 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all duration-200 active:scale-95 sm:w-auto w-full text-center"
              >
                TUTUP
              </button>
            </div>
          )}

          {/* KONDISI 4: Pendaftaran Ditolak (Hanya Menampilkan Tombol Tutup Bersih) */}
          {selectedReg.status === 'Ditolak' && (
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-gray-200/50 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95 text-center"
            >
              TUTUP
            </button>
          )}

        </div>
      </div>
    </div>
  )
}