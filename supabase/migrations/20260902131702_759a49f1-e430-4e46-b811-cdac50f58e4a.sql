CREATE TYPE public.app_role AS ENUM ('admin','student');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  full_name text NOT NULL,
  register_number text NOT NULL UNIQUE,
  department text NOT NULL DEFAULT '',
  year int NOT NULL DEFAULT 1,
  gender text NOT NULL DEFAULT 'Male',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  blood_group text NOT NULL DEFAULT 'O+',
  dob date,
  weight numeric,
  last_donation_date date,
  medical_conditions text DEFAULT '',
  address text DEFAULT '',
  photo_url text,
  willing boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own or admin all" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "update own or admin" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.blood_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid,
  patient_name text NOT NULL,
  hospital text NOT NULL,
  blood_group text NOT NULL,
  units int NOT NULL DEFAULT 1,
  reason text DEFAULT '',
  required_date date,
  contact_number text NOT NULL DEFAULT '',
  urgency text NOT NULL DEFAULT 'Normal',
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blood_requests TO authenticated;
GRANT ALL ON public.blood_requests TO service_role;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own or admin" ON public.blood_requests FOR SELECT TO authenticated USING (requester_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "create own request" ON public.blood_requests FOR INSERT TO authenticated WITH CHECK (requester_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update requests" ON public.blood_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete requests" ON public.blood_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER requests_updated BEFORE UPDATE ON public.blood_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  donation_date date NOT NULL DEFAULT current_date,
  units int NOT NULL DEFAULT 1,
  hospital text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own donations or admin" ON public.donations FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.user_id = auth.uid()));
CREATE POLICY "admin manage donations" ON public.donations FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'General',
  target_blood_group text,
  camp_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all signed in read notifications" ON public.notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage notifications" ON public.notifications FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all signed in read settings" ON public.app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage settings" ON public.app_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.app_settings (key, value) VALUES
  ('college_name','Government College of Engineering'),
  ('system_name','Blood Donor Management & Tracking System'),
  ('contact_email','bloodbank@college.edu'),
  ('contact_phone','+91 98765 43210');

INSERT INTO public.profiles (full_name, register_number, department, year, gender, phone, email, blood_group, dob, weight, last_donation_date, medical_conditions, address, willing) VALUES
  ('Arjun Menon','21CS001','Computer Science',3,'Male','9876543210','arjun@college.edu','O+','2003-04-12',68,'2026-03-14','None','Kochi, Kerala',true),
  ('Priya Raman','21EC014','Electronics',3,'Female','9876500011','priya@college.edu','A+','2003-08-02',55,'2026-01-20','None','Coimbatore',true),
  ('Karthik S','22ME045','Mechanical',2,'Male','9812345678','karthik@college.edu','B+','2004-01-19',72,NULL,'Asthma (mild)','Madurai',false),
  ('Fatima Noor','20IT007','Information Technology',4,'Female','9900112233','fatima@college.edu','AB+','2002-11-05',58,'2025-12-02','None','Chennai',true),
  ('Rahul Verma','21CS077','Computer Science',3,'Male','9098765432','rahul@college.edu','O-','2003-06-23',75,'2026-05-10','None','Bengaluru',true),
  ('Sneha Iyer','22EE032','Electrical',2,'Female','9765432100','sneha@college.edu','B-','2004-03-30',52,NULL,'Anemia','Salem',false),
  ('Vikram Das','20CE019','Civil',4,'Male','9345678120','vikram@college.edu','A-','2002-09-17',80,'2026-02-08','None','Trichy',true),
  ('Ananya Gupta','23CS110','Computer Science',1,'Female','9123456780','ananya@college.edu','AB-','2005-02-14',54,NULL,'None','Hyderabad',true),
  ('Mohan Kumar','21ME061','Mechanical',3,'Male','9234567810','mohan@college.edu','O+','2003-12-01',70,'2026-04-22','None','Erode',true),
  ('Divya Prakash','22IT028','Information Technology',2,'Female','9345612780','divya@college.edu','A+','2004-07-08',56,'2026-06-15','None','Kollam',true);

INSERT INTO public.donations (profile_id, donation_date, units, hospital, notes)
SELECT id, last_donation_date, 1, 'Government General Hospital', 'Camp donation' FROM public.profiles WHERE last_donation_date IS NOT NULL;

INSERT INTO public.donations (profile_id, donation_date, units, hospital, notes)
SELECT id, last_donation_date - INTERVAL '7 months', 1, 'Red Cross Blood Bank', 'Voluntary donation' FROM public.profiles WHERE last_donation_date IS NOT NULL;

INSERT INTO public.notifications (title, message, type, target_blood_group, camp_date) VALUES
  ('Blood Donation Camp - Main Auditorium','A mega blood donation camp is organised in association with the Red Cross Society. Register at the NSS desk.','Camp',NULL,'2026-09-20'),
  ('Urgent: O- blood required','A patient at Government General Hospital urgently needs 2 units of O- blood. Contact the NSS coordinator immediately.','Urgent','O-',NULL),
  ('Eligibility reminder','Students whose last donation was more than 3 months ago are now eligible to donate again.','Reminder',NULL,NULL);

INSERT INTO public.blood_requests (patient_name, hospital, blood_group, units, reason, required_date, contact_number, urgency, status) VALUES
  ('Ramesh Nair','Apollo Hospital','B+',2,'Scheduled surgery','2026-09-12','9876543210','High','Pending'),
  ('Latha Devi','Government General Hospital','O-',1,'Accident emergency','2026-09-05','9876500011','Critical','Approved'),
  ('Sundar Raj','KMC Hospital','A+',3,'Cancer treatment','2026-09-25','9812345678','Normal','Completed');