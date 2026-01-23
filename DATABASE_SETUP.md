# Database Setup Guide

This guide will help you set up Supabase (PostgreSQL) for your booking system.

## Quick Start

### 1. Create Supabase Account & Project

1. Go to https://supabase.com
2. Sign up for a free account
3. Click "New Project"
4. Fill in:
   - **Name**: funzia-world (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait 2-3 minutes for setup to complete

### 2. Get Your Credentials

1. In your Supabase project dashboard, click **Settings** (gear icon)
2. Go to **API** section
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **service_role key** (under "Project API keys" → "service_role" - this is the secret one!)

### 3. Configure Environment Variables

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

   ⚠️ **Important**: Never commit `.env.local` to git! It's already in `.gitignore`.

### 4. Run the Migration

#### Option A: Using Supabase Dashboard (Easiest)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Run this command to see the migration SQL:
   ```bash
   npm run migration:show
   ```
4. Copy the SQL output
5. Paste it into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned"

#### Option B: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:
```bash
supabase init
supabase link --project-ref your-project-ref
supabase db push
```

### 5. Verify Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see the `bookings` table
3. Click on it to see all columns:
   - id
   - service
   - duration
   - date
   - time
   - customer_name
   - customer_email
   - customer_phone
   - amount
   - payment_status
   - payment_reference
   - created_at

### 6. Test the Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. The app will automatically use Supabase if credentials are configured
3. If Supabase credentials are missing, it will fall back to JSON file storage (for development only)

## Migration Details

The migration creates:

- ✅ **bookings table** with all required columns
- ✅ **Indexes** for fast queries on:
  - Payment references
  - Customer emails
  - Dates
  - Payment status
  - Created timestamps
- ✅ **Row Level Security (RLS)** enabled
- ✅ **Security policies** for service role access

## Troubleshooting

### "Supabase credentials not found" warning

This means your `.env.local` file is missing Supabase credentials. The app will use JSON file storage as fallback. To fix:

1. Make sure `.env.local` exists
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. Restart your dev server

### "Table does not exist" error

The migration hasn't been run yet. Follow step 4 above to run the migration.

### Connection errors

1. Check your Supabase project is active (not paused)
2. Verify your credentials are correct
3. Check your internet connection
4. Make sure you're using the **service_role** key (not the anon key)

### Permission errors

Ensure you're using the **Service Role Key** for server-side operations. The anon key won't work for server-side database operations.

## Fallback Mode (JSON Storage)

If Supabase credentials are not configured, the app automatically uses JSON file storage in the `/data` directory. This is:

- ✅ Fine for development and testing
- ❌ Not recommended for production
- ⚠️ Data is stored locally and not backed up

## Next Steps

Once your database is set up:

1. ✅ Test creating a booking
2. ✅ Test payment flow
3. ✅ Verify bookings are stored in Supabase
4. ✅ Set up Paystack webhook URL: `https://yourdomain.com/api/bookings/webhook`

## Future Migrations

When you need to add new tables or modify existing ones:

1. Create a new SQL file: `migrations/002_description.sql`
2. Run it in Supabase SQL Editor
3. Update database utility functions if needed

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
