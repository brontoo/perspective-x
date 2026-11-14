DO $test$
BEGIN
 IF (SELECT avatar_preset_id FROM public.profiles WHERE full_name='Synthetic Learner A') IS DISTINCT FROM 'portrait-7' THEN RAISE EXCEPTION 'Existing learner A was not backfilled'; END IF;
 IF (SELECT avatar_preset_id FROM public.profiles WHERE full_name='Synthetic Learner B') IS DISTINCT FROM 'portrait-10' THEN RAISE EXCEPTION 'Existing learner B was not backfilled'; END IF;
 IF (SELECT avatar_preset_id FROM public.profiles WHERE full_name='Synthetic Invalid Choice') IS NOT NULL THEN RAISE EXCEPTION 'Invalid preset was exposed'; END IF;
 IF EXISTS (SELECT id,full_name,role,avatar_path FROM public.profiles EXCEPT SELECT * FROM public.fixture_originals) THEN RAISE EXCEPTION 'Unrelated profile fields changed'; END IF;
 IF EXISTS (SELECT policyname,qual,with_check FROM pg_catalog.pg_policies WHERE schemaname='public' AND tablename='profiles' EXCEPT SELECT * FROM public.fixture_policies) THEN RAISE EXCEPTION 'RLS policies changed'; END IF;
 IF pg_catalog.has_function_privilege('authenticated','public.px_auth_avatar_to_profile()','EXECUTE') OR pg_catalog.has_function_privilege('anon','public.px_profile_avatar_on_insert()','EXECUTE') THEN RAISE EXCEPTION 'Trigger function exposed as a callable API'; END IF;
END;
$test$;
-- Future selection change and removal/photo transition synchronize transactionally.
UPDATE auth.users SET raw_user_meta_data=jsonb_set(raw_user_meta_data,'{px_avatar_id}','"portrait-4"') WHERE id='00000000-0000-4000-8000-000000000002';
DO $$BEGIN IF (SELECT avatar_preset_id FROM public.profiles WHERE full_name='Synthetic Learner A') IS DISTINCT FROM 'portrait-4' THEN RAISE EXCEPTION 'Selection update was not synchronized'; END IF; END$$;
UPDATE auth.users SET raw_user_meta_data=raw_user_meta_data-'px_avatar_id' WHERE id='00000000-0000-4000-8000-000000000002';
DO $$BEGIN IF (SELECT avatar_preset_id FROM public.profiles WHERE full_name='Synthetic Learner A') IS NOT NULL THEN RAISE EXCEPTION 'Removed selection was not cleared'; END IF; END$$;
-- Profile creation must work independently of the project's existing auth-user/profile creation trigger order.
INSERT INTO auth.users VALUES ('00000000-0000-4000-8000-000000000006','{"px_avatar_id":"portrait-8"}');
INSERT INTO public.profiles(id,full_name,role) VALUES ('00000000-0000-4000-8000-000000000006','Synthetic New Learner','student');
DO $$BEGIN IF (SELECT avatar_preset_id FROM public.profiles WHERE full_name='Synthetic New Learner') IS DISTINCT FROM 'portrait-8' THEN RAISE EXCEPTION 'New profile missed its selected avatar'; END IF; END$$;
-- The new display field must not broaden row visibility or permit private Auth reads.
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000003',false);
DO $$BEGIN
 IF (SELECT count(*) FROM public.profiles) <> 1 THEN RAISE EXCEPTION 'Student row visibility broadened'; END IF;
 BEGIN PERFORM raw_user_meta_data FROM auth.users; RAISE EXCEPTION 'Private Auth metadata became readable'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END$$;
SELECT * FROM public.profiles; -- Also proves the new column's targeted SELECT grant works.
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false);
DO $$BEGIN IF (SELECT count(*) FROM public.profiles WHERE role='student') <> 5 THEN RAISE EXCEPTION 'Authorized teacher cannot read student profiles'; END IF; END$$;
SELECT full_name,avatar_preset_id FROM public.profiles WHERE role='student';
RESET ROLE;
SELECT 'PASS: backfill, idempotence, future updates, removal, signup, photo/name/role preservation, RLS and restricted Auth metadata' AS result;
