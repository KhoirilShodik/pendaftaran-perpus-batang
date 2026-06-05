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
      // Menggunakan bwip-js untuk generate Barcode 128
      bwipjs.toDataURL({
        bcid: 'code128',      // Tipe barcode
        text: ticketNumber,   // Data yang di-encode
        scale: 3,             // Ukuran skala
        height: 10,           // Tinggi barcode (mm)
        includetext: true,    // Tampilkan teks di bawah barcode
        textxalign: 'center',
      }, (err, png) => {
        if (err) {
          console.error('Barcode Error:', err)
        } else {
          // PERBAIKAN: 
          // 1. Mengakses properti .uri dari objek hasil bwipjs terbaru
          // 2. Menggunakan 'png' sebagai sumber data, bukan state 'barcodeData'
          setBarcodeData((png as any).uri || png) 
        }
      })
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