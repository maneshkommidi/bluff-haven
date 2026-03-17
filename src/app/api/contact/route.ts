import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json()
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Use existing email infrastructure
    const { sendEmail } = await import('@/lib/email')
    await sendEmail({
      to:      process.env.OWNER_EMAIL ?? 'bluffhavenretreat@gmail.com',
      subject: `New inquiry from ${name} — Bluff Haven Retreat`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Contact route error:', err?.message ?? err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
