'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import QRCode from 'qrcode'
import { 
  RefreshCw, LogOut, ShieldAlert, KeyRound, 
  Loader2, Save, X, BookOpen 
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

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

  // Auth States
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginError, setLoginError] = useState('')

  // Password Modal States
  const [showPassModal, setShowPassModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [isUpdatingPass, setIsUpdatingPass] = useState(false)
  
  const [activeFilter, setActiveFilter] = useState<'Semua'|RegistrationStatus>('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState('')
  const [qrCodeData, setQrCodeData] = useState<string>('')

  // Check Session on Mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
      setIsLoadingAuth(false)
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
      if (!session) {
        // Reset sensitive states on logout
        setSearchQuery('')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

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

  const handleLogin = async () => {
    if (!loginEmail || !loginPass) {
      setLoginError('Email dan password wajib diisi!')
      return
    }

    setIsLoggingIn(true)
    setLoginError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPass,
      })

      if (error) throw error
    } catch (err: any) {
      setLoginError(err.message === 'Invalid login credentials' ? 'Email atau password salah!' : err.message)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsLoggedIn(false)
  }

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }, [setToast])

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      showToast('⚠️ Password minimal 6 karakter')
      return
    }

    setIsUpdatingPass(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      showToast('✅ Password berhasil diperbarui!')
      setShowPassModal(false)
      setNewPassword('')
    } catch (err: any) {
      showToast('❌ Gagal: ' + err.message)
    } finally {
      setIsUpdatingPass(false)
    }
  }

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

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#1e3a5f]" size={48} />
      </div>
    )
  }

  if (!isLoggedIn) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 p-10 w-full max-w-md border border-gray-100 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-[#1e3a5f] flex items-center justify-center mx-auto mb-6 rotate-3 shadow-2xl shadow-blue-900/20 relative overflow-hidden group hover:rotate-0 transition-transform duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <BookOpen className="text-[#c8a84b] -rotate-3 group-hover:rotate-0 transition-transform duration-500" size={40} />
          </div>
          <h1 className="font-extrabold text-2xl text-[#1e3a5f] tracking-tight uppercase">Portal Admin</h1>
          <p className="text-[10px] font-bold text-[#c8a84b] uppercase tracking-[0.2em] mt-1">Dispuspa Kabupaten Batang</p>
        </div>
        
        {loginError && (
          <div className="bg-rose-50 text-rose-600 text-xs p-4 rounded-2xl mb-6 border border-rose-100 flex items-center gap-3 animate-in slide-in-from-top-2">
            <div className="w-1 h-1 bg-rose-600 rounded-full shrink-0" />
            {loginError}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Admin</label>
            <input 
              className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-[#1e3a5f]/10 outline-none transition-all" 
              value={loginEmail} 
              onChange={e=>setLoginEmail(e.target.value)} 
              onKeyDown={e=>e.key==='Enter'&&handleLogin()} 
              placeholder="admin@batangkab.go.id"
              type="email"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-[#1e3a5f]/10 outline-none transition-all" 
              value={loginPass} 
              onChange={e=>setLoginPass(e.target.value)} 
              onKeyDown={e=>e.key==='Enter'&&handleLogin()} 
              placeholder="••••••••"
            />
          </div>
          <button 
            onClick={handleLogin} 
            disabled={isLoggingIn}
            className="w-full py-4 bg-[#1e3a5f] rounded-2xl text-white font-bold text-sm transition-all hover:bg-[#1e3a5f]/90 active:scale-95 shadow-lg shadow-blue-900/20 mt-4 flex items-center justify-center gap-2"
          >
            {isLoggingIn ? (
              <><Loader2 className="animate-spin" size={18} /> MEMPROSES...</>
            ) : (
              'MASUK KE DASHBOARD'
            )}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-[#1e3a5f] rounded-[1.2rem] flex items-center justify-center text-white shadow-xl shadow-blue-900/10 group-hover:rotate-6 transition-transform duration-300">
              <BookOpen size={24} className="text-[#c8a84b]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#1e3a5f] leading-none tracking-tight">DASHBOARD <span className="text-[#c8a84b]">ADMIN</span></h1>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em] mt-1">Dispuspa Kab. Batang</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={() => setShowPassModal(true)}
              className="p-2.5 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all active:scale-95 text-blue-900 flex items-center gap-2 px-3 md:px-4"
              title="Ganti Password"
            >
              <KeyRound size={16} />
              <span className="text-xs font-bold md:block hidden">Sandi</span>
            </button>
            <button 
              onClick={fetchRegistrations} 
              className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all active:scale-95 text-gray-500 flex items-center gap-2 px-3 md:px-4"
            >
              <RefreshCw size={16} className={isLoadingData ? 'animate-spin' : ''} />
              <span className="text-xs font-bold md:block hidden">Refresh</span>
            </button>
            <button 
              onClick={handleLogout} 
              className="p-2.5 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all active:scale-95 text-rose-600 flex items-center gap-2 px-3 md:px-4"
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

      {/* Change Password Modal */}
      {showPassModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm border border-gray-100" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <KeyRound size={20} /> Ganti Password
              </h2>
              <button onClick={() => setShowPassModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Password Baru</label>
                <input 
                  type="password" 
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-3 text-sm focus:bg-white focus:border-[#1e3a5f]/10 outline-none transition-all" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  placeholder="Min. 6 karakter"
                />
              </div>
              <button 
                onClick={handleUpdatePassword}
                disabled={isUpdatingPass || newPassword.length < 6}
                className="w-full py-3 bg-[#1e3a5f] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#1e3a5f]/90 transition-all active:scale-95 disabled:bg-gray-300 disabled:active:scale-100"
              >
                {isUpdatingPass ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                SIMPAN PERUBAHAN
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast message={toast} />
      )}
    </div>
  )
}