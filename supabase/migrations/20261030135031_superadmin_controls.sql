-- Privileged Auth administration lives in an unexposed schema. Public RPCs are invoker wrappers.
create schema if not exists postcheck_private;
revoke all on schema postcheck_private from public, anon, authenticated;
grant usage on schema postcheck_private to authenticated;
create table postcheck_private.role_audit (
 id bigint generated always as identity primary key,
 actor_id uuid not null,
 target_id uuid not null,
 old_role text not null,
 new_role text not null,
 reason text not null check (char_length(reason) between 8 and 500),
 created_at timestamptz not null default now()
);
alter table postcheck_private.role_audit enable row level security;
revoke all on postcheck_private.role_audit from public, anon, authenticated;

create function postcheck_private.admin_snapshot(page_number integer default 0)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb;
begin
 if auth.uid() is null or not exists (
  select 1 from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null
  and u.raw_app_meta_data->>'postcheck_role'='superadmin'
 ) then raise exception 'Access denied' using errcode='42501'; end if;
 select jsonb_build_object(
  'total', (select count(*) from auth.users),
  'confirmed', (select count(*) from auth.users where email_confirmed_at is not null),
  'disabled', (select count(*) from auth.users where raw_app_meta_data->>'postcheck_role'='disabled'),
  'users', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select id,email,created_at,email_confirmed_at,coalesce(raw_app_meta_data->>'postcheck_role','participant') as role
    from auth.users order by created_at desc,id limit 25 offset greatest(0,least(coalesce(page_number,0),100000))*25
  ) x),'[]'::jsonb),
  'audit', coalesce((select jsonb_agg(to_jsonb(x)) from (
    select id,actor_id,target_id,old_role,new_role,reason,created_at
    from postcheck_private.role_audit order by id desc limit 20
  ) x),'[]'::jsonb)
 ) into result;
 return result;
end $$;

create function postcheck_private.admin_set_role(target_user uuid, desired_role text, change_reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare previous_role text;
begin
 -- Lock the actor while authorizing, so a concurrent role revocation cannot race this mutation.
 perform 1 from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null
  and u.raw_app_meta_data->>'postcheck_role'='superadmin' for share;
 if not found then raise exception 'Access denied' using errcode='42501'; end if;
 if desired_role is null or desired_role not in ('owner','build_lead','qa','demo_editor','participant','disabled') then
  raise exception 'Unsupported role' using errcode='22023';
 end if;
 if change_reason is null or char_length(btrim(change_reason)) not between 8 and 500 then
  raise exception 'An 8–500 character reason is required' using errcode='22023';
 end if;
 if target_user=auth.uid() then raise exception 'Self role changes are not allowed' using errcode='42501'; end if;
 select coalesce(raw_app_meta_data->>'postcheck_role','participant') into previous_role
 from auth.users where id=target_user for update;
 if not found then raise exception 'User not found' using errcode='22023'; end if;
 if previous_role='superadmin' then raise exception 'Superadmin changes require organization-owner provisioning' using errcode='42501'; end if;
 if previous_role=desired_role then return; end if;
 update auth.users set raw_app_meta_data=coalesce(raw_app_meta_data,'{}'::jsonb) || jsonb_build_object('postcheck_role',desired_role),updated_at=now() where id=target_user;
 insert into postcheck_private.role_audit(actor_id,target_id,old_role,new_role,reason)
 values(auth.uid(),target_user,previous_role,desired_role,btrim(change_reason));
end $$;

revoke all on function postcheck_private.admin_snapshot(integer) from public,anon,authenticated;
revoke all on function postcheck_private.admin_set_role(uuid,text,text) from public,anon,authenticated;
grant execute on function postcheck_private.admin_snapshot(integer) to authenticated;
grant execute on function postcheck_private.admin_set_role(uuid,text,text) to authenticated;
create function public.postcheck_admin_snapshot(page_number integer default 0)
returns jsonb language sql security invoker set search_path = '' as $$ select postcheck_private.admin_snapshot(page_number); $$;
create function public.postcheck_admin_set_role(target_user uuid, desired_role text, change_reason text)
returns void language sql security invoker set search_path = '' as $$ select postcheck_private.admin_set_role(target_user,desired_role,change_reason); $$;
revoke all on function public.postcheck_admin_snapshot(integer) from public,anon,authenticated;
revoke all on function public.postcheck_admin_set_role(uuid,text,text) from public,anon,authenticated;
grant execute on function public.postcheck_admin_snapshot(integer) to authenticated;
grant execute on function public.postcheck_admin_set_role(uuid,text,text) to authenticated;
