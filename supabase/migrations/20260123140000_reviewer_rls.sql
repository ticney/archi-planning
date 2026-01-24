-- Grant SELECT on governance_requests to reviewers
create policy "Reviewers can view all governance requests"
  on governance_requests for select
  to authenticated
  using (
    exists (
      select 1 from profiles
      where user_id = auth.uid()
      and role = 'reviewer'
    )
  );
