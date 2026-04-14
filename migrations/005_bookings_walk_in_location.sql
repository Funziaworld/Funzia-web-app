-- Walk-in package bookings: location + extended service enum
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS location TEXT;

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_location_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_location_check
  CHECK (location IS NULL OR location IN ('ikeja', 'lekki'));

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_service_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_service_check
  CHECK (service IN (
    'Arcade',
    'VR',
    'The Ball Pit',
    'Fun Rides',
    'Walk-in Package'
  ));
