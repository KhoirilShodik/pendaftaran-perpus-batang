'use client'
import React, { useState, useEffect } from 'react'
import { Search, Eye, ListFilter, ChevronLeft, ChevronRight } from 'lucide-react'
import { Registration, RegistrationStatus } from '@/types'
import { StatusBadge } from '@/app/components/ui/StatusBadge'

const ITEMS_PER_PAGE = 20

interface RegistrationTableProps {
  registrations: Registration[]
  activeFilter: 'Semua' | RegistrationStatus
  setActiveFilter: (filter: 'Semua' | RegistrationStatus) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  onSelect: (reg: Registration) => void
}

export function RegistrationTable({
  registrations,
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  onSelect
}: RegistrationTableProps) {
  const [currentPage, setCurrentPage] = useState(1)

  // Reset ke halaman 1 setiap kali data berubah (akibat filter atau pencarian)
  useEffect(() => {
    setCurrentPage(1)
  }, [registrations])

  const totalPages = Math.ceil(registrations.length / ITEMS_PER_PAGE)
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const paginated = registrations.slice(startIdx, startIdx + ITEMS_PER_PAGE)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 backdrop-blur-sm">
        <div className="flex bg-gray-100/80 p-1.5 rounded-xl w-full md:w-auto">
          {['Semua', 'Menunggu', 'Disetujui', 'Ditolak'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f as 'Semua' | RegistrationStatus)}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all duration-200 active:scale-95 ${activeFilter === f ? 'bg-white shadow-md text-blue-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80 group">
          <input
            type="text"
            placeholder="Cari nama, tiket, atau nomor INLIS..."
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-transparent border-2 rounded-xl text-sm focus:outline-none focus:border-blue-900/10 focus:bg-white transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-3 text-gray-400 group-focus-within:text-blue-900 transition-colors" size={18} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 text-gray-400 uppercase text-[10px] font-bold tracking-[0.15em] border-b border-gray-100">
              <th className="px-6 py-5 font-bold">No</th>
              <th className="px-6 py-5 font-bold">Nomor Tiket</th>
              <th className="px-6 py-5 font-bold">No. Anggota INLIS</th>
              <th className="px-6 py-5 font-bold">Nama Lengkap</th>
              <th className="px-6 py-5 font-bold">NIK</th>
              <th className="px-6 py-5 font-bold">Tanggal Daftar</th>
              <th className="px-6 py-5 text-center font-bold">Status</th>
              <th className="px-6 py-5 text-right font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {paginated.length > 0 ? (
              paginated.map((reg, idx) => (
                <tr key={reg.id} className="hover:bg-blue-50/40 transition-colors duration-150 group">
                  <td className="px-6 py-4 text-gray-300 font-mono text-xs">{startIdx + idx + 1}</td>
                  
                  {/* 🟢 TIKET: Dijamin 100% aman menampilkan string REG-XXXXX asli */}
                  <td className="px-6 py-4 font-bold text-blue-900 tracking-tight">{reg.ticketNumber}</td>
                  
                  {/* 🟢 NO ANGGOTA INLIS: Menampilkan no_hp/nomor asli kiriman database Hostinger */}
                  <td className="px-6 py-4 font-mono text-xs">
                    {reg.status === 'Disetujui' && reg.memberNo && reg.memberNo !== '-' ? (
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-md border border-emerald-100">
                        {reg.memberNo}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic font-sans">-</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 font-semibold text-gray-700">{reg.fullname}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{reg.identityNo}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{reg.registerDate}</td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={reg.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onSelect(reg)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg hover:bg-blue-100 transition-all active:scale-95 border border-transparent hover:border-blue-200"
                    >
                      <Eye size={14} /> DETAIL
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-24 text-center text-gray-400 italic">
                  <div className="flex flex-col items-center gap-3 opacity-60">
                    <ListFilter size={40} strokeWidth={1} />
                    <p>Data tidak ditemukan</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
          <p className="text-xs text-gray-400 font-medium">
            Menampilkan{' '}
            <span className="font-bold text-gray-600">{startIdx + 1}–{Math.min(startIdx + ITEMS_PER_PAGE, registrations.length)}</span>
            {' '}dari{' '}
            <span className="font-bold text-gray-600">{registrations.length}</span>
            {' '}data
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <ChevronLeft size={14} /> Sebelumnya
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) =>
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
                )
                .reduce<(number | '...')[]>((acc, page, i, arr) => {
                  if (i > 0 && typeof arr[i - 1] === 'number' && (page as number) - (arr[i - 1] as number) > 1) {
                    acc.push('...')
                  }
                  acc.push(page)
                  return acc
                }, [])
                .map((item, i) =>
                  item === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-xs font-bold">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item as number)}
                      className={`w-8 h-8 text-xs font-bold rounded-lg transition-all active:scale-95 ${
                        currentPage === item
                          ? 'bg-[#1e3a5f] text-white shadow-md shadow-blue-900/20'
                          : 'bg-white border border-gray-200 text-gray-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-900'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              Selanjutnya <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}