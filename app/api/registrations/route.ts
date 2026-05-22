import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// GET — ambil semua registrations (untuk dashboard admin)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ticketNo = searchParams.get('ticket_no')

    if (ticketNo) {
      // Cari by ticket number (untuk cek status)
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

// POST — simpan pendaftaran baru
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

// PATCH — update status (approve/reject) + Integrasi Real-time ke INLIS Lite
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, status, reject_reason } = body

    // Ambil identitas admin dari JWT cookie
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
        const BRIDGE_URL = 'https://hungry-snakes-tickle.loca.lt/index.php?action=insert-member';
        try {
          // 3. Kirim data pendaftar ke INLIS Lite via PHP Bridge
          const bridgeResponse = await fetch(BRIDGE_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              Fullname: dataPendaftar.fullname,
              IdentityNo: dataPendaftar.identity_no,
              PlaceOfBirth: dataPendaftar.place_of_birth,
              DateOfBirth: dataPendaftar.date_of_birth, // Format Y-m-d otomatis dihandle
              Address: dataPendaftar.address,
              Kecamatan: dataPendaftar.kecamatan,
              Kelurahan: dataPendaftar.kelurahan,
              RT: dataPendaftar.rt,
              RW: dataPendaftar.rw,
              NoHp: dataPendaftar.no_hp,
              Email: dataPendaftar.email,
              InstitutionName: dataPendaftar.institution_name,
              PhotoUrl: dataPendaftar.pas_foto_url,
              JenisAnggota_id: 13,    // Default 13 (Umum) sesuai database dinas
              IdentityType_id: 1,     // Default 1 (KTP)
              EducationLevel_id: dataPendaftar.education_level_id || 1,
              Sex_id: dataPendaftar.sex_id || 1,
              Agama_id: dataPendaftar.agama_id || 1
            }),
          });

          const bridgeData = await bridgeResponse.json();

          // 4. Jika PHP Bridge sukses memasukkan data ke INLIS Lite, ambil nomor anggota barunya
          if (bridgeResponse.ok && bridgeData.success) {
            nextMemberNo = bridgeData.member_no;

            // 5. Timpa nilai ticket_no lama dengan Nomor Anggota resmi dari INLIS Lite
            await pool.execute(
              `UPDATE registrations SET ticket_no = ?, updated_at = NOW() WHERE id = ?`,
              [nextMemberNo, id]
            );
          } else {
            console.error('PHP Bridge mengembalikan error:', bridgeData.error);
          }
        } catch (bridgeErr: any) {
          console.error('Gagal terhubung ke PHP Bridge (Pastikan XAMPP/Bridge menyala):', bridgeErr.message);
        }
      }

    } else if (status === 'Ditolak') {
      // Logika jika pendaftaran ditolak oleh petugas
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