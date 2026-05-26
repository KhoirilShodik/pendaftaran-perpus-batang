// hooks/useRegistrations.ts
'use client'
import { useState, useCallback } from 'react'
import { Registration, RegistrationStatus } from '@/types'
import { ADMIN_CONFIG } from '@/lib/constants'

export function useRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [fetchError, setFetchError] = useState('')

  const [selectedReg, setSelectedReg] = useState<Registration | null>(null)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  // ============================================================
  // FETCH — Ambil data dan map ke properti yang benar
  // ============================================================
  const fetchRegistrations = useCallback(async () => {
    try {
      setIsLoadingData(true)
      const res = await fetch('/api/registrations')
      const json = await res.json()

      if (!res.ok) throw new Error(json.error || 'Gagal memuat data')

      const data = json.data || []
      const mapped = data.map((r: any) => ({
        id: r.id,
        ticketNumber: r.ticket_no,             // 🟢 Membaca murni kode REG-2026-XXXXX
        fullname: r.fullname,
        memberNo: r.MemberNo || '-',           // 🟢 Membaca murni kolom MemberNo kapital dari DB
        endDate: r.EndDate || null,            // 🟢 Membaca murni kolom EndDate kapital dari DB
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
        city: r.city || ADMIN_CONFIG.CITY_DEFAULT,
        province: r.province || ADMIN_CONFIG.PROVINCE_DEFAULT,
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
        pasFotoUrl: r.pas_foto_url || '',
        fotoKtpUrl: r.foto_ktp_url || '',
        registerDate: r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-',
        createdAt: r.created_at || '',
        approvedAt: r.approved_at || null,
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
  }, [])

  // ============================================================
  // NOTIFY — Mengirim Email/Notifikasi Sistem
  // ============================================================
  const sendNotification = async (payload: any) => {
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Notification failed')
      return await res.json()
    } catch (err) {
      console.error('Notification error:', err)
      throw err
    }
  }

  // ============================================================
  // APPROVE — Setujui Pendaftaran & Sinkronisasi Real-time
  // ============================================================
  const handleApprove = async (reg: Registration) => {
    if (reg.email === '-' || !reg.email.includes('@')) {
      throw new Error('Email pendaftar tidak valid, tidak bisa mengirim notifikasi.')
    }

    const res = await fetch('/api/registrations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: reg.id,
        status: 'Disetujui'
      })
    })

    const json = await res.json()

    // 🔍 DEBUG DI CONSOLE LOG BROWSER (F12)
    console.log('================================')
    console.log('DEBUG APPROVE FRONTEND RESPONSE')
    console.log(json)
    console.log('================================')

    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Gagal menyetujui')
    }

    // Ambil ulang data fresh dari DB online Hostinger
    await fetchRegistrations()

    // Kirim email notifikasi sukses ke user
    await sendNotification({
      type: 'STATUS_APPROVED',
      email: reg.email,
      fullname: reg.fullname,
      ticketNumber: reg.ticketNumber
    })

    setSelectedReg(null)
  }

  // ============================================================
  // REJECT — Tolak Pendaftaran
  // ============================================================
  const handleReject = async (reg: Registration, reason: string) => {
    if (reg.email === '-' || !reg.email.includes('@')) {
      throw new Error('Email pendaftar tidak valid, tidak bisa mengirim notifikasi.')
    }

    const res = await fetch('/api/registrations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: reg.id,
        status: 'Ditolak',
        reject_reason: reason
      })
    })

    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(json.error || 'Gagal menolak')

    await fetchRegistrations()

    await sendNotification({
      type: 'STATUS_REJECTED',
      email: reg.email,
      fullname: reg.fullname,
      ticketNumber: reg.ticketNumber,
      rejectReason: reason
    })

    setSelectedReg(null)
    setShowRejectForm(false)
    setRejectReason('')
  }

  return {
    registrations,
    isLoadingData,
    fetchError,
    fetchRegistrations,
    handleApprove,
    handleReject,
    sendNotification,
    selectedReg,
    setSelectedReg,
    showRejectForm,
    setShowRejectForm,
    rejectReason,
    setRejectReason
  }
}