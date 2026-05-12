import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { COMMON_REGEX } from '@/lib/constants';

import { getEmailTemplate } from '@/lib/emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { type, email, fullname, ticketNumber, rejectReason } = await req.json();

    // Basic validation
    if (!email || !fullname || !ticketNumber) {
      console.log('Missing notification fields:', { email, fullname, ticketNumber });
      return NextResponse.json({ error: 'Missing required fields: email, fullname, or ticketNumber' }, { status: 400 });
    }

    if (!COMMON_REGEX.EMAIL.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const { subject, html } = getEmailTemplate({ type, fullname, ticketNumber, rejectReason });

    if (!subject || !html) {
      return NextResponse.json({ error: 'Invalid notification type or template generation failed' }, { status: 400 });
    }

    // Send Email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Layanan Perpustakaan Batang <noreply@pendaftaran-perpus-batang.my.id>',
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
