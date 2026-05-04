import type { Metadata } from "next";
import RegistrationForm from "./components/RegistrationForm";

export const metadata: Metadata = {
  title: "Pendaftaran Anggota Perpustakaan – Dispuspa Kabupaten Batang",
  description:
    "Form pendaftaran anggota perpustakaan online Dinas Perpustakaan dan Kearsipan Kabupaten Batang.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* ── TOP BAR ── */}
      <div className="bg-[#c8a84b] py-1.5 px-4 text-center">
        <p className="text-xs text-[#1e3a5f] font-semibold tracking-wide uppercase">
          Layanan Online · Dinas Perpustakaan dan Kearsipan Kabupaten Batang
        </p>
      </div>

      {/* ── HEADER ── */}
      <header className="bg-[#1e3a5f] shadow-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center gap-4">
          {/* Logo placeholder – book icon */}
          <div className="flex-shrink-0 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border-2 border-[#c8a84b]">
            <svg
              className="w-9 h-9 text-[#c8a84b]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>

          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide leading-tight">
              PENDAFTARAN ANGGOTA PERPUSTAKAAN
            </h1>
            <p className="text-[#c8a84b] text-sm sm:text-base font-medium mt-0.5">
              Dinas Perpustakaan dan Kearsipan Kabupaten Batang
            </p>
            <p className="text-white/60 text-xs mt-1">
              Isi formulir di bawah ini dengan lengkap dan benar
            </p>
          </div>
        </div>

        {/* Decorative gold divider */}
        <div className="h-1 bg-gradient-to-r from-[#c8a84b] via-yellow-300 to-[#c8a84b]" />
      </header>

      {/* ── INFO BANNER ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-800 leading-relaxed">
            <span className="font-semibold">Perhatian:</span> Pastikan data yang
            Anda isi sesuai dengan dokumen identitas resmi. Kolom bertanda{" "}
            <span className="text-red-600 font-bold">*</span> wajib diisi.
            Proses verifikasi membutuhkan waktu 1–3 hari kerja.
          </div>
        </div>
      </div>

      {/* ── MAIN FORM ── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
        <RegistrationForm />
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#1e3a5f] mt-12 py-6 px-4 text-center">
        <p className="text-white/70 text-xs">
          © {new Date().getFullYear()} Dinas Perpustakaan dan Kearsipan Kabupaten Batang.
          Semua hak dilindungi.
        </p>
        <p className="text-[#c8a84b] text-xs mt-1">
          Jl. Pemuda No. 1 Batang, Jawa Tengah · Telp. (0285) 391234
        </p>
      </footer>
    </div>
  );
}
