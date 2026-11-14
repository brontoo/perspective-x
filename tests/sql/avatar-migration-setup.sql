CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE SCHEMA auth;
GRANT USAGE ON SCHEMA auth TO authenticated;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
$$;
CREATE TABLE auth.users (id uuid PRIMARY KEY, raw_user_meta_data jsonb);
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id), full_name text, role text, avatar_path text
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.test_is_teacher() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='teacher');
$$;
CREATE POLICY fixture_profiles_select ON public.profiles FOR SELECT TO authenticated
  USING (id=auth.uid() OR public.test_is_teacher());
CREATE POLICY fixture_profiles_update ON public.profiles FOR UPDATE TO authenticated
  USING (id=auth.uid()) WITH CHECK (id=auth.uid());
-- Use column grants deliberately so the migration must account for them safely.
GRANT SELECT(id,full_name,role,avatar_path) ON public.profiles TO authenticated;
GRANT UPDATE(full_name,avatar_path) ON public.profiles TO authenticated;
INSERT INTO auth.users VALUES
 ('00000000-0000-4000-8000-000000000001','{"px_avatar_id":"portrait-2","private_note":"not exposed"}'),
 ('00000000-0000-4000-8000-000000000002','{"px_avatar_id":"portrait-7","private_note":"not exposed"}'),
 ('00000000-0000-4000-8000-000000000003','{"px_avatar_id":"portrait-10"}'),
 ('00000000-0000-4000-8000-000000000004','{"px_avatar_id":"https://untrusted.invalid/image"}'),
 ('00000000-0000-4000-8000-000000000005','{"px_avatar_id":null}');
INSERT INTO public.profiles VALUES
 ('00000000-0000-4000-8000-000000000001','Synthetic Teacher','teacher',null),
 ('00000000-0000-4000-8000-000000000002','Synthetic Learner A','student',null),
 ('00000000-0000-4000-8000-000000000003','Synthetic Learner B','student',null),
 ('00000000-0000-4000-8000-000000000004','Synthetic Invalid Choice','student',null),
 ('00000000-0000-4000-8000-000000000005','Synthetic Photo','student','00000000-0000-4000-8000-000000000005/photo.webp');
CREATE TABLE public.fixture_originals AS SELECT * FROM public.profiles;
CREATE TABLE public.fixture_policies AS SELECT policyname,qual,with_check FROM pg_catalog.pg_policies WHERE schemaname='public' AND tablename='profiles';
