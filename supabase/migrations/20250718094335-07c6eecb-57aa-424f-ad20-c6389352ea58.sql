-- Fix the trigger function to handle role casting properly
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
$$ LANGUAGE plpgsql SECURITY DEFINER;