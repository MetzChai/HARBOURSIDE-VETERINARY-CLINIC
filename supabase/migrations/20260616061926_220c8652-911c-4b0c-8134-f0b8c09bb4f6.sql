
-- ===== Enums =====
CREATE TYPE public.app_role AS ENUM ('admin','owner');
CREATE TYPE public.pet_status AS ENUM ('available','deceased');
CREATE TYPE public.appt_type AS ENUM ('scheduled','walk_in','request');
CREATE TYPE public.appt_status AS ENUM ('Scheduled','Completed','Missed','Cancelled','Requested');
CREATE TYPE public.txn_type AS ENUM ('in','out');
CREATE TYPE public.item_category AS ENUM ('vaccine','medication','dewormer','supply');

-- ===== updated_at helper =====
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- ===== profiles =====
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== user_roles =====
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ===== owners =====
CREATE TABLE public.owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  contact text,
  email text,
  address text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.owners TO authenticated;
GRANT ALL ON public.owners TO service_role;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_owners_updated BEFORE UPDATE ON public.owners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- helper: owner ids belonging to current user
CREATE OR REPLACE FUNCTION public.my_owner_ids()
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.owners WHERE user_id = auth.uid()
$$;

-- ===== pets =====
CREATE TABLE public.pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
  name text NOT NULL,
  species text,
  breed text,
  gender text,
  dob date,
  image_url text,
  status pet_status NOT NULL DEFAULT 'available',
  cause_of_death text,
  deceased_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pets TO authenticated;
GRANT ALL ON public.pets TO service_role;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_pets_updated BEFORE UPDATE ON public.pets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.my_pet_ids()
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id FROM public.pets p JOIN public.owners o ON p.owner_id = o.id WHERE o.user_id = auth.uid()
$$;

-- ===== appointments =====
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid REFERENCES public.pets(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES public.owners(id) ON DELETE CASCADE,
  date date NOT NULL,
  time text NOT NULL,
  vet text,
  reason text,
  type appt_type NOT NULL DEFAULT 'scheduled',
  status appt_status NOT NULL DEFAULT 'Scheduled',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_appts_updated BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== vaccinations =====
CREATE TABLE public.vaccinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  vaccine_type text NOT NULL,
  date_given date,
  next_due date,
  vet text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vaccinations TO authenticated;
GRANT ALL ON public.vaccinations TO service_role;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_vax_updated BEFORE UPDATE ON public.vaccinations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== dewormings =====
CREATE TABLE public.dewormings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  product text NOT NULL,
  date_given date,
  next_due date,
  vet text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dewormings TO authenticated;
GRANT ALL ON public.dewormings TO service_role;
ALTER TABLE public.dewormings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_deworm_updated BEFORE UPDATE ON public.dewormings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== care_records =====
CREATE TABLE public.care_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT now(),
  vet text,
  record_type text NOT NULL DEFAULT 'checkup',
  diagnosis text,
  treatment text,
  medication text,
  dosage text,
  outcome text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.care_records TO authenticated;
GRANT ALL ON public.care_records TO service_role;
ALTER TABLE public.care_records ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_care_updated BEFORE UPDATE ON public.care_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== inventory_items =====
CREATE TABLE public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text,
  dosage text,
  category item_category NOT NULL DEFAULT 'supply',
  quantity integer NOT NULL DEFAULT 0,
  unit text DEFAULT 'unit',
  expiration_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_items TO authenticated;
GRANT ALL ON public.inventory_items TO service_role;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_inv_updated BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== inventory_transactions (batches in/out) =====
CREATE TABLE public.inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  type txn_type NOT NULL,
  quantity integer NOT NULL,
  batch_no text,
  expiration_date date,
  reason text,
  pet_id uuid REFERENCES public.pets(id) ON DELETE SET NULL,
  date date NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_transactions TO authenticated;
GRANT ALL ON public.inventory_transactions TO service_role;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- ===== lab_transactions =====
CREATE TABLE public.lab_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid REFERENCES public.pets(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES public.owners(id) ON DELETE SET NULL,
  date date NOT NULL DEFAULT now(),
  vet text,
  status text NOT NULL DEFAULT 'Unpaid',
  total numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lab_transactions TO authenticated;
GRANT ALL ON public.lab_transactions TO service_role;
ALTER TABLE public.lab_transactions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_lab_updated BEFORE UPDATE ON public.lab_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== lab_transaction_items =====
CREATE TABLE public.lab_transaction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES public.lab_transactions(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  line_total numeric NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lab_transaction_items TO authenticated;
GRANT ALL ON public.lab_transaction_items TO service_role;
ALTER TABLE public.lab_transaction_items ENABLE ROW LEVEL SECURITY;

-- ===== messages (simulated SMS log) =====
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.owners(id) ON DELETE SET NULL,
  phone text,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'simulated',
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ===== Policies =====
-- profiles
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- user_roles
CREATE POLICY "user_roles_select_own_or_admin" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- owners
CREATE POLICY "owners_admin_all" ON public.owners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "owners_select_own" ON public.owners FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "owners_update_own" ON public.owners FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- pets
CREATE POLICY "pets_admin_all" ON public.pets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "pets_owner_select" ON public.pets FOR SELECT TO authenticated
  USING (owner_id IN (SELECT public.my_owner_ids()));

-- appointments
CREATE POLICY "appts_admin_all" ON public.appointments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "appts_owner_select" ON public.appointments FOR SELECT TO authenticated
  USING (owner_id IN (SELECT public.my_owner_ids()));
CREATE POLICY "appts_owner_request" ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (owner_id IN (SELECT public.my_owner_ids()) AND type = 'request');

-- vaccinations
CREATE POLICY "vax_admin_all" ON public.vaccinations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "vax_owner_select" ON public.vaccinations FOR SELECT TO authenticated
  USING (pet_id IN (SELECT public.my_pet_ids()));

-- dewormings
CREATE POLICY "deworm_admin_all" ON public.dewormings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "deworm_owner_select" ON public.dewormings FOR SELECT TO authenticated
  USING (pet_id IN (SELECT public.my_pet_ids()));

-- care_records
CREATE POLICY "care_admin_all" ON public.care_records FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "care_owner_select" ON public.care_records FOR SELECT TO authenticated
  USING (pet_id IN (SELECT public.my_pet_ids()));

-- inventory (admin only)
CREATE POLICY "inv_admin_all" ON public.inventory_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "invtxn_admin_all" ON public.inventory_transactions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- lab_transactions
CREATE POLICY "lab_admin_all" ON public.lab_transactions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "lab_owner_select" ON public.lab_transactions FOR SELECT TO authenticated
  USING (owner_id IN (SELECT public.my_owner_ids()));
CREATE POLICY "labitem_admin_all" ON public.lab_transaction_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "labitem_owner_select" ON public.lab_transaction_items FOR SELECT TO authenticated
  USING (transaction_id IN (SELECT id FROM public.lab_transactions WHERE owner_id IN (SELECT public.my_owner_ids())));

-- messages (admin only)
CREATE POLICY "msg_admin_all" ON public.messages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ===== new user handler: profile + owner role + owner record =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_name text;
BEGIN
  v_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1));
  INSERT INTO public.profiles (id, full_name, email) VALUES (NEW.id, v_name, NEW.email)
    ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'owner')
    ON CONFLICT (user_id, role) DO NOTHING;
  INSERT INTO public.owners (user_id, name, email) VALUES (NEW.id, v_name, NEW.email);
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
