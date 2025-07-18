-- Security Fix Phase 1: Critical Privilege Escalation Fix
-- Drop the existing policy that allows users to update their own profile (including role)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create a new policy that allows users to update their profile but NOT the role column
CREATE POLICY "Users can update their own profile (except role)" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND role = (SELECT role FROM public.profiles WHERE user_id = auth.uid()));

-- Security Fix Phase 2: Database Function Security
-- Fix function search paths to prevent function hijacking

-- Update handle_new_user function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_value public.user_role;
BEGIN
  -- Safely cast the role from metadata, defaulting to 'trainer' if invalid
  BEGIN
    user_role_value := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'trainer');
  EXCEPTION WHEN invalid_text_representation THEN
    user_role_value := 'trainer';
  END;

  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    user_role_value
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update get_current_user_role function with proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Update update_updated_at_column function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Security Fix Phase 3: RLS Policy Completion
-- Add missing UPDATE and DELETE policies for photos table

CREATE POLICY "Users can update their own photos" 
ON public.photos 
FOR UPDATE 
USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own photos" 
ON public.photos 
FOR DELETE 
USING (uploaded_by = auth.uid());

-- Add admin override policies for photos
CREATE POLICY "Admins can update all photos" 
ON public.photos 
FOR UPDATE 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete all photos" 
ON public.photos 
FOR DELETE 
USING (get_current_user_role() = 'admin');

-- Security Fix Phase 4: Audit Trail
-- Create audit table for tracking role changes
CREATE TABLE public.profile_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  changed_by UUID NOT NULL,
  old_role user_role,
  new_role user_role NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT
);

-- Enable RLS on audit table
ALTER TABLE public.profile_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs" 
ON public.profile_audit 
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- Create trigger function for role change auditing
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only audit role changes
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.profile_audit (user_id, changed_by, old_role, new_role, reason)
    VALUES (
      NEW.user_id,
      auth.uid(),
      OLD.role,
      NEW.role,
      'Role updated via profile update'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for role change auditing
CREATE TRIGGER audit_profile_role_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();