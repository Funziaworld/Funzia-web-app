# Database Migrations

This directory contains SQL migration files for setting up the database schema.

## Setup Instructions

### Option 1: Using Supabase (Recommended)

1. **Create a Supabase account**
   - Go to https://supabase.com
   - Sign up for a free account
   - Create a new project

2. **Get your credentials**
   - In your Supabase project dashboard, go to Settings > API
   - Copy your Project URL and Service Role Key
   - Add them to your `.env.local` file:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
     ```

3. **Run the migration**
   - In your Supabase dashboard, go to SQL Editor
   - Copy the contents of `001_create_bookings_table.sql`
   - Paste and run it in the SQL Editor
   - Or use the Supabase CLI:
     ```bash
     supabase db push
     ```

4. **Verify the table was created**
   - Go to Table Editor in your Supabase dashboard
   - You should see the `bookings` table with all columns

### Option 2: Using JSON File Storage (Fallback)

If you don't set up Supabase, the application will automatically fall back to JSON file storage in the `/data` directory. This is fine for development and testing, but not recommended for production.

## Migration Files

- `001_create_bookings_table.sql` - Creates the bookings table with all necessary columns, indexes, and security policies

## Future Migrations

When you need to add new tables or modify existing ones:

1. Create a new migration file: `002_description.sql`
2. Run it in your Supabase SQL Editor
3. Update the database utility functions if needed

## Troubleshooting

- **"Supabase credentials not found"** - The app will use JSON file storage. This is fine for development.
- **"Table does not exist"** - Make sure you've run the migration SQL in your Supabase dashboard.
- **Permission errors** - Ensure you're using the Service Role Key (not the anon key) for server-side operations.
