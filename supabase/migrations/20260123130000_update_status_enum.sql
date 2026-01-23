ALTER TYPE governance_request_status ADD VALUE IF NOT EXISTS 'pending_review';
-- Optionally migrate old data if any (unlikely in dev but good practice)
-- UPDATE governance_requests SET status = 'pending_review' WHERE status = 'pending';
