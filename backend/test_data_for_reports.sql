-- =====================================================
-- TEST DATA FOR REPORTING MODULE
-- This script adds comprehensive test data for all 7 admin reports
-- =====================================================

-- Clean existing test data (optional - comment out if you want to keep existing data)
-- DELETE FROM attendance WHERE mentee_id IN (SELECT id FROM public.user WHERE email LIKE '%test%');
-- DELETE FROM class_resources;
-- DELETE FROM learning_resources;
-- DELETE FROM enrollments;
-- DELETE FROM classes;
-- DELETE FROM subjects;
-- DELETE FROM user_roles WHERE user_id IN (SELECT id FROM public.user WHERE email LIKE '%test%');
-- DELETE FROM public.user WHERE email LIKE '%test%';

-- =====================================================
-- 1. INSERT TEST SUBJECTS (15 subjects)
-- =====================================================
INSERT INTO subjects (subject_id, subject_name, description, created_at) VALUES
('SUBJ001', 'Advanced Mathematics', 'Calculus, Linear Algebra, and Statistics', NOW()),
('SUBJ002', 'Computer Science Fundamentals', 'Data Structures, Algorithms, Programming', NOW()),
('SUBJ003', 'Physics', 'Mechanics, Thermodynamics, Electromagnetism', NOW()),
('SUBJ004', 'Chemistry', 'Organic Chemistry, Inorganic Chemistry', NOW()),
('SUBJ005', 'English Literature', 'Poetry, Prose, Drama Analysis', NOW()),
('SUBJ006', 'Data Science', 'Machine Learning, Data Analysis, Python', NOW()),
('SUBJ007', 'Web Development', 'HTML, CSS, JavaScript, React', NOW()),
('SUBJ008', 'Database Management', 'SQL, NoSQL, Database Design', NOW()),
('SUBJ009', 'Business Analytics', 'Excel, Tableau, Business Intelligence', NOW()),
('SUBJ010', 'Digital Marketing', 'SEO, Social Media, Content Marketing', NOW()),
('SUBJ011', 'Graphic Design', 'Photoshop, Illustrator, Design Principles', NOW()),
('SUBJ012', 'Mobile App Development', 'iOS, Android, Flutter', NOW()),
('SUBJ013', 'Cybersecurity', 'Network Security, Ethical Hacking', NOW()),
('SUBJ014', 'Cloud Computing', 'AWS, Azure, DevOps', NOW()),
('SUBJ015', 'Artificial Intelligence', 'Neural Networks, Deep Learning', NOW())
ON CONFLICT (subject_id) DO NOTHING;

-- =====================================================
-- 2. INSERT TEST USERS (30+ users: mentees, tutors, admins)
-- =====================================================

