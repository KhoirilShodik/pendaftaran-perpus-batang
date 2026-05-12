import { User, CreditCard, MapPin, Phone, School, Heart } from 'lucide-react'
import { FormData } from '@/types'

interface FormSectionsProps {
  formData: FormData
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  errors: Record<string, string>
}

const inputClass = (error?: string) => 
  `w-full px-5 py-3 mt-2 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-900/5 focus:border-[#1e3a5f] transition-all text-sm ${
    error ? 'border-rose-300 bg-rose-50 text-rose-900 placeholder-rose-300' : 'border-gray-100 bg-gray-50 focus:bg-white text-gray-700'
  }`

const labelClass = "block text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] ml-1"

export function PersonalDataSection({ formData, handleInputChange, errors }: FormSectionsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
        <div className="p-2.5 bg-blue-50 text-[#1e3a5f] rounded-xl">
          <User size={20} />
        </div>
        <h3 className="text-xl font-bold text-[#1e3a5f]">Data Pribadi</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="fullname" className={labelClass}>Nama Lengkap <span className="text-rose-500 font-bold">*</span></label>
          <input type="text" id="fullname" value={formData.fullname} onChange={handleInputChange} className={inputClass(errors.fullname)} placeholder="Sesuai kartu identitas" />
          {errors.fullname && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.fullname}</p>}
        </div>

        <div>
          <label htmlFor="placeOfBirth" className={labelClass}>Tempat Lahir <span className="text-rose-500 font-bold">*</span></label>
          <input type="text" id="placeOfBirth" value={formData.placeOfBirth} onChange={handleInputChange} className={inputClass(errors.placeOfBirth)} />
          {errors.placeOfBirth && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.placeOfBirth}</p>}
        </div>

        <div>
          <label htmlFor="dateOfBirth" className={labelClass}>Tanggal Lahir <span className="text-rose-500 font-bold">*</span></label>
          <input type="date" id="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className={inputClass(errors.dateOfBirth)} />
          {errors.dateOfBirth && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.dateOfBirth}</p>}
        </div>

        <div>
          <label htmlFor="sexId" className={labelClass}>Jenis Kelamin <span className="text-rose-500 font-bold">*</span></label>
          <select id="sexId" value={formData.sexId} onChange={handleInputChange} className={inputClass(errors.sexId)}>
            <option value="">-- Pilih Jenis Kelamin --</option>
            <option value="1">Laki-laki</option>
            <option value="2">Perempuan</option>
          </select>
          {errors.sexId && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.sexId}</p>}
        </div>

        <div>
          <label htmlFor="agamaId" className={labelClass}>Agama <span className="text-rose-500 font-bold">*</span></label>
          <select id="agamaId" value={formData.agamaId} onChange={handleInputChange} className={inputClass(errors.agamaId)}>
            <option value="">-- Pilih Agama --</option>
            <option value="1">Islam</option>
            <option value="2">Kristen</option>
            <option value="3">Katolik</option>
            <option value="4">Hindu</option>
            <option value="5">Buddha</option>
            <option value="6">Konghucu</option>
          </select>
          {errors.agamaId && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.agamaId}</p>}
        </div>

        <div>
          <label htmlFor="maritalStatusId" className={labelClass}>Status Perkawinan <span className="text-rose-500 font-bold">*</span></label>
          <select id="maritalStatusId" value={formData.maritalStatusId} onChange={handleInputChange} className={inputClass(errors.maritalStatusId)}>
            <option value="">-- Pilih Status --</option>
            <option value="Belum Menikah">Belum Menikah</option>
            <option value="Menikah">Menikah</option>
            <option value="Cerai">Cerai</option>
          </select>
          {errors.maritalStatusId && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.maritalStatusId}</p>}
        </div>

        <div>
          <label htmlFor="motherMaidenName" className={labelClass}>Nama Ibu Kandung <span className="text-rose-500 font-bold">*</span></label>
          <input type="text" id="motherMaidenName" value={formData.motherMaidenName} onChange={handleInputChange} className={inputClass(errors.motherMaidenName)} />
          {errors.motherMaidenName && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.motherMaidenName}</p>}
        </div>
      </div>
    </div>
  )
}

