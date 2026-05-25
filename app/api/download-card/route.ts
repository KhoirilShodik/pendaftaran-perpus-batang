import React from 'react';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { renderToStream } from '@react-pdf/renderer';
import { LibraryCardPDF } from '@/app/components/LibraryCardPDF';
import bwipjs from 'bwip-js';
import { STATUS_CONFIG } from '@/lib/constants';
import fs from 'fs';
import path from 'path';

// Fungsi download gambar khusus untuk external URL (misal dari Hostinger Cloud)
async function getBase64FromExternalUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch (err) {
    return null;
  }
}

// Generator Barcode Code 128 menggunakan bwip-js (bebas dependency biner canvas)
async function generateBarcodeBase64(text: string): Promise<string> {
  const pngBuffer = await bwipjs.toBuffer({
    bcid: 'code128',
    text: text,
    scale: 3,
    height: 10,
    includetext: false,
  });
  return `data:image/png;base64,${pngBuffer.toString('base64')}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tiket = searchParams.get('tiket');

    if (!tiket) {
      return NextResponse.json({ error: 'Parameter tiket diperlukan' }, { status: 400 });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM registrations WHERE ticket_no = ?',
      [tiket]
    );
    const registrations = rows as any[];
    const reg = registrations[0];

    if (!reg) {
      return NextResponse.json({ error: 'Data pendaftaran tidak ditemukan' }, { status: 404 });
    }

    if (reg.status !== 'Disetujui') {
      return NextResponse.json({ error: 'Pendaftaran belum disetujui' }, { status: 403 });
    }

    const memberNo = reg.member_no || reg.ticket_no;
    const barcodeDataUrl = await generateBarcodeBase64(memberNo);

    // Pemformatan Tanggal Berlaku
    let formattedEndDate = '-';
    if (reg.end_date) {
      const dateObj = new Date(reg.end_date);
      formattedEndDate = `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;
    }

    // Perbaikan Mapping Nama Pendek Sesuai Desain Gambar Dinas
    const jenisAnggotaMapping: Record<string, string> = {
      '1': 'PELAJAR',
      '2': 'UMUM',
      '13': 'UMUM',
    };
    const jenisAnggotaText = jenisAnggotaMapping[String(reg.jenis_anggota_id || reg.job_id)] || 'UMUM';

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || STATUS_CONFIG.SITE_URL_FALLBACK;
    let pasFotoBase64: string | null = null;

    if (reg.pas_foto_url) {
      const cleanPath = reg.pas_foto_url.trim();

      if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
        // Kasus 1: URL Absolut eksternal -> Ambil via Fetch
        pasFotoBase64 = await getBase64FromExternalUrl(cleanPath);
      } else {
        // Kasus 2: Path Lokal Server -> Baca langsung via File System (Bebas Overhead Network)
        try {
          const relativePath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
          // Menargetkan folder public/uploads di dalam struktur Next.js Anda
          const localFilePath = path.join(process.cwd(), 'public', relativePath);

          if (fs.existsSync(localFilePath)) {
            const fileBuffer = fs.readFileSync(localFilePath);
            const ext = path.extname(localFilePath).replace('.', '') || 'jpeg';
            pasFotoBase64 = `data:image/${ext};base64,${fileBuffer.toString('base64')}`;
          } else {
            // Fallback jika tidak ada di folder public lokal, coba fetch via URL absolute
            pasFotoBase64 = await getBase64FromExternalUrl(`${baseUrl}${relativePath}`);
          }
        } catch (fsErr) {
          console.error('[download-card] Local FS Read Error:', fsErr);
        }
      }
    }

    // Render PDF Stream dengan Data Terkalibrasi
    const pdfStream = await renderToStream(
      React.createElement(LibraryCardPDF, {
        member: {
          fullname: reg.fullname || 'NAMA LENGKAP',
          memberNo: memberNo,
          jenisAnggota: jenisAnggotaText,
          endDate: formattedEndDate,
        },
        barcodeUrl: barcodeDataUrl,
        pasFotoUrl: pasFotoBase64 || '',
        baseUrl: baseUrl,
      }) as any
    );

    return new NextResponse(pdfStream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Kartu_Anggota_${memberNo}.pdf"`,
      },
    });
  } catch (error) {
    console.error('[download-card] PDF Generation Error:', error);
    return NextResponse.json({ error: 'Gagal memproses kartu PDF' }, { status: 500 });
  }
}