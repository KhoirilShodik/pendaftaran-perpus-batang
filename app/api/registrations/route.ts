import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// ============================================================
// GET — Ambil Semua Registrations (Untuk Dashboard Admin)
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ticketNo = searchParams.get('ticket_no')

    if (ticketNo) {
      const [rows] = await pool.execute(
        `SELECT ticket_no, member_no, end_date, job_id, pas_foto_url, fullname, status, created_at, approved_at, reject_reason 
         FROM registrations WHERE ticket_no = ? LIMIT 1`,
        [ticketNo]
      )
      const data = rows as any[]
      if (!data.length) {
        return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
      }
      return NextResponse.json({ data: data[0] })
    }

    // DISESUAIKAN: Ambil kolom member_no dan end_date menggunakan huruf kecil
    const [rows] = await pool.execute(
      `SELECT id, ticket_no, member_no, end_date, fullname, place_of_birth, date_of_birth, address, kecamatan, kelurahan, 
              rt, rw, city, province, identity_type_id, identity_no, education_level_id, sex_id, 
              marital_status_id, job_id, institution_name, mother_maiden_name, email, no_hp, phone, 
              agama_id, nama_darurat, telp_darurat, status_hubungan_darurat, pas_foto_url, foto_ktp_url, 
              status, reject_reason, created_at, updated_at, approved_at, approved_by
       FROM registrations 
       ORDER BY created_at DESC`
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

    // 1. Audit Trail: Ambil Identitas Admin dari Cookie JWT
    const token = req.cookies.get('admin_token')?.value;
    let adminIdentity = 'admin.perpus';

    if (token) {
      try {
        const { jwtVerify } = await import('jose');
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super_secret_jwt_key_dispuspa_batang_2026_xyz123');
        const { payload } = await jwtVerify(token, secret);
        adminIdentity = (payload.email as string) || (payload.username as string) || adminIdentity;
      } catch (e) {
        console.error('Invalid token for audit trail, using default.');
      }
    }

    let nextMemberNo = null;
    let finalEndDate = null;

    // KONDISI A: JIKA STATUS DISETUJUI
    if (status === 'Disetujui') {
      const [rows] = await pool.execute(
        `SELECT * FROM registrations WHERE id = ? LIMIT 1`,
        [id]
      )
      const dataPendaftar = (rows as any[])[0]

      if (!dataPendaftar) {
        return NextResponse.json({ error: 'Data pendaftaran tidak ditemukan' }, { status: 404 });
      }

      const BRIDGE_URL = 'https://bridge.pendaftaran-perpus-batang.my.id/perpus-bridge.php?action=insert-member';

      try {
        // 2. Kirim Data Lengkap ke PHP Bridge (INLIS Lite Lokal)
        const bridgeResponse = await fetch(BRIDGE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.BRIDGE_API_KEY || 'dispuspa-batang-secret-2026',
            'bypass-tunnel-reminder': 'true',
            'User-Agent': 'NextJS-PerpusBatang/1.0'
          },
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
            mother_maiden_name: dataPendaftar.mother_maiden_name,
            nama_darurat: dataPendaftar.nama_darurat,
            telp_darurat: dataPendaftar.telp_darurat,
            status_hubungan_darurat: dataPendaftar.status_hubungan_darurat,
            institution_name: dataPendaftar.institution_name,
            photo_url: dataPendaftar.pas_foto_url,
            jenis_anggota_id: Number(dataPendaftar.job_id) === 1 ? 1 : 13,
            identity_type_id: dataPendaftar.identity_type_id || 1,
            education_level_id: dataPendaftar.education_level_id || 1,
            sex_id: dataPendaftar.sex_id || 1,
            agama_id: dataPendaftar.agama_id || 1
          }),
        });

        const textData = await bridgeResponse.text();
        
        // 🔍 [LOG VERCEL 1] - Memantau respon mentah PHP Bridge
        console.log('\n===========================================');
        console.log('=== [DEBUG] TEXT MENTAH DARI PHP BRIDGE ===');
        console.log(textData);
        console.log('===========================================\n');

        let bridgeData: any;

        try {
          bridgeData = JSON.parse(textData);
          
          // 🔍 [LOG VERCEL 2] - Memantau objek JSON hasil parsing
          console.log('======================================');
          console.log('=== [DEBUG] OBJECT JSON PHP BRIDGE ===');
          console.log(JSON.stringify(bridgeData, null, 2));
          console.log('======================================\n');

        } catch (jsonErr) {
          throw new Error(`Response PHP Bridge bukan JSON valid. Output: ${textData.substring(0, 100)}`);
        }

        // 3. Validasi Response Sukses dari Bridge
        if (bridgeResponse.ok && bridgeData.success) {
          
          // ✨ ANTI-FAILOVER LOGIC: Ambil nomor dari struktur key apa pun
          nextMemberNo = bridgeData.member_no || 
                         bridgeData.MemberNo || 
                         bridgeData.memberNo || 
                         (bridgeData.ticket_no && bridgeData.ticket_no.startsWith('012026') ? bridgeData.ticket_no : null);

          if (bridgeData.end_date || bridgeData.EndDate) {
            finalEndDate = bridgeData.end_date || bridgeData.EndDate;
          } else {
            const now = new Date();
            now.setFullYear(now.getFullYear() + 3);
            finalEndDate = now.toISOString().split('T')[0];
          }

          if (!nextMemberNo) {
            throw new Error(`Nomor anggota tidak terdeteksi. Isi JSON Bridge: ${JSON.stringify(bridgeData)}`);
          }

          // 🔍 [LOG VERCEL 3] - Nilai variabel TEPAT SEBELUM Query MySQL dijalankan
          console.log('======================================');
          console.log('DEBUG BEFORE UPDATE SYSTEM');
          console.log({
            id,
            original_ticket_no: dataPendaftar.ticket_no,
            nextMemberNo,
            finalEndDate,
            adminIdentity
          });
          console.log('======================================');

          // 4. DISESUAIKAN: Eksekusi UPDATE Kolom member_no & end_date (huruf kecil) ke Hostinger
          await pool.execute(
  `UPDATE registrations 
   SET 
      status = ?,
      member_no = ?,
      end_date = ?,
      approved_at = NOW(),
      approved_by = ?,
      updated_at = NOW()
   WHERE id = ?`,
  [
    'Disetujui',
    String(nextMemberNo),
    String(finalEndDate),
    String(adminIdentity),
    Number(id)
  ]
)

const [debugCheck] = await pool.execute(
  `SELECT id, ticket_no, member_no 
   FROM registrations 
   WHERE id = ?`,
  [id]
)

console.log('DEBUG DB AFTER UPDATE:', debugCheck)
          // 🔍 [LOG VERCEL 4] - Ambil ulang data untuk membuktikan apakah data tersimpan dengan benar
          const [afterRows] = await pool.execute(
            `SELECT ticket_no, member_no, end_date, status 
             FROM registrations 
             WHERE id = ? LIMIT 1`,
            [id]
          );

          console.log('======================================');
          console.log('DEBUG AFTER UPDATE SYSTEM (DB STATE)');
          console.log(afterRows);
          console.log('======================================');
        } else {
          console.error('PHP Bridge mengembalikan error:', bridgeData.error || 'Unknown Error');
          return NextResponse.json({ error: bridgeData.error || 'Gagal sinkronisasi data ke INLIS Lite' }, { status: 422 });
        }
      } catch (bridgeErr: any) {
        console.error('Gagal terhubung ke PHP Bridge:', bridgeErr.message);
        return NextResponse.json({ error: `PHP Bridge Error: ${bridgeErr.message}` }, { status: 502 });
      }

    // KONDISI B: JIKA STATUS DITOLAK
    } else if (status === 'Ditolak') {
      await pool.execute(
        `UPDATE registrations 
         SET status = 'Ditolak', 
             reject_reason = ?, 
             approved_by = ?, 
             updated_at = NOW() 
         WHERE id = ?`,
        [reject_reason || 'Persyaratan tidak sesuai', adminIdentity, id]
      )
    }

    // 5. Kembalikan Response Sukses ke Frontend Dashboard
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