/*
  # Add phone number to users table

  1. Changes
    - Add phone_number column to users table
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE users ADD COLUMN phone_number text;
  END IF;
END $$;