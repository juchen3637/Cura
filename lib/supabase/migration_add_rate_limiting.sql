-- Create rate limiting table
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_type TEXT NOT NULL CHECK (api_type IN ('ai_analyze', 'ai_build', 'pdf_import')),
  call_count INTEGER NOT NULL DEFAULT 0,
  month_year TEXT NOT NULL, -- Format: YYYY-MM
  last_call_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, api_type, month_year)
);

-- Create indexes
CREATE INDEX idx_rate_limits_user_id ON rate_limits(user_id);
CREATE INDEX idx_rate_limits_month_year ON rate_limits(month_year);
CREATE INDEX idx_rate_limits_user_month ON rate_limits(user_id, month_year);

-- Enable Row Level Security
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Rate limits policies
CREATE POLICY "Users can view own rate limits" ON rate_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rate limits" ON rate_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rate limits" ON rate_limits
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to check and increment rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_api_type TEXT,
  p_max_calls INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_month_year TEXT;
  v_current_count INTEGER;
  v_user_role TEXT;
BEGIN
  -- Get current month-year
  v_month_year := TO_CHAR(NOW(), 'YYYY-MM');

  -- Get user role
  SELECT role INTO v_user_role FROM profiles WHERE id = p_user_id;

  -- Admins have unlimited calls (but with safety limit of 1000/month)
  IF v_user_role = 'admin' THEN
    p_max_calls := 1000;
  END IF;

  -- Get or create rate limit record
  INSERT INTO rate_limits (user_id, api_type, month_year, call_count, last_call_at)
  VALUES (p_user_id, p_api_type, v_month_year, 0, NOW())
  ON CONFLICT (user_id, api_type, month_year)
  DO NOTHING;

  -- Get current count
  SELECT call_count INTO v_current_count
  FROM rate_limits
  WHERE user_id = p_user_id
    AND api_type = p_api_type
    AND month_year = v_month_year;

  -- Check if limit exceeded
  IF v_current_count >= p_max_calls THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'current_count', v_current_count,
      'limit', p_max_calls,
      'remaining', 0,
      'reset_date', (DATE_TRUNC('month', NOW()) + INTERVAL '1 month')::TEXT
    );
  END IF;

  -- Increment count
  UPDATE rate_limits
  SET call_count = call_count + 1,
      last_call_at = NOW(),
      updated_at = NOW()
  WHERE user_id = p_user_id
    AND api_type = p_api_type
    AND month_year = v_month_year;

  -- Return success
  RETURN jsonb_build_object(
    'allowed', true,
    'current_count', v_current_count + 1,
    'limit', p_max_calls,
    'remaining', p_max_calls - v_current_count - 1,
    'reset_date', (DATE_TRUNC('month', NOW()) + INTERVAL '1 month')::TEXT
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current usage
CREATE OR REPLACE FUNCTION get_rate_limit_usage(
  p_user_id UUID,
  p_api_type TEXT
) RETURNS JSONB AS $$
DECLARE
  v_month_year TEXT;
  v_current_count INTEGER;
  v_user_role TEXT;
  v_max_calls INTEGER;
BEGIN
  v_month_year := TO_CHAR(NOW(), 'YYYY-MM');

  -- Get user role
  SELECT role INTO v_user_role FROM profiles WHERE id = p_user_id;

  -- Set limits based on role and API type
  IF v_user_role = 'admin' THEN
    v_max_calls := 1000; -- Safety limit
  ELSIF p_api_type IN ('ai_analyze', 'ai_build') THEN
    v_max_calls := 30; -- 30 AI calls per month for users
  ELSE
    v_max_calls := 100; -- 100 PDF imports per month (abuse prevention)
  END IF;

  -- Get current count
  SELECT COALESCE(call_count, 0) INTO v_current_count
  FROM rate_limits
  WHERE user_id = p_user_id
    AND api_type = p_api_type
    AND month_year = v_month_year;

  RETURN jsonb_build_object(
    'current_count', COALESCE(v_current_count, 0),
    'limit', v_max_calls,
    'remaining', v_max_calls - COALESCE(v_current_count, 0),
    'reset_date', (DATE_TRUNC('month', NOW()) + INTERVAL '1 month')::TEXT,
    'role', v_user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
