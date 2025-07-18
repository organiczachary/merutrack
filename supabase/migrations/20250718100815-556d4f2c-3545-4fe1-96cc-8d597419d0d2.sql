
-- Create training_sessions table
CREATE TABLE public.training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  venue TEXT NOT NULL,
  gps_latitude DECIMAL(10, 8),
  gps_longitude DECIMAL(11, 8),
  value_chain public.value_chain NOT NULL,
  ward TEXT NOT NULL,
  constituency public.constituency NOT NULL,
  expected_participants INTEGER DEFAULT 0,
  actual_participants INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  completion_notes TEXT,
  supervisor_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create modules table with hierarchical structure
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  value_chain public.value_chain NOT NULL,
  difficulty_level TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  duration_hours INTEGER DEFAULT 1,
  prerequisites TEXT[],
  learning_objectives TEXT[],
  parent_module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wards reference table
CREATE TABLE public.wards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  constituency public.constituency NOT NULL,
  ward_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trainer_modules assignment table
CREATE TABLE public.trainer_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  competency_level TEXT NOT NULL DEFAULT 'beginner' CHECK (competency_level IN ('beginner', 'intermediate', 'advanced')),
  certification_status TEXT NOT NULL DEFAULT 'not_started' CHECK (certification_status IN ('not_started', 'in_progress', 'certified')),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  certified_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(trainer_id, module_id)
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_session_id UUID NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  participant_phone TEXT,
  participant_age INTEGER,
  participant_gender TEXT CHECK (participant_gender IN ('male', 'female', 'other')),
  attendance_status TEXT NOT NULL DEFAULT 'present' CHECK (attendance_status IN ('present', 'absent', 'late')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create photos table
CREATE TABLE public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_session_id UUID NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for training_sessions
CREATE POLICY "Trainers can view their own training sessions" 
ON public.training_sessions FOR SELECT 
USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can insert their own training sessions" 
ON public.training_sessions FOR INSERT 
WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "Trainers can update their own training sessions" 
ON public.training_sessions FOR UPDATE 
USING (trainer_id = auth.uid());

CREATE POLICY "Supervisors can view training sessions in their area" 
ON public.training_sessions FOR SELECT 
USING (
  public.get_current_user_role() = 'supervisor' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND constituency = training_sessions.constituency
  )
);

CREATE POLICY "Admins can view all training sessions" 
ON public.training_sessions FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage all training sessions" 
ON public.training_sessions FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- RLS Policies for modules
CREATE POLICY "Everyone can view active modules" 
ON public.modules FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all modules" 
ON public.modules FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- RLS Policies for wards
CREATE POLICY "Everyone can view wards" 
ON public.wards FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Admins can manage wards" 
ON public.wards FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- RLS Policies for trainer_modules
CREATE POLICY "Trainers can view their own module assignments" 
ON public.trainer_modules FOR SELECT 
USING (trainer_id = auth.uid());

CREATE POLICY "Admins can manage all trainer module assignments" 
ON public.trainer_modules FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- RLS Policies for attendance
CREATE POLICY "Trainers can manage attendance for their sessions" 
ON public.attendance FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.training_sessions 
    WHERE id = training_session_id AND trainer_id = auth.uid()
  )
);

CREATE POLICY "Supervisors can view attendance in their area" 
ON public.attendance FOR SELECT 
USING (
  public.get_current_user_role() = 'supervisor' AND
  EXISTS (
    SELECT 1 FROM public.training_sessions ts
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE ts.id = training_session_id AND ts.constituency = p.constituency
  )
);

CREATE POLICY "Admins can manage all attendance" 
ON public.attendance FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- RLS Policies for photos
CREATE POLICY "Users can view photos for accessible training sessions" 
ON public.photos FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.training_sessions ts
    WHERE ts.id = training_session_id AND (
      ts.trainer_id = auth.uid() OR
      (public.get_current_user_role() = 'supervisor' AND 
       EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND constituency = ts.constituency)) OR
      public.get_current_user_role() = 'admin'
    )
  )
);

CREATE POLICY "Users can upload photos for accessible training sessions" 
ON public.photos FOR INSERT 
WITH CHECK (
  uploaded_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.training_sessions ts
    WHERE ts.id = training_session_id AND (
      ts.trainer_id = auth.uid() OR
      public.get_current_user_role() = 'admin'
    )
  )
);

-- Add triggers for updated_at columns
CREATE TRIGGER update_training_sessions_updated_at
  BEFORE UPDATE ON public.training_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert all 45 Meru County wards
INSERT INTO public.wards (name, constituency, ward_code) VALUES
-- Igembe North Constituency
('Antuambui', 'igembe_north', 'IGN001'),
('Antubetwe Kiongo', 'igembe_north', 'IGN002'),
('Naathu', 'igembe_north', 'IGN003'),
('Ntunene', 'igembe_north', 'IGN004'),
('Amwathi', 'igembe_north', 'IGN005'),

-- Igembe South Constituency
('Akachiu', 'igembe_south', 'IGS001'),
('Athiru Gaiti', 'igembe_south', 'IGS002'),
('Kanuni', 'igembe_south', 'IGS003'),
('Kiegoi/Antubochiu', 'igembe_south', 'IGS004'),
('Maua', 'igembe_south', 'IGS005'),

