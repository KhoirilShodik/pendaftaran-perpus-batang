    'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { LibraryCardPDF } from '@/app/components/LibraryCardPDF'
import QRCode from 'qrcode'

type RegistrationStatus = 'Menunggu' | 'Disetujui' | 'Ditolak'
type Registration = {
  id: number
  ticketNo: string
  fullname: string
  identityNo: string
  noHp: string
  email: string
  placeOfBirth: string
  dateOfBirth: string
  address: string
  kecamatan: string
  kelurahan: string
  rt: string
  rw: string
  city: string
  province: string
  sexId: number
  agamaId: number
  maritalStatusId: string
  pas_foto_url?: string
  foto_ktp_url?: string
  motherMaidenName: string
  identityTypeId: number
  educationLevelId: number
  jobId: number
  institutionName: string
  namaDarurat: string
  telpDarurat: string
  statusHubunganDarurat: string
  registerDate: string
  status: RegistrationStatus
  rejectReason?: string
}



export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginError, setLoginError] = useState('')
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [activeFilter, setActiveFilter] = useState<'Semua'|RegistrationStatus>('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReg, setSelectedReg] = useState<Registration|null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [toast, setToast] = useState('')
  const [qrCodeData, setQrCodeData] = useState<string>('')



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

  const fetchRegistrations = async () => {
    setIsLoadingData(true)
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped = (data || []).map((r: any) => ({
        id: r.id,
        ticketNo: r.ticket_no,
        fullname: r.fullname,
        identityNo: r.identity_no || '-',
        noHp: r.no_hp || '-',
        email: r.email || '-',
        placeOfBirth: r.place_of_birth || '-',
        dateOfBirth: r.date_of_birth || '-',
        address: r.address || '-',
        kecamatan: r.kecamatan || '-',
        kelurahan: r.kelurahan || '-',
        rt: r.rt || '-',
        rw: r.rw || '-',
        city: r.city || 'Batang',
        province: r.province || 'Jawa Tengah',
        sexId: r.sex_id || 0,
        agamaId: r.agama_id || 0,
        maritalStatusId: r.marital_status_id || '-',
        motherMaidenName: r.mother_maiden_name || '-',
        identityTypeId: r.identity_type_id || 0,
        educationLevelId: r.education_level_id || 0,
        jobId: r.job_id || 0,
        institutionName: r.institution_name || '',
        namaDarurat: r.nama_darurat || '-',
        telpDarurat: r.telp_darurat || '-',
        statusHubunganDarurat: r.status_hubungan_darurat || '-',
        pas_foto_url: r.pas_foto_url || '',
        foto_ktp_url: r.foto_ktp_url || '',
        registerDate: r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-',
        status: (r.status as RegistrationStatus) || 'Menunggu',
        rejectReason: r.reject_reason || '',
      }))

      setRegistrations(mapped)
    } catch (err) {
      console.error('Fetch error:', err)
      setFetchError('Gagal memuat data. Silakan refresh halaman.')
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      fetchRegistrations()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn])

  useEffect(() => {
  if (selectedReg && selectedReg.status === 'Disetujui') {
    // 1. Tentukan Base URL secara pintar
    // Jika ada environment variable, pakai itu. Jika tidak, pakai origin saat ini.
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    
    // 2. Gabungkan menjadi URL verifikasi
    const verifyUrl = `${baseUrl}/cek-status?tiket=${selectedReg.ticketNo}`;
    
    QRCode.toDataURL(verifyUrl, { width: 300, margin: 2 })
      .then(url => setQrCodeData(url))
      .catch(err => console.error("QR Error:", err));
  }
}, [selectedReg]);

  const handleLogin = () => {
    if (loginUser === 'admin.perpus' && loginPass === 'Dispuspa@2026') {
      setIsLoggedIn(true)
      setLoginError('')
    } else {
      setLoginError('Username atau password salah!')
    }
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleApprove = async (id: number) => {
    const reg = registrations.find(r => r.id === id)
    if (!reg) return

    const { error } = await supabase
      .from('registrations')
      .update({
        status: 'Disetujui',
        approved_at: new Date().toISOString(),
        approved_by: 'admin.perpus'
      })
      .eq('id', id)

    if (error) {
      showToast('❌ Gagal mengupdate status. Coba lagi.')
      return
    }

    // Update local state
    setRegistrations(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'Disetujui' } : r
    ))
    setShowModal(false)

    // Send approval email (non-blocking)
    // Send approval email (non-blocking)
    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'STATUS_APPROVED',
        email: reg.email,
        fullname: reg.fullname,
        ticketNumber: (reg as any).ticket_no // GANTI DARI ticketNo KE ticket_no
      })
    }).catch(err => console.error('Email approval error:', err))

    showToast('✅ Pendaftaran disetujui! Email notifikasi dikirim ke anggota.')
  }

  const handleReject = async (id: number) => {
    if (!rejectReason.trim()) return
    const { error } = await supabase
      .from('registrations')
      .update({ status: 'Ditolak', reject_reason: rejectReason })
      .eq('id', id)

    if (!error) {
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status: 'Ditolak', rejectReason } : r))
      setShowModal(false)
      setShowRejectForm(false)
      setRejectReason('')
      showToast('❌ Pendaftaran telah ditolak.')
    } else {
      showToast('❌ Gagal mengupdate status. Coba lagi.')
    }
  }

  const filtered = registrations.filter(r => {
    const matchFilter = activeFilter === 'Semua' || r.status === activeFilter
    const matchSearch = r.fullname.toLowerCase().includes(searchQuery.toLowerCase()) || r.ticketNo.includes(searchQuery)
    return matchFilter && matchSearch
  })

  const counts = { 
    total: registrations.length, 
    menunggu: registrations.filter(r=>r.status==='Menunggu').length, 
    disetujui: registrations.filter(r=>r.status==='Disetujui').length, 
    ditolak: registrations.filter(r=>r.status==='Ditolak').length 
  }

  // Ambil URL dari .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const getImageUrl = (path: string, folder: 'pas-foto' | 'foto-ktp') => {
  if (!path) return null;
  
  // Bersihkan path dari spasi yang tidak sengaja terinput
  const cleanPath = path.trim();
  
  // Logika: Jika di database 'cleanPath' belum ada folder/ (garis miring), 
  // kita tambahkan foldernya secara otomatis.
  const finalPath = cleanPath.includes('/') ? cleanPath : `${folder}/${cleanPath}`;

  return `${supabaseUrl}/storage/v1/object/public/dokumen-anggota/${finalPath}`;
};

  if (!isLoggedIn) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm border-t-4" style={{borderColor: '#1e3a5f'}}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{backgroundColor:'#1e3a5f'}}>
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="font-bold text-xl uppercase tracking-tight" style={{color:'#1e3a5f'}}>Login Admin</h1>
          <p className="text-gray-500 text-xs">Dinas Perpustakaan dan Kearsipan Batang</p>
        </div>
        {loginError && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4 border border-red-100">{loginError}</div>}
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase mb-1" style={{color:'#1e3a5f'}}>Username</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-900 outline-none" value={loginUser} onChange={e=>setLoginUser(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()} placeholder="admin.perpus"/>
        </div>
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase mb-1" style={{color:'#1e3a5f'}}>Password</label>
          <input type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-900 outline-none" value={loginPass} onChange={e=>setLoginPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()} placeholder="••••••••"/>
        </div>
        <button onClick={handleLogin} className="w-full py-2.5 rounded-lg text-white font-bold text-sm transition-opacity hover:opacity-90" style={{backgroundColor:'#1e3a5f'}}>MASUK SISTEM</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      {/* HEADER */}
      <header className="text-white py-6 px-6 shadow-md" style={{backgroundColor:'#1e3a5f'}}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-widest">DASHBOARD ADMIN — PENDAFTARAN ANGGOTA</h1>
              <button onClick={fetchRegistrations} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition ml-2">
                🔄 Refresh
              </button>
            </div>
            <p className="text-sm opacity-80" style={{color:'#c8a84b'}}>Dinas Perpustakaan dan Kearsipan Kabupaten Batang</p>
          </div>
          <button onClick={() => setIsLoggedIn(false)} className="text-xs bg-red-700 hover:bg-red-800 px-4 py-2 rounded font-bold transition-colors">LOGOUT</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        {isLoadingData && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">Memuat data pendaftaran...</p>
            </div>
          </div>
        )}
        {fetchError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-red-600 text-sm flex items-center gap-2">
            ⚠️ {fetchError}
            <button onClick={fetchRegistrations} className="ml-auto text-xs underline">Coba lagi</button>
          </div>
        )}
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Menunggu Review</p>
                <h3 className="text-3xl font-bold">{counts.menunggu}</h3>
              </div>
              <span className="text-3xl">⏳</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Disetujui</p>
                <h3 className="text-3xl font-bold">{counts.disetujui}</h3>
              </div>
              <span className="text-3xl">✅</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Ditolak</p>
                <h3 className="text-3xl font-bold">{counts.ditolak}</h3>
              </div>
              <span className="text-3xl">❌</span>
            </div>
          </div>
        </div>

        {/* FILTERS & SEARCH */}
        <div className="bg-white p-4 rounded-t-xl shadow-sm border-b flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
            {['Semua', 'Menunggu', 'Disetujui', 'Ditolak'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f as any)}
                className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeFilter === f ? 'bg-white shadow-sm text-blue-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Cari nama atau nomor tiket..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 opacity-30">🔍</span>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-b-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-[10px] font-bold tracking-wider">
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Nomor Tiket</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">NIK</th>
                <th className="px-6 py-4">Tanggal Daftar</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {filtered.map((reg, idx) => (
                <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-400 font-mono">{idx + 1}</td>
                  <td className="px-6 py-4 font-bold text-blue-900">{reg.ticketNo}</td>
                  <td className="px-6 py-4 font-medium">{reg.fullname}</td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-xs">{reg.identityNo}</td>
                  <td className="px-6 py-4 text-gray-500">{reg.registerDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                        reg.status === 'Menunggu' ? 'bg-yellow-100 text-yellow-700' :
                        reg.status === 'Disetujui' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {reg.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => { setSelectedReg(reg); setShowModal(true); setShowRejectForm(false); }}
                      className="text-xs font-bold px-4 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-900 hover:text-white transition-all"
                    >
                      LIHAT DETAIL
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">Data pendaftaran tidak ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* DETAIL MODAL */}
      {showModal && selectedReg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-blue-900">Detail Pendaftaran Anggota</h2>
                <p className="text-sm font-mono text-gray-500">{selectedReg.ticketNo}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-2xl hover:rotate-90 transition-transform">✕</button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-3 border-b pb-1">Data Pribadi</h3>
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <span className="text-gray-500">Nama Lengkap</span> <span className="font-medium">{selectedReg.fullname}</span>
                    <span className="text-gray-500">NIK</span> <span className="font-mono">{selectedReg.identityNo}</span>
                    <span className="text-gray-500">Tempat, Tgl Lahir</span> <span>{selectedReg.placeOfBirth}, {selectedReg.dateOfBirth}</span>
                    <span className="text-gray-500">Jenis Kelamin</span> <span>{selectedReg.sexId === 1 ? 'Laki-laki' : 'Perempuan'}</span>
                    <span className="text-gray-500">Alamat</span> <span className="leading-tight">{selectedReg.address}, RT{selectedReg.rt}/RW{selectedReg.rw}, {selectedReg.kelurahan}, {selectedReg.kecamatan}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-3 border-b pb-1">Kontak & Pendidikan</h3>
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <span className="text-gray-500">No. HP</span> <span className="font-medium text-green-700">{selectedReg.noHp}</span>
                    <span className="text-gray-500">Email</span> <span>{selectedReg.email}</span>
                    <span className="text-gray-500">Instansi</span> <span>{selectedReg.institutionName || '-'}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-3 border-b pb-1">Kontak Darurat</h3>
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <span className="text-gray-500">Nama</span> <span>{selectedReg.namaDarurat}</span>
                    <span className="text-gray-500">No. Telp</span> <span>{selectedReg.telpDarurat}</span>
                    <span className="text-gray-500">Hubungan</span> <span>{selectedReg.statusHubunganDarurat}</span>
                  </div>
                </div>
              </div>

              {/* Document Previews */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-3 border-b pb-1">Berkas Lampiran</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Pas Foto</p>
                      {selectedReg.pas_foto_url ? (
                        <img
                          src={getImageUrl(selectedReg.pas_foto_url, 'pas-foto') || ''}
                          alt="Pas Foto"
                          className="w-full rounded-lg border border-gray-200 object-cover aspect-[3/4]"
                          onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
                        />
                      ) : (
                        <div className="aspect-[3/4] bg-gray-100 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs text-center p-4">
                          Foto tidak tersedia
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Foto KTP</p>
                      {selectedReg.foto_ktp_url ? (
                        <img
                          src={getImageUrl(selectedReg.foto_ktp_url, 'foto-ktp') || ''}
                          alt="Foto KTP"
                          className="w-full rounded-lg border border-gray-200 object-cover aspect-[3/4]"
                          onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
                        />
                      ) : (
                        <div className="aspect-[3/4] bg-gray-100 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs text-center p-4">
                          Foto tidak tersedia
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedReg.status === 'Ditolak' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs font-bold text-red-700 uppercase mb-1">Alasan Penolakan:</p>
                    <p className="text-sm italic">{selectedReg.rejectReason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="p-6 border-t bg-gray-50 rounded-b-2xl">
              {selectedReg.status === 'Menunggu' && !showRejectForm && (
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowRejectForm(true)}
                    className="flex-1 py-3 bg-white border border-red-600 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors"
                  >
                    
                    ✗ TOLAK PENDAFTARAN
                  </button>
                  <button 
                    onClick={() => handleApprove(selectedReg.id)}
                    className="flex-2 py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 shadow-lg shadow-green-200 transition-colors flex-[2]"
                  >
                    ✓ SETUJUI & KIRIM KE INLISLITE
                  </button>
                </div>
              )}

              {showRejectForm && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <label className="block text-sm font-bold mb-2">Alasan Penolakan (Wajib diisi):</label>
                  <textarea 
                    className="w-full border-2 border-red-100 rounded-xl p-4 text-sm focus:border-red-400 outline-none mb-4"
                    rows={3}
                    placeholder="Contoh: Foto KTP tidak terbaca jelas atau data tidak sesuai dokumen..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setShowRejectForm(false)} className="px-6 py-2 text-sm font-bold text-gray-500">Batal</button>
                    <button 
                      onClick={() => handleReject(selectedReg.id)}
                      disabled={!rejectReason.trim()}
                      className={`px-8 py-2 text-sm font-bold text-white rounded-lg transition-all ${!rejectReason.trim() ? 'bg-gray-300' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                      KONFIRMASI TOLAK
                    </button>
                  </div>
                </div>
              )}

              {selectedReg.status === 'Disetujui' && (
                <div className="mb-4">
                  {qrCodeData ? (
                    <PDFDownloadLink
                      document={
                        <LibraryCardPDF 
                          registration={selectedReg}
                          qrCodeUrl={qrCodeData}
                          pasFotoPublicUrl={getImageUrl(selectedReg.pas_foto_url || '', 'pas-foto') || ''}
                        />
                      }
                      fileName={`KARTU-PERPUS-${selectedReg.fullname.toUpperCase().replace(/\s+/g, '-')}.pdf`}
                    >
                      {({ loading }) => (
                        <button 
                          disabled={loading}
                          className="w-full py-3 bg-[#1e3a5f] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors shadow-lg"
                        >
                          {loading ? 'MENYIAPKAN DOKUMEN...' : '📥 DOWNLOAD KARTU DIGITAL'}
                        </button>
                      )}
                    </PDFDownloadLink>
                  ) : (
                    <div className="w-full py-3 bg-gray-100 text-gray-400 font-bold rounded-xl flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                      GENERATING QR CODE...
                    </div>
                  )}
                </div>
              )}

              {selectedReg.status !== 'Menunggu' && (
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full py-3 bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  TUTUP DETAIL
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in zoom-in slide-in-from-bottom-10">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
            <span className="text-sm font-medium">{toast}</span>
          </div>
        </div>
      )}
    </div>
  )
}