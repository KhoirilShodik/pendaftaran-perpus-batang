import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { type, email, fullname, ticketNumber } = await req.json();

    // Basic validation
    if (!email || !fullname || !ticketNumber) {
      return NextResponse.json({ error: 'Missing required fields: email, fullname, or ticketNumber' }, { status: 400 });
    }

    let subject = '';
    let html = '';

    const brandBlue = '#1e3a5f';
    const brandGold = '#c8a84b';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Email Template Logic
    if (type === 'WELCOME_CONFIRMATION') {
      subject = 'Konfirmasi Pendaftaran Anggota - Dispuspa Batang';
      html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: ${brandBlue}; padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 1px;">DISPUSPA BATANG</h1>
            <p style="color: ${brandGold}; margin: 10px 0 0; font-weight: bold; text-transform: uppercase;">Pendaftaran Berhasil</p>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: ${brandBlue}; margin-top: 0; font-size: 22px;">Halo, ${fullname}!</h2>
            <p style="color: #4a4a4a; line-height: 1.6; font-size: 16px;">Terima kasih telah mendaftar sebagai anggota Perpustakaan Daerah Kabupaten Batang. Data Anda telah kami terima dan sedang dalam tahap verifikasi.</p>
            
            <div style="background-color: #f9f9f9; border: 1px dashed ${brandGold}; border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center;">
              <span style="display: block; color: #888; font-size: 13px; text-transform: uppercase; margin-bottom: 8px;">Nomor Tiket Anda</span>
              <strong style="color: ${brandBlue}; font-size: 32px; letter-spacing: 2px;">${ticketNumber}</strong>
            </div>

            <p style="color: #4a4a4a; line-height: 1.6; font-size: 16px; margin-bottom: 30px;">Gunakan nomor tiket di atas untuk memantau status pendaftaran Anda secara berkala melalui tombol di bawah ini:</p>
            
            <div style="text-align: center;">
              <a href="${siteUrl}/cek-status?tiket=${ticketNumber}" 
                 style="background-color: ${brandGold}; color: ${brandBlue}; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                Cek Status Pendaftaran
              </a>
            </div>
          </div>
          <div style="background-color: #f4f4f4; padding: 25px; text-align: center; color: #777; font-size: 12px; border-top: 1px solid #eeeeee;">
            <p style="margin: 0;">&copy; 2026 Dinas Perpustakaan dan Kearsipan Kabupaten Batang</p>
            <p style="margin: 5px 0 0;">Jl. Alun-alun Batang No. 1, Batang, Jawa Tengah</p>
          </div>
        </div>
      `;
    } else if (type === 'STATUS_APPROVED') {
      subject = 'Pendaftaran Disetujui - Dispuspa Batang';
      html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: ${brandBlue}; padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 1px;">DISPUSPA BATANG</h1>
            <p style="color: ${brandGold}; margin: 10px 0 0; font-weight: bold; text-transform: uppercase;">Selamat! Akun Anda Aktif</p>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #2e7d32; margin-top: 0; font-size: 22px;">Pendaftaran Disetujui!</h2>
            <p style="color: #4a4a4a; line-height: 1.6; font-size: 16px;">Selamat <strong>${fullname}</strong>, pendaftaran anggota perpustakaan Anda telah disetujui. Anda sekarang dapat mengakses layanan digital kami.</p>
            
            <p style="color: #4a4a4a; line-height: 1.6; font-size: 16px; margin: 30px 0;">Kartu anggota digital Anda sudah tersedia dan dapat diunduh melalui link di bawah ini:</p>
            
            <div style="text-align: center; margin-bottom: 40px;">
              <a href="${siteUrl}/cek-status?tiket=${ticketNumber}" 
                 style="background-color: ${brandGold}; color: ${brandBlue}; padding: 18px 36px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                Lihat Kartu Digital
              </a>
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 20px; color: #666; font-size: 14px;">
              <p><strong>Catatan:</strong> Anda juga bisa mendapatkan kartu fisik dengan menunjukkan nomor tiket <strong>${ticketNumber}</strong> di meja layanan Perpustakaan Daerah Batang.</p>
            </div>
          </div>
          <div style="background-color: #f4f4f4; padding: 25px; text-align: center; color: #777; font-size: 12px; border-top: 1px solid #eeeeee;">
            <p style="margin: 0;">&copy; 2026 Dinas Perpustakaan dan Kearsipan Kabupaten Batang</p>
            <p style="margin: 5px 0 0;">Jl. Alun-alun Batang No. 1, Batang, Jawa Tengah</p>
          </div>
        </div>
      `;
    } else {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    // Send Email via Resend
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Resend Error Details:', error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Critical Email API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
