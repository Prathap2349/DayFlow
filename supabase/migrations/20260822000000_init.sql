-- supabase/migrations/20260822000000_init.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_code TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT,
    address TEXT,
    profile_picture_url TEXT,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    job_title TEXT,
    employment_type TEXT CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Intern')),
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    work_location TEXT,
    employment_status TEXT CHECK (employment_status IN ('Active', 'On Leave', 'Absent', 'Inactive')) DEFAULT 'Active',
    basic_salary NUMERIC NOT NULL DEFAULT 0,
    hra NUMERIC NOT NULL DEFAULT 0,
    special_allowance NUMERIC NOT NULL DEFAULT 0,
    other_allowances NUMERIC NOT NULL DEFAULT 0,
    pf_deduction NUMERIC NOT NULL DEFAULT 0,
    tax_deduction NUMERIC NOT NULL DEFAULT 0,
    other_deductions NUMERIC NOT NULL DEFAULT 0,
    net_salary NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('employee', 'hr', 'admin')) DEFAULT 'employee',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    working_minutes INTEGER DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'half_day', 'leave')) DEFAULT 'present',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_employee_date UNIQUE (employee_id, attendance_date)
);

-- Create Leave Requests Table
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL CHECK (leave_type IN ('paid', 'sick', 'unpaid')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    number_of_days NUMERIC NOT NULL DEFAULT 0,
    reason TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    review_comment TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    CONSTRAINT check_dates CHECK (end_date >= start_date)
);

-- Create Payroll Records Table
CREATE TABLE IF NOT EXISTS public.payroll_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    payment_date DATE,
    basic_salary NUMERIC NOT NULL DEFAULT 0,
    hra NUMERIC NOT NULL DEFAULT 0,
    special_allowance NUMERIC NOT NULL DEFAULT 0,
    other_earnings NUMERIC NOT NULL DEFAULT 0,
    pf_deduction NUMERIC NOT NULL DEFAULT 0,
    tax_deduction NUMERIC NOT NULL DEFAULT 0,
    other_deductions NUMERIC NOT NULL DEFAULT 0,
    gross_salary NUMERIC NOT NULL DEFAULT 0,
    total_deductions NUMERIC NOT NULL DEFAULT 0,
    net_salary NUMERIC NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL CHECK (payment_status IN ('Paid', 'Processing', 'Pending')) DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Employee Documents Table
CREATE TABLE IF NOT EXISTS public.employee_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    document_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR HIGH-PERFORMANCE QUERIES
CREATE INDEX IF NOT EXISTS idx_employees_code ON public.employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_dept ON public.employees(department_id);
CREATE INDEX IF NOT EXISTS idx_profiles_employee_id ON public.profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_emp_date ON public.attendance(employee_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_emp ON public.leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_payroll_records_emp ON public.payroll_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is an admin or hr
CREATE OR REPLACE FUNCTION public.is_admin_or_hr()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'hr' OR role = 'admin')
  );
END;
$$ LANGUAGE plpgsql;

-- Profiles Policies
CREATE POLICY "Allow public read profile details"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin_or_hr());

CREATE POLICY "Allow profiles update by owners and HR"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin_or_hr());

-- Departments Policies
CREATE POLICY "Allow authenticated read departments"
    ON public.departments FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow department edits by admin/hr only"
    ON public.departments FOR ALL
    USING (public.is_admin_or_hr());

-- Employees Policies
CREATE POLICY "Allow select own employee record or by admin/hr"
    ON public.employees FOR SELECT
    USING (
        id IN (SELECT employee_id FROM public.profiles WHERE id = auth.uid())
        OR public.is_admin_or_hr()
    );

CREATE POLICY "Allow insert and update employees by admin/hr only"
    ON public.employees FOR ALL
    USING (public.is_admin_or_hr());

-- Attendance Policies
CREATE POLICY "Allow select own attendance or by admin/hr"
    ON public.attendance FOR SELECT
    USING (
        employee_id IN (SELECT employee_id FROM public.profiles WHERE id = auth.uid())
        OR public.is_admin_or_hr()
    );

CREATE POLICY "Allow employee check-in/out and HR edits"
    ON public.attendance FOR ALL
    USING (
        employee_id IN (SELECT employee_id FROM public.profiles WHERE id = auth.uid())
        OR public.is_admin_or_hr()
    );

-- Leave Requests Policies
CREATE POLICY "Allow select own leave requests or by admin/hr"
    ON public.leave_requests FOR SELECT
    USING (
        employee_id IN (SELECT employee_id FROM public.profiles WHERE id = auth.uid())
        OR public.is_admin_or_hr()
    );

CREATE POLICY "Allow create own leave requests or HR edits"
    ON public.leave_requests FOR ALL
    USING (
        employee_id IN (SELECT employee_id FROM public.profiles WHERE id = auth.uid())
        OR public.is_admin_or_hr()
    );

-- Payroll Records Policies
CREATE POLICY "Allow select own payroll or by admin/hr"
    ON public.payroll_records FOR SELECT
    USING (
        employee_id IN (SELECT employee_id FROM public.profiles WHERE id = auth.uid())
        OR public.is_admin_or_hr()
    );

CREATE POLICY "Allow payroll edits by admin/hr only"
    ON public.payroll_records FOR ALL
    USING (public.is_admin_or_hr());

-- Notifications Policies
CREATE POLICY "Allow select own notifications and global notices"
    ON public.notifications FOR SELECT
    USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Allow delete/update own notifications"
    ON public.notifications FOR ALL
    USING (user_id = auth.uid());

-- Employee Documents Policies
CREATE POLICY "Allow select own documents or by admin/hr"
    ON public.employee_documents FOR SELECT
    USING (
        employee_id IN (SELECT employee_id FROM public.profiles WHERE id = auth.uid())
        OR public.is_admin_or_hr()
    );

