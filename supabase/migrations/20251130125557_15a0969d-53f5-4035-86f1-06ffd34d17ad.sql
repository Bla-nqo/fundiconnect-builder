-- Create job categories table for managing available skills/work types
CREATE TABLE IF NOT EXISTS public.job_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view job categories
CREATE POLICY "Job categories are viewable by everyone"
ON public.job_categories
FOR SELECT
USING (true);

-- Only admins can insert job categories
CREATE POLICY "Admins can insert job categories"
ON public.job_categories
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update job categories
CREATE POLICY "Admins can update job categories"
ON public.job_categories
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete job categories
CREATE POLICY "Admins can delete job categories"
ON public.job_categories
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create user restrictions table
CREATE TABLE IF NOT EXISTS public.user_restrictions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  restricted_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_restrictions ENABLE ROW LEVEL SECURITY;

-- Users can view their own restrictions
CREATE POLICY "Users can view their own restrictions"
ON public.user_restrictions
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all restrictions
CREATE POLICY "Admins can view all restrictions"
ON public.user_restrictions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert restrictions
CREATE POLICY "Admins can insert restrictions"
ON public.user_restrictions
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update restrictions
CREATE POLICY "Admins can update restrictions"
ON public.user_restrictions
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default job categories
INSERT INTO public.job_categories (name, description) VALUES
  ('Plumbing', 'Water systems, pipes, drainage installation and repair'),
  ('Electrical', 'Electrical wiring, installations, and repairs'),
  ('Carpentry', 'Wood working, furniture making, and installations'),
  ('Painting', 'Interior and exterior painting services'),
  ('Masonry', 'Brick, stone, and concrete work'),
  ('Roofing', 'Roof installation, repair, and maintenance'),
  ('Welding', 'Metal fabrication and welding services'),
  ('Tiling', 'Floor and wall tiling services'),
  ('HVAC', 'Heating, ventilation, and air conditioning'),
  ('Landscaping', 'Garden design and maintenance')
ON CONFLICT (name) DO NOTHING;

-- Add trigger for updated_at
CREATE TRIGGER update_job_categories_updated_at
BEFORE UPDATE ON public.job_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();