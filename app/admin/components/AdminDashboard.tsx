'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import QRCode from 'qrcode'
import { RefreshCw, LogOut, Lock, LayoutDashboard, ShieldAlert } from 'lucide-react'

import { Registration, RegistrationStatus } from '@/types'
import { ADMIN_CONFIG } from '@/lib/constants'
import { Toast } from '@/app/components/ui/Toast'
import { useRegistrations } from '@/hooks/useRegistrations'
import { StatsOverview } from '@/app/components/admin/StatsOverview'
import { RegistrationTable } from '@/app/components/admin/RegistrationTable'
import { ActionModals } from '@/app/components/admin/ActionModals'

export default function AdminDashboard() {
  const { 
    registrations, 
    isLoadingData, 
    fetchError, 
    fetchRegistrations, 
    handleApprove, 
    handleReject,
    selectedReg,
    setSelectedReg,
    showRejectForm,
    setShowRejectForm,
    rejectReason,
    setRejectReason
  } = useRegistrations()

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginError, setLoginError] = useState('')
  
  const [activeFilter, setActiveFilter] = useState<'Semua'|RegistrationStatus>('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState('')
  const [qrCodeData, setQrCodeData] = useState<string>('')

  useEffect(() => {
    if (isLoggedIn) {
      fetchRegistrations()
    }
  }, [isLoggedIn, fetchRegistrations])

  useEffect(() => {
    if (selectedReg && selectedReg.status === 'Disetujui') {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const verifyUrl = `${baseUrl}/cek-status?tiket=${selectedReg.ticketNumber}`;
      
      QRCode.toDataURL(verifyUrl, { width: 300, margin: 2 })
        .then(url => setQrCodeData(url))
        .catch(err => console.error("QR Error:", err));
    }
  }, [selectedReg]);

  const handleLogin = () => {
    if (loginUser === ADMIN_CONFIG.USERNAME && loginPass === ADMIN_CONFIG.PASSWORD) {
      setIsLoggedIn(true)
      setLoginError('')
    } else {
      setLoginError('Username atau password salah!')
    }
  }

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    const timer = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(timer)
  }, [])

  const onApprove = async (reg: Registration) => {
    try {
      await handleApprove(reg)
      showToast('✅ Pendaftaran berhasil disetujui!')
    } catch (err: any) {
      showToast('❌ ' + err.message)
    }
  }

  const onReject = async () => {
    if (!selectedReg || !rejectReason.trim()) return
    try {
      await handleReject(selectedReg, rejectReason)
      showToast('✅ Pendaftaran telah ditolak.')
    } catch (err: any) {
      showToast('❌ ' + err.message)
    }
  }

  const filtered = useMemo(() => registrations.filter(r => {
    const query = searchQuery.toLowerCase()
    const matchFilter = activeFilter === 'Semua' || r.status === activeFilter
    const matchSearch = r.fullname.toLowerCase().includes(query) || r.ticketNumber.toLowerCase().includes(query)
    return matchFilter && matchSearch
  }), [registrations, activeFilter, searchQuery])

  const counts = useMemo(() => ({ 
    total: registrations.length, 
    menunggu: registrations.filter(r=>r.status==='Menunggu').length, 
    disetujui: registrations.filter(r=>r.status==='Disetujui').length, 
    ditolak: registrations.filter(r=>r.status==='Ditolak').length 
  }), [registrations])

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const getImageUrl = (path: string, folder: 'pas-foto' | 'foto-ktp') => {
    if (!path) return null;
    const cleanPath = path.trim();
    const finalPath = cleanPath.includes('/') ? cleanPath : `${folder}/${cleanPath}`;
    return `${supabaseUrl}/storage/v1/object/public/${ADMIN_CONFIG.STORAGE_BUCKET}/${finalPath}`;
  };

  if (!isLoggedIn) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 p-10 w-full max-w-md border border-gray-100 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-blue-900 flex items-center justify-center mx-auto mb-6 rotate-3 shadow-xl shadow-blue-900/20">
            <Lock className="text-white -rotate-3" size={32} />
          </div>
          <h1 className="font-extrabold text-2xl text-blue-900 tracking-tight">Portal Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Sistem Pendaftaran Anggota Perpustakaan</p>
        </div>
        
        {loginError && (
          <div className="bg-rose-50 text-rose-600 text-xs p-4 rounded-2xl mb-6 border border-rose-100 flex items-center gap-3 animate-in slide-in-from-top-2">
            <div className="w-1 h-1 bg-rose-600 rounded-full shrink-0" />
            {loginError}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Username</label>
            <input 
              className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-900/10 outline-none transition-all" 
              value={loginUser} 
              onChange={e=>setLoginUser(e.target.value)} 
              onKeyDown={e=>e.key==='Enter'&&handleLogin()} 
              placeholder="admin.perpus"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-900/10 outline-none transition-all" 
              value={loginPass} 
              onChange={e=>setLoginPass(e.target.value)} 
              onKeyDown={e=>e.key==='Enter'&&handleLogin()} 
              placeholder="••••••••"
            />
          </div>
          <button 
            onClick={handleLogin} 
            className="w-full py-4 bg-blue-900 rounded-2xl text-white font-bold text-sm transition-all hover:bg-blue-800 active:scale-95 shadow-lg shadow-blue-900/20 mt-4"
          >
            MASUK KE DASHBOARD
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-blue-900 leading-none">DASHBOARD ADMIN</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Dispuspa Kab. Batang</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchRegistrations} 
              className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all active:scale-95 text-gray-500 flex items-center gap-2 px-4"
            >
              <RefreshCw size={16} className={isLoadingData ? 'animate-spin' : ''} />
              <span className="text-xs font-bold md:block hidden">Refresh</span>
            </button>
            <button 
              onClick={() => setIsLoggedIn(false)} 
              className="p-2.5 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all active:scale-95 text-rose-600 flex items-center gap-2 px-4"
            >
              <LogOut size={16} />
              <span className="text-xs font-bold md:block hidden">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10">
        {isLoadingData && !registrations.length && (
          <div className="flex flex-col items-center justify-center py-32 opacity-20">
            <RefreshCw className="animate-spin mb-4" size={48} strokeWidth={1} />
            <p className="font-bold tracking-widest text-xs uppercase">Menyiapkan Data...</p>
          </div>
        )}
        
        {fetchError && (
          <div className="bg-rose-50 border border-rose-100 rounded-3xl p-5 mb-8 text-rose-600 text-sm flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <ShieldAlert size={24} />
            <div className="flex-1">
              <p className="font-bold">Gagal Sinkronisasi</p>
              <p className="text-xs opacity-80">{fetchError}</p>
            </div>
            <button onClick={fetchRegistrations} className="bg-rose-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200">Coba Lagi</button>
          </div>
        )}

        <StatsOverview counts={counts} />

        <RegistrationTable 
          registrations={filtered}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelect={(reg) => {
            setSelectedReg(reg)
            setShowRejectForm(false)
          }}
        />

        <ActionModals 
          selectedReg={selectedReg}
          onClose={() => {
            setSelectedReg(null)
            setShowRejectForm(false)
          }}
          onApprove={onApprove}
          onReject={onReject}
          qrCodeData={qrCodeData}
          getImageUrl={getImageUrl}
          showRejectForm={showRejectForm}
          setShowRejectForm={setShowRejectForm}
          rejectReason={rejectReason}
          setRejectReason={setRejectReason}
        />
      </main>

      {toast && (
        <Toast message={toast} />
      )}
    </div>
  )
}