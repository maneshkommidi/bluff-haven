# Bluff Haven Retreat — Website

A direct booking website for Bluff Haven Retreat, integrated with OwnerRez PMS.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.example` to `.env.local` and fill in your credentials:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
OWNERREZ_USERNAME=bluffhavenretreat@gmail.com
OWNERREZ_TOKEN=your_full_token_here
OWNERREZ_PROPERTY_ID=458447

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

RESEND_API_KEY=re_...
EMAIL_FROM=bookings@bluffhavenretreat.com

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── book/page.tsx               # Booking page (calendar + form)
│   ├── booking/[id]/page.tsx       # Confirmation page
│   └── api/
│       ├── availability/route.ts   # GET availability from OwnerRez
│       ├── quote/route.ts          # GET price quote from OwnerRez
│       ├── booking/route.ts        # POST create Stripe payment intent
│       └── webhooks/
│           ├── stripe/route.ts     # Stripe → create OwnerRez booking
│           └── ownerrez/route.ts   # OwnerRez → sync updates
├── lib/
│   ├── ownerrez.ts                 # OwnerRez API v2 client
│   └── email.ts                    # Resend email templates
└── components/                     # Shared UI components
```

## OwnerRez Integration

Authentication uses HTTP Basic with your email and personal access token.
All availability and pricing flows through OwnerRez API v2 — never hardcoded.

## Deployment

Push to GitHub, then connect to Vercel:
1. `vercel --prod` or connect via vercel.com dashboard
2. Add all environment variables in Vercel project settings
3. Set up Stripe webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Set up OwnerRez webhook endpoint: `https://yourdomain.com/api/webhooks/ownerrez`
