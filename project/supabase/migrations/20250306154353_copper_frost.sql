/*
  # Initial Schema Setup for Energy Consumption Predictor

  1. New Tables
    - `predictions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `appliances` (jsonb)
      - `start_date` (date)
      - `end_date` (date)
      - `consumption` (double precision)
      - `days` (integer)
      - `total_appliances` (integer)
      - `time_series_predictions` (jsonb)
      - `created_at` (timestamptz)

    - `forecasts`
      - `id` (uuid, primary key)
      - `prediction_id` (uuid, references predictions)
      - `user_id` (uuid, references auth.users)
      - `consumption` (double precision)
      - `trend` (text)
      - `percentage_change` (double precision)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read their own data
      - Create new predictions and forecasts
*/

DO $$ BEGIN
  -- Create predictions table if it doesn't exist
  CREATE TABLE IF NOT EXISTS predictions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    appliances jsonb NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    consumption double precision NOT NULL,
    days integer NOT NULL,
    total_appliances integer NOT NULL,
    time_series_predictions jsonb,
    created_at timestamptz DEFAULT now()
  );

  -- Create forecasts table if it doesn't exist
  CREATE TABLE IF NOT EXISTS forecasts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id uuid REFERENCES predictions(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    consumption double precision NOT NULL,
    trend text NOT NULL,
    percentage_change double precision NOT NULL,
    created_at timestamptz DEFAULT now()
  );

  -- Enable Row Level Security
  ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can read own predictions" ON predictions;
  DROP POLICY IF EXISTS "Users can create predictions" ON predictions;
  DROP POLICY IF EXISTS "Users can read own forecasts" ON forecasts;
  DROP POLICY IF EXISTS "Users can create forecasts" ON forecasts;

  -- Create new policies
  CREATE POLICY "Users can read own predictions"
    ON predictions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can create predictions"
    ON predictions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can read own forecasts"
    ON forecasts
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can create forecasts"
    ON forecasts
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  -- Create indexes if they don't exist
  CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
  CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_forecasts_user_id ON forecasts(user_id);
  CREATE INDEX IF NOT EXISTS idx_forecasts_prediction_id ON forecasts(prediction_id);
END $$;