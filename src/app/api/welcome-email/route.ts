import { NextRequest, NextResponse } from 'next/server';

function influencerEmailHtml(name: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Welcome to RYI</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" style="max-width:560px;background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">

      <!-- Header -->
      <tr>
        <td style="background:#000;padding:28px 32px;border-bottom:1px solid #27272a;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#fff;border-radius:8px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                <span style="font-size:14px;font-weight:900;color:#000;line-height:36px;">RYI</span>
              </td>
              <td style="padding-left:10px;">
                <span style="color:#fff;font-size:15px;font-weight:600;">ReachYourInfluencer</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:36px 32px;">
          <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#fff;">Welcome, ${name}! 🎉</p>
          <p style="margin:0 0 24px;font-size:15px;color:#a1a1aa;line-height:1.6;">
            You're now part of India's first fair-pay micro-influencer marketplace. No agencies, no middlemen — just real brand deals.
          </p>

          <!-- Steps -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            ${[
              ['1', 'Complete your profile', 'Add your niche, follower count, and price per post so brands can find you.'],
              ['2', 'Browse open campaigns', 'Hundreds of brand campaigns are live right now. Apply to the ones that fit your niche.'],
              ['3', 'Get paid in 72 hours', 'Once a brand approves your work, payment hits your account within 72 hours — guaranteed.'],
            ].map(([num, title, desc]) => `
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid #27272a;">
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="width:32px;vertical-align:top;padding-top:2px;">
                      <div style="width:24px;height:24px;background:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#000;">${num}</div>
                    </td>
                    <td style="padding-left:12px;">
                      <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#fff;">${title}</p>
                      <p style="margin:0;font-size:13px;color:#71717a;line-height:1.5;">${desc}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`).join('')}
          </table>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center">
                <a href="https://ryi-platform.vercel.app/influencer/campaigns"
                   style="display:inline-block;background:#fff;color:#000;font-size:14px;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;">
                  Browse Open Campaigns →
                </a>
              </td>
            </tr>
          </table>

          <p style="margin:28px 0 0;font-size:13px;color:#52525b;text-align:center;line-height:1.6;">
            Questions? Reply to this email — we respond within 24 hours.<br/>
            Made with ❤️ in Bangalore, India
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:20px 32px;border-top:1px solid #27272a;background:#000;">
          <p style="margin:0;font-size:12px;color:#3f3f46;text-align:center;">
            © ${new Date().getFullYear()} RYI (ReachYourInfluencer) · <a href="https://ryi-platform.vercel.app" style="color:#52525b;text-decoration:none;">ryi-platform.vercel.app</a>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function brandEmailHtml(name: string, companyName: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Welcome to RYI</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" style="max-width:560px;background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">

      <!-- Header -->
      <tr>
        <td style="background:#000;padding:28px 32px;border-bottom:1px solid #27272a;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#fff;border-radius:8px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                <span style="font-size:14px;font-weight:900;color:#000;line-height:36px;">RYI</span>
              </td>
              <td style="padding-left:10px;">
                <span style="color:#fff;font-size:15px;font-weight:600;">ReachYourInfluencer</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:36px 32px;">
          <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#fff;">Welcome, ${companyName || name}! 🚀</p>
          <p style="margin:0 0 24px;font-size:15px;color:#a1a1aa;line-height:1.6;">
            Your brand account is ready. You can now post campaigns and connect with 10,000+ verified micro-influencers across India — no agency fees, no middlemen.
          </p>

          <!-- Steps -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            ${[
              ['1', 'Post your first campaign', 'Takes 2 minutes. Describe what you need and set your budget — applications arrive within 24 hours.'],
              ['2', 'Review creator applications', 'Browse profiles, check follower counts, and accept the creators that fit your brand.'],
              ['3', 'Pay only on completion', 'Escrow payment — you only release funds when you\'re happy with the content.'],
            ].map(([num, title, desc]) => `
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid #27272a;">
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="width:32px;vertical-align:top;padding-top:2px;">
                      <div style="width:24px;height:24px;background:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#000;">${num}</div>
                    </td>
                    <td style="padding-left:12px;">
                      <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#fff;">${title}</p>
                      <p style="margin:0;font-size:13px;color:#71717a;line-height:1.5;">${desc}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`).join('')}
          </table>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center">
                <a href="https://ryi-platform.vercel.app/brand/campaigns/new"
                   style="display:inline-block;background:#fff;color:#000;font-size:14px;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;">
                  Post Your First Campaign →
                </a>
              </td>
            </tr>
          </table>

          <p style="margin:28px 0 0;font-size:13px;color:#52525b;text-align:center;line-height:1.6;">
            Questions? Reply to this email — we respond within 24 hours.<br/>
            Made with ❤️ in Bangalore, India
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:20px 32px;border-top:1px solid #27272a;background:#000;">
          <p style="margin:0;font-size:12px;color:#3f3f46;text-align:center;">
            © ${new Date().getFullYear()} RYI (ReachYourInfluencer) · <a href="https://ryi-platform.vercel.app" style="color:#52525b;text-decoration:none;">ryi-platform.vercel.app</a>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    // Silently skip if not configured — don't break signup
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const { email, name, userType, companyName } = await req.json();

    const isInfluencer = userType === 'influencer';
    const subject = isInfluencer
      ? `Welcome to RYI, ${name}! Your creator profile is ready 🎉`
      : `Welcome to RYI, ${companyName || name}! Post your first campaign →`;
    const html = isInfluencer
      ? influencerEmailHtml(name)
      : brandEmailHtml(name, companyName || '');

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RYI <hello@ryi.in>',
        to: [email],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return NextResponse.json({ ok: false, error: err }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Welcome email error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
