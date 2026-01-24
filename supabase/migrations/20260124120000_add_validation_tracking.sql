alter table governance_requests 
add column if not exists validated_at timestamptz,
add column if not exists validated_by uuid references auth.users(id);
