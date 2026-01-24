-- Fix RLS policies defined in 20260123100000_add_request_attachments.sql
-- The previous policies incorrectly compared profiles.id to auth.uid() instead of profiles.user_id

-- 1. Fix request_attachments policy
drop policy "Reviewers can view all attachments" on request_attachments;

create policy "Reviewers can view all attachments"
  on request_attachments for select
  to authenticated
  using (
    exists (
      select 1 from profiles
      where user_id = auth.uid()
      and role = 'reviewer'
    )
  );

-- 2. Fix Storage policies
drop policy "Reviewers can view all proofs" on storage.objects;

create policy "Reviewers can view all proofs"
on storage.objects for select
to authenticated
using (
  bucket_id = 'governance-proofs'
  and exists (
    select 1 from profiles
    where user_id = auth.uid()
    and role = 'reviewer'
  )
);