export function IdentitySection({ formData, handleInputChange, errors }: FormSectionsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
        <div className="p-2.5 bg-blue-50 text-[#1e3a5f] rounded-xl">
          <CreditCard size={20} />
        </div>
        <h3 className="text-xl font-bold text-[#1e3a5f]">Identitas</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="identityTypeId" className={labelClass}>Jenis Identitas <span className="text-rose-500 font-bold">*</span></label>
          <select id="identityTypeId" value={formData.identityTypeId} onChange={handleInputChange} className={inputClass(errors.identityTypeId)}>
            <option value="">-- Pilih Identitas --</option>
            <option value="1">KTP</option>
            <option value="2">SIM</option>
            <option value="3">Kartu Pelajar</option>
          </select>
          {errors.identityTypeId && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.identityTypeId}</p>}
        </div>

        <div>
          <label htmlFor="identityNo" className={labelClass}>Nomor Identitas <span className="text-rose-500 font-bold">*</span></label>
          <input type="text" id="identityNo" value={formData.identityNo} onChange={handleInputChange} className={inputClass(errors.identityNo)} placeholder={formData.identityTypeId === "1" ? "16 Digit NIK" : ""} />
          {errors.identityNo && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.identityNo}</p>}
        </div>
      </div>
    </div>
  )
}

export function AddressSection({ formData, handleInputChange, errors }: FormSectionsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
        <div className="p-2.5 bg-blue-50 text-[#1e3a5f] rounded-xl">
          <MapPin size={20} />
        </div>
        <h3 className="text-xl font-bold text-[#1e3a5f]">Alamat Lengkap</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="address" className={labelClass}>Alamat Lengkap <span className="text-rose-500 font-bold">*</span></label>
          <textarea id="address" rows={3} value={formData.address} onChange={handleInputChange} className={inputClass(errors.address)} placeholder="Nama jalan, gedung, blok, dll" />
          {errors.address && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.address}</p>}
        </div>

        <div>
          <label htmlFor="province" className={labelClass}>Provinsi <span className="text-rose-500 font-bold">*</span></label>
          <input type="text" id="province" value={formData.province} onChange={handleInputChange} className={inputClass(errors.province)} />
          {errors.province && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.province}</p>}
        </div>

        <div>
          <label htmlFor="city" className={labelClass}>Kota/Kabupaten <span className="text-rose-500 font-bold">*</span></label>
          <input type="text" id="city" value={formData.city} onChange={handleInputChange} className={inputClass(errors.city)} />
          {errors.city && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.city}</p>}
        </div>

        <div>
          <label htmlFor="kecamatan" className={labelClass}>Kecamatan <span className="text-rose-500 font-bold">*</span></label>
          <input type="text" id="kecamatan" value={formData.kecamatan} onChange={handleInputChange} className={inputClass(errors.kecamatan)} />
          {errors.kecamatan && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.kecamatan}</p>}
        </div>

        <div>
          <label htmlFor="kelurahan" className={labelClass}>Kelurahan/Desa <span className="text-rose-500 font-bold">*</span></label>
          <input type="text" id="kelurahan" value={formData.kelurahan} onChange={handleInputChange} className={inputClass(errors.kelurahan)} />
          {errors.kelurahan && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.kelurahan}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="rt" className={labelClass}>RT <span className="text-rose-500 font-bold">*</span></label>
            <input type="text" id="rt" value={formData.rt} onChange={handleInputChange} className={inputClass(errors.rt)} placeholder="001" maxLength={3} />
            {errors.rt && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.rt}</p>}
          </div>
          <div>
            <label htmlFor="rw" className={labelClass}>RW <span className="text-rose-500 font-bold">*</span></label>
            <input type="text" id="rw" value={formData.rw} onChange={handleInputChange} className={inputClass(errors.rw)} placeholder="001" maxLength={3} />
            {errors.rw && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.rw}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ContactSection({ formData, handleInputChange, errors }: FormSectionsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
        <div className="p-2.5 bg-blue-50 text-[#1e3a5f] rounded-xl">
          <Phone size={20} />
        </div>
        <h3 className="text-xl font-bold text-[#1e3a5f]">Informasi Kontak</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="noHp" className={labelClass}>No. HP / WhatsApp <span className="text-rose-500 font-bold">*</span></label>
          <input type="text" id="noHp" value={formData.noHp} onChange={handleInputChange} className={inputClass(errors.noHp)} placeholder="08xxxxxxxxxx" />
          {errors.noHp && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.noHp}</p>}
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>No. Telepon Rumah</label>
          <input type="text" id="phone" value={formData.phone} onChange={handleInputChange} className={inputClass(formData.phone)} placeholder="Opsional" />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="email" className={labelClass}>Alamat Email <span className="text-rose-500 font-bold">*</span></label>
          <input type="email" id="email" value={formData.email} onChange={handleInputChange} className={inputClass(errors.email)} placeholder="nama@email.com" />
          {errors.email && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.email}</p>}
        </div>
      </div>
    </div>
  )
}

