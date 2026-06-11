import { useState, useCallback } from 'react'
import bwipjs from 'bwip-js'
import { Registration, RegistrationStatus } from '@/types'

export type SearchState = 'idle' | 'loading' | 'not_found' | 'found'

export function useStatusSearch(initialTicket: string = '') {
  const [ticketInput, setTicketInput] = useState(initialTicket)
  const [searchState, setSearchState] = useState<SearchState>('idle')
  const [result, setResult] = useState<Partial<Registration> | null>(null)
  const [barcodeData, setBarcodeData] = useState('')

  const generateBarcode = useCallback(async (ticketNumber: string) => {
    try {
      // Guard: pastikan kode hanya berjalan di browser (bukan SSR)
      if (typeof document === 'undefined') return

      // Buat elemen canvas offscreen untuk bwip-js v4.x
      const canvas = document.createElement('canvas')

      // Menggunakan bwip-js toCanvas() (API yang tersedia di browser pada v4.x)
      bwipjs.toCanvas(canvas, {
        bcid: 'code128',      // Tipe barcode Code 128
        text: ticketNumber,   // Data yang di-encode
        scale: 3,             // Ukuran skala
        height: 10,           // Tinggi barcode (mm)
        includetext: true,    // Tampilkan teks di bawah barcode
        textxalign: 'center',
      })

      // Konversi canvas ke Data URL menggunakan native browser API
      const dataUrl = canvas.toDataURL('image/png')
      setBarcodeData(dataUrl)
    } catch (err) {
      console.error('Barcode Generation Error:', err)
    }
  }, [])

  const handleSearch = useCallback(async (tiket?: string) => {
    const ticket = tiket || ticketInput
    if (!ticket) return

    setSearchState('loading')

    try {
      const res = await fetch(`/api/registrations?ticket_no=${encodeURIComponent(ticket)}`)
      const json = await res.json()

      if (!res.ok || json.error || !json.data) {
        setSearchState('not_found')
        setResult(null)
      } else {
        const r = json.data
        const mappedData: Partial<Registration> = {
          ticketNumber: r.ticket_no,
          fullname: r.fullname,
          email: r.email,
          status: r.status as RegistrationStatus,
          createdAt: r.created_at,
          approvedAt: r.approved_at,
          rejectReason: r.reject_reason,
          pasFotoUrl: r.pas_foto_url,
          memberNo: r.member_no || r.ticket_no,
          endDate: r.end_date,
          jobId: r.job_id
        }
        
        setResult(mappedData)
        setSearchState('found')
        
        // Panggil generateBarcode agar barcode langsung muncul saat data ditemukan
        if (mappedData.ticketNumber) {
          generateBarcode(mappedData.ticketNumber)
        }
      }
    } catch (err) {
      console.error('Search error:', err)
      setSearchState('not_found')
      setResult(null)
    }
  }, [ticketInput, generateBarcode])

  return {
    ticketInput,
    setTicketInput,
    searchState,
    result,
    barcodeData,
    handleSearch,
    generateBarcode
  }
}