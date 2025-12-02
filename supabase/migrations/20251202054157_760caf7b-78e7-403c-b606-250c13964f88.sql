-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- System can insert notifications (through service role)
CREATE POLICY "Service role can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create appeals table
CREATE TABLE public.restriction_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restriction_id UUID NOT NULL REFERENCES public.user_restrictions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appeal_message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_response TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for appeals
ALTER TABLE public.restriction_appeals ENABLE ROW LEVEL SECURITY;

-- Users can view their own appeals
CREATE POLICY "Users can view their own appeals"
ON public.restriction_appeals
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own appeals
CREATE POLICY "Users can insert their own appeals"
ON public.restriction_appeals
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can view all appeals
CREATE POLICY "Admins can view all appeals"
ON public.restriction_appeals
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admins can update appeals
CREATE POLICY "Admins can update appeals"
ON public.restriction_appeals
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_appeals_user_id ON public.restriction_appeals(user_id);
CREATE INDEX idx_appeals_status ON public.restriction_appeals(status);