import React from 'react';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { renderToStream } from '@react-pdf/renderer';
import { LibraryCardPDF } from '@/app/components/LibraryCardPDF';
import bwipjs from 'bwip-js'; // Pustaka JS murni, aman untuk Vercel
import { STATUS_CONFIG } from '@/lib/constants';
import fs from 'fs';
import path from 'path';

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

// Generator Barcode Code 128 Berbasis Asinkron (Pure JS - bwip-js)
async function generateBarcodeBase64(text: string): Promise<string> {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer({
      bcid: 'code128',       // Tipe barcode Code 128 standar perpustakaan
      text: text,            // Isi teks nomor anggota
      scale: 3,              // Skala resolusi tinggi agar tajam saat di-scan
      height: 10,            // Tinggi bar proporsional
      includetext: false,    // Teks nomor diatur manual di layout react-pdf
    }, (err, pngBuffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(`data:image/png;base64,${pngBuffer.toString('base64')}`);
      }
    });
  });
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

    // Memanggil generator barcode baru yang aman untuk platform serverless
    const barcodeDataUrl = await generateBarcodeBase64(memberNo);

    let formattedEndDate = '-';
    if (reg.end_date) {
      const dateObj = new Date(reg.end_date);
      formattedEndDate = `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;
    }

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
        pasFotoBase64 = await getBase64FromExternalUrl(cleanPath);
      } else {
        try {
          const relativePath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
          const localFilePath = path.join(process.cwd(), 'public', relativePath);

          if (fs.existsSync(localFilePath)) {
            const fileBuffer = fs.readFileSync(localFilePath);
            const ext = path.extname(localFilePath).replace('.', '') || 'jpeg';
            pasFotoBase64 = `data:image/${ext};base64,${fileBuffer.toString('base64')}`;
          } else {
            pasFotoBase64 = await getBase64FromExternalUrl(`${baseUrl}${relativePath}`);
          }
        } catch (fsErr) {
          console.error('[download-card] Local FS Read Error:', fsErr);
        }
      }
    }

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