-- Insert 15 Mentees
INSERT INTO public.user (email, password_hash, full_name, phone, bio, faculty, created_at) VALUES
('mentee1@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'Alice Johnson', '555-0101', 'Computer Science major interested in AI', 'Engineering', NOW() - INTERVAL '6 months'),
('mentee2@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'Bob Smith', '555-0102', 'Mathematics enthusiast', 'Science', NOW() - INTERVAL '5 months'),
('mentee3@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'Carol Davis', '555-0103', 'Physics major with scholarship', 'Science', NOW() - INTERVAL '4 months'),
('mentee4@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'David Wilson', '555-0104', 'Web development learner', 'Engineering', NOW() - INTERVAL '3 months'),
('mentee5@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'Emma Brown', '555-0105', 'Data science student', 'Engineering', NOW() - INTERVAL '4 months'),
('mentee6@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'Frank Miller', '555-0106', 'Business analytics major', 'Business', NOW() - INTERVAL '5 months'),
('mentee7@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'Grace Lee', '555-0107', 'Chemistry student with high GPA', 'Science', NOW() - INTERVAL '6 months'),
('mentee8@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'Henry Taylor', '555-0108', 'English literature major', 'Arts', NOW() - INTERVAL '3 months'),
('mentee9@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'Ivy Anderson', '555-0109', 'Graphic design student', 'Arts', NOW() - INTERVAL '4 months'),
('mentee10@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'Jack Thomas', '555-0110', 'Mobile app development', 'Engineering', NOW() - INTERVAL '2 months'),
('mentee11@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'Karen Martinez', '555-0111', 'Cybersecurity enthusiast', 'Engineering', NOW() - INTERVAL '5 months'),
('mentee12@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'Liam Garcia', '555-0112', 'Cloud computing student', 'Engineering', NOW() - INTERVAL '3 months'),
('mentee13@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'Mia Rodriguez', '555-0113', 'AI and ML passionate', 'Engineering', NOW() - INTERVAL '6 months'),
('mentee14@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'Noah White', '555-0114', 'Digital marketing student', 'Business', NOW() - INTERVAL '4 months'),
('mentee15@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'Olivia Harris', '555-0115', 'Database management learner', 'Engineering', NOW() - INTERVAL '5 months')
ON CONFLICT (email) DO NOTHING;

-- Insert 10 Tutors
INSERT INTO public.user (email, password_hash, full_name, phone, bio, faculty, created_at) VALUES
('tutor1@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'Dr. Sarah Chen', '555-0201', 'PhD in Computer Science, 10 years teaching experience', 'Engineering', NOW() - INTERVAL '2 years'),
('tutor2@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'Prof. Michael Brown', '555-0202', 'Mathematics expert, Former university professor', 'Science', NOW() - INTERVAL '3 years'),
('tutor3@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'Dr. Emily Parker', '555-0203', 'Physics PhD, Research experience', 'Science', NOW() - INTERVAL '1 year'),
('tutor4@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'James Wilson', '555-0204', 'Full-stack developer, Web dev instructor', 'Engineering', NOW() - INTERVAL '2 years'),
('tutor5@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'Dr. Linda Martinez', '555-0205', 'Data scientist, ML specialist', 'Engineering', NOW() - INTERVAL '1 year'),
('tutor6@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'Robert Taylor', '555-0206', 'Business analytics consultant', 'Business', NOW() - INTERVAL '2 years'),
('tutor7@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'Dr. Jessica Lee', '555-0207', 'Chemistry professor, Research publications', 'Science', NOW() - INTERVAL '3 years'),
('tutor8@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'David Anderson', '555-0208', 'Certified ethical hacker, Security expert', 'Engineering', NOW() - INTERVAL '1 year'),
('tutor9@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'Sophie Turner', '555-0209', 'AWS certified cloud architect', 'Engineering', NOW() - INTERVAL '2 years'),
('tutor10@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7eTVgXpqxq', 'Mark Johnson', '555-0210', 'AI researcher, Deep learning expert', 'Engineering', NOW() - INTERVAL '1 year')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 3. ASSIGN ROLES TO USERS
-- =====================================================

-- Assign mentee role to mentees
INSERT INTO user_roles (user_id, role)
SELECT id, 'mentee'::user_role_enum FROM public.user WHERE email LIKE 'mentee%@test.com'
ON CONFLICT DO NOTHING;

-- Assign tutor role to tutors
INSERT INTO user_roles (user_id, role)
SELECT id, 'tutor'::user_role_enum FROM public.user WHERE email LIKE 'tutor%@test.com'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. INSERT CLASSES (20+ classes across different subjects)
-- =====================================================

-- Helper: Get tutor IDs
DO $$
DECLARE
    tutor1_id UUID;
    tutor2_id UUID;
    tutor3_id UUID;
    tutor4_id UUID;
    tutor5_id UUID;
    tutor6_id UUID;
    tutor7_id UUID;
    tutor8_id UUID;
    tutor9_id UUID;
    tutor10_id UUID;
BEGIN
    -- Get tutor IDs
    SELECT id INTO tutor1_id FROM public.user WHERE email = 'tutor1@test.com';
    SELECT id INTO tutor2_id FROM public.user WHERE email = 'tutor2@test.com';
    SELECT id INTO tutor3_id FROM public.user WHERE email = 'tutor3@test.com';
    SELECT id INTO tutor4_id FROM public.user WHERE email = 'tutor4@test.com';
    SELECT id INTO tutor5_id FROM public.user WHERE email = 'tutor5@test.com';
    SELECT id INTO tutor6_id FROM public.user WHERE email = 'tutor6@test.com';
    SELECT id INTO tutor7_id FROM public.user WHERE email = 'tutor7@test.com';
    SELECT id INTO tutor8_id FROM public.user WHERE email = 'tutor8@test.com';
    SELECT id INTO tutor9_id FROM public.user WHERE email = 'tutor9@test.com';
    SELECT id INTO tutor10_id FROM public.user WHERE email = 'tutor10@test.com';

    -- Insert classes
    INSERT INTO classes (class_code, subject_id, tutor_id, week_day, period, room_id, max_students, created_at) VALUES
    -- Tutor 1 - Dr. Sarah Chen (CS)
    ('CS101-A', 'SUBJ002', tutor1_id, 'Monday', 1, 'R101', 25, NOW() - INTERVAL '3 months'),
    ('CS101-B', 'SUBJ002', tutor1_id, 'Wednesday', 2, 'R101', 25, NOW() - INTERVAL '3 months'),
    ('DS201', 'SUBJ006', tutor1_id, 'Friday', 3, 'R102', 20, NOW() - INTERVAL '2 months'),
    
    -- Tutor 2 - Prof. Michael Brown (Math)
    ('MATH101-A', 'SUBJ001', tutor2_id, 'Monday', 2, 'R201', 30, NOW() - INTERVAL '4 months'),
    ('MATH101-B', 'SUBJ001', tutor2_id, 'Thursday', 1, 'R201', 30, NOW() - INTERVAL '4 months'),
    
    -- Tutor 3 - Dr. Emily Parker (Physics)
    ('PHYS101', 'SUBJ003', tutor3_id, 'Tuesday', 1, 'R301', 25, NOW() - INTERVAL '3 months'),
    ('PHYS201', 'SUBJ003', tutor3_id, 'Thursday', 3, 'R301', 20, NOW() - INTERVAL '2 months'),
    
    -- Tutor 4 - James Wilson (Web Dev)
    ('WEB101', 'SUBJ007', tutor4_id, 'Monday', 3, 'R102', 20, NOW() - INTERVAL '3 months'),
    ('WEB201', 'SUBJ007', tutor4_id, 'Wednesday', 1, 'R102', 18, NOW() - INTERVAL '2 months'),
    
    -- Tutor 5 - Dr. Linda Martinez (Data Science)
    ('DS101', 'SUBJ006', tutor5_id, 'Tuesday', 2, 'R103', 22, NOW() - INTERVAL '3 months'),
    ('AI101', 'SUBJ015', tutor5_id, 'Friday', 1, 'R103', 18, NOW() - INTERVAL '2 months'),
    
    -- Tutor 6 - Robert Taylor (Business Analytics)
    ('BA101', 'SUBJ009', tutor6_id, 'Wednesday', 3, 'R104', 25, NOW() - INTERVAL '3 months'),
    ('BA201', 'SUBJ009', tutor6_id, 'Friday', 2, 'R104', 20, NOW() - INTERVAL '2 months'),
    
    -- Tutor 7 - Dr. Jessica Lee (Chemistry)
    ('CHEM101', 'SUBJ004', tutor7_id, 'Monday', 1, 'R401', 25, NOW() - INTERVAL '4 months'),
    ('CHEM201', 'SUBJ004', tutor7_id, 'Thursday', 2, 'R401', 20, NOW() - INTERVAL '3 months'),
    
    -- Tutor 8 - David Anderson (Cybersecurity)
    ('SEC101', 'SUBJ013', tutor8_id, 'Tuesday', 3, 'R105', 20, NOW() - INTERVAL '3 months'),
    
    -- Tutor 9 - Sophie Turner (Cloud)
    ('CLOUD101', 'SUBJ014', tutor9_id, 'Wednesday', 2, 'R106', 22, NOW() - INTERVAL '3 months'),
    ('CLOUD201', 'SUBJ014', tutor9_id, 'Friday', 3, 'R106', 18, NOW() - INTERVAL '2 months'),
    
    -- Tutor 10 - Mark Johnson (AI)
    ('AI201', 'SUBJ015', tutor10_id, 'Thursday', 1, 'R107', 20, NOW() - INTERVAL '2 months'),
    ('AI301', 'SUBJ015', tutor10_id, 'Tuesday', 2, 'R107', 15, NOW() - INTERVAL '1 month')
    ON CONFLICT DO NOTHING;
END $$;

-- =====================================================
-- 5. INSERT ENROLLMENTS (Students enrolled in classes)
-- =====================================================

DO $$
DECLARE
    mentee_rec RECORD;
    class_rec RECORD;
    enroll_count INTEGER;
BEGIN
    -- Enroll each mentee in 3-5 random classes
    FOR mentee_rec IN SELECT id FROM public.user WHERE email LIKE 'mentee%@test.com' LOOP
        enroll_count := 0;
        FOR class_rec IN 
            SELECT id FROM classes ORDER BY RANDOM() LIMIT (3 + FLOOR(RANDOM() * 3)::INTEGER)
        LOOP
            INSERT INTO enrollments (mentee_id, class_id, enrolled_at, status)
            VALUES (
                mentee_rec.id,
                class_rec.id,
                NOW() - (RANDOM() * INTERVAL '90 days'),
                CASE WHEN RANDOM() > 0.2 THEN 'active'::enrollment_status_enum ELSE 'completed'::enrollment_status_enum END
            )
            ON CONFLICT DO NOTHING;
            enroll_count := enroll_count + 1;
        END LOOP;
    END LOOP;
END $$;

-- =====================================================
-- 6. INSERT ATTENDANCE RECORDS (High participation)
-- =====================================================

DO $$
DECLARE
    enrollment_rec RECORD;
    attendance_count INTEGER;
    i INTEGER;
BEGIN
    -- Create 10-20 attendance records per enrollment
    FOR enrollment_rec IN SELECT mentee_id, class_id FROM enrollments LOOP
        attendance_count := 10 + FLOOR(RANDOM() * 11)::INTEGER;
        
        FOR i IN 1..attendance_count LOOP
            INSERT INTO attendance (mentee_id, class_id, attendance_mark, date)
            VALUES (
                enrollment_rec.mentee_id,
                enrollment_rec.class_id,
                RANDOM() > 0.15, -- 85% attendance rate
                NOW() - (RANDOM() * INTERVAL '60 days')
            )
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- =====================================================
-- 7. INSERT LEARNING RESOURCES (15+ resources)
-- =====================================================

INSERT INTO learning_resources (title, description, file_type, file_size, file_url, created_at) VALUES
('Introduction to Python Programming', 'Comprehensive Python guide for beginners', 'PDF', 2500000, 'https://example.com/python-intro.pdf', NOW() - INTERVAL '4 months'),
('Data Structures Cheat Sheet', 'Quick reference for common data structures', 'PDF', 1200000, 'https://example.com/ds-cheatsheet.pdf', NOW() - INTERVAL '3 months'),
('Calculus Formula Reference', 'Essential calculus formulas and examples', 'PDF', 1800000, 'https://example.com/calculus-ref.pdf', NOW() - INTERVAL '5 months'),
('Web Development Tutorial Videos', 'Complete HTML/CSS/JS video series', 'VIDEO', 15000000, 'https://example.com/webdev-videos.mp4', NOW() - INTERVAL '2 months'),
('Machine Learning Basics', 'Introduction to ML algorithms', 'PDF', 3200000, 'https://example.com/ml-basics.pdf', NOW() - INTERVAL '3 months'),
('SQL Database Guide', 'Comprehensive SQL tutorial with examples', 'PDF', 2100000, 'https://example.com/sql-guide.pdf', NOW() - INTERVAL '4 months'),
('Physics Lab Manual', 'Practical experiments and procedures', 'PDF', 4500000, 'https://example.com/physics-lab.pdf', NOW() - INTERVAL '3 months'),
('Chemistry Periodic Table', 'Interactive periodic table reference', 'IMAGE', 800000, 'https://example.com/periodic-table.png', NOW() - INTERVAL '6 months'),
('Business Analytics Case Studies', 'Real-world BA examples', 'PDF', 3500000, 'https://example.com/ba-cases.pdf', NOW() - INTERVAL '2 months'),
('React.js Complete Guide', 'Modern React development tutorial', 'PDF', 2800000, 'https://example.com/react-guide.pdf', NOW() - INTERVAL '1 month'),
('Cloud Computing Fundamentals', 'AWS and Azure basics', 'PDF', 3100000, 'https://example.com/cloud-fundamentals.pdf', NOW() - INTERVAL '3 months'),
('Cybersecurity Best Practices', 'Security principles and tools', 'PDF', 2400000, 'https://example.com/security-bp.pdf', NOW() - INTERVAL '2 months'),
('AI Neural Networks Explained', 'Deep learning architecture guide', 'PDF', 4200000, 'https://example.com/neural-nets.pdf', NOW() - INTERVAL '1 month'),
('Mobile App Design Patterns', 'iOS and Android UI/UX patterns', 'PDF', 2900000, 'https://example.com/mobile-patterns.pdf', NOW() - INTERVAL '2 months'),
('Digital Marketing Strategy', 'SEO and social media marketing', 'PDF', 2200000, 'https://example.com/marketing-strategy.pdf', NOW() - INTERVAL '3 months'),
('Database Normalization Guide', 'Database design principles', 'PDF', 1500000, 'https://example.com/db-normalization.pdf', NOW() - INTERVAL '4 months')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. LINK RESOURCES TO CLASSES
-- =====================================================

DO $$
DECLARE
    class_rec RECORD;
    resource_rec RECORD;
    link_count INTEGER;
BEGIN
    -- Link 3-6 resources to each class
    FOR class_rec IN SELECT id FROM classes LOOP
        link_count := 0;
        FOR resource_rec IN 
            SELECT id FROM learning_resources ORDER BY RANDOM() LIMIT (3 + FLOOR(RANDOM() * 4)::INTEGER)
        LOOP
            INSERT INTO class_resources (class_id, resource_id)
            VALUES (class_rec.id, resource_rec.id)
            ON CONFLICT DO NOTHING;
            link_count := link_count + 1;
        END LOOP;
    END LOOP;
END $$;

-- =====================================================
-- 9. UPDATE USER STATISTICS FOR SCHOLARSHIP ELIGIBILITY
-- =====================================================

-- Update some mentees to have high GPA and attendance for scholarship eligibility
DO $$
DECLARE
    mentee_id UUID;
    total_attended INTEGER;
    total_sessions INTEGER;
    attendance_rate DECIMAL;
BEGIN
    -- Select top performing mentees (mentee1, mentee3, mentee5, mentee7, mentee9, mentee11, mentee13)
    FOR mentee_id IN 
        SELECT id FROM public.user WHERE email IN (
            'mentee1@test.com', 'mentee3@test.com', 'mentee5@test.com', 
            'mentee7@test.com', 'mentee9@test.com', 'mentee11@test.com', 
            'mentee13@test.com'
        )
    LOOP
        -- Calculate actual attendance rate
        SELECT 
            COUNT(*) FILTER (WHERE attendance_mark = true),
            COUNT(*)
        INTO total_attended, total_sessions
        FROM attendance
        WHERE attendance.mentee_id = mentee_id;
        
        IF total_sessions > 0 THEN
            attendance_rate := (total_attended::DECIMAL / total_sessions) * 100;
            
            -- These are high-performing students
            RAISE NOTICE 'Mentee % has attendance rate: %', mentee_id, attendance_rate;
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check inserted data counts
SELECT 'Subjects' as entity, COUNT(*) as count FROM subjects
UNION ALL
SELECT 'Users', COUNT(*) FROM public.user WHERE email LIKE '%test.com'
UNION ALL
SELECT 'Mentees', COUNT(*) FROM public.user WHERE email LIKE 'mentee%@test.com'
UNION ALL
SELECT 'Tutors', COUNT(*) FROM public.user WHERE email LIKE 'tutor%@test.com'
UNION ALL
SELECT 'User Roles', COUNT(*) FROM user_roles WHERE user_id IN (SELECT id FROM public.user WHERE email LIKE '%test.com')
UNION ALL
SELECT 'Classes', COUNT(*) FROM classes WHERE tutor_id IN (SELECT id FROM public.user WHERE email LIKE 'tutor%@test.com')
UNION ALL
SELECT 'Enrollments', COUNT(*) FROM enrollments
UNION ALL
SELECT 'Attendance Records', COUNT(*) FROM attendance
UNION ALL
SELECT 'Learning Resources', COUNT(*) FROM learning_resources
UNION ALL
SELECT 'Class Resources Links', COUNT(*) FROM class_resources;

-- Sample queries to verify report data

-- Course Analytics Preview
SELECT 
    s.subject_name,
    c.class_code,
    COUNT(DISTINCT e.mentee_id) as enrollments,
    COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.mentee_id END) as active_enrollments,
    ROUND(AVG(CASE WHEN a.attendance_mark THEN 100.0 ELSE 0 END), 0) as avg_attendance_rate
FROM classes c
JOIN subjects s ON c.subject_id = s.subject_id
LEFT JOIN enrollments e ON c.id = e.class_id
LEFT JOIN attendance a ON c.id = a.class_id
WHERE c.tutor_id IN (SELECT id FROM public.user WHERE email LIKE 'tutor%@test.com')
GROUP BY s.subject_name, c.class_code
ORDER BY enrollments DESC
LIMIT 10;

-- Resource Usage Preview
SELECT 
    lr.title,
    lr.file_type,
    COUNT(DISTINCT cr.class_id) as classes_using,
    lr.created_at::date
FROM learning_resources lr
LEFT JOIN class_resources cr ON lr.id = cr.resource_id
GROUP BY lr.id, lr.title, lr.file_type, lr.created_at
ORDER BY classes_using DESC
LIMIT 10;

-- Participation Preview
SELECT 
    u.full_name,
    COUNT(CASE WHEN a.attendance_mark = true THEN 1 END) as sessions_attended,
    COUNT(a.id) as total_sessions,
    ROUND((COUNT(CASE WHEN a.attendance_mark = true THEN 1 END)::DECIMAL / NULLIF(COUNT(a.id), 0)) * 100, 0) as attendance_rate
FROM public.user u
JOIN attendance a ON u.id = a.mentee_id
WHERE u.email LIKE 'mentee%@test.com'
GROUP BY u.id, u.full_name
ORDER BY attendance_rate DESC
LIMIT 10;

COMMIT;
