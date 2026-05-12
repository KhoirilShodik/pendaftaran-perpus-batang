import React from 'react'
import { UploadCloud, FileText, CheckCircle2, CreditCard } from 'lucide-react'

interface FileUploadSectionProps {
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'pasFoto' | 'fotoKtp') => void
  pasFotoPreview: string | null
  fotoKtpPreview: string | null
  errors: Record<string, string>
}

const labelClass = "block text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2"

export function FileUploadSection({
  handleFileChange,
  pasFotoPreview,
  fotoKtpPreview,
  errors
}: FileUploadSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
        <div className="p-2.5 bg-blue-50 text-[#1e3a5f] rounded-xl">
          <UploadCloud size={20} />
        </div>
        <h3 className="text-xl font-bold text-[#1e3a5f]">Upload Dokumen</h3>
      </div>
      
      <p className="text-sm text-gray-400 font-medium mb-8">Format JPG/PNG, ukuran maksimal 2MB per file.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Pas Foto */}
        <div>
          <label className={labelClass}>Pas Foto (Formal) <span className="text-rose-500 font-bold">*</span></label>
          <div className={`group relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[2rem] transition-all duration-300 ${
            errors.pasFoto ? 'border-rose-300 bg-rose-50' : 'border-gray-100 bg-gray-50 hover:border-[#1e3a5f] hover:bg-white hover:shadow-xl hover:shadow-blue-900/5'
          }`}>
            {pasFotoPreview ? (
              <div className="relative group/preview">
                <div className="w-32 h-44 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                  <img src={pasFotoPreview} alt="Preview Pas Foto" className="object-cover w-full h-full" />
                </div>
                <div className="absolute inset-0 bg-[#1e3a5f]/40 backdrop-blur-sm rounded-2xl opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                  <CheckCircle2 className="text-white" size={32} />
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <FileText className="text-gray-300 group-hover:text-[#1e3a5f]" size={32} />
                </div>
                <p className="text-xs font-bold text-gray-400 group-hover:text-gray-500">Belum ada file</p>
              </div>
            )}
            
            <label htmlFor="pasFoto" className="mt-6 cursor-pointer bg-white border border-gray-100 px-6 py-2.5 rounded-xl text-xs font-extrabold text-[#1e3a5f] shadow-sm hover:shadow-md active:scale-95 transition-all">
              <span>{pasFotoPreview ? 'GANTI FOTO' : 'PILIH FILE'}</span>
              <input id="pasFoto" name="pasFoto" type="file" accept=".jpg,.jpeg,.png" className="sr-only" onChange={(e) => handleFileChange(e, "pasFoto")} />
            </label>
          </div>
          {errors.pasFoto && <p className="text-rose-500 text-[10px] font-bold mt-3 text-center uppercase">{errors.pasFoto}</p>}
        </div>

        {/* Foto KTP */}
        <div>
          <label className={labelClass}>Foto Identitas (KTP/KIA) <span className="text-rose-500 font-bold">*</span></label>
          <div className={`group relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[2rem] transition-all duration-300 ${
            errors.fotoKtp ? 'border-rose-300 bg-rose-50' : 'border-gray-100 bg-gray-50 hover:border-[#1e3a5f] hover:bg-white hover:shadow-xl hover:shadow-blue-900/5'
          }`}>
            {fotoKtpPreview ? (
              <div className="relative group/preview w-full max-w-[240px]">
                <div className="w-full h-36 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                  <img src={fotoKtpPreview} alt="Preview KTP" className="object-cover w-full h-full" />
                </div>
                <div className="absolute inset-0 bg-[#1e3a5f]/40 backdrop-blur-sm rounded-2xl opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                  <CheckCircle2 className="text-white" size={32} />
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="text-gray-300 group-hover:text-[#1e3a5f]" size={32} />
                </div>
                <p className="text-xs font-bold text-gray-400 group-hover:text-gray-500">Belum ada file</p>
              </div>
            )}
            
            <label htmlFor="fotoKtp" className="mt-6 cursor-pointer bg-white border border-gray-100 px-6 py-2.5 rounded-xl text-xs font-extrabold text-[#1e3a5f] shadow-sm hover:shadow-md active:scale-95 transition-all">
              <span>{fotoKtpPreview ? 'GANTI FILE' : 'PILIH FILE'}</span>
              <input id="fotoKtp" name="fotoKtp" type="file" accept=".jpg,.jpeg,.png" className="sr-only" onChange={(e) => handleFileChange(e, "fotoKtp")} />
            </label>
          </div>
          {errors.fotoKtp && <p className="text-rose-500 text-[10px] font-bold mt-3 text-center uppercase">{errors.fotoKtp}</p>}
        </div>
      </div>
    </div>
  )
}
