// Mock current user
export const mockCurrentUser = {
  id: '1',
  name: 'أحمد محمد علي',
  phone: '07901234567'
};

// Mock statistics
export const mockStats = {
  totalVoters: 15847,
  activeMonitors: 24,
  todayReports: 12,
  totalSalaries: 48500000
};

// Mock voting centers
export const mockVotingCenters = [
  {
    id: '1',
    name: 'مدرسة الأمل الابتدائية',
    address: 'حي الكرادة، شارع الكرادة داخل، بناية رقم 15',
    province: 'بغداد',
    gps_lat: 33.3152,
    gps_long: 44.3661,
    monitor_id: '1',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'مدرسة النور المتوسطة',
    address: 'حي الجادرية، شارع الجامعة، مجمع الكليات',
    province: 'بغداد',
    gps_lat: 33.2778,
    gps_long: 44.3661,
    monitor_id: '2',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'مدرسة الفرات الثانوية',
    address: 'حي الدورة، الشارع الرئيسي، قرب الجامع الكبير',
    province: 'بغداد',
    gps_lat: 33.2500,
    gps_long: 44.3000,
    monitor_id: null,
    status: 'inactive',
    created_at: '2024-01-01T00:00:00Z'
  }
];

// Mock monitors
export const mockMonitors = [
  {
    id: '1',
    first_name: 'محمد',
    last_name: 'أحمد الكريم',
    phone: '07901111111',
    address: 'حي الكرادة، شارع أبو نواس',
    gps_home_lat: 33.3100,
    gps_home_long: 44.3600,
    salary: 2500000,
    gps_status: 'active',
    assigned_center: 'مدرسة الأمل الابتدائية',
    region: 'بغداد - الكرخ',
    status: 'active'
  },
  {
    id: '2',
    first_name: 'فاطمة',
    last_name: 'علي حسن',
    phone: '07902222222',
    address: 'حي الجادرية، شارع الجامعة',
    gps_home_lat: 33.2800,
    gps_home_long: 44.3700,
    salary: 2300000,
    gps_status: 'inactive',
    assigned_center: 'مدرسة النور المتوسطة',
    region: 'بغداد - الرصافة',
    status: 'active'
  },
  {
    id: '3',
    first_name: 'عبد الله',
    last_name: 'محمد صالح',
    phone: '07903333333',
    address: 'حي الكاظمية، شارع الإمام موسى الكاظم',
    gps_home_lat: 33.3800,
    gps_home_long: 44.3400,
    salary: 2400000,
    gps_status: 'active',
    assigned_center: 'غير مخصص',
    region: 'بغداد - الكرخ',
    status: 'active'
  }
];

// Mock voters
export const mockVoters = [
  {
    id: '1',
    first_name: 'أحمد',
    last_name: 'محمد علي',
    mother_name: 'فاطمة حسن',
    dob: '1985-03-15',
    address: 'حي الكرادة، شارع أبو نواس، بناية رقم 25، الطابق الثالث',
    phone: '07901234567',
    education: 'بكالوريوس',
    job: 'مهندس',
    unemployed: false,
    region: 'بغداد - الكرخ',
    documents: {
      id_card: true
    },
    vote_proof: {
      image: true
    },
    family_members: [
      {
        name: 'زينب أحمد محمد',
        relation: 'الزوجة',
        education: 'بكالوريوس',
        job: 'مدرسة'
      },
      {
        name: 'محمد أحمد علي',
        relation: 'الابن',
        education: 'متوسطة',
        job: 'طالب'
      }
    ]
  },
  {
    id: '2',
    first_name: 'سارة',
    last_name: 'علي حسن',
    mother_name: 'مريم أحمد',
    dob: '1990-07-22',
    address: 'حي الجادرية، شارع الجامعة، مجمع السكن الطلابي',
    phone: '07902345678',
    education: 'ماجستير',
    job: 'طبيبة',
    unemployed: false,
    region: 'بغداد - الرصافة',
    documents: {
      id_card: true
    },
    vote_proof: {
      image: false
    },
    family_members: []
  },
  {
    id: '3',
    first_name: 'عبد الرحمن',
    last_name: 'صالح محمود',
    mother_name: 'خديجة علي',
    dob: '1978-12-10',
    address: 'حي الدورة، الشارع الرئيسي، بناية الأمل',
    phone: '07903456789',
    education: 'ثانوية',
    job: 'عامل',
    unemployed: true,
    region: 'بغداد - الكرخ',
    documents: {
      id_card: false
    },
    vote_proof: {
      image: false
    },
    family_members: [
      {
        name: 'أم كلثوم عبد الرحمن',
        relation: 'الزوجة',
        education: 'ابتدائية',
        job: 'ربة منزل'
      }
    ]
  }
];

