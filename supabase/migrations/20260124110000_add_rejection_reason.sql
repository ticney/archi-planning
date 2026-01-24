alter table governance_requests add column if not exists rejection_reason text;

create policy "Reviewers can update governance requests"
  on governance_requests for update
  to authenticated
  using (
    exists (
      select 1 from profiles
      where user_id = auth.uid()
      and role = 'reviewer'
    )
  );