-- Igembe Central Constituency
('Akirang''ondú', 'igembe_central', 'IGC001'),
('Athiru Ruujine', 'igembe_central', 'IGC002'),
('Igembe East', 'igembe_central', 'IGC003'),
('Kangeta', 'igembe_central', 'IGC004'),
('Njia', 'igembe_central', 'IGC005'),

-- Tigania East Constituency
('Karama', 'tigania_east', 'TGE001'),
('Kiguchwa', 'tigania_east', 'TGE002'),
('Mikinduri', 'tigania_east', 'TGE003'),
('Muthara', 'tigania_east', 'TGE004'),
('Thangatha', 'tigania_east', 'TGE005'),

-- Tigania West Constituency
('Akithii', 'tigania_west', 'TGW001'),
('Athwana', 'tigania_west', 'TGW002'),
('Kianjai', 'tigania_west', 'TGW003'),
('Mbeu', 'tigania_west', 'TGW004'),
('Nkomo', 'tigania_west', 'TGW005'),

-- North Imenti Constituency
('Municipality', 'north_imenti', 'NIM001'),
('Ntima East', 'north_imenti', 'NIM002'),
('Ntima West', 'north_imenti', 'NIM003'),
('Nyaki East', 'north_imenti', 'NIM004'),
('Nyaki West', 'north_imenti', 'NIM005'),

-- Central Imenti Constituency
('Abothuguchi Central', 'central_imenti', 'CIM001'),
('Abothuguchi West', 'central_imenti', 'CIM002'),
('Kiagu', 'central_imenti', 'CIM003'),
('Mwanganthia', 'central_imenti', 'CIM004'),

-- South Imenti Constituency
('Abogeta East', 'south_imenti', 'SIM001'),
('Abogeta West', 'south_imenti', 'SIM002'),
('Igoji East', 'south_imenti', 'SIM003'),
('Igoji West', 'south_imenti', 'SIM004'),
('Mitunguu', 'south_imenti', 'SIM005'),
('Nkuene', 'south_imenti', 'SIM006'),

-- Buuri Constituency
('Kiirua/Naari', 'buuri', 'BUR001'),
('Kisima', 'buuri', 'BUR002'),
('Ruiri/Rwarera', 'buuri', 'BUR003'),
('Timau', 'buuri', 'BUR004'),
('Kibirichia', 'buuri', 'BUR005');

-- Insert sample modules for each value chain
INSERT INTO public.modules (name, description, value_chain, difficulty_level, duration_hours, learning_objectives) VALUES
-- Banana modules
('Introduction to Banana Farming', 'Basic principles of banana cultivation in Meru County', 'banana', 'beginner', 2, ARRAY['Understand banana varieties', 'Learn basic planting techniques', 'Identify suitable growing conditions']),
('Banana Disease Management', 'Identifying and managing common banana diseases', 'banana', 'intermediate', 3, ARRAY['Identify common banana diseases', 'Apply prevention strategies', 'Use integrated pest management']),
('Post-Harvest Banana Handling', 'Proper handling and storage of bananas after harvest', 'banana', 'intermediate', 2, ARRAY['Learn proper harvesting techniques', 'Understand storage requirements', 'Reduce post-harvest losses']),

-- Avocado modules
('Avocado Nursery Management', 'Setting up and managing avocado nurseries', 'avocado', 'beginner', 4, ARRAY['Set up avocado nursery', 'Select quality seedlings', 'Manage nursery operations']),
('Avocado Grafting Techniques', 'Advanced grafting methods for avocado trees', 'avocado', 'advanced', 6, ARRAY['Master grafting techniques', 'Select appropriate rootstock', 'Achieve high success rates']),

-- Dairy modules
('Dairy Cattle Breeds Selection', 'Choosing appropriate dairy cattle breeds for Meru conditions', 'dairy', 'beginner', 3, ARRAY['Identify suitable dairy breeds', 'Understand breed characteristics', 'Make informed selection decisions']),
('Milk Quality Management', 'Ensuring high milk quality from farm to market', 'dairy', 'intermediate', 4, ARRAY['Implement quality control measures', 'Understand milk testing', 'Meet market standards']),

-- Irish Potato modules
('Irish Potato Seed Selection', 'Selecting and preparing quality potato seeds', 'irish_potato', 'beginner', 2, ARRAY['Select quality seed potatoes', 'Understand seed preparation', 'Plan planting schedule']),
('Potato Storage and Marketing', 'Proper storage and marketing of potatoes', 'irish_potato', 'intermediate', 3, ARRAY['Implement proper storage techniques', 'Understand market requirements', 'Maximize profits']),

-- Coffee modules
('Coffee Nursery Establishment', 'Setting up coffee nurseries for quality seedlings', 'coffee', 'beginner', 3, ARRAY['Establish coffee nursery', 'Manage seedling production', 'Ensure quality standards']),
('Coffee Processing Methods', 'Various methods of processing coffee beans', 'coffee', 'advanced', 5, ARRAY['Master wet processing', 'Understand dry processing', 'Achieve quality standards']);
