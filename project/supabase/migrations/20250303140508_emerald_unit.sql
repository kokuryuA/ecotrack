/*
  # Create predictions table

  1. New Tables
    - `predictions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `appliances` (jsonb, stores appliance counts)
      - `start_date` (date)
      - `end_date` (date)
      - `consumption` (float, predicted energy consumption)
      - `days` (integer, number of days in prediction period)
      - `total_appliances` (integer, total number of appliances)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `predictions` table
    - Add policy for authenticated users to read their own predictions
    - Add policy for authenticated users to insert their own predictions
*/

CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  appliances jsonb NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  consumption float NOT NULL,
  days integer NOT NULL,
  total_appliances integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own predictions"
  ON predictions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions"
  ON predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);