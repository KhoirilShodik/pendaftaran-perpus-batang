'use client'
import React from 'react'
import { Loader2, Send, Zap } from 'lucide-react'
import { useRegistrationForm } from '@/hooks/useRegistrationForm'
import { SuccessState } from './form/SuccessState'
import { FileUploadSection } from './form/FileUploadSection'
import {
  PersonalDataSection,
  IdentitySection,
  AddressSection,
  ContactSection,
  EducationJobSection,
  EmergencyContactSection
} from './form/FormSections'

export default function RegistrationForm() {
  const {
    formData,
    errors,
    isSubmitting,
    isSuccess,
    ticketNumber,
    pasFotoPreview,
    fotoKtpPreview,
    handleInputChange,
    handleFileChange,
    handleCameraCapture,
    handleSubmit,
    handleAutofill
  } = useRegistrationForm()

  if (isSuccess) {
    return <SuccessState ticketNumber={ticketNumber} email={formData.email} />
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/5 border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Garis gradien atas */}
      <div className="p-1 bg-gradient-to-r from-[#1e3a5f] via-[#c8a84b] to-[#1e3a5f]" />
      
      <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-10">
        
        {/* 🟢 PERBAIKAN TOTAL: Tombol ditaruh di dalam baris flex khusus, anti-ngumpet */}
        <div className="flex justify-end w-full mb-2 border-b border-gray-100 pb-4">
          <button
            type="button"
            onClick={handleAutofill}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all duration-150 border border-amber-400"
            title="Isi form otomatis untuk mempercepat development"
          >
            <Zap size={14} className="fill-white animate-pulse" />
            ⚡ Autofill Testing (Klik Sini)
          </button>
        </div>
        
        <PersonalDataSection 
          formData={formData} 
          handleInputChange={handleInputChange} 
          errors={errors} 
        />
        
        <IdentitySection 
          formData={formData} 
          handleInputChange={handleInputChange} 
          errors={errors} 
        />

        <AddressSection 
          formData={formData} 
          handleInputChange={handleInputChange} 
          errors={errors} 
        />

        <ContactSection 
          formData={formData} 
          handleInputChange={handleInputChange} 
          errors={errors} 
        />

        <EducationJobSection 
          formData={formData} 
          handleInputChange={handleInputChange} 
          errors={errors} 
        />

        <FileUploadSection 
          handleFileChange={handleFileChange}
          handleCameraCapture={handleCameraCapture}
          pasFotoPreview={pasFotoPreview}
          fotoKtpPreview={fotoKtpPreview}
          errors={errors}
        />

        <EmergencyContactSection 
          formData={formData} 
          handleInputChange={handleInputChange} 
          errors={errors} 
        />

        <div className="flex justify-center pt-10 border-t border-gray-50">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`group relative flex items-center justify-center gap-3 px-12 py-4 rounded-2xl text-white font-bold text-lg w-full md:w-auto overflow-hidden transition-all duration-300 active:scale-95 shadow-xl ${
              isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1e3a5f] hover:bg-blue-900 hover:shadow-blue-900/20'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span>MEMPROSES...</span>
              </>
            ) : (
              <>
                <span>KIRIM PENDAFTARAN</span>
                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
            
            {/* Gloss effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
        </div>
      </form>
    </div>
  )
}