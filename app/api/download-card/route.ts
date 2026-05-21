import React from 'react';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { renderToStream } from '@react-pdf/renderer';
import { LibraryCardPDF } from '@/app/components/LibraryCardPDF';
import QRCode from 'qrcode';
import { STATUS_CONFIG } from '@/lib/constants';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tiket = searchParams.get('tiket');

    if (!tiket) {
      return NextResponse.json({ error: 'Parameter tiket diperlukan' }, { status: 400 });
    }

    // Cari data pendaftaran berdasarkan nomor tiket via MySQL
    const [rows] = await pool.execute(
      'SELECT * FROM registrations WHERE ticket_no = ?',
      [tiket]
    );
    const registrations = rows as any[];
    const registration = registrations[0];

    if (!registration) {
      return NextResponse.json({ error: 'Data pendaftaran tidak ditemukan' }, { status: 404 });
    }

    if (registration.status !== 'Disetujui') {
      return NextResponse.json({ error: 'Pendaftaran belum disetujui, kartu belum tersedia' }, { status: 403 });
    }

    // 1. Generate QR Code untuk verifikasi online
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || STATUS_CONFIG.SITE_URL_FALLBACK;
    const url = `${baseUrl}/cek-status?tiket=${registration.ticket_no}`;
    const qrCodeData = await QRCode.toDataURL(url, {
      margin: 1,
      width: 150,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#1e3a5f',
        light: '#ffffff',
      }
    });

    // 2. Format URL gambar profil (Lokal /uploads atau Absolut)
    let pasFotoPublicUrl = '';
    let pasFotoDataUrl = '';
    if (registration.pas_foto_url) {
      const cleanPath = registration.pas_foto_url.trim();
      if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
        pasFotoPublicUrl = cleanPath;
      } else {
        const imagePath = cleanPath.startsWith('/uploads/') 
          ? cleanPath 
          : `/uploads/${cleanPath}`;
        pasFotoPublicUrl = `${baseUrl}${imagePath}`;
      }

      // Convert remote URL to Base64 data URL specifically for @react-pdf/renderer
      try {
        console.log('Fetching pas_foto from URL:', pasFotoPublicUrl);
        const imgRes = await fetch(pasFotoPublicUrl, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
          }
        });

        if (imgRes.ok) {
          console.log(`Successfully fetched image from ${pasFotoPublicUrl}. Status: ${imgRes.status} ${imgRes.statusText}`);
          const arrayBuffer = await imgRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
          pasFotoDataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
          console.log(`Converted image to Base64 (length: ${pasFotoDataUrl.length}, mimeType: ${mimeType})`);
        } else {
          console.error(`Failed to fetch image for PDF. Status: ${imgRes.status} ${imgRes.statusText}. URL: ${pasFotoPublicUrl}`);
          try {
            const errText = await imgRes.text();
            console.error('Response body:', errText.slice(0, 500));
          } catch (e) {
            console.error('Could not read response body');
          }
        }
      } catch (err: any) {
        console.error('Error fetching pas_foto for PDF from URL:', pasFotoPublicUrl, 'Error details:', err);
        if (err instanceof Error) {
          console.error('Error name:', err.name);
          console.error('Error message:', err.message);
          console.error('Error stack:', err.stack);
        }
      }
    }

    // 3. Render PDF ke stream
    const pdfStream = await renderToStream(
      React.createElement(LibraryCardPDF, {
        registration: {
          fullname: registration.fullname,
          ticketNumber: registration.ticket_no
        },
        qrCodeUrl: qrCodeData,
        pasFotoPublicUrl: pasFotoDataUrl || pasFotoPublicUrl
      }) as any
    );

    // 4. Return PDF stream dengan header attachment
    const memberNameClean = registration.fullname.toUpperCase().replace(/\s+/g, '_');
    const memberNo = registration.ticket_no;
    
    return new NextResponse(pdfStream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Kartu_Anggota_${memberNo}.pdf"`
      }
    });

  } catch (error: any) {
    console.error('Download PDF Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat membuat dokumen PDF' }, { status: 500 });
  }
}
