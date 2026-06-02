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

    let memberNo = null;
    let endDate = null;

    // KONDISI A: JIKA STATUS DISETUJUI (APPROVE)
    if (status === 'Disetujui') {
      const [rows]: any = await pool.execute(
        `SELECT * FROM registrations WHERE id = ? LIMIT 1`,
        [id]
      );
      const reg = rows[0];
      if (!reg) {
        return NextResponse.json({ error: 'Data pendaftaran tidak ditemukan' }, { status: 404 });
      }

      const BRIDGE_URL = 'https://bridge.pendaftaran-perpus-batang.my.id/perpus-bridge.php?action=insert-member';

      // Normalisasi format tanggal lahir untuk kestabilan INLIS Lite lokal
      let tanggalLahirBersih = reg.date_of_birth;
      if (reg.date_of_birth) {
        const d = new Date(reg.date_of_birth);
        if (!isNaN(d.getTime())) {
          tanggalLahirBersih = d.toISOString().split('T')[0];
        }
      }

      // Payload hibrida menuju PHP Bridge
      const bridgePayload = {
        fullname: reg.fullname,
        identity_no: reg.identity_no,
        place_of_birth: reg.place_of_birth,
        date_of_birth: tanggalLahirBersih,
        address: reg.address,
        kecamatan: reg.kecamatan,
        kelurahan: reg.kelurahan,
        rt: reg.rt,
        rw: reg.rw,
        no_hp: reg.no_hp,
        email: reg.email,
        mother_maiden_name: reg.mother_maiden_name,
        nama_darurat: reg.nama_darurat,
        telp_darurat: reg.telp_darurat,
        status_hubungan_darurat: reg.status_hubungan_darurat,
        institution_name: reg.institution_name,
        photo_url: reg.pas_foto_url,
        jenis_anggota_id: Number(reg.job_id) === 1 ? 1 : 13,
        identity_type_id: reg.identity_type_id || 1,
        education_level_id: reg.education_level_id || 1,
        sex_id: reg.sex_id || 1,
        agama_id: reg.agama_id || 1,
        marital_status_id: reg.marital_status_id,

        // Properti Cadangan Huruf Kapital
        Fullname: reg.fullname,
        IdentityNo: reg.identity_no,
        PlaceOfBirth: reg.place_of_birth,
        DateOfBirth: tanggalLahirBersih,
        Address: reg.address,
        PhotoUrl: reg.pas_foto_url
      };

      try {
        const bridgeResponse = await fetch(BRIDGE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.BRIDGE_API_KEY || 'dispuspa-batang-secret-2026',
            'bypass-tunnel-reminder': 'true',
            'User-Agent': 'NextJS-PerpusBatang/1.0'
          },
          body: JSON.stringify(bridgePayload),
        });

        const textData = await bridgeResponse.text();
        let bridgeData: any;

        try {
          bridgeData = JSON.parse(textData);
          console.log('Bridge Data Received:', bridgeData);
        } catch (jsonErr) {
          throw new Error(`Response PHP Bridge bukan JSON valid. Output: ${textData.substring(0, 100)}`);
        }

        if (!bridgeData.success) {
          throw new Error(`Bridge error: ${bridgeData.error || 'Unknown error'}`);
        }

        // Penangkapan nilai fleksibel (Mendukung lowercase maupun PascalCase dari PHP)
        memberNo = bridgeData.member_no || bridgeData.MemberNo;
        endDate = bridgeData.end_date || bridgeData.EndDate;

        // =========================================================================
        // 🟢 PERBAIKAN UTAMA: SANITASI MUTLAK & STRATEGI EXPLICIT LITERAL QUERY
        // Membypass bug penukaran indeks tanda tanya oleh driver database pooling Vercel
        // =========================================================================
        const safeMemberNo = memberNo ? String(memberNo).trim().substring(0, 20) : null;
        const safeEndDate = endDate && String(endDate).trim().match(/^\d{4}-\d{2}-\d{2}/)
          ? String(endDate).trim().substring(0, 10)
          : null;

        // Proteksi SQL Injection internal dengan meng-escape tanda petik satu (') jika ada
        const safeAdmin = String(adminIdentity).trim().replace(/'/g, "''");
        const safeId = Number(id);

        if (!safeMemberNo || !safeEndDate || isNaN(safeId)) {
          throw new Error("Nomor anggota atau masa aktif dari sistem INLIS tidak bernilai valid.");
        }

        // Menyusun kueri secara literal tanpa tanda tanya (?). Kolom dipetakan secara absolut.
        const susunanKueriEksplisit = `
          UPDATE registrations 
          SET 
            member_no = '${safeMemberNo}', 
            end_date = '${safeEndDate}', 
            status = 'Disetujui', 
            approved_by = '${safeAdmin}',
            approved_at = NOW(), 
            updated_at = NOW() 
          WHERE id = ${safeId}
        `;

        console.log("MENGEKSEKUSI KUERI STRATEGIS NO-BINDING:");
        console.log(susunanKueriEksplisit);

        // Eksekusi string SQL langsung menggunakan pool.query()
        const [result]: any = await pool.query(susunanKueriEksplisit);

        console.log('UPDATE DATABASE HOSTINGER BERHASIL:', {
          affectedRows: result?.affectedRows,
          idTarget: safeId,
          nomorAnggota: safeMemberNo,
          masaBerlaku: safeEndDate
        });
        // =========================================================================

      } catch (bridgeErr: any) {
        console.error('Gagal terhubung ke PHP Bridge:', bridgeErr.message);
        return NextResponse.json({ error: `PHP Bridge Error: ${bridgeErr.message}` }, { status: 502 });
      }

    } else if (status === 'Ditolak') {
      // Terapkan hal yang sama pada proses penolakan agar aman
      const safeAdmin = String(adminIdentity).trim().replace(/'/g, "''");
      const safeReason = (reject_reason || 'Persyaratan tidak sesuai').replace(/'/g, "''");
      const safeId = Number(id);

      const updateRejectSql = `
        UPDATE registrations 
        SET status = 'Ditolak', 
            reject_reason = '${safeReason}', 
            approved_by = '${safeAdmin}', 
            updated_at = NOW() 
        WHERE id = ${safeId}
      `;
      await pool.query(updateRejectSql);
    }

    // RETURN RESPONS LANGSUNG KE FRONTEND
    return NextResponse.json({
      success: true,
      member_no: memberNo,
      end_date: endDate,
      message: 'Proses pembaruan status registrasi berhasil disinkronisasi',
    });

  } catch (err: any) {
    console.error('PATCH registration error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}