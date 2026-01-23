-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  service TEXT NOT NULL CHECK (service IN ('Arcade & VR', 'The Ball Pit', 'Fun Rides')),
  duration TEXT NOT NULL CHECK (duration IN ('30min', '1hr', '2hr')),
  date DATE NOT NULL,
  time TIME NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled')),
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_payment_reference ON bookings(payment_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to do everything (for server-side operations)
CREATE POLICY "Service role can manage all bookings"
  ON bookings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: Create policy for users to read their own bookings (if you add auth later)
-- CREATE POLICY "Users can view their own bookings"
--   ON bookings
--   FOR SELECT
--   USING (auth.uid()::text = customer_email);
