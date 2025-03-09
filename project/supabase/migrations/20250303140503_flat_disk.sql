/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text, nullable for Auth0 users)
      - `auth_provider` (text, 'local' or 'auth0')
      - `auth0_id` (text, nullable, for Auth0 users)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `users` table
    - Add policy for authenticated users to read their own data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text,
  auth_provider text NOT NULL DEFAULT 'local',
  auth0_id text UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);