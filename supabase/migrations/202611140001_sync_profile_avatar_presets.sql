-- Run once in this project's Supabase SQL Editor, or via its authorized migration runner.
-- Exposes only a validated generic avatar ID through existing profiles RLS.
-- No auth metadata, credentials, roles, photo paths, scores or policies are changed.
BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_preset_id text;

-- Preserve column-grant deployments as well as table-grant deployments; existing row policies still apply.
GRANT SELECT (avatar_preset_id) ON public.profiles TO authenticated;

-- A trigger-only function: new profiles inherit the student's existing selection.
CREATE OR REPLACE FUNCTION public.px_profile_avatar_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  selected text;
BEGIN
  SELECT u.raw_user_meta_data ->> 'px_avatar_id'
    INTO selected
    FROM auth.users AS u
    WHERE u.id = NEW.id;
  NEW.avatar_preset_id := CASE
    WHEN selected IN ('portrait-1','portrait-2','portrait-3','portrait-4','portrait-5',
                      'portrait-6','portrait-7','portrait-8','portrait-9','portrait-10')
    THEN selected ELSE NULL END;
  RETURN NEW;
END;
$function$;

-- Auth metadata updates synchronize the display-only field, including removal/photo selection.
CREATE OR REPLACE FUNCTION public.px_auth_avatar_to_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  selected text := NEW.raw_user_meta_data ->> 'px_avatar_id';
  desired text;
BEGIN
  desired := CASE
    WHEN selected IN ('portrait-1','portrait-2','portrait-3','portrait-4','portrait-5',
                      'portrait-6','portrait-7','portrait-8','portrait-9','portrait-10')
    THEN selected ELSE NULL END;
  UPDATE public.profiles
    SET avatar_preset_id = desired
    WHERE id = NEW.id AND avatar_preset_id IS DISTINCT FROM desired;
  RETURN NEW;
END;
$function$;

-- These functions have no callable application API and never return account metadata.
REVOKE ALL ON FUNCTION public.px_profile_avatar_on_insert() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.px_auth_avatar_to_profile() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS px_profile_avatar_on_insert ON public.profiles;
CREATE TRIGGER px_profile_avatar_on_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.px_profile_avatar_on_insert();

DROP TRIGGER IF EXISTS px_auth_avatar_to_profile ON auth.users;
CREATE TRIGGER px_auth_avatar_to_profile
  AFTER UPDATE OF raw_user_meta_data ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.px_auth_avatar_to_profile();

-- Backfill previously selected avatars immediately; students need not choose them again.
UPDATE public.profiles AS p
  SET avatar_preset_id = CASE
    WHEN u.raw_user_meta_data ->> 'px_avatar_id' IN
      ('portrait-1','portrait-2','portrait-3','portrait-4','portrait-5',
       'portrait-6','portrait-7','portrait-8','portrait-9','portrait-10')
    THEN u.raw_user_meta_data ->> 'px_avatar_id' ELSE NULL END
  FROM auth.users AS u
  WHERE u.id = p.id
    AND p.avatar_preset_id IS DISTINCT FROM CASE
      WHEN u.raw_user_meta_data ->> 'px_avatar_id' IN
        ('portrait-1','portrait-2','portrait-3','portrait-4','portrait-5',
         'portrait-6','portrait-7','portrait-8','portrait-9','portrait-10')
      THEN u.raw_user_meta_data ->> 'px_avatar_id' ELSE NULL END;

DO $block$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
      WHERE conrelid = 'public.profiles'::pg_catalog.regclass
        AND conname = 'px_profiles_avatar_preset_id_check'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT px_profiles_avatar_preset_id_check
      CHECK (avatar_preset_id IS NULL OR avatar_preset_id IN
        ('portrait-1','portrait-2','portrait-3','portrait-4','portrait-5',
         'portrait-6','portrait-7','portrait-8','portrait-9','portrait-10'));
  END IF;
END;
$block$;

NOTIFY pgrst, 'reload schema';
COMMIT;
