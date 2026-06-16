
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_name text;
  v_is_admin boolean;
BEGIN
  v_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1));
  v_is_admin := NEW.email ILIKE '%@harbourside.com';

  INSERT INTO public.profiles (id, full_name, email) VALUES (NEW.id, v_name, NEW.email)
    ON CONFLICT (id) DO NOTHING;

  IF v_is_admin THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'owner')
      ON CONFLICT (user_id, role) DO NOTHING;
    INSERT INTO public.owners (user_id, name, email) VALUES (NEW.id, v_name, NEW.email);
  END IF;
  RETURN NEW;
END; $$;
