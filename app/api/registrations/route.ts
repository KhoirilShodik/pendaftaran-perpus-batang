import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// ============================================================
// GET — Ambil Semua Registrations (Untuk Dashboard Admin / Cek Status)
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ticketNo = searchParams.get('ticket_no')

    if (ticketNo) {
      // Cari by ticket number (untuk cek status anggota)
      const [rows] = await pool.execute(
        `SELECT ticket_no, fullname, status, created_at, approved_at, reject_reason 
         FROM registrations WHERE ticket_no = ? LIMIT 1`,
        [ticketNo]
      )
      const data = rows as any[]
      if (!data.length) {
        return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
      }
      return NextResponse.json({ data: data[0] })
    }

    // Ambil semua data (dashboard admin)
    const [rows] = await pool.execute(
      `SELECT * FROM registrations ORDER BY created_at DESC`
    )
    return NextResponse.json({ data: rows })

  } catch (err: any) {
    console.error('GET registrations error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ============================================================
// POST — Simpan Pendaftaran Anggota Baru Online
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      ticket_no, fullname, place_of_birth, date_of_birth,
      address, kecamatan, kelurahan, rt, rw, city, province,
      identity_type_id, identity_no, education_level_id,
      sex_id, marital_status_id, job_id, institution_name,
      mother_maiden_name, email, no_hp, phone, agama_id,
      nama_darurat, telp_darurat, status_hubungan_darurat,
      pas_foto_url, foto_ktp_url
    } = body

    await pool.execute(
      `INSERT INTO registrations (
        ticket_no, fullname, place_of_birth, date_of_birth,
        address, kecamatan, kelurahan, rt, rw, city, province,
        identity_type_id, identity_no, education_level_id,
        sex_id, marital_status_id, job_id, institution_name,
        mother_maiden_name, email, no_hp, phone, agama_id,
        nama_darurat, telp_darurat, status_hubungan_darurat,
        pas_foto_url, foto_ktp_url, status, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu', NOW(), NOW()
      )`,
      [
        ticket_no, fullname, place_of_birth, date_of_birth,
        address, kecamatan, kelurahan, rt, rw, city, province,
        identity_type_id, identity_no, education_level_id,
        sex_id, marital_status_id, job_id, institution_name,
        mother_maiden_name, email, no_hp, phone, agama_id,
        nama_darurat, telp_darurat, status_hubungan_darurat,
        pas_foto_url, foto_ktp_url
      ]
    )

    return NextResponse.json({ success: true, ticket_no })

  } catch (err: any) {
    console.error('POST registration error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ============================================================
// PATCH — Update Status (Approve/Reject) + Integrasi PHP Bridge
// ============================================================
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, status, reject_reason } = body

    // Ambil identitas admin dari JWT cookie untuk audit trail log
    const token = req.cookies.get('admin_token')?.value;
    let adminIdentity = 'admin.perpus';

    if (token) {
      try {
        const { jwtVerify } = await import('jose');
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super_secret_jwt_key_dispuspa_batang_2026_xyz123');
        const { payload } = await jwtVerify(token, secret);
        adminIdentity = (payload.email as string) || adminIdentity;
      } catch (e) {
        console.error('Invalid token for audit trail');
      }
    }

    let nextMemberNo = null;

    if (status === 'Disetujui') {
      // 1. Update status pendaftaran menjadi Disetujui di database web Hostinger
      await pool.execute(
        `UPDATE registrations SET status = 'Disetujui', approved_at = NOW(), approved_by = ?, updated_at = NOW() WHERE id = ?`,
        [adminIdentity, id]
      )

      // 2. Ambil data lengkap pendaftar tersebut dari database web Hostinger
      const [rows] = await pool.execute(
        `SELECT * FROM registrations WHERE id = ? LIMIT 1`,
        [id]
      )
      const dataPendaftar = (rows as any[])[0]

      if (dataPendaftar) {
        // Alamat URL API Bridge lokal di komputer/server perpustakaan Batang
        const BRIDGE_URL = 'https://bridge.pendaftaran-perpus-batang.my.id/perpus-bridge.php?action=insert-member'; try {
          // 3. Kirim data pendaftar ke INLIS Lite via PHP Bridge (Ditambahkan bypass header LocalTunnel)
          const bridgeResponse = await fetch(BRIDGE_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': process.env.BRIDGE_API_KEY || 'dispuspa-batang-secret-2026',
              'bypass-tunnel-reminder': 'true',      // ← Solusi Bypass Halaman Interstitial Loca.lt
              'User-Agent': 'NextJS-PerpusBatang/1.0'  // ← Menyamar sebagai Client Aman terpercaya
            },
            // SANGAT DISARANKAN: Gunakan snake_case agar sinkron dengan PHP
            body: JSON.stringify({
              fullname: dataPendaftar.fullname,
              identity_no: dataPendaftar.identity_no,
              place_of_birth: dataPendaftar.place_of_birth,
              date_of_birth: dataPendaftar.date_of_birth,
              address: dataPendaftar.address,
              kecamatan: dataPendaftar.kecamatan,
              kelurahan: dataPendaftar.kelurahan,
              rt: dataPendaftar.rt,
              rw: dataPendaftar.rw,
              no_hp: dataPendaftar.no_hp,
              email: dataPendaftar.email,
              mother_maiden_name: dataPendaftar.mother_maiden_name, // Pastikan di database key-nya ini
              nama_darurat: dataPendaftar.nama_darurat,
              telp_darurat: dataPendaftar.telp_darurat,
              status_hubungan_darurat: dataPendaftar.status_hubungan_darurat,
              institution_name: dataPendaftar.institution_name,
              photo_url: dataPendaftar.pas_foto_url,
              jenis_anggota_id: 13,
              identity_type_id: 1,
              education_level_id: dataPendaftar.education_level_id || 1,
              sex_id: dataPendaftar.sex_id || 1,
              agama_id: dataPendaftar.agama_id || 1
            }),
          });

          // Mengantisipasi jika teks balasan masih kotor / gagal diparse ke json
          const textData = await bridgeResponse.text();
          let bridgeData: any;

          try {
            bridgeData = JSON.parse(textData);
          } catch (jsonErr) {
            throw new Error(`Response PHP Bridge bukan JSON valid. Output: ${textData.substring(0, 100)}`);
          }

          // 4. Jika PHP Bridge sukses memasukkan data ke INLIS Lite, ambil nomor anggota barunya
          if (bridgeResponse.ok && bridgeData.success) {
            nextMemberNo = bridgeData.member_no;

            // 5. Timpa nilai ticket_no lama dengan Nomor Anggota resmi dari INLIS Lite
            await pool.execute(
              `UPDATE registrations SET ticket_no = ?, updated_at = NOW() WHERE id = ?`,
              [nextMemberNo, id]
            );
          } else {
            console.error('PHP Bridge mengembalikan error:', bridgeData.error || 'Unknown Error');
          }
        } catch (bridgeErr: any) {
          console.error('Gagal terhubung ke PHP Bridge (Pastikan XAMPP/Bridge menyala):', bridgeErr.message);
          return NextResponse.json({ error: `PHP Bridge Error: ${bridgeErr.message}` }, { status: 502 });
        }
      }

    } else if (status === 'Ditolak') {
      // Logika jika pendaftaran ditolak oleh petugas admin
      await pool.execute(
        `UPDATE registrations SET status = 'Ditolak', reject_reason = ?, approved_by = ?, updated_at = NOW() WHERE id = ?`,
        [reject_reason, adminIdentity, id]
      )
    }

    // Mengembalikan response sukses ke frontend Next.js admin dashboard
    return NextResponse.json({
      success: true,
      member_no: nextMemberNo,
      message: status === 'Disetujui' && nextMemberNo
        ? `Pendaftaran disetujui dan disinkronkan ke INLIS dengan No: ${nextMemberNo}`
        : 'Status pendaftaran berhasil diperbarui.'
    })

  } catch (err: any) {
    console.error('PATCH registration error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}