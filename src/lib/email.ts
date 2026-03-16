import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface BookingConfirmationParams {
  guestEmail:       string
  guestName:        string
  confirmationCode: string
  arrival:          string
  departure:        string
  total:            number
}

// Fix: append T00:00:00 to prevent UTC offset shifting the date in some timezones
function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  })
}

export async function sendBookingConfirmation(params: BookingConfirmationParams) {
  const { guestEmail, guestName, confirmationCode, arrival, departure, total } = params

  await resend.emails.send({
    from:    process.env.EMAIL_FROM!,
    to:      guestEmail,
    subject: `Booking Confirmed \u2014 Bluff Haven Retreat`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;background:#fff;padding:40px 32px;">

        <h1 style="font-size:26px;font-weight:700;color:#1c1917;margin:0 0 8px;">You're confirmed! &#127881;</h1>
        <p style="font-size:15px;color:#57534e;margin:0 0 32px;">Hi ${guestName}, your stay at Bluff Haven Retreat is booked and confirmed.</p>

        <div style="background:#1c1917;border-radius:12px;padding:28px;margin-bottom:24px;color:white;">
          <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#a8a29e;">Booking Reference</p>
          <p style="margin:0 0 28px;font-size:22px;font-weight:700;font-family:monospace;letter-spacing:2px;">#${confirmationCode}</p>

          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:0 20px 0 0;vertical-align:top;">
                <p style="margin:0 0 4px;font-size:11px;color:#a8a29e;text-transform:uppercase;letter-spacing:0.5px;">Check-in</p>
                <p style="margin:0 0 2px;font-weight:600;font-size:14px;">${formatDate(arrival)}</p>
                <p style="margin:0;font-size:13px;color:#a8a29e;">After 4:00 PM</p>
              </td>
              <td style="vertical-align:top;">
                <p style="margin:0 0 4px;font-size:11px;color:#a8a29e;text-transform:uppercase;letter-spacing:0.5px;">Check-out</p>
                <p style="margin:0 0 2px;font-weight:600;font-size:14px;">${formatDate(departure)}</p>
                <p style="margin:0;font-size:13px;color:#a8a29e;">Before 10:00 AM</p>
              </td>
            </tr>
          </table>

          <div style="border-top:1px solid #44403c;margin-top:20px;padding-top:20px;">
            <p style="margin:0 0 2px;font-size:11px;color:#a8a29e;text-transform:uppercase;letter-spacing:0.5px;">Total paid</p>
            <p style="margin:0;font-size:24px;font-weight:700;">$${total.toFixed(2)}</p>
          </div>
        </div>

        <div style="background:#fafaf9;border-radius:12px;padding:24px;margin-bottom:24px;">
          <h2 style="font-size:16px;font-weight:600;margin:0 0 16px;color:#1c1917;">What happens next</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr style="margin-bottom:14px;">
              <td style="width:32px;vertical-align:top;padding-bottom:14px;">
                <div style="width:24px;height:24px;border-radius:50%;background:#1c1917;color:white;font-size:12px;font-weight:600;text-align:center;line-height:24px;">1</div>
              </td>
              <td style="padding-left:12px;padding-bottom:14px;">
                <p style="margin:0 0 2px;font-weight:600;font-size:14px;color:#1c1917;">Check your inbox</p>
                <p style="margin:0;font-size:13px;color:#78716c;">This email is your confirmation. Save it for your records.</p>
              </td>
            </tr>
            <tr style="margin-bottom:14px;">
              <td style="width:32px;vertical-align:top;padding-bottom:14px;">
                <div style="width:24px;height:24px;border-radius:50%;background:#1c1917;color:white;font-size:12px;font-weight:600;text-align:center;line-height:24px;">2</div>
              </td>
              <td style="padding-left:12px;padding-bottom:14px;">
                <p style="margin:0 0 2px;font-weight:600;font-size:14px;color:#1c1917;">Address &amp; access codes</p>
                <p style="margin:0;font-size:13px;color:#78716c;">Full address, door code, and directions sent 7 days before check-in.</p>
              </td>
            </tr>
            <tr>
              <td style="width:32px;vertical-align:top;">
                <div style="width:24px;height:24px;border-radius:50%;background:#1c1917;color:white;font-size:12px;font-weight:600;text-align:center;line-height:24px;">3</div>
              </td>
              <td style="padding-left:12px;">
                <p style="margin:0 0 2px;font-weight:600;font-size:14px;color:#1c1917;">Questions? Just reply</p>
                <p style="margin:0;font-size:13px;color:#78716c;">Reply to this email anytime &mdash; we're here to help.</p>
              </td>
            </tr>
          </table>
        </div>

        <p style="font-size:12px;color:#a8a29e;margin:0;text-align:center;">
          Bluff Haven Retreat &middot; Sevierville, TN<br/>
          Direct booking &mdash; no platform fees
        </p>
      </div>
    `,
  })
}
