# PawsitiveSpace — Setup Guide

## 1. Supabase (Free Tier)

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name it `pawsitive-space`, pick a strong DB password, choose nearest region
3. Wait ~2 minutes for provisioning
4. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ keep secret, server-side only)
5. Go to **SQL Editor**, paste the contents of `supabase/migrations/001_initial_schema.sql`, and click **Run**
6. Verify tables appear under **Table Editor**

---

## 2. Twilio WhatsApp Sandbox (Free)

The sandbox lets you test WhatsApp messaging without Meta Business approval.

1. Sign up at [twilio.com](https://www.twilio.com/try-twilio) (free trial gives $15 credit)
2. Go to **Messaging → Try it out → Send a WhatsApp message**
3. Follow the instructions: send the join code (e.g. `join quiet-fox`) from your phone to the Twilio sandbox number
4. Copy from your Twilio Console:
   - **Account SID** → `TWILIO_ACCOUNT_SID`
   - **Auth Token** → `TWILIO_AUTH_TOKEN`
   - Sandbox number is usually `whatsapp:+14155238886` → `TWILIO_WHATSAPP_FROM`
5. Under **Sandbox Settings**, set the webhook URL:
   - **When a message comes in**: `https://<your-domain>/api/whatsapp` (POST)
   - During development, use ngrok (see below)

---

## 3. Claude API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key → `ANTHROPIC_API_KEY`
3. Free tier gives limited usage; pay-as-you-go is ~$3/M input tokens (very cheap for this use case)

---

## 4. Local Development with ngrok (Free)

Twilio needs a public URL to send webhooks. ngrok tunnels your localhost.

```bash
# Install ngrok (one-time)
npm install -g ngrok
# or download from https://ngrok.com/download (free account required)

# Start your Next.js dev server
npm run dev

# In another terminal, expose port 3000
ngrok http 3000
```

Copy the `https://xxxx.ngrok-free.app` URL and paste it into Twilio Sandbox Settings:
```
https://xxxx.ngrok-free.app/api/whatsapp
```

> ⚠️ The free ngrok URL changes every time you restart. Update Twilio each time, or sign up for a free static domain.

---

## 5. Running Locally

```bash
# Install dependencies
npm install

# Copy env file and fill in your keys
cp .env.local.example .env.local

# Run dev server
npm run dev
```

Open http://localhost:3000 — then send a WhatsApp message to your Twilio sandbox number to test.

---

## 6. Deploy to Vercel (Free Tier)

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Import Project** → select your repo
3. Framework: **Next.js** (auto-detected)
4. Go to **Settings → Environment Variables** and add all values from `.env.local`
5. Deploy — Vercel gives you a `https://your-app.vercel.app` URL
6. Update Twilio Sandbox webhook to: `https://your-app.vercel.app/api/whatsapp`

### Free tier limits (more than enough for MVP):
- 100 GB bandwidth/month
- Serverless function invocations: 100k/month
- Builds: 6000 min/month

---

## Quick Test Checklist

- [ ] Supabase tables created (check Table Editor)
- [ ] `.env.local` filled with all keys
- [ ] `npm run dev` starts without errors
- [ ] ngrok tunnel running and URL set in Twilio
- [ ] Send "I found an injured dog near Jubilee Hills" via WhatsApp
- [ ] Receive confirmation with case ID
- [ ] Check `animals` and `rescue_cases` tables in Supabase — new rows appear
- [ ] Send "status" → get case status back
- [ ] Send "I want to adopt a cat" → get adoption enquiry confirmation
