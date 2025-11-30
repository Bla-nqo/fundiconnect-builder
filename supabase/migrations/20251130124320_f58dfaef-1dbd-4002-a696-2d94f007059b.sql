-- Add foreign key constraints that don't exist yet

-- Drop existing constraints if they exist and recreate them properly
DO $$ 
BEGIN
  -- Drop and recreate jobs.fundi_id constraint
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_fundi_id_fkey') THEN
    ALTER TABLE public.jobs DROP CONSTRAINT jobs_fundi_id_fkey;
  END IF;
  
  -- Drop and recreate fundi_profiles.user_id constraint
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fundi_profiles_user_id_fkey') THEN
    ALTER TABLE public.fundi_profiles DROP CONSTRAINT fundi_profiles_user_id_fkey;
  END IF;
  
  -- Drop and recreate ratings constraints
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ratings_fundi_id_fkey') THEN
    ALTER TABLE public.ratings DROP CONSTRAINT ratings_fundi_id_fkey;
  END IF;
END $$;

-- Now add the correct foreign keys

-- Link jobs.fundi_id to fundi_profiles.user_id
ALTER TABLE public.jobs
ADD CONSTRAINT jobs_fundi_id_fkey 
FOREIGN KEY (fundi_id) 
REFERENCES public.fundi_profiles(user_id) 
ON DELETE SET NULL;

-- Link fundi_profiles.user_id to auth.users
ALTER TABLE public.fundi_profiles
ADD CONSTRAINT fundi_profiles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Link ratings.fundi_id to fundi_profiles.user_id
ALTER TABLE public.ratings
ADD CONSTRAINT ratings_fundi_id_fkey 
FOREIGN KEY (fundi_id) 
REFERENCES public.fundi_profiles(user_id) 
ON DELETE CASCADE;