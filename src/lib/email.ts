import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface BookingConfirmationParams {
  guestEmail: string
  guestName: string
  confirmationCode: string
  arrival: string
  departure: string
  total: number
}

export async function sendBookingConfirmation(params: BookingConfirmationParams) {
  const { guestEmail, guestName, confirmationCode, arrival, departure, total } = params

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: guestEmail,
    subject: `Booking Confirmed — Bluff Haven Retreat (${confirmationCode})`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <h1 style="color: #2d5016; font-size: 28px; margin-bottom: 8px;">You're confirmed! 🎉</h1>
        <p style="font-size: 16px; color: #555;">Hi ${guestName}, your stay at Bluff Haven Retreat is booked.</p>

        <div style="background: #f7f9f4; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Confirmation Code</p>
          <p style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: #2d5016;">${confirmationCode}</p>

          <div style="display: flex; gap: 32px;">
            <div>
              <p style="margin: 0 0 4px; font-size: 13px; color: #888;">Check-in</p>
              <p style="margin: 0; font-weight: 600;">${formatDate(arrival)}</p>
              <p style="margin: 0; font-size: 13px; color: #555;">After 4:00 PM</p>
            </div>
            <div>
              <p style="margin: 0 0 4px; font-size: 13px; color: #888;">Check-out</p>
              <p style="margin: 0; font-weight: 600;">${formatDate(departure)}</p>
              <p style="margin: 0; font-size: 13px; color: #555;">Before 11:00 AM</p>
            </div>
          </div>

          <div style="border-top: 1px solid #e0e7d9; margin-top: 20px; padding-top: 20px;">
            <p style="margin: 0 0 4px; font-size: 13px; color: #888;">Total paid</p>
            <p style="margin: 0; font-size: 22px; font-weight: 700;">$${total.toFixed(2)}</p>
          </div>
        </div>

        <h2 style="font-size: 18px; color: #2d5016;">Property Address</h2>
        <p style="color: #555;">Bluff Haven Retreat<br/>Address will be sent 7 days before check-in.</p>

        <h2 style="font-size: 18px; color: #2d5016;">Questions?</h2>
        <p style="color: #555;">Reply to this email or contact us at <a href="mailto:${process.env.EMAIL_FROM}" style="color: #2d5016;">${process.env.EMAIL_FROM}</a></p>

        <p style="font-size: 12px; color: #aaa; margin-top: 40px;">Bluff Haven Retreat · Booking confirmation</p>
      </div>
    `,
  })
}
