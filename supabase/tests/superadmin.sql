-- Run as the project database administrator. All synthetic fixtures are rolled back.
begin;
select set_config('postcheck.test_admin',gen_random_uuid()::text,true);
select set_config('postcheck.test_member',gen_random_uuid()::text,true);
insert into auth.users(id,email,email_confirmed_at,raw_app_meta_data) values
(current_setting('postcheck.test_admin')::uuid,'test-'||current_setting('postcheck.test_admin')||'@example.invalid',now(),'{"postcheck_role":"superadmin"}'),
(current_setting('postcheck.test_member')::uuid,'test-'||current_setting('postcheck.test_member')||'@example.invalid',now(),'{"postcheck_role":"participant"}');
set local role authenticated;
do $$
declare data jsonb;
begin
 perform set_config('request.jwt.claim.sub',current_setting('postcheck.test_member'),true);
 begin perform public.postcheck_admin_snapshot(0); raise exception 'Participant read unexpectedly allowed'; exception when insufficient_privilege then null; end;
 begin perform public.postcheck_admin_set_role(current_setting('postcheck.test_member')::uuid,'owner','Unauthorized promotion'); raise exception 'Participant write unexpectedly allowed'; exception when insufficient_privilege then null; end;
 begin perform count(*) from postcheck_private.role_audit; raise exception 'Direct audit read unexpectedly allowed'; exception when insufficient_privilege then null; end;
 perform set_config('request.jwt.claim.sub',current_setting('postcheck.test_admin'),true);
 data := public.postcheck_admin_snapshot(0);
 if jsonb_typeof(data->'users') <> 'array' then raise exception 'Missing directory'; end if;
 perform public.postcheck_admin_set_role(current_setting('postcheck.test_member')::uuid,'qa','Synthetic test promotion');
 data := public.postcheck_admin_snapshot(0);
 if not exists(select 1 from jsonb_array_elements(data->'audit') a where a->>'target_id'=current_setting('postcheck.test_member') and a->>'new_role'='qa') then raise exception 'Missing role audit'; end if;
 begin perform public.postcheck_admin_set_role(current_setting('postcheck.test_admin')::uuid,'disabled','Self demotion attempt'); raise exception 'Self demotion unexpectedly allowed'; exception when insufficient_privilege then null; end;
 begin perform public.postcheck_admin_set_role(current_setting('postcheck.test_member')::uuid,'superadmin','Forbidden escalation'); raise exception 'Superadmin escalation unexpectedly allowed'; exception when invalid_parameter_value then null; end;
 begin perform public.postcheck_admin_set_role(current_setting('postcheck.test_member')::uuid,'qa','short'); raise exception 'Short reason unexpectedly allowed'; exception when invalid_parameter_value then null; end;
end $$;
reset role;
update auth.users set email_confirmed_at=null where id=current_setting('postcheck.test_admin')::uuid;
set local role authenticated;
do $$ begin
 begin perform public.postcheck_admin_snapshot(0); raise exception 'Unconfirmed admin unexpectedly allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
update auth.users set email_confirmed_at=now(),raw_app_meta_data='{"postcheck_role":"disabled"}' where id=current_setting('postcheck.test_admin')::uuid;
set local role authenticated;
do $$ begin
 begin perform public.postcheck_admin_snapshot(0); raise exception 'Revoked admin unexpectedly allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
do $$ begin
 begin perform public.postcheck_admin_snapshot(0); raise exception 'Anon read unexpectedly allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'PASS: anonymous/participant/direct-table denial, admin read/write, audit, self-demotion/escalation rejection, confirmation and revocation checks' as result;
rollback;