CREATE POLICY "Allow document edits by own employee or admin/hr"
    ON public.employee_documents FOR ALL
    USING (
        employee_id IN (SELECT employee_id FROM public.profiles WHERE id = auth.uid())
        OR public.is_admin_or_hr()
    );

-- Audit Logs Policies
CREATE POLICY "Allow audit select by admin/hr only"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin_or_hr());

-- Trigger to automatically create a profile record when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER SECURITY DEFINER AS $$
DECLARE
    role_var TEXT := 'employee';
    emp_id_var UUID := NULL;
BEGIN
    -- Set role based on email context
    IF NEW.email = 'hr@dayflow.demo' THEN
        role_var := 'hr';
    ELSIF NEW.email = 'employee@dayflow.demo' THEN
        role_var := 'employee';
    END IF;

    -- Look up if this email is already registered in our employees table
    SELECT id INTO emp_id_var FROM public.employees WHERE email = NEW.email;

    INSERT INTO public.profiles (id, employee_id, full_name, email, role)
    VALUES (
        NEW.id,
        emp_id_var,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        role_var
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =======================================================
-- INITIAL SEED DATA FOR DAYFLOW DEMO WORKFORCE
-- =======================================================

-- 1. Departments
INSERT INTO public.departments (name, description) VALUES
    ('Engineering', 'Software engineering, platform architecture, devops'),
    ('Human Resources', 'People management, talent acquisition, HR compliance'),
    ('Marketing', 'Brand growth, digital campaigns, public relations'),
    ('Finance', 'Financial planning, accounting, payroll management'),
    ('Operations', 'Workflow optimization, office management, IT support')
ON CONFLICT (name) DO NOTHING;

-- 2. Initial Employees
INSERT INTO public.employees (
    employee_code, first_name, last_name, email, phone, job_title,
    employment_type, joining_date, employment_status, basic_salary, hra, special_allowance, pf_deduction, tax_deduction, net_salary
) VALUES
    ('EMP001', 'Arjun', 'Sharma', 'employee@dayflow.demo', '+91 98765 43210', 'Senior Full Stack Engineer', 'Full-time', '2023-01-15', 'Active', 50000, 20000, 15000, 6000, 4000, 75000),
    ('EMP002', 'Priya', 'Verma', 'priya.v@dayflow.demo', '+91 98765 43211', 'Lead UI/UX Designer', 'Full-time', '2023-03-01', 'Active', 45000, 18000, 12000, 5400, 3600, 66000),
    ('EMP003', 'Rahul', 'Nair', 'rahul.n@dayflow.demo', '+91 98765 43212', 'DevOps & Cloud Engineer', 'Full-time', '2022-11-10', 'Active', 55000, 22000, 16000, 6600, 4400, 82000),
    ('EMP004', 'Ananya', 'Gupta', 'hr@dayflow.demo', '+91 98765 43213', 'HR Operations Lead', 'Full-time', '2022-06-15', 'Active', 60000, 24000, 18000, 7200, 4800, 90000),
    ('EMP005', 'Vikram', 'Singh', 'vikram.s@dayflow.demo', '+91 98765 43214', 'Senior Product Manager', 'Full-time', '2023-05-20', 'On Leave', 65000, 26000, 19000, 7800, 5200, 97000)
-- Office Locations Table for Network IP & Geofencing
CREATE TABLE IF NOT EXISTS public.office_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    allowed_ip_addresses TEXT[] NOT NULL DEFAULT '{}',
    latitude NUMERIC,
    longitude NUMERIC,
    radius_meters NUMERIC DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Work Mode & WFH Exception Columns
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS work_mode TEXT CHECK (work_mode IN ('Office', 'Remote', 'Hybrid')) DEFAULT 'Office',
ADD COLUMN IF NOT EXISTS wfh_exception_active BOOLEAN DEFAULT FALSE;

-- Attendance Verification Columns
ALTER TABLE public.attendance
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS is_verified_location BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_method TEXT CHECK (verification_method IN ('office_wifi', 'wfh_exception', 'remote_allowed', 'geo_location', 'manual_override'));

ALTER TABLE public.office_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read office locations" ON public.office_locations FOR SELECT USING (true);
CREATE POLICY "Allow edit office locations by admin/hr" ON public.office_locations FOR ALL USING (public.is_admin_or_hr());

-- Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT CHECK (category IN ('General', 'Urgent', 'Event', 'Policy')) DEFAULT 'General',
    is_pinned BOOLEAN DEFAULT FALSE,
    target_department TEXT DEFAULT 'All',
    author_name TEXT DEFAULT 'HR Team',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Allow edit announcements by admin/hr" ON public.announcements FOR ALL USING (public.is_admin_or_hr());

-- Seed Sample Broadcast Announcements
INSERT INTO public.announcements (title, content, category, is_pinned, author_name) VALUES
    ('Annual Townhall Meeting & Q3 Strategy Presentation', 'Join us this Friday at 3:00 PM for our virtual Townhall. Executive leadership will share product roadmap updates and celebrate team accomplishments!', 'Event', true, 'Ananya Gupta (HR Lead)'),
    ('Updated Remote Work & Wi-Fi Check-in Policy', 'Please ensure you are connected to an approved Office Wi-Fi network when punching in for office days. Contact HR for WFH exception overrides.', 'Policy', true, 'Ananya Gupta (HR Lead)'),
    ('Q3 Wellness Allowance Claim Submission Deadline', 'Friendly reminder to submit your fitness and wellness expense claims before the end of the month to receive reimbursement in this payroll cycle.', 'General', false, 'Finance Team')
ON CONFLICT DO NOTHING;



