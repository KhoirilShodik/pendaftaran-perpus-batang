import React from 'react'
import { Users, Clock, CheckCircle2, XCircle } from 'lucide-react'

interface StatsOverviewProps {
  counts: {
    total: number
    menunggu: number
    disetujui: number
    ditolak: number
  }
}

export function StatsOverview({ counts }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow duration-300 group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-900 group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</p>
            <h3 className="text-3xl font-bold text-gray-900 leading-none">{counts.total}</h3>
          </div>
        </div>
        <p className="text-xs text-gray-500 font-medium">Pendaftar Terdaftar</p>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow duration-300 group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
            <Clock size={24} />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Menunggu</p>
            <h3 className="text-3xl font-bold text-gray-900 leading-none">{counts.menunggu}</h3>
          </div>
        </div>
        <p className="text-xs text-gray-500 font-medium">Belum Diproses</p>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow duration-300 group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
            <CheckCircle2 size={24} />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Disetujui</p>
            <h3 className="text-3xl font-bold text-gray-900 leading-none">{counts.disetujui}</h3>
          </div>
        </div>
        <p className="text-xs text-gray-500 font-medium">Selesai Verifikasi</p>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow duration-300 group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 group-hover:scale-110 transition-transform">
            <XCircle size={24} />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ditolak</p>
            <h3 className="text-3xl font-bold text-gray-900 leading-none">{counts.ditolak}</h3>
          </div>
        </div>
        <p className="text-xs text-gray-500 font-medium">Tidak Memenuhi Syarat</p>
      </div>
    </div>
  )
}
