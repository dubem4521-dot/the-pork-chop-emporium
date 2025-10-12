-- Create table for storing admin PINs temporarily
CREATE TABLE IF NOT EXISTS public.admin_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  pin TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_pins ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX idx_admin_pins_email_expires ON public.admin_pins(email, expires_at);

-- No RLS policies needed as this table is only accessed via edge functions with service role

-- Function to cleanup expired pins (optional but recommended)
CREATE OR REPLACE FUNCTION public.cleanup_expired_admin_pins()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.admin_pins
  WHERE expires_at < now();
$$;