// Mock salary data
export const mockSalaryData = [
  {
    id: '1',
    monitor_name: 'محمد أحمد الكريم',
    center_name: 'مدرسة الأمل الابتدائية',
    amount: 2500000,
    hours_worked: 180,
    gps_compliance: 95.5,
    deductions: 0,
    final_amount: 2500000,
    payment_status: 'paid',
    payment_date: '2024-01-31'
  },
  {
    id: '2',
    monitor_name: 'فاطمة علي حسن',
    center_name: 'مدرسة النور المتوسطة',
    amount: 2300000,
    hours_worked: 165,
    gps_compliance: 78.2,
    deductions: 230000,
    final_amount: 2070000,
    payment_status: 'pending',
    payment_date: null
  },
  {
    id: '3',
    monitor_name: 'عبد الله محمد صالح',
    center_name: 'غير مخصص',
    amount: 2400000,
    hours_worked: 172,
    gps_compliance: 88.7,
    deductions: 120000,
    final_amount: 2280000,
    payment_status: 'unpaid',
    payment_date: null
  }
];

// Mock notifications
export const mockNotifications = [
  {
    id: '1',
    title: 'تحديث مهم في النظام',
    message: 'تم إضافة ميزات جديدة لتتبع GPS. يرجى تحديث التطبيق للاستفادة من الميزات الجديدة.',
    type: 'important' as const,
    target_role: 'monitor',
    created_at: '2024-01-15T10:30:00Z',
    created_by: 'admin_1'
  },
  {
    id: '2',
    title: 'تذكير عاجل',
    message: 'يجب على جميع المراقبين تفعيل نظام GPS قبل بداية العمل اليوم.',
    type: 'urgent' as const,
    target_role: 'monitor',
    created_at: '2024-01-15T08:00:00Z',
    created_by: 'admin_1'
  },
  {
    id: '3',
    title: 'اجتماع دوري',
    message: 'اجتماع دوري لجميع مدراء المناطق يوم الأحد الساعة 10 صباحاً في المقر الرئيسي.',
    type: 'general' as const,
    target_role: 'admin',
    created_at: '2024-01-14T16:45:00Z',
    created_by: 'super_admin_1'
  },
  {
    id: '4',
    title: 'مشكلة تقنية محلولة',
    message: 'تم حل مشكلة بطء التطبيق التي كانت تؤثر على بعض المستخدمين.',
    type: 'general' as const,
    target_role: 'all',
    created_at: '2024-01-14T14:20:00Z',
    created_by: 'admin_1'
  }
];

// Mock reports
export const mockReports = [
  {
    id: '1',
    title: 'مشكلة في نظام الكهرباء',
    description: 'انقطاع متكرر في التيار الكهربائي يؤثر على عمل الأجهزة الإلكترونية في مركز الاقتراع. المولد الاحتياطي يعمل لكن بحاجة لصيانة.',
    monitor_name: 'محمد أحمد الكريم',
    center_name: 'مدرسة الأمل الابتدائية',
    region: 'بغداد - الكرخ',
    priority: 'high',
    status: 'new',
    media: ['power_issue_1.jpg', 'generator_photo.jpg'],
    created_at: '2024-01-15T11:30:00Z'
  },
  {
    id: '2',
    title: 'ازدحام في المركز',
    description: 'ازدحام شديد من الناخبين في الساعات الأولى من الصباح. نحتاج لتنظيم أفضل للطوابير وربما مراقب إضافي.',
    monitor_name: 'فاطمة علي حسن',
    center_name: 'مدرسة النور المتوسطة',
    region: 'بغداد - الرصافة',
    priority: 'medium',
    status: 'reviewed',
    media: ['crowd_photo.jpg'],
    created_at: '2024-01-15T09:15:00Z'
  },
  {
    id: '3',
    title: 'مشكلة في التطبيق',
    description: 'التطبيق يتوقف عن العمل عند محاولة رفع صور الناخبين. جربت إعادة تشغيل الهاتف لكن المشكلة مستمرة.',
    monitor_name: 'عبد الله محمد صالح',
    center_name: 'مدرسة الفرات الثانوية',
    region: 'بغداد - الكرخ',
    priority: 'critical',
    status: 'resolved',
    media: ['app_error_screenshot.jpg'],
    created_at: '2024-01-14T15:45:00Z'
  },
  {
    id: '4',
    title: 'نقص في المواد',
    description: 'نفدت أوراق التسجيل ونحتاج لإمدادات إضافية. أيضاً الأقلام بدأت تنفد.',
    monitor_name: 'محمد أحمد الكريم',
    center_name: 'مدرسة الأمل الابتدائية',
    region: 'بغداد - الكرخ',
    priority: 'medium',
    status: 'pending',
    media: [],
    created_at: '2024-01-14T13:20:00Z'
  }
];