export function EducationJobSection({ formData, handleInputChange, errors }: FormSectionsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
        <div className="p-2.5 bg-blue-50 text-[#1e3a5f] rounded-xl">
          <School size={20} />
        </div>
        <h3 className="text-xl font-bold text-[#1e3a5f]">Pendidikan & Pekerjaan</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="educationLevelId" className={labelClass}>Pendidikan Terakhir <span className="text-rose-500 font-bold">*</span></label>
          <select id="educationLevelId" value={formData.educationLevelId} onChange={handleInputChange} className={inputClass(errors.educationLevelId)}>
            <option value="">-- Pilih Pendidikan --</option>
            <option value="1">SD</option>
            <option value="2">SMP</option>
            <option value="3">SMA/SMK</option>
            <option value="4">D3</option>
            <option value="5">S1</option>
            <option value="6">S2</option>
            <option value="7">S3</option>
          </select>
          {errors.educationLevelId && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.educationLevelId}</p>}
        </div>

        <div>
          <label htmlFor="jobId" className={labelClass}>Pekerjaan <span className="text-rose-500 font-bold">*</span></label>
          <select id="jobId" value={formData.jobId} onChange={handleInputChange} className={inputClass(errors.jobId)}>
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
          {errors.jobId && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.jobId}</p>}
        </div>

        {(formData.jobId === "5" || formData.jobId === "6") && (
          <div className="md:col-span-2">
            <label htmlFor="institutionName" className={labelClass}>Nama Instansi/Sekolah <span className="text-rose-500 font-bold">*</span></label>
            <input type="text" id="institutionName" value={formData.institutionName} onChange={handleInputChange} className={inputClass(errors.institutionName)} placeholder="Nama sekolah / universitas" />
            {errors.institutionName && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.institutionName}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export function EmergencyContactSection({ formData, handleInputChange, errors }: FormSectionsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
        <div className="p-2.5 bg-blue-50 text-[#1e3a5f] rounded-xl">
          <Heart size={20} />
        </div>
        <h3 className="text-xl font-bold text-[#1e3a5f]">Kontak Darurat</h3>
      </div>
      <p className="text-sm text-gray-400 mb-6 font-medium">Orang yang dapat dihubungi dalam keadaan darurat.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="namaDarurat" className={labelClass}>Nama Lengkap <span className="text-rose-500 font-bold">*</span></label>
          <input type="text" id="namaDarurat" value={formData.namaDarurat} onChange={handleInputChange} className={inputClass(errors.namaDarurat)} />
          {errors.namaDarurat && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.namaDarurat}</p>}
        </div>

        <div>
          <label htmlFor="telpDarurat" className={labelClass}>No. Telepon / HP <span className="text-rose-500 font-bold">*</span></label>
          <input type="text" id="telpDarurat" value={formData.telpDarurat} onChange={handleInputChange} className={inputClass(errors.telpDarurat)} />
          {errors.telpDarurat && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.telpDarurat}</p>}
        </div>

        <div>
          <label htmlFor="statusHubunganDarurat" className={labelClass}>Hubungan <span className="text-rose-500 font-bold">*</span></label>
          <select id="statusHubunganDarurat" value={formData.statusHubunganDarurat} onChange={handleInputChange} className={inputClass(errors.statusHubunganDarurat)}>
            <option value="">-- Pilih Hubungan --</option>
            <option value="Orang Tua">Orang Tua</option>
            <option value="Suami-Istri">Suami-Istri</option>
            <option value="Saudara">Saudara</option>
            <option value="Teman">Teman</option>
          </select>
          {errors.statusHubunganDarurat && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.statusHubunganDarurat}</p>}
        </div>
      </div>
    </div>
  )
}
