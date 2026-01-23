ALTER TABLE governance_requests
ADD COLUMN IF NOT EXISTS topic text,
ADD COLUMN IF NOT EXISTS estimated_duration integer;

ALTER TABLE governance_requests
ADD CONSTRAINT governance_requests_topic_check CHECK (topic IN ('standard', 'strategic'));
