-- First, remove all existing admin roles
DELETE FROM public.user_roles WHERE role = 'admin';

-- Create the admin user account (Supabase will handle user creation via auth)
-- We'll insert the profile data for when the user signs up
-- The user will be created when they first authenticate with OTP

-- Note: The actual user creation in auth.users will happen automatically 
-- when they use OTP authentication. We'll set up a function to auto-assign 
-- admin role to this specific email.

-- Create a function to auto-assign admin role to specific email
CREATE OR REPLACE FUNCTION public.assign_admin_role_to_taku()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the new user's email is the admin email
  IF NEW.email = 'dubem4521@gmail.com' THEN
    -- Insert admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Update profile with admin name
    UPDATE public.profiles
    SET full_name = 'Taku'
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run after user creation
DROP TRIGGER IF EXISTS assign_admin_role_trigger ON auth.users;
CREATE TRIGGER assign_admin_role_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_admin_role_to_taku();