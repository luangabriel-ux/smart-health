CREATE TABLE users (
  id uuid PRIMARY KEY,
  name varchar(120) NOT NULL,
  email varchar(254) NOT NULL UNIQUE CHECK (email = lower(email)),
  password_hash text NOT NULL,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  age integer CHECK (age BETWEEN 1 AND 120),
  weight_kg numeric(6,2) CHECK (weight_kg > 0 AND weight_kg <= 500),
  height_cm numeric(5,2) CHECK (height_cm > 0 AND height_cm <= 300),
  health_goals varchar(1000),
  medical_conditions varchar(2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE sessions (
  token_hash char(64) PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE TABLE activities (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('exercise', 'water', 'meal', 'habit')),
  description varchar(500) NOT NULL,
  occurred_at timestamptz NOT NULL,
  duration_minutes integer CHECK (duration_minutes BETWEEN 1 AND 1440),
  water_ml integer CHECK (water_ml BETWEEN 1 AND 20000),
  steps integer CHECK (steps BETWEEN 0 AND 200000),
  calories integer CHECK (calories BETWEEN 0 AND 30000),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((type = 'water' AND water_ml IS NOT NULL) OR (type <> 'water' AND water_ml IS NULL)),
  CHECK (type = 'exercise' OR (duration_minutes IS NULL AND steps IS NULL AND calories IS NULL))
);
CREATE INDEX activities_user_date_idx ON activities(user_id, occurred_at DESC, id);
