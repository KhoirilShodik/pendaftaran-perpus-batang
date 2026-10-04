import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email dan Password wajib diisi' }, { status: 400 });
        }

        // 1. Ambil data user berdasarkan email
        const [rows]: any = await pool.execute('SELECT * FROM admin_users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Email atau Password salah' }, { status: 401 });
        }

        const user = rows[0];

        // 2. Cek status keaktifan akun
        if (user.is_active === 0) {
            return NextResponse.json({ error: 'Akun Anda dinonaktifkan.' }, { status: 403 });
        }

        // 3. Cocokkan Password menggunakan bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Email atau Password salah' }, { status: 401 });
        }

        // 4. Update status last_login ke database
        await pool.execute('UPDATE admin_users SET last_login = NOW() WHERE id = ?', [user.id]);

        // 5. Buat Token JWT
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new SignJWT({ id: user.id, email: user.email, role: user.role })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('1d')
            .sign(secret);

        // 6. Simpan Token ke Cookie
        const cookieStore = await cookies();
        cookieStore.set('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24,
            path: '/',
        });

        return NextResponse.json({
            message: 'Login Berhasil',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error: any) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
    }
}