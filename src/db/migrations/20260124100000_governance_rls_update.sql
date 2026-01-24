-- Allow Reviewers to update governance requests
-- Specifically needed for the status column when validating

create policy "Reviewer can update status"
on "public"."governance_requests"
as permissive
for update
to authenticated
using (
  (auth.uid() in ( select profiles.user_id from profiles where (profiles.role = 'reviewer'::user_role) ))
)
with check (
  (status =Any (ARRAY['validated'::governance_request_status, 'rejected'::governance_request_status]))
);
