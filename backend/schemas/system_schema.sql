--=================================================================
--  1. CLEANUP SCRIPT
--=================================================================
-- Drop the trigger from auth.users first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop all tables. CASCADE handles foreign keys and RLS policies.
DROP TABLE IF EXISTS public.progress_records CASCADE;
DROP TABLE IF EXISTS public.progress CASCADE;
DROP TABLE IF EXISTS public.class_resources CASCADE;
DROP TABLE IF EXISTS public.learning_resources CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.registrations CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.subjects CASCADE;
DROP TABLE IF EXISTS public.mentee_details CASCADE;
DROP TABLE IF EXISTS public.tutor_details CASCADE;
DROP TABLE IF EXISTS public.admin CASCADE;
DROP TABLE IF EXISTS public.department_chair CASCADE;
DROP TABLE IF EXISTS public.academic_affairs CASCADE;
DROP TABLE IF EXISTS public.student_affairs CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public."USER" CASCADE; -- Use "USER" as finalized
-- (If you used 'profiles', change public."USER" to public.profiles)

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(UUID, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.check_schedule_conflict(TEXT[], INT, INT, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.increment_enrollment() CASCADE;
DROP FUNCTION IF EXISTS public.decrement_enrollment() CASCADE;

-- Now it is 100% safe to drop the type
DROP TYPE IF EXISTS public.app_role;


-- This function automatically updates 'updated_at' timestamps.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- "USER"

CREATE TABLE public."USER" (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  faculty TEXT,
  hcmut_sso_credentials TEXT, 
  user_type TEXT, 
  password TEXT, 
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public."USER" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
  ON public."USER" FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public."USER" FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public."USER" FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE TRIGGER update_user_updated_at
  BEFORE UPDATE ON public."USER"
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- CUSTOM TYPES

CREATE TYPE public.app_role AS ENUM (
  'tutor',
  'mentee',
  'admin',
  'department_chair',
  'academic_affairs',
  'student_affairs',
  'coordinator'
);
-- "user_roles" 

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" 
  ON public.user_roles FOR SELECT 
  USING (auth.uid() = user_id);
  
CREATE POLICY "Coordinators can manage roles" 
  ON public.user_roles FOR ALL 
  USING (public.has_role(auth.uid(), 'coordinator'));


-- TUTOR

CREATE TABLE public.TUTOR (
  user_id UUID PRIMARY KEY REFERENCES public."USER"(id) ON DELETE CASCADE,
  major TEXT,
  expertise_areas TEXT
);
ALTER TABLE public.TUTOR ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view/update their own tutor details" ON public.TUTOR FOR ALL USING (auth.uid() = user_id);


-- MENTEE

CREATE TABLE public.MENTEE (
  user_id UUID PRIMARY KEY REFERENCES public."USER"(id) ON DELETE CASCADE,
  major TEXT,
  learning_needs TEXT
);
ALTER TABLE public.MENTEE ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view/update their own mentee details" ON public.MENTEE FOR ALL USING (auth.uid() = user_id);

-- subjects

CREATE TABLE IF NOT EXISTS public.subjects (
  id SERIAL PRIMARY KEY,
  subject_name TEXT NOT NULL,
  subject_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view subjects" ON public.subjects FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Coordinators can manage subjects" ON public.subjects FOR ALL USING (public.has_role(auth.uid(), 'coordinator'));


-- week_day ENUM type
CREATE TYPE public.week_day AS ENUM (
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
);

-- classes
CREATE TABLE public.classes (
  id SERIAL PRIMARY KEY,
  tutor_id UUID NOT NULL REFERENCES public."USER"(id),
  subject_id INTEGER NOT NULL REFERENCES public.subjects(id),
  week_day week_day,
  class_status TEXT DEFAULT 'scheduled',
  location TEXT,
  capacity INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  start_time INTEGER,
  end_time INTEGER,
  current_enrolled INTEGER DEFAULT 0,
  num_of_weeks INTEGER,
  registration_deadline TIMESTAMPTZ,
  semester TEXT
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view classes" 
  ON public.classes FOR SELECT 
  USING (true);

CREATE POLICY "Coordinators can manage classes" 
  ON public.classes FOR ALL 
  USING (public.has_role(auth.uid(), 'coordinator'));

CREATE POLICY "Tutors can update their assigned classes" 
  ON public.classes FOR UPDATE 
  USING (auth.uid() = tutor_id);

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


--sessions
CREATE TABLE public.sessions (
  class_id INTEGER NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  session_id SERIAL NOT NULL,
  session_date_time TIMESTAMPTZ,
  session_status TEXT DEFAULT 'scheduled',
  location TEXT,
  current_enrolled INTEGER DEFAULT 0,
  max_enrolled INTEGER DEFAULT 10,
  meeting_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (class_id, session_id)
);


ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sessions" 
  ON public.sessions FOR SELECT 
  USING (true);

CREATE POLICY "Coordinators can manage sessions" 
  ON public.sessions FOR ALL 
  USING (public.has_role(auth.uid(), 'coordinator'));

CREATE POLICY "Tutors can update sessions for their classes" 
  ON public.sessions FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.classes c 
    WHERE c.id = sessions.class_id AND c.tutor_id = auth.uid()
  ));

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


--=================================================================
--class_registrations 

CREATE TABLE public.class_registrations (
  mentee_id UUID NOT NULL REFERENCES public."USER"(id) ON DELETE CASCADE,
  class_id INTEGER NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  registration_log TIMESTAMPTZ DEFAULT NOW(),
  cancellation_log TIMESTAMPTZ,
  PRIMARY KEY (mentee_id, class_id) -- A mentee can only register for a class once
);

ALTER TABLE public.class_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentees can manage their own registrations" 
  ON public.class_registrations FOR ALL 
  USING (auth.uid() = mentee_id);

CREATE POLICY "Tutors/Coordinators can view registrations" 
  ON public.class_registrations FOR SELECT
  USING (
    public.has_role(auth.uid(), 'coordinator') OR
    EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = class_registrations.class_id AND c.tutor_id = auth.uid()
    )
  );

--attendance

CREATE TABLE public.attendance (
  mentee_id UUID NOT NULL REFERENCES public."USER"(id) ON DELETE CASCADE,
  class_id INTEGER NOT NULL,
  session_id INTEGER NOT NULL,
  attendance_mark BOOLEAN DEFAULT false,
  PRIMARY KEY (mentee_id, class_id, session_id),
  FOREIGN KEY (class_id, session_id) REFERENCES public.sessions(class_id, session_id) ON DELETE CASCADE,
  -- This constraint ensures you can only mark attendance for a mentee
  -- who is actually registered for the class.
  FOREIGN KEY (mentee_id, class_id) REFERENCES public.class_registrations(mentee_id, class_id) ON DELETE CASCADE
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own attendance" 
  ON public.attendance FOR SELECT 
  USING (auth.uid() = mentee_id);
  
CREATE POLICY "Tutors/Coordinators can manage attendance" 
  ON public.attendance FOR ALL
  USING (
    public.has_role(auth.uid(), 'coordinator') OR
    EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = attendance.class_id AND c.tutor_id = auth.uid()
    )
  );



-- learning_resources

CREATE TABLE public.learning_resources (
  id SERIAL PRIMARY KEY,
  -- Corrected: References public."USER"(id)
  tutor_id UUID NOT NULL REFERENCES public."USER"(id),
  file_type TEXT,
  resource_source TEXT,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view resources" 
  ON public.learning_resources FOR SELECT 
  USING (auth.uid() IS NOT NULL);
  
CREATE POLICY "Tutors can manage their own resources" 
  ON public.learning_resources FOR ALL 
  USING (auth.uid() = tutor_id);
  
CREATE POLICY "Coordinators can manage all resources" 
  ON public.learning_resources FOR ALL 
  USING (public.has_role(auth.uid(), 'coordinator'));



--class_resources

CREATE TABLE public.class_resources (

  class_id INTEGER NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  resource_id INTEGER NOT NULL REFERENCES public.learning_resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (class_id, resource_id)
);

ALTER TABLE public.class_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view links" 
  ON public.class_resources FOR SELECT 
  USING (auth.uid() IS NOT NULL);
  
CREATE POLICY "Tutors/Coordinators can manage links for classes" 
  ON public.class_resources FOR ALL
  USING (
    public.has_role(auth.uid(), 'coordinator') OR
    EXISTS (
      -- Corrected: References public.CLASS c
      SELECT 1 FROM public.classes c
      WHERE c.id = class_resources.class_id AND c.tutor_id = auth.uid()
    )
  );


--feedback

CREATE TABLE public.feedback (
  mentee_id UUID NOT NULL REFERENCES public."USER"(id) ON DELETE CASCADE,
  class_id INTEGER NOT NULL,
  session_id INTEGER NOT NULL,
  rating_scale INTEGER CHECK (rating_scale >= 1 AND rating_scale <= 5),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (mentee_id, class_id, session_id),
  FOREIGN KEY (class_id, session_id) REFERENCES public.sessions(class_id, session_id) ON DELETE CASCADE
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentees can manage their own feedback" 
  ON public.feedback FOR ALL 
  USING (auth.uid() = mentee_id);

CREATE POLICY "Tutors/Coordinators can view feedback" 
  ON public.feedback FOR SELECT
  USING (
    public.has_role(auth.uid(), 'coordinator') OR
    EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = feedback.class_id AND c.tutor_id = auth.uid()
    )
  );
  
--  progress_reports

CREATE TABLE public.progress_reports (
  id SERIAL PRIMARY KEY,
  tutor_id UUID NOT NULL REFERENCES public."USER"(id),
  class_id INTEGER NOT NULL REFERENCES public.CLASS(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  progress_date TIMESTAMPTZ DEFAULT NOW()
);


ALTER TABLE public.progress_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors/Coordinators can manage reports"
  ON public.progress_reports FOR ALL
  USING (
    public.has_role(auth.uid(), 'coordinator') OR
    auth.uid() = tutor_id
  );

CREATE POLICY "Registered Mentees can view reports"
  ON public.progress_reports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.class_registrations cr -- Uses the table from Part 7
    WHERE cr.class_id = progress_reports.class_id AND cr.mentee_id = auth.uid()
  ));


-- progress_marks

CREATE TABLE public.progress_marks (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES public.progress_reports(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES public.MENTEE(User_ID) ON DELETE CASCADE,
  points INTEGER,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, mentee_id)
);


ALTER TABLE public.progress_marks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors/Coordinators can manage marks" 
  ON public.progress_marks FOR ALL
  USING (
    public.has_role(auth.uid(), 'coordinator') OR
    EXISTS (
      SELECT 1 FROM public.progress_reports pr
      WHERE pr.id = progress_marks.report_id AND pr.tutor_id = auth.uid()
    )
  );

CREATE POLICY "Mentees can view their own marks" 
  ON public.progress_marks FOR SELECT
  USING (auth.uid() = mentee_id);
