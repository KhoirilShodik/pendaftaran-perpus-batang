import { useState, ChangeEvent, FormEvent } from 'react'
import type { FormData as RegFormData, FormErrors } from '@/types'
import { FORM_CONFIG, COMMON_REGEX } from '@/lib/constants'

export function useRegistrationForm() {
  const [formData, setFormData] = useState<RegFormData>({
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

  // 🟢 FITUR BARU: AUTOFILL DATA TESTING (TERMASUK DUMMY FILES)
  const handleAutofill = () => {
    // 1. Generate data dummy acak biar tidak bentrok KTP/Email di database
    const randomId = Math.floor(1000 + Math.random() * 9000);
    
    setFormData({
      fullname: `Tester Ahmad ${randomId}`,
      placeOfBirth: "Batang",
      dateOfBirth: "2000-01-01",
      sexId: "1", // Laki-laki
      agamaId: "1", // Islam
      maritalStatusId: "1", // Belum Kawin
      motherMaidenName: "Ibu Siti",
      identityTypeId: "1", // KTP
      identityNo: `332501${Date.now().toString().substring(3, 13)}`, // Pas 16 digit angka valid
      address: "Jl. Veteran No. 10, Alun-alun Batang",
      kecamatan: "Batang",
      kelurahan: "Kauman",
      rt: "02",
      rw: "05",
      city: FORM_CONFIG.CITY_DEFAULT || "Kab. Batang",
      province: FORM_CONFIG.PROVINCE_DEFAULT || "Jawa Tengah",
      noHp: `08123456${randomId}`, // Lolos regex PHONE
      phone: "",
      email: `test.user${randomId}@gmail.com`, // Lolos regex EMAIL
      educationLevelId: "5", // S1/Diploma
      jobId: "6", // Mahasiswa
      institutionName: "Universitas Negeri Batang",
      namaDarurat: "Bapak Budi",
      telpDarurat: "085641000222",
      statusHubunganDarurat: "Orang Tua"
    });

    // 2. Buat blob gambar tiruan biar validasi file tidak error
    const fakeContent = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // Fake PNG header
    const fakePasFoto = new File([fakeContent], `fake_avatar_${randomId}.png`, { type: 'image/png' });
    const fakeFotoKtp = new File([fakeContent], `fake_ktp_${randomId}.png`, { type: 'image/png' });

    setPasFoto(fakePasFoto);
    setFotoKtp(fakeFotoKtp);
    setPasFotoPreview("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"); // Placeholder preview avatar
    setFotoKtpPreview("https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=300");  // Placeholder preview dokumen

    // Bersihkan error jika sebelumnya ada
    setErrors({});
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    const name = id 
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
    
    if (!formData.fullname.trim()) newErrors.fullname = "Nama Lengkap wajib diisi"
    if (!formData.placeOfBirth.trim()) newErrors.placeOfBirth = "Tempat Lahir wajib diisi"
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Tanggal Lahir wajib diisi"
    if (!formData.sexId) newErrors.sexId = "Jenis Kelamin wajib dipilih"
    if (!formData.agamaId) newErrors.agamaId = "Agama wajib dipilih"
    if (!formData.maritalStatusId) newErrors.maritalStatusId = "Status Perkawinan wajib dipilih"
    if (!formData.motherMaidenName.trim()) newErrors.motherMaidenName = "Nama Ibu Kandung wajib diisi"

    if (!formData.identityTypeId) newErrors.identityTypeId = "Jenis Identitas wajib dipilih"
    if (!formData.identityNo.trim()) {
      newErrors.identityNo = "Nomor Identitas wajib diisi"
    } else if (formData.identityTypeId === "1" && !/^\d{16}$/.test(formData.identityNo)) {
      newErrors.identityNo = "Nomor KTP harus tepat 16 digit angka"
    }

    if (!formData.address.trim()) newErrors.address = "Alamat wajib diisi"
    if (!formData.kecamatan.trim()) newErrors.kecamatan = "Kecamatan wajib diisi"
    if (!formData.kelurahan.trim()) newErrors.kelurahan = "Kelurahan/Desa wajib diisi"
    if (!formData.rt.trim()) newErrors.rt = "RT wajib diisi"
    if (!formData.rw.trim()) newErrors.rw = "RW wajib diisi"
    if (!formData.city.trim()) newErrors.city = "Kota/Kabupaten wajib diisi"
    if (!formData.province.trim()) newErrors.province = "Provinsi wajib diisi"

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

    if (!formData.educationLevelId) newErrors.educationLevelId = "Pendidikan Terakhir wajib dipilih"
    if (!formData.jobId) newErrors.jobId = "Pekerjaan wajib dipilih"
    if ((formData.jobId === "5" || formData.jobId === "6") && !formData.institutionName.trim()) {
      newErrors.institutionName = "Nama Instansi/Sekolah wajib diisi untuk Pelajar/Mahasiswa"
    }

    if (!pasFoto) newErrors.pasFoto = "Pas Foto wajib diupload"
    if (!fotoKtp) newErrors.fotoKtp = "Foto KTP wajib diupload"

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

  const uploadFile = async (file: File, type: 'pas_foto' | 'foto_ktp', ticketNo: string): Promise<string> => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', type)
    fd.append('ticket_no', ticketNo)

    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const json = await res.json()

    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Gagal mengupload file')
    }

    return json.url
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const ticket = `${FORM_CONFIG.TICKET_PREFIX}${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      
      const [pasFotoUrl, fotoKtpUrl] = await Promise.all([
        uploadFile(pasFoto!, 'pas_foto', ticket),
        uploadFile(fotoKtp!, 'foto_ktp', ticket)
      ])

      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
          pas_foto_url: pasFotoUrl,
          foto_ktp_url: fotoKtpUrl,
          mother_maiden_name: formData.motherMaidenName,
          identity_type_id: parseInt(formData.identityTypeId),
          education_level_id: parseInt(formData.educationLevelId),
          job_id: parseInt(formData.jobId),
          institution_name: formData.institutionName,
          nama_darurat: formData.namaDarurat,
          telp_darurat: formData.telpDarurat,
          status_hubungan_darurat: formData.statusHubunganDarurat,
          phone: formData.phone,
        })
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menyimpan pendaftaran')
      }

      setTicketNumber(ticket)
      setIsSuccess(true)

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
    handleSubmit,
    handleAutofill // 🟢 Diekspos agar bisa dipanggil tombol di UI
  }
}