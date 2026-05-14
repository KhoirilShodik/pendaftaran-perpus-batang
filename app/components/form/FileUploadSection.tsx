import React, { useRef, useState, useCallback } from 'react'
import { UploadCloud, FileText, CheckCircle2, CreditCard, Camera, X, RotateCcw, ZoomIn } from 'lucide-react'

interface FileUploadSectionProps {
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'pasFoto' | 'fotoKtp') => void
  handleCameraCapture: (file: File, type: 'pasFoto' | 'fotoKtp') => void
  pasFotoPreview: string | null
  fotoKtpPreview: string | null
  errors: Record<string, string>
}

interface CameraModalProps {
  type: 'pasFoto' | 'fotoKtp'
  onCapture: (file: File, type: 'pasFoto' | 'fotoKtp') => void
  onClose: () => void
}

function CameraModal({ type, onCapture, onClose }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string>('')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')

  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: type === 'fotoKtp' ? 1280 : 720 },
          height: { ideal: type === 'fotoKtp' ? 720 : 960 }
        }
      }
      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(newStream)
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
      }
      setCameraError('')
    } catch (err) {
      setCameraError('Kamera tidak dapat diakses. Pastikan izin kamera telah diberikan.')
    }
  }, [stream, type])

  React.useEffect(() => {
    startCamera(facingMode)
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop())
    }
  }, [])

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const isKtp = type === 'fotoKtp'
    canvas.width = isKtp ? 1280 : 720
    canvas.height = isKtp ? 720 : 960
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = canvas.toDataURL('image/jpeg', 0.85)
    setCapturedImage(imageData)
    if (stream) stream.getTracks().forEach(track => track.stop())
  }

  const handleRetake = () => {
    setCapturedImage(null)
    startCamera(facingMode)
  }

  const handleConfirm = () => {
    if (!capturedImage || !canvasRef.current) return
    canvasRef.current.toBlob((blob) => {
      if (!blob) return
      const fileName = type === 'pasFoto' ? 'pas-foto-kamera.jpg' : 'foto-ktp-kamera.jpg'
      const file = new File([blob], fileName, { type: 'image/jpeg' })
      onCapture(file, type)
      onClose()
    }, 'image/jpeg', 0.85)
  }

  const toggleCamera = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(newMode)
    startCamera(newMode)
  }

  const isKtp = type === 'fotoKtp'

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl overflow-hidden w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h3 className="font-bold text-[#1e3a5f] text-lg">
              {isKtp ? '📄 Foto KTP / Identitas' : '🤳 Pas Foto'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {isKtp ? 'Posisikan KTP secara horizontal & pastikan teks terbaca jelas' : 'Posisikan wajah secara vertikal dengan latar belakang polos'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tips banner */}
        <div className={`px-5 py-2.5 text-xs font-medium flex items-center gap-2 ${isKtp ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
          <ZoomIn size={14} />
          {isKtp
            ? '💡 Tips: Pegang KTP horizontal, pastikan semua teks NIK & nama terbaca jelas'
            : '💡 Tips: Foto tampak depan, ekspresi natural, latar belakang polos & cerah'
          }
        </div>

        {/* Camera / Preview */}
        <div className={`relative bg-black overflow-hidden ${isKtp ? 'aspect-video' : 'aspect-[3/4]'}`}>
          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3 p-6 text-center">
              <Camera size={48} className="opacity-30" />
              <p className="text-sm opacity-70">{cameraError}</p>
              <button onClick={() => startCamera(facingMode)} className="bg-white text-[#1e3a5f] px-4 py-2 rounded-xl text-xs font-bold">
                Coba Lagi
              </button>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Hasil foto" className="w-full h-full object-cover" />
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {/* Guide overlay */}
              <div className="absolute inset-4 border-2 border-white/40 rounded-2xl pointer-events-none">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
              </div>
            </>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />

        {/* Controls */}
        <div className="p-5 flex items-center justify-between gap-3">
          {!capturedImage ? (
            <>
              <button onClick={toggleCamera} className="p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors" title="Ganti kamera">
                <RotateCcw size={20} className="text-gray-600" />
              </button>
              <button
                onClick={handleCapture}
                className="flex-1 py-4 bg-[#1e3a5f] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-900 transition-all active:scale-95 shadow-lg"
              >
                <Camera size={20} /> AMBIL FOTO
              </button>
            </>
          ) : (
            <>
              <button onClick={handleRetake} className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-95">
                <RotateCcw size={18} /> FOTO ULANG
              </button>
              <button onClick={handleConfirm} className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 shadow-lg">
                <CheckCircle2 size={18} /> GUNAKAN FOTO
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const labelClass = "block text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2"

export function FileUploadSection({
  handleFileChange,
  handleCameraCapture,
  pasFotoPreview,
  fotoKtpPreview,
  errors
}: FileUploadSectionProps) {
  const [showCamera, setShowCamera] = useState<'pasFoto' | 'fotoKtp' | null>(null)

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
          <label className={labelClass}>Pas Foto (Formal) <span className="text-rose-500 font-bold">*</span> <span className="text-[9px] text-blue-400 font-medium ml-1 normal-case tracking-normal">(Vertikal - tampak depan)</span></label>
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
            
            <div className="mt-6 flex items-center gap-2">
              <label htmlFor="pasFoto" className="cursor-pointer bg-white border border-gray-100 px-4 py-2.5 rounded-xl text-xs font-extrabold text-[#1e3a5f] shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5">
                <UploadCloud size={14} />
                <span>{pasFotoPreview ? 'GANTI' : 'PILIH FILE'}</span>
                <input id="pasFoto" name="pasFoto" type="file" accept=".jpg,.jpeg,.png" className="sr-only" onChange={(e) => handleFileChange(e, "pasFoto")} />
              </label>
              <button
                type="button"
                onClick={() => setShowCamera('pasFoto')}
                className="bg-[#1e3a5f] text-white border border-[#1e3a5f] px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Camera size={14} />
                <span>KAMERA</span>
              </button>
            </div>
          </div>
          {errors.pasFoto && <p className="text-rose-500 text-[10px] font-bold mt-3 text-center uppercase">{errors.pasFoto}</p>}
        </div>

        {/* Foto KTP */}
        <div>
          <label className={labelClass}>Foto Identitas (KTP/KIA) <span className="text-rose-500 font-bold">*</span> <span className="text-[9px] text-blue-400 font-medium ml-1 normal-case tracking-normal">(Horizontal - semua teks terbaca)</span></label>
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
            
            <div className="mt-6 flex items-center gap-2">
              <label htmlFor="fotoKtp" className="cursor-pointer bg-white border border-gray-100 px-4 py-2.5 rounded-xl text-xs font-extrabold text-[#1e3a5f] shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5">
                <UploadCloud size={14} />
                <span>{fotoKtpPreview ? 'GANTI' : 'PILIH FILE'}</span>
                <input id="fotoKtp" name="fotoKtp" type="file" accept=".jpg,.jpeg,.png" className="sr-only" onChange={(e) => handleFileChange(e, "fotoKtp")} />
              </label>
              <button
                type="button"
                onClick={() => setShowCamera('fotoKtp')}
                className="bg-[#1e3a5f] text-white border border-[#1e3a5f] px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Camera size={14} />
                <span>KAMERA</span>
              </button>
            </div>
          </div>
          {errors.fotoKtp && <p className="text-rose-500 text-[10px] font-bold mt-3 text-center uppercase">{errors.fotoKtp}</p>}
        </div>
      </div>

      {showCamera && (
        <CameraModal
          type={showCamera}
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(null)}
        />
      )}
    </div>
  )
}
