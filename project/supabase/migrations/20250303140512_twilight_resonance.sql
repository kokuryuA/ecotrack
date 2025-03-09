/*
  # Create forecasts table

  1. New Tables
    - `forecasts`
      - `id` (uuid, primary key)
      - `prediction_id` (uuid, foreign key to predictions)
      - `user_id` (uuid, foreign key to users)
      - `consumption` (float, forecasted energy consumption)
      - `trend` (text, trend direction: increase, decrease, or stable)
      - `percentage_change` (float, percentage change from prediction)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `forecasts` table
    - Add policy for authenticated users to read their own forecasts
    - Add policy for authenticated users to insert their own forecasts
*/

CREATE TABLE IF NOT EXISTS forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id uuid REFERENCES predictions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  consumption float NOT NULL,
  trend text NOT NULL,
  percentage_change float NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own forecasts"
  ON forecasts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own forecasts"
  ON forecasts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);