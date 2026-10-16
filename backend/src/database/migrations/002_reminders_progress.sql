CREATE TABLE reminders (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title varchar(120) NOT NULL,
  time time NOT NULL,
  weekdays smallint[] NOT NULL,
  timezone varchar(100) NOT NULL DEFAULT 'America/Sao_Paulo',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CHECK (char_length(trim(title)) BETWEEN 1 AND 120),
  CHECK (cardinality(weekdays) >= 1),
  CHECK (weekdays <@ ARRAY[0,1,2,3,4,5,6]::smallint[])
);

CREATE INDEX reminders_user_id_idx
  ON reminders(user_id);

CREATE TABLE progress_goals (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  steps integer CHECK (steps > 0),
  water_ml integer CHECK (water_ml > 0),
  duration_minutes integer CHECK (duration_minutes > 0),
  calories integer CHECK (calories > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
