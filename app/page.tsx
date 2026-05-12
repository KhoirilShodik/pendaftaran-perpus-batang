import type { Metadata } from "next";
import { BookOpen, Info } from "lucide-react";
import RegistrationForm from "./components/RegistrationForm";

export const metadata: Metadata = {
  title: "Pendaftaran Anggota Perpustakaan – Dispuspa Kabupaten Batang",
  description:
    "Form pendaftaran anggota perpustakaan online Dinas Perpustakaan dan Kearsipan Kabupaten Batang.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      {/* ── TOP BAR ── */}
      <div className="bg-[#c8a84b] py-1.5 px-4 text-center">
        <p className="text-[10px] text-[#1e3a5f] font-extrabold tracking-[0.2em] uppercase">
          Layanan Online · Dinas Perpustakaan dan Kearsipan Kabupaten Batang
        </p>
      </div>

      {/* ── HEADER ── */}
      <header className="bg-[#1e3a5f] relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#c8a84b]/10 rounded-full -ml-32 -mb-32 blur-3xl" />

        <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center text-center gap-6 relative z-10">
          {/* Logo Branding */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#c8a84b] to-yellow-300 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-[#c8a84b]/50 shadow-2xl">
              <BookOpen className="w-10 h-10 text-[#c8a84b]" strokeWidth={1.5} />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight uppercase">
              Pendaftaran Anggota <br className="sm:hidden" /> <span className="text-[#c8a84b]">Perpustakaan</span>
            </h1>
            <div className="h-1 w-20 bg-[#c8a84b] mx-auto rounded-full" />
            <p className="text-white/80 text-sm sm:text-base font-medium tracking-wide">
              Dinas Perpustakaan dan Kearsipan Kabupaten Batang
            </p>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold mt-4">
              Lengkapi formulir digital di bawah ini
            </p>
          </div>
        </div>

        {/* Decorative divider */}
        <div className="h-1.5 bg-gradient-to-r from-transparent via-[#c8a84b] to-transparent opacity-50" />
      </header>

      {/* ── INFO BANNER ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 relative z-20">
        <div className="flex items-start gap-4 bg-white/80 backdrop-blur-md border border-blue-100 rounded-2xl p-5 shadow-xl shadow-blue-900/5">
          <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shrink-0">
            <Info size={20} />
          </div>
          <div className="text-sm text-gray-600 leading-relaxed">
            <span className="font-bold text-blue-900">Penting:</span> Pastikan data yang
            Anda isi sesuai dengan dokumen identitas resmi. Kolom bertanda{" "}
            <span className="text-rose-500 font-bold">*</span> wajib diisi.
            Proses verifikasi oleh admin membutuhkan waktu <span className="font-bold text-blue-900 underline decoration-[#c8a84b] decoration-2">1–3 hari kerja</span>.
          </div>
        </div>
      </div>

      {/* ── MAIN FORM ── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-10">
        <RegistrationForm />
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#1e3a5f] mt-20 pt-16 pb-10 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-center gap-3 opacity-50">
            <div className="h-px w-8 bg-white" />
            <BookOpen className="text-white" size={16} />
            <div className="h-px w-8 bg-white" />
          </div>
          
          <div className="space-y-2">
            <p className="text-white/60 text-xs font-medium tracking-widest uppercase">
              © {new Date().getFullYear()} Dinas Perpustakaan dan Kearsipan Kabupaten Batang
            </p>
            <p className="text-[#c8a84b] text-sm font-bold">
              Jl. Pemuda No. 1 Batang, Jawa Tengah · Telp. (0285) 391234
            </p>
          </div>

          <div className="flex justify-center gap-6 pt-4">
            <a href="/cek-status" className="text-[10px] font-bold text-white/40 hover:text-[#c8a84b] transition-colors tracking-widest uppercase border border-white/10 px-4 py-2 rounded-full hover:border-[#c8a84b]/30">
              Cek Status Pendaftaran
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
