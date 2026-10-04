/*
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM admin_users');
    const count = (rows as any[])[0].count;

    if (count > 0) {
      return NextResponse.json({ message: 'Tabel admin_users sudah berisi data. Seeding dibatalkan.' }, { status: 400 });
    }

    const email = 'admin@pendaftaran-perpus-batang.my.id';
    const password = 'Dispuspa@2026';
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = 'superadmin';

    await pool.execute(
      'INSERT INTO admin_users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );

    return NextResponse.json({ message: 'Seeding berhasil. Akun superadmin pertama telah dibuat.' });
  } catch (error: any) {
    console.error('Seed Error:', error);
    return NextResponse.json({ error: 'Gagal melakukan seeding', details: error.message }, { status: 500 });
  }
}
*/
export { };