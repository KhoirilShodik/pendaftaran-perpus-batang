import { NextResponse } from 'next/server';

/**
 * Image Proxy Route - app/api/proxy-image/route.ts
 *
 * Endpoint ini berfungsi sebagai perantara (proxy) antara browser klien
 * dengan server gambar Hostinger. Dengan cara ini, browser tidak perlu
 * langsung mengakses domain Hostinger (yang berpotensi menyebabkan CORS),
 * melainkan cukup meminta gambar melalui domain Next.js yang sama.
 *
 * Penggunaan: /api/proxy-image?url=https://api.pendaftaran-perpus-batang.my.id/uploads/...
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Parameter url diperlukan' }, { status: 400 });
  }

  // Validasi sederhana: hanya izinkan URL dari domain Hostinger kita
  const allowedDomain = process.env.HOSTINGER_API_URL || 'api.pendaftaran-perpus-batang.my.id';
  try {
    const parsed = new URL(imageUrl);
    if (!parsed.hostname.endsWith(allowedDomain.replace(/^https?:\/\//, ''))) {
      return NextResponse.json({ error: 'Domain tidak diizinkan' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'URL tidak valid' }, { status: 400 });
  }

  try {
    const res = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
    });

    if (!res.ok) {
      console.error(`[proxy-image] Fetch failed. Status: ${res.status}, URL: ${imageUrl}`);
      return NextResponse.json({ error: 'Gagal mengambil gambar dari server' }, { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await res.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // cache 24 jam di browser
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (err: any) {
    console.error('[proxy-image] Exception:', err?.message || err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada proxy gambar' }, { status: 500 });
  }
}
