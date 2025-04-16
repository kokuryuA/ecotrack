-- Drop existing view if it exists
DROP VIEW IF EXISTS user_profiles;

-- Drop and recreate prediction_cache table with proper constraints
DROP TABLE IF EXISTS prediction_cache;

CREATE TABLE prediction_cache (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key text NOT NULL,
    user_id uuid NOT NULL,
    prediction_data jsonb NOT NULL,
    input_data jsonb NOT NULL,
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz NOT NULL,
    UNIQUE(user_id, cache_key)
);

-- Create index for faster lookups
CREATE INDEX idx_prediction_cache_user_id ON prediction_cache(user_id);
CREATE INDEX idx_prediction_cache_expires_at ON prediction_cache(expires_at);

-- Enable RLS on prediction_cache
ALTER TABLE prediction_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for prediction_cache
CREATE POLICY "Users can view own cached predictions"
    ON prediction_cache
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own cached predictions"
    ON prediction_cache
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cached predictions"
    ON prediction_cache
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own cached predictions"
    ON prediction_cache
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Create a new secure view
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    au.id,
    au.email,
    au.created_at,
    au.last_sign_in_at,
    au.phone,
    au.role,
    COUNT(p.id) as predictions_count
FROM auth.users au
LEFT JOIN predictions p ON au.id = p.user_id
GROUP BY au.id, au.email, au.created_at, au.last_sign_in_at, au.phone, au.role;

-- Grant access to authenticated users
GRANT SELECT ON user_profiles TO authenticated;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own predictions" ON predictions;
DROP POLICY IF EXISTS "Users can create their own predictions" ON predictions;
DROP POLICY IF EXISTS "Users can view their own cached predictions" ON prediction_cache;
DROP POLICY IF EXISTS "Users can create their own cached predictions" ON prediction_cache;
DROP POLICY IF EXISTS "Users can update their own cached predictions" ON prediction_cache;
DROP POLICY IF EXISTS "Users can delete their own cached predictions" ON prediction_cache;

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data"
    ON users
    FOR SELECT
    TO authenticated
    USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update their own data"
    ON users
    FOR UPDATE
    TO authenticated
    USING (auth_user_id = auth.uid());

CREATE POLICY "Admin can view all data"
    ON users
    FOR ALL
    TO authenticated
    USING (auth.email() = 'lionelabdelnour5@gmail.com');

-- Enable RLS on predictions table
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Create policies for predictions table
CREATE POLICY "Users can view their own predictions"
    ON predictions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own predictions"
    ON predictions
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can manage all predictions"
    ON predictions
    FOR ALL
    TO authenticated
    USING (auth.email() = 'lionelabdelnour5@gmail.com');

-- Grant necessary permissions
GRANT ALL ON prediction_cache TO authenticated;
GRANT ALL ON predictions TO authenticated;
GRANT ALL ON users TO authenticated;

-- Create admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.email() = 'lionelabdelnour5@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 