CREATE TABLE contents (
  id uuid PRIMARY KEY,
  title varchar(200) NOT NULL,
  category varchar(100) NOT NULL,
  type text NOT NULL CHECK (type IN ('article', 'video')),
  text_content text,
  url text,
  difficulty varchar(100),
  is_premium boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),

  CHECK (char_length(trim(title)) BETWEEN 1 AND 200),
  CHECK (char_length(trim(category)) BETWEEN 1 AND 100),

  CHECK (
    (type = 'article' AND text_content IS NOT NULL AND url IS NULL)
    OR
    (type = 'video' AND url IS NOT NULL AND text_content IS NULL)
  ),

  CHECK (
    url IS NULL
    OR url ~ '^https://'
  )
);

CREATE INDEX contents_category_idx
  ON contents(category);

CREATE INDEX contents_type_idx
  ON contents(type);

CREATE INDEX contents_premium_idx
  ON contents(is_premium);
