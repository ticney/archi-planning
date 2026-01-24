ALTER TYPE governance_request_status ADD VALUE IF NOT EXISTS 'tentative';

ALTER TABLE governance_requests ADD COLUMN IF NOT EXISTS booking_start_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_governance_requests_booking_start_at ON governance_requests(booking_start_at);
