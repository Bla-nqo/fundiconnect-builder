-- Add ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  fundi_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, client_id)
);

-- Add job progress tracking columns
ALTER TABLE public.jobs 
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE,
ADD COLUMN actual_end_date DATE,
ADD COLUMN progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);

-- Update jobs status to include more states
ALTER TABLE public.jobs 
ALTER COLUMN status TYPE TEXT,
ALTER COLUMN status SET DEFAULT 'open';

-- Enable RLS on ratings
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Ratings policies
CREATE POLICY "Anyone can view ratings"
ON public.ratings FOR SELECT
USING (true);

CREATE POLICY "Clients can create ratings for completed jobs"
ON public.ratings FOR INSERT
WITH CHECK (
  auth.uid() = client_id AND
  EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE jobs.id = job_id 
    AND jobs.status = 'completed'
    AND jobs.client_id = auth.uid()
  )
);

-- Enable realtime for ratings
ALTER PUBLICATION supabase_realtime ADD TABLE public.ratings;

-- Enable realtime for jobs (for progress tracking)
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;

-- Enable realtime for fundi_profiles (for verification status)
ALTER PUBLICATION supabase_realtime ADD TABLE public.fundi_profiles;