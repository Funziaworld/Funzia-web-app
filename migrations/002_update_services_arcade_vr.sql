-- Update service constraint to support Arcade and VR as separate services
-- First migrate existing 'Arcade & VR' bookings to 'Arcade'
UPDATE bookings SET service = 'Arcade' WHERE service = 'Arcade & VR';

-- Drop the old check constraint and add new one
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_service_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_service_check 
  CHECK (service IN ('Arcade', 'VR', 'The Ball Pit', 'Fun Rides'));
