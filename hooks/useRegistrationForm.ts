import { useState, ChangeEvent, FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { FormData, FormErrors } from '@/types'
import { FORM_CONFIG, COMMON_REGEX } from '@/lib/constants'

export function useRegistrationForm() {
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
    city: FORM_CONFIG.CITY_DEFAULT,
    province: FORM_CONFIG.PROVINCE_DEFAULT,
    noHp: "",
    phone: "",
    email: "",
    educationLevelId: "",
    jobId: "",
    institutionName: "",
    namaDarurat: "",
    telpDarurat: "",
    statusHubunganDarurat: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [ticketNumber, setTicketNumber] = useState("")
  const [pasFoto, setPasFoto] = useState<File | null>(null)
  const [fotoKtp, setFotoKtp] = useState<File | null>(null)
  const [pasFotoPreview, setPasFotoPreview] = useState<string | null>(null)
  const [fotoKtpPreview, setFotoKtpPreview] = useState<string | null>(null)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    const name = id // Fallback to id if name is not set
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrs = { ...prev }
        delete newErrs[name]
        return newErrs
      })
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'pasFoto' | 'fotoKtp') => {
    const file = e.target.files?.[0]
    if (!file) return

    // Clear previous error
    setErrors(prev => {
      const newErrs = { ...prev }
      delete newErrs[type]
      return newErrs
    })

    const previewUrl = URL.createObjectURL(file)
    if (type === 'pasFoto') {
      setPasFoto(file)
      setPasFotoPreview(previewUrl)
    } else {
      setFotoKtp(file)
      setFotoKtpPreview(previewUrl)
    }
  }

  const handleCameraCapture = (file: File, type: 'pasFoto' | 'fotoKtp') => {
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [type]: 'Ukuran foto melebihi 2MB' }))
      return
    }
    const previewUrl = URL.createObjectURL(file)
    if (type === 'pasFoto') {
      setPasFoto(file)
      setPasFotoPreview(previewUrl)
    } else {
      setFotoKtp(file)
      setFotoKtpPreview(previewUrl)
    }
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[type]
      return newErrors
    })
  }

  const validate = () => {
    const newErrors: FormErrors = {}
    
    // Section 1: Data Pribadi
    if (!formData.fullname.trim()) newErrors.fullname = "Nama Lengkap wajib diisi"
    if (!formData.placeOfBirth.trim()) newErrors.placeOfBirth = "Tempat Lahir wajib diisi"
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Tanggal Lahir wajib diisi"
    if (!formData.sexId) newErrors.sexId = "Jenis Kelamin wajib dipilih"
    if (!formData.agamaId) newErrors.agamaId = "Agama wajib dipilih"
    if (!formData.maritalStatusId) newErrors.maritalStatusId = "Status Perkawinan wajib dipilih"
    if (!formData.motherMaidenName.trim()) newErrors.motherMaidenName = "Nama Ibu Kandung wajib diisi"

    // Section 2: Identitas
    if (!formData.identityTypeId) newErrors.identityTypeId = "Jenis Identitas wajib dipilih"
    if (!formData.identityNo.trim()) {
      newErrors.identityNo = "Nomor Identitas wajib diisi"
    } else if (formData.identityTypeId === "1" && !/^\d{16}$/.test(formData.identityNo)) {
      newErrors.identityNo = "Nomor KTP harus tepat 16 digit angka"
    }

    // Section 3: Alamat
    if (!formData.address.trim()) newErrors.address = "Alamat wajib diisi"
    if (!formData.kecamatan.trim()) newErrors.kecamatan = "Kecamatan wajib diisi"
    if (!formData.kelurahan.trim()) newErrors.kelurahan = "Kelurahan/Desa wajib diisi"
    if (!formData.rt.trim()) newErrors.rt = "RT wajib diisi"
    if (!formData.rw.trim()) newErrors.rw = "RW wajib diisi"
    if (!formData.city.trim()) newErrors.city = "Kota/Kabupaten wajib diisi"
    if (!formData.province.trim()) newErrors.province = "Provinsi wajib diisi"

    // Section 4: Kontak
    if (!formData.noHp.trim()) {
      newErrors.noHp = "No. HP wajib diisi"
    } else if (!COMMON_REGEX.PHONE.test(formData.noHp)) {
      newErrors.noHp = "Format No. HP harus diawali 08 atau +628"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi"
    } else if (!COMMON_REGEX.EMAIL.test(formData.email)) {
      newErrors.email = "Format email tidak valid"
    }

    // Section 5: Pekerjaan/Pendidikan
    if (!formData.educationLevelId) newErrors.educationLevelId = "Pendidikan Terakhir wajib dipilih"
    if (!formData.jobId) newErrors.jobId = "Pekerjaan wajib dipilih"
    if ((formData.jobId === "5" || formData.jobId === "6") && !formData.institutionName.trim()) {
      newErrors.institutionName = "Nama Instansi/Sekolah wajib diisi untuk Pelajar/Mahasiswa"
    }

    // Section 6: Berkas
    if (!pasFoto) newErrors.pasFoto = "Pas Foto wajib diupload"
    if (!fotoKtp) newErrors.fotoKtp = "Foto KTP wajib diupload"

    // Section 7: Kontak Darurat
    if (!formData.namaDarurat.trim()) newErrors.namaDarurat = "Nama Kontak Darurat wajib diisi"
    if (!formData.telpDarurat.trim()) newErrors.telpDarurat = "No. Telepon Darurat wajib diisi"
    if (!formData.statusHubunganDarurat) newErrors.statusHubunganDarurat = "Hubungan wajib dipilih"

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      const firstErrorId = Object.keys(newErrors)[0]
      const element = document.getElementById(firstErrorId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return false
    }
    return true
  }

  const uploadFile = async (file: File, folder: string, ticket: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${ticket}-${Date.now()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const { error } = await supabase.storage
      .from(FORM_CONFIG.STORAGE_BUCKET)
      .upload(filePath, file)

    if (error) throw error
    return filePath
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const ticket = `${FORM_CONFIG.TICKET_PREFIX}${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      
      const [pasFotoPath, fotoKtpPath] = await Promise.all([
        uploadFile(pasFoto!, 'pas-foto', ticket),
        uploadFile(fotoKtp!, 'foto-ktp', ticket)
      ])

      const { error } = await supabase
        .from('registrations')
        .insert([{
          ticket_no: ticket,
          fullname: formData.fullname,
          identity_no: formData.identityNo,
          no_hp: formData.noHp,
          email: formData.email,
          place_of_birth: formData.placeOfBirth,
          date_of_birth: formData.dateOfBirth,
          address: formData.address,
          kecamatan: formData.kecamatan,
          kelurahan: formData.kelurahan,
          rt: formData.rt,
          rw: formData.rw,
          city: formData.city,
          province: formData.province,
          sex_id: parseInt(formData.sexId),
          agama_id: parseInt(formData.agamaId),
          marital_status_id: formData.maritalStatusId,
          pas_foto_url: pasFotoPath,
          foto_ktp_url: fotoKtpPath,
          mother_maiden_name: formData.motherMaidenName,
          identity_type_id: parseInt(formData.identityTypeId),
          education_level_id: parseInt(formData.educationLevelId),
          job_id: parseInt(formData.jobId),
          institution_name: formData.institutionName,
          nama_darurat: formData.namaDarurat,
          telp_darurat: formData.telpDarurat,
          status_hubungan_darurat: formData.statusHubunganDarurat,
          status: 'Menunggu'
        }])

      if (error) throw error

      setTicketNumber(ticket)
      setIsSuccess(true)

      // Background notification
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'WELCOME_CONFIRMATION',
          email: formData.email,
          fullname: formData.fullname,
          ticketNumber: ticket
        })
      }).catch(err => console.error('Notify Error:', err))

    } catch (err: any) {
      alert("Gagal mengirim pendaftaran: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formData,
    errors,
    isSubmitting,
    isSuccess,
    ticketNumber,
    pasFoto,
    fotoKtp,
    pasFotoPreview,
    fotoKtpPreview,
    handleInputChange,
    handleFileChange,
    handleCameraCapture,
    handleSubmit
  }
}
