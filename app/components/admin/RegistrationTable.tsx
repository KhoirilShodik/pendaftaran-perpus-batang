'use client'
import React from 'react'
import { Search, Eye, ListFilter } from 'lucide-react'
import { Registration, RegistrationStatus } from '@/types'
import { StatusBadge } from '@/app/components/ui/StatusBadge'

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
            {registrations.length > 0 ? (
              registrations.map((reg, idx) => (
                <tr key={reg.id} className="hover:bg-blue-50/40 transition-colors duration-150 group">
                  <td className="px-6 py-4 text-gray-300 font-mono text-xs">{idx + 1}</td>
                  
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
    </div>
  )
}