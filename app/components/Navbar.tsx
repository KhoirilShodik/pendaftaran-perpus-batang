'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
// Import ikon yang lebih profesional
import { Bookmark, ClipboardPen, Search } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) return null

  return (
    <nav style={{ backgroundColor: '#1e3a5f' }} className="text-white px-4 py-4 shadow-md border-b border-white/10">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/10 p-2 rounded-lg">
            <Bookmark className="w-5 h-5 text-[#c8a84b]" />
          </div>
          <div className="hidden sm:block">
            <p className="font-bold text-xs md:text-sm leading-tight tracking-wider uppercase">PERPUSTAKAAN DAERAH</p>
            <p className="text-[10px] opacity-70 italic">Kabupaten Batang</p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-[11px] md:text-xs px-3 py-2 rounded-lg font-bold transition-all border"
            style={pathname === '/'
              ? { backgroundColor: '#c8a84b', color: '#1e3a5f', borderColor: '#c8a84b' }
              : { backgroundColor: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }
            }
          >
            <ClipboardPen className="w-3.5 h-3.5" />
            <span>Daftar</span>
          </Link>

          <Link
            href="/cek-status"
            className="flex items-center gap-2 text-[11px] md:text-xs px-3 py-2 rounded-lg font-bold transition-all border"
            style={pathname === '/cek-status'
              ? { backgroundColor: '#c8a84b', color: '#1e3a5f', borderColor: '#c8a84b' }
              : { backgroundColor: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }
            }
          >
            <Search className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Cek Status</span>
          </Link>
        </div>

      </div>
    </nav>
  )
}