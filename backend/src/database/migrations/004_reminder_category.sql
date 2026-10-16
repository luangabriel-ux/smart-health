ALTER TABLE reminders
  ADD COLUMN category text NOT NULL DEFAULT 'habit'
  CHECK (category IN ('exercise', 'medication', 'water', 'meal', 'habit'));
