"use client";
import { supabase } from '@/lib/supabase'
import React, { useState, ChangeEvent, FormEvent } from "react";

interface FormData {
  fullname: string;
  placeOfBirth: string;
  dateOfBirth: string;
  sexId: string;
  agamaId: string;
  maritalStatusId: string;
  motherMaidenName: string;
  identityTypeId: string;
  identityNo: string;
  address: string;
  kecamatan: string;
  kelurahan: string;
  rt: string;
  rw: string;
  city: string;
  province: string;
  noHp: string;
  phone: string;
  email: string;
  educationLevelId: string;
  jobId: string;
  institutionName: string;
  namaDarurat: string;
  telpDarurat: string;
  statusHubunganDarurat: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function RegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    fullname: "",
    placeOfBirth: "",
    dateOfBirth: "",
    sexId: "",
    agamaId: "",
    maritalStatusId: "",
    motherMaidenName: "",
    identityTypeId: "",
    identityNo: "",
    address: "",
    kecamatan: "",
    kelurahan: "",
    rt: "",
    rw: "",
    city: "Batang",
    province: "Jawa Tengah",
    noHp: "",
    phone: "",
    email: "",
    educationLevelId: "",
    jobId: "",
    institutionName: "",
    namaDarurat: "",
    telpDarurat: "",
    statusHubunganDarurat: "",
  });

  const [pasFoto, setPasFoto] = useState<File | null>(null);
  const [fotoKtp, setFotoKtp] = useState<File | null>(null);
  const [pasFotoPreview, setPasFotoPreview] = useState<string | null>(null);
  const [fotoKtpPreview, setFotoKtpPreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear error on change
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: "pasFoto" | "fotoKtp") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size & type for early feedback
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [type]: "Ukuran maksimal 2MB" }));
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setErrors((prev) => ({ ...prev, [type]: "Format harus JPG/PNG" }));
      return;
    }

    // Clear previous error
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[type];
      return newErrors;
    });

    const previewUrl = URL.createObjectURL(file);
    if (type === "pasFoto") {
      setPasFoto(file);
      setPasFotoPreview(previewUrl);
    } else {
      setFotoKtp(file);
      setFotoKtpPreview(previewUrl);
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Section 1
    if (!formData.fullname.trim()) newErrors.fullname = "Nama Lengkap wajib diisi";
    if (!formData.placeOfBirth.trim()) newErrors.placeOfBirth = "Tempat Lahir wajib diisi";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Tanggal Lahir wajib diisi";
    if (!formData.sexId) newErrors.sexId = "Jenis Kelamin wajib dipilih";
    if (!formData.agamaId) newErrors.agamaId = "Agama wajib dipilih";
    if (!formData.maritalStatusId) newErrors.maritalStatusId = "Status Perkawinan wajib dipilih";
    if (!formData.motherMaidenName.trim()) newErrors.motherMaidenName = "Nama Ibu Kandung wajib diisi";

    // Section 2
    if (!formData.identityTypeId) newErrors.identityTypeId = "Jenis Identitas wajib dipilih";
    if (!formData.identityNo.trim()) {
      newErrors.identityNo = "Nomor Identitas wajib diisi";
    } else if (formData.identityTypeId === "1" && !/^\d{16}$/.test(formData.identityNo)) {
      newErrors.identityNo = "Nomor KTP harus tepat 16 digit angka";
    }

    // Section 3
    if (!formData.address.trim()) newErrors.address = "Alamat wajib diisi";
    if (!formData.kecamatan.trim()) newErrors.kecamatan = "Kecamatan wajib diisi";
    if (!formData.kelurahan.trim()) newErrors.kelurahan = "Kelurahan/Desa wajib diisi";
    if (!formData.rt.trim()) newErrors.rt = "RT wajib diisi";
    else if (formData.rt.length > 3) newErrors.rt = "Maksimal 3 karakter";
    if (!formData.rw.trim()) newErrors.rw = "RW wajib diisi";
    else if (formData.rw.length > 3) newErrors.rw = "Maksimal 3 karakter";
    if (!formData.city.trim()) newErrors.city = "Kota/Kabupaten wajib diisi";
    if (!formData.province.trim()) newErrors.province = "Provinsi wajib diisi";

    // Section 4
    if (!formData.noHp.trim()) {
      newErrors.noHp = "No. HP wajib diisi";
    } else if (!/^(08|\+628)\d+$/.test(formData.noHp)) {
      newErrors.noHp = "Format No. HP harus diawali 08 atau +628";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    // Section 5
    if (!formData.educationLevelId) newErrors.educationLevelId = "Pendidikan Terakhir wajib dipilih";
    if (!formData.jobId) newErrors.jobId = "Pekerjaan wajib dipilih";
    if ((formData.jobId === "5" || formData.jobId === "6") && !formData.institutionName.trim()) {
      newErrors.institutionName = "Nama Instansi/Sekolah wajib diisi untuk Pelajar/Mahasiswa";
    }

    // Section 6
    if (!pasFoto) newErrors.pasFoto = "Pas Foto wajib diupload";
    if (!fotoKtp) newErrors.fotoKtp = "Foto KTP wajib diupload";

    // Section 7
    if (!formData.namaDarurat.trim()) newErrors.namaDarurat = "Nama Kontak Darurat wajib diisi";
    if (!formData.telpDarurat.trim()) newErrors.telpDarurat = "No. Telepon Darurat wajib diisi";
    if (!formData.statusHubunganDarurat) newErrors.statusHubunganDarurat = "Hubungan wajib dipilih";

    setErrors(newErrors);

    // Scroll to first error smoothly if exists
    if (Object.keys(newErrors).length > 0) {
      const firstErrorId = Object.keys(newErrors)[0];
      const element = document.getElementById(firstErrorId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    return true;
  };

  const handleSubmit = async (e?: FormEvent) => {
    console.log('handleSubmit called', formData)
    e?.preventDefault()

    if (!validate()) return

    setIsLoading(true)

    try {
      const ticketNo = `REG-2026-${Math.floor(10000 + Math.random() * 90000)}`

      // Upload pas foto
      let pasFotoUrl = ''
      if (pasFoto) {
        const ext = pasFoto.name.split('.').pop()
        const path = `pas-foto/${ticketNo}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('dokumen-anggota')
          .upload(path, pasFoto)
        if (!uploadError) pasFotoUrl = path
      }

      // Upload foto KTP
      let fotoKtpUrl = ''
      if (fotoKtp) {
        const ext = fotoKtp.name.split('.').pop()
        const path = `foto-ktp/${ticketNo}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('dokumen-anggota')
          .upload(path, fotoKtp)
        if (!uploadError) fotoKtpUrl = path
      }

      // Simpan data ke Supabase
      const { error } = await supabase.from('registrations').insert({
        ticket_no: ticketNo,
        fullname: formData.fullname,
        place_of_birth: formData.placeOfBirth,
        date_of_birth: formData.dateOfBirth,
        address: formData.address,
        kecamatan: formData.kecamatan,
        kelurahan: formData.kelurahan,
        rt: formData.rt,
        rw: formData.rw,
        city: formData.city,
        province: formData.province,
        identity_type_id: parseInt(formData.identityTypeId),
        identity_no: formData.identityNo,
        education_level_id: parseInt(formData.educationLevelId),
        sex_id: parseInt(formData.sexId),
        marital_status_id: formData.maritalStatusId,
        job_id: parseInt(formData.jobId),
        institution_name: formData.institutionName,
        mother_maiden_name: formData.motherMaidenName,
        email: formData.email,
        no_hp: formData.noHp,
        phone: formData.phone,
        agama_id: parseInt(formData.agamaId),
        nama_darurat: formData.namaDarurat,
        telp_darurat: formData.telpDarurat,
        status_hubungan_darurat: formData.statusHubunganDarurat,
        pas_foto_url: pasFotoUrl,
        foto_ktp_url: fotoKtpUrl,
        status: 'Menunggu'
      })

      if (error) throw error

      // Trigger Email Notification (Asynchronous/Non-blocking)
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'WELCOME_CONFIRMATION',
          email: formData.email,
          fullname: formData.fullname,
          ticketNo: ticketNo
        })
      }).catch(err => console.error('Email trigger error:', err))

      setTicketNumber(ticketNo)
      setIsSuccess(true)

    } catch (err) {
      console.error('Submit error:', err)
      alert('Terjadi kesalahan saat mengirim data. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  // Ganti HANYA bagian isSuccess return di RegistrationForm.tsx
// Cari: if (isSuccess) {
// Ganti dengan blok di bawah ini:

if (isSuccess) {
  return (
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center max-w-lg w-full">

        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>

        <h2 className="text-2xl font-bold mb-1" style={{color:'#1e3a5f'}}>Pendaftaran Berhasil!</h2>
        <p className="text-gray-500 text-sm mb-6">Formulir Anda telah diterima dan sedang diproses petugas.</p>

        {/* Ticket Number Box */}
        <div className="rounded-xl p-5 mb-4" style={{backgroundColor:'#1e3a5f'}}>
          <p className="text-white/70 text-xs mb-1 uppercase tracking-wider">Nomor Tiket Anda</p>
          <p className="text-white text-2xl font-bold tracking-widest mb-3">{ticketNumber}</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(ticketNumber)
              alert('Nomor tiket berhasil disalin!')
            }}
            className="text-xs px-4 py-1.5 rounded-lg font-semibold transition hover:opacity-80"
            style={{backgroundColor:'#c8a84b', color:'#1e3a5f'}}>
            📋 Salin Nomor
          </button>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-left">
          <p className="text-amber-800 font-bold text-sm mb-1">⚠️ Simpan Nomor Tiket Ini!</p>
          <ul className="text-amber-700 text-xs space-y-1">
            <li>• Untuk mengecek status pendaftaran Anda</li>
            <li>• Untuk komunikasi dengan petugas perpustakaan</li>
            <li>• Untuk mengambil kartu anggota</li>
          </ul>
        </div>

        {/* Email info */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left">
          <p className="text-blue-800 text-xs leading-relaxed">
            Konfirmasi dikirim ke <strong>{formData.email}</strong>.
            Proses verifikasi <strong>1–3 hari kerja</strong>.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <a
            href={`/cek-status?tiket=${ticketNumber}`}
            className="w-full py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition"
            style={{backgroundColor:'#1e3a5f'}}>
            🔍 CEK STATUS PENDAFTARAN
          </a>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 rounded-xl font-bold text-sm border-2 hover:bg-gray-50 transition"
            style={{borderColor:'#1e3a5f', color:'#1e3a5f'}}>
            📝 DAFTAR ANGGOTA BARU
          </button>
        </div>

      </div>
    </div>
  )
}


  const inputClass = (error?: string) => 
    `w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-colors ${
      error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
    }`;
  
  const labelClass = "block text-sm font-semibold text-[#1e3a5f]";

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* SECTION 1: DATA PRIBADI */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8">
        <h3 className="text-xl font-bold text-[#1e3a5f] border-b-2 border-[#c8a84b] pb-2 mb-6 inline-block">Data Pribadi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="fullname" className={labelClass}>Nama Lengkap <span className="text-red-500">*</span></label>
            <input type="text" id="fullname" value={formData.fullname} onChange={handleChange} className={inputClass(errors.fullname)} placeholder="Sesuai kartu identitas" />
            {errors.fullname && <p className="text-red-500 text-xs mt-1">{errors.fullname}</p>}
          </div>

          <div>
            <label htmlFor="placeOfBirth" className={labelClass}>Tempat Lahir <span className="text-red-500">*</span></label>
            <input type="text" id="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} className={inputClass(errors.placeOfBirth)} />
            {errors.placeOfBirth && <p className="text-red-500 text-xs mt-1">{errors.placeOfBirth}</p>}
          </div>

          <div>
            <label htmlFor="dateOfBirth" className={labelClass}>Tanggal Lahir <span className="text-red-500">*</span></label>
            <input type="date" id="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={inputClass(errors.dateOfBirth)} />
            {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
          </div>

          <div>
            <label htmlFor="sexId" className={labelClass}>Jenis Kelamin <span className="text-red-500">*</span></label>
            <select id="sexId" value={formData.sexId} onChange={handleChange} className={inputClass(errors.sexId)}>
              <option value="">-- Pilih Jenis Kelamin --</option>
              <option value="1">Laki-laki</option>
              <option value="2">Perempuan</option>
            </select>
            {errors.sexId && <p className="text-red-500 text-xs mt-1">{errors.sexId}</p>}
          </div>

          <div>
            <label htmlFor="agamaId" className={labelClass}>Agama <span className="text-red-500">*</span></label>
            <select id="agamaId" value={formData.agamaId} onChange={handleChange} className={inputClass(errors.agamaId)}>
              <option value="">-- Pilih Agama --</option>
              <option value="1">Islam</option>
              <option value="2">Kristen</option>
              <option value="3">Katolik</option>
              <option value="4">Hindu</option>
              <option value="5">Buddha</option>
              <option value="6">Konghucu</option>
            </select>
            {errors.agamaId && <p className="text-red-500 text-xs mt-1">{errors.agamaId}</p>}
          </div>

          <div>
            <label htmlFor="maritalStatusId" className={labelClass}>Status Perkawinan <span className="text-red-500">*</span></label>
            <select id="maritalStatusId" value={formData.maritalStatusId} onChange={handleChange} className={inputClass(errors.maritalStatusId)}>
              <option value="">-- Pilih Status --</option>
              <option value="Belum Menikah">Belum Menikah</option>
              <option value="Menikah">Menikah</option>
              <option value="Cerai">Cerai</option>
            </select>
            {errors.maritalStatusId && <p className="text-red-500 text-xs mt-1">{errors.maritalStatusId}</p>}
          </div>

          <div>
            <label htmlFor="motherMaidenName" className={labelClass}>Nama Ibu Kandung <span className="text-red-500">*</span></label>
            <input type="text" id="motherMaidenName" value={formData.motherMaidenName} onChange={handleChange} className={inputClass(errors.motherMaidenName)} />
            {errors.motherMaidenName && <p className="text-red-500 text-xs mt-1">{errors.motherMaidenName}</p>}
          </div>
        </div>
      </div>

      {/* SECTION 2: IDENTITAS */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8">
        <h3 className="text-xl font-bold text-[#1e3a5f] border-b-2 border-[#c8a84b] pb-2 mb-6 inline-block">Identitas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="identityTypeId" className={labelClass}>Jenis Identitas <span className="text-red-500">*</span></label>
            <select id="identityTypeId" value={formData.identityTypeId} onChange={handleChange} className={inputClass(errors.identityTypeId)}>
              <option value="">-- Pilih Identitas --</option>
              <option value="1">KTP</option>
              <option value="2">SIM</option>
              <option value="3">Kartu Pelajar</option>
            </select>
            {errors.identityTypeId && <p className="text-red-500 text-xs mt-1">{errors.identityTypeId}</p>}
          </div>

          <div>
            <label htmlFor="identityNo" className={labelClass}>Nomor Identitas <span className="text-red-500">*</span></label>
            <input type="text" id="identityNo" value={formData.identityNo} onChange={handleChange} className={inputClass(errors.identityNo)} placeholder={formData.identityTypeId === "1" ? "16 Digit NIK" : ""} />
            {errors.identityNo && <p className="text-red-500 text-xs mt-1">{errors.identityNo}</p>}
          </div>
        </div>
      </div>

      {/* SECTION 3: ALAMAT */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8">
        <h3 className="text-xl font-bold text-[#1e3a5f] border-b-2 border-[#c8a84b] pb-2 mb-6 inline-block">Alamat Sesuai Identitas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="address" className={labelClass}>Alamat Lengkap <span className="text-red-500">*</span></label>
            <textarea id="address" rows={3} value={formData.address} onChange={handleChange} className={inputClass(errors.address)} placeholder="Nama jalan, gedung, blok, dll" />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          <div>
            <label htmlFor="province" className={labelClass}>Provinsi <span className="text-red-500">*</span></label>
            <input type="text" id="province" value={formData.province} onChange={handleChange} className={inputClass(errors.province)} />
            {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
          </div>

          <div>
            <label htmlFor="city" className={labelClass}>Kota/Kabupaten <span className="text-red-500">*</span></label>
            <input type="text" id="city" value={formData.city} onChange={handleChange} className={inputClass(errors.city)} />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>

          <div>
            <label htmlFor="kecamatan" className={labelClass}>Kecamatan <span className="text-red-500">*</span></label>
            <input type="text" id="kecamatan" value={formData.kecamatan} onChange={handleChange} className={inputClass(errors.kecamatan)} />
            {errors.kecamatan && <p className="text-red-500 text-xs mt-1">{errors.kecamatan}</p>}
          </div>

          <div>
            <label htmlFor="kelurahan" className={labelClass}>Kelurahan/Desa <span className="text-red-500">*</span></label>
            <input type="text" id="kelurahan" value={formData.kelurahan} onChange={handleChange} className={inputClass(errors.kelurahan)} />
            {errors.kelurahan && <p className="text-red-500 text-xs mt-1">{errors.kelurahan}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="rt" className={labelClass}>RT <span className="text-red-500">*</span></label>
              <input type="text" id="rt" value={formData.rt} onChange={handleChange} className={inputClass(errors.rt)} placeholder="001" maxLength={3} />
              {errors.rt && <p className="text-red-500 text-xs mt-1">{errors.rt}</p>}
            </div>
            <div>
              <label htmlFor="rw" className={labelClass}>RW <span className="text-red-500">*</span></label>
              <input type="text" id="rw" value={formData.rw} onChange={handleChange} className={inputClass(errors.rw)} placeholder="001" maxLength={3} />
              {errors.rw && <p className="text-red-500 text-xs mt-1">{errors.rw}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: KONTAK */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8">
        <h3 className="text-xl font-bold text-[#1e3a5f] border-b-2 border-[#c8a84b] pb-2 mb-6 inline-block">Informasi Kontak</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="noHp" className={labelClass}>No. HP / WhatsApp <span className="text-red-500">*</span></label>
            <input type="text" id="noHp" value={formData.noHp} onChange={handleChange} className={inputClass(errors.noHp)} placeholder="08xxxxxxxxxx" />
            {errors.noHp && <p className="text-red-500 text-xs mt-1">{errors.noHp}</p>}
          </div>

          <div>
            <label htmlFor="phone" className={labelClass}>No. Telepon Rumah</label>
            <input type="text" id="phone" value={formData.phone} onChange={handleChange} className={inputClass(errors.phone)} placeholder="Opsional" />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="email" className={labelClass}>Alamat Email <span className="text-red-500">*</span></label>
            <input type="email" id="email" value={formData.email} onChange={handleChange} className={inputClass(errors.email)} placeholder="nama@email.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
        </div>
      </div>

      {/* SECTION 5: PENDIDIKAN & PEKERJAAN */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8">
        <h3 className="text-xl font-bold text-[#1e3a5f] border-b-2 border-[#c8a84b] pb-2 mb-6 inline-block">Pendidikan & Pekerjaan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="educationLevelId" className={labelClass}>Pendidikan Terakhir <span className="text-red-500">*</span></label>
            <select id="educationLevelId" value={formData.educationLevelId} onChange={handleChange} className={inputClass(errors.educationLevelId)}>
              <option value="">-- Pilih Pendidikan --</option>
              <option value="1">SD</option>
              <option value="2">SMP</option>
              <option value="3">SMA/SMK</option>
              <option value="4">D3</option>
              <option value="5">S1</option>
              <option value="6">S2</option>
              <option value="7">S3</option>
            </select>
            {errors.educationLevelId && <p className="text-red-500 text-xs mt-1">{errors.educationLevelId}</p>}
          </div>

          <div>
            <label htmlFor="jobId" className={labelClass}>Pekerjaan <span className="text-red-500">*</span></label>
            <select id="jobId" value={formData.jobId} onChange={handleChange} className={inputClass(errors.jobId)}>
              <option value="">-- Pilih Pekerjaan --</option>
              <option value="1">PNS</option>
              <option value="2">TNI/Polri</option>
              <option value="3">Swasta</option>
              <option value="4">Wirausaha</option>
              <option value="5">Pelajar</option>
              <option value="6">Mahasiswa</option>
              <option value="7">Ibu Rumah Tangga</option>
              <option value="8">Lainnya</option>
            </select>
            {errors.jobId && <p className="text-red-500 text-xs mt-1">{errors.jobId}</p>}
          </div>

          {(formData.jobId === "5" || formData.jobId === "6") && (
            <div className="md:col-span-2">
              <label htmlFor="institutionName" className={labelClass}>Nama Instansi/Sekolah <span className="text-red-500">*</span></label>
              <input type="text" id="institutionName" value={formData.institutionName} onChange={handleChange} className={inputClass(errors.institutionName)} placeholder="Nama sekolah / universitas" />
              {errors.institutionName && <p className="text-red-500 text-xs mt-1">{errors.institutionName}</p>}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 6: UPLOAD DOKUMEN */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8">
        <h3 className="text-xl font-bold text-[#1e3a5f] border-b-2 border-[#c8a84b] pb-2 mb-6 inline-block">Upload Dokumen</h3>
        <p className="text-sm text-gray-500 mb-6">Format JPG/PNG, ukuran maksimal 2MB per file.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className={labelClass}>Pas Foto (Formal) <span className="text-red-500">*</span></label>
            <div className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl ${errors.pasFoto ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-[#1e3a5f] transition-colors bg-gray-50'}`}>
              <div className="space-y-1 text-center">
                {pasFotoPreview ? (
                  <div className="mx-auto w-32 h-40 relative mb-4 shadow-sm border border-gray-200 rounded overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={pasFotoPreview} alt="Preview Pas Foto" className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="pasFoto" className="relative cursor-pointer bg-white rounded-md font-medium text-[#1e3a5f] hover:text-blue-800 focus-within:outline-none px-2 py-1">
                    <span>Upload file</span>
                    <input id="pasFoto" name="pasFoto" type="file" accept=".jpg,.jpeg,.png" className="sr-only" onChange={(e) => handleFileChange(e, "pasFoto")} />
                  </label>
                </div>
                {pasFoto && <p className="text-xs text-gray-500 truncate">{pasFoto.name} ({(pasFoto.size / 1024 / 1024).toFixed(2)} MB)</p>}
              </div>
            </div>
            {errors.pasFoto && <p className="text-red-500 text-xs mt-2 text-center">{errors.pasFoto}</p>}
          </div>

          <div>
            <label className={labelClass}>Foto Identitas (KTP/KIA/Pelajar) <span className="text-red-500">*</span></label>
            <div className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl ${errors.fotoKtp ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-[#1e3a5f] transition-colors bg-gray-50'}`}>
              <div className="space-y-1 text-center w-full">
                {fotoKtpPreview ? (
                  <div className="mx-auto w-full max-w-[200px] h-32 relative mb-4 shadow-sm border border-gray-200 rounded overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={fotoKtpPreview} alt="Preview KTP" className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="fotoKtp" className="relative cursor-pointer bg-white rounded-md font-medium text-[#1e3a5f] hover:text-blue-800 focus-within:outline-none px-2 py-1">
                    <span>Upload file</span>
                    <input id="fotoKtp" name="fotoKtp" type="file" accept=".jpg,.jpeg,.png" className="sr-only" onChange={(e) => handleFileChange(e, "fotoKtp")} />
                  </label>
                </div>
                {fotoKtp && <p className="text-xs text-gray-500 truncate">{fotoKtp.name} ({(fotoKtp.size / 1024 / 1024).toFixed(2)} MB)</p>}
              </div>
            </div>
            {errors.fotoKtp && <p className="text-red-500 text-xs mt-2 text-center">{errors.fotoKtp}</p>}
          </div>
        </div>
      </div>

      {/* SECTION 7: KONTAK DARURAT */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8">
        <h3 className="text-xl font-bold text-[#1e3a5f] border-b-2 border-[#c8a84b] pb-2 mb-6 inline-block">Kontak Darurat</h3>
        <p className="text-sm text-gray-500 mb-6">Orang yang dapat dihubungi dalam keadaan darurat.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="namaDarurat" className={labelClass}>Nama Lengkap <span className="text-red-500">*</span></label>
            <input type="text" id="namaDarurat" value={formData.namaDarurat} onChange={handleChange} className={inputClass(errors.namaDarurat)} />
            {errors.namaDarurat && <p className="text-red-500 text-xs mt-1">{errors.namaDarurat}</p>}
          </div>

          <div>
            <label htmlFor="telpDarurat" className={labelClass}>No. Telepon / HP <span className="text-red-500">*</span></label>
            <input type="text" id="telpDarurat" value={formData.telpDarurat} onChange={handleChange} className={inputClass(errors.telpDarurat)} />
            {errors.telpDarurat && <p className="text-red-500 text-xs mt-1">{errors.telpDarurat}</p>}
          </div>

          <div>
            <label htmlFor="statusHubunganDarurat" className={labelClass}>Hubungan <span className="text-red-500">*</span></label>
            <select id="statusHubunganDarurat" value={formData.statusHubunganDarurat} onChange={handleChange} className={inputClass(errors.statusHubunganDarurat)}>
              <option value="">-- Pilih Hubungan --</option>
              <option value="Orang Tua">Orang Tua</option>
              <option value="Suami-Istri">Suami-Istri</option>
              <option value="Saudara">Saudara</option>
              <option value="Teman">Teman</option>
            </select>
            {errors.statusHubunganDarurat && <p className="text-red-500 text-xs mt-1">{errors.statusHubunganDarurat}</p>}
          </div>
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className={`flex items-center justify-center px-8 py-3 rounded-lg text-white font-bold text-lg w-full md:w-auto shadow-lg transition-all ${
            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1e3a5f] hover:bg-blue-900 hover:shadow-xl'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </>
          ) : (
            'KIRIM PENDAFTARAN'
          )}
        </button>
      </div>
    </form>
  );
}
