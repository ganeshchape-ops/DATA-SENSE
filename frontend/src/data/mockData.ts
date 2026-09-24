import type {
  User, Dataset, DatasetProfile, DashboardOverviewResponse,
  ExploreQueryResponse, AIInsightsResponse
} from '../types';

export const MOCK_DEMO_USER: User = {
  id: 1,
  name: 'Ganesh Chape',
  email: 'ganesh@datasense.ai',
  role: 'admin',
  company: 'Enterprise AI Lab',
  is_active: true,
  is_verified: true,
  created_at: '2026-01-01T00:00:00Z',
};

export const MOCK_STUDENT_DATASET: Dataset = {
  id: 1,
  user_id: 1,
  name: 'Student Academic Performance 2026',
  original_filename: 'student_results.csv',
  file_type: 'csv',
  file_size: 1024,
  rows: 25,
  columns: 7,
  column_names: ['Student_ID', 'Name', 'Maths', 'Science', 'English', 'Computer', 'Attendance'],
  column_types: {
    'Student_ID': 'string',
    'Name': 'string',
    'Maths': 'numeric',
    'Science': 'numeric',
    'English': 'numeric',
    'Computer': 'numeric',
    'Attendance': 'numeric'
  },
  domain: 'student',
  domain_confidence: 0.98,
  domain_reason: 'Detected student identifiers, academic subject marks (Maths, Science, English, Computer), and attendance rate.',
  created_at: '2026-02-15T10:00:00Z',
  updated_at: '2026-02-15T10:00:00Z'
};

export const MOCK_ECOMMERCE_DATASET: Dataset = {
  id: 2,
  user_id: 1,
  name: 'Global E-Commerce Sales Trends',
  original_filename: 'ecommerce_sales.csv',
  file_type: 'csv',
  file_size: 2048,
  rows: 30,
  columns: 6,
  column_names: ['Order_ID', 'Category', 'Sales_Amount', 'Quantity', 'Discount', 'Profit_Margin'],
  column_types: {
    'Order_ID': 'string',
    'Category': 'string',
    'Sales_Amount': 'numeric',
    'Quantity': 'numeric',
    'Discount': 'numeric',
    'Profit_Margin': 'numeric'
  },
  domain: 'ecommerce',
  domain_confidence: 0.95,
  domain_reason: 'Identified transactions, sales revenue metrics, product categories, and order parameters.',
  created_at: '2026-02-10T12:00:00Z',
  updated_at: '2026-02-10T12:00:00Z'
};

export const MOCK_DATASETS_LIST: Dataset[] = [
  MOCK_STUDENT_DATASET,
  MOCK_ECOMMERCE_DATASET
];

export const MOCK_STUDENT_ROWS = [
  { Student_ID: 'STU-1001', Name: 'Aarav Sharma', Maths: 88, Science: 82, English: 79, Computer: 91, Attendance: 94.5 },
  { Student_ID: 'STU-1002', Name: 'Aditi Verma', Maths: 74, Science: 78, English: 85, Computer: 80, Attendance: 88.0 },
  { Student_ID: 'STU-1003', Name: 'Rohan Gupta', Maths: 92, Science: 95, English: 88, Computer: 96, Attendance: 96.0 },
  { Student_ID: 'STU-1004', Name: 'Ananya Patel', Maths: 65, Science: 60, English: 72, Computer: 68, Attendance: 78.5 },
  { Student_ID: 'STU-1005', Name: 'Vihaan Singh', Maths: 45, Science: 52, English: 58, Computer: 62, Attendance: 71.0 },
  { Student_ID: 'STU-1006', Name: 'Diya Kumar', Maths: 98, Science: 92, English: 90, Computer: 95, Attendance: 98.0 },
  { Student_ID: 'STU-1007', Name: 'Kabir Iyer', Maths: 34, Science: 42, English: 48, Computer: 39, Attendance: 62.0 },
  { Student_ID: 'STU-1008', Name: 'Meera Reddy', Maths: 81, Science: 85, English: 82, Computer: 88, Attendance: 91.5 },
  { Student_ID: 'STU-1009', Name: 'Arjun Nair', Maths: 59, Science: 63, English: 67, Computer: 70, Attendance: 75.0 },
  { Student_ID: 'STU-1010', Name: 'Ishita Deshmukh', Maths: 77, Science: 80, English: 84, Computer: 82, Attendance: 89.0 },
  { Student_ID: 'STU-1011', Name: 'Dev Chopra', Maths: 90, Science: 88, English: 85, Computer: 92, Attendance: 93.5 },
  { Student_ID: 'STU-1012', Name: 'Sneha Mehta', Maths: 68, Science: 72, English: 76, Computer: 74, Attendance: 82.0 },
  { Student_ID: 'STU-1013', Name: 'Karan Joshi', Maths: 38, Science: 45, English: 50, Computer: 42, Attendance: 65.0 },
  { Student_ID: 'STU-1014', Name: 'Pooja Kapoor', Maths: 85, Science: 89, English: 86, Computer: 90, Attendance: 92.0 },
  { Student_ID: 'STU-1015', Name: 'Vikram Bhat', Maths: 72, Science: 68, English: 74, Computer: 78, Attendance: 80.5 },
  { Student_ID: 'STU-1016', Name: 'Riya Shah', Maths: 94, Science: 96, English: 92, Computer: 98, Attendance: 97.0 },
  { Student_ID: 'STU-1017', Name: 'Aditya Sharma', Maths: 55, Science: 58, English: 62, Computer: 60, Attendance: 73.0 },
  { Student_ID: 'STU-1018', Name: 'Tanvi Verma', Maths: 83, Science: 86, English: 88, Computer: 89, Attendance: 90.0 },
  { Student_ID: 'STU-1019', Name: 'Siddharth Gupta', Maths: 42, Science: 48, English: 52, Computer: 46, Attendance: 67.5 },
  { Student_ID: 'STU-1020', Name: 'Nisha Patel', Maths: 91, Science: 89, English: 93, Computer: 94, Attendance: 95.0 },
  { Student_ID: 'STU-1021', Name: 'Rahul Singh', Maths: 76, Science: 74, English: 80, Computer: 78, Attendance: 84.0 },
  { Student_ID: 'STU-1022', Name: 'Priya Kumar', Maths: 87, Science: 90, English: 85, Computer: 92, Attendance: 93.0 },
  { Student_ID: 'STU-1023', Name: 'Amit Iyer', Maths: 62, Science: 65, English: 70, Computer: 68, Attendance: 77.0 },
  { Student_ID: 'STU-1024', Name: 'Kavya Reddy', Maths: 96, Science: 94, English: 95, Computer: 97, Attendance: 98.5 },
  { Student_ID: 'STU-1025', Name: 'Aryan Nair', Maths: 32, Science: 38, English: 44, Computer: 40, Attendance: 58.0 }
];

export const MOCK_STUDENT_TABLE: ExploreQueryResponse = {
  total_rows: 25,
  filtered_rows: 25,
  page: 1,
  page_size: 50,
  total_pages: 1,
  columns: ['Student_ID', 'Name', 'Maths', 'Science', 'English', 'Computer', 'Attendance'],
  column_types: {
    'Student_ID': 'string',
    'Name': 'string',
    'Maths': 'numeric',
    'Science': 'numeric',
    'English': 'numeric',
    'Computer': 'numeric',
    'Attendance': 'numeric'
  },
  data: MOCK_STUDENT_ROWS
};

export const MOCK_STUDENT_PROFILE: DatasetProfile = {
  dataset_id: 1,
  dataset_name: 'Student Academic Performance 2026',
  rows: 25,
  columns: 7,
  memory_usage_kb: 14.5,
  total_missing_cells: 0,
  missing_cells_pct: 0,
  duplicate_rows_count: 0,
  duplicate_rows_pct: 0,
  numeric_columns_count: 5,
  categorical_columns_count: 2,
  datetime_columns_count: 0,
  data_quality_score: 98,
  missing_per_column: {
    Student_ID: 0,
    Name: 0,
    Maths: 0,
    Science: 0,
    English: 0,
    Computer: 0,
    Attendance: 0
  },
  column_types: {
    'Student_ID': 'string',
    'Name': 'string',
    'Maths': 'numeric',
    'Science': 'numeric',
    'English': 'numeric',
    'Computer': 'numeric',
    'Attendance': 'numeric'
  },
  numeric_stats: [
    {
      name: 'Maths',
      dtype: 'numeric',
      count: 25,
      missing: 0,
      missing_pct: 0,
      mean: 71.9,
      std: 20.4,
      variance: 416.1,
      min: 32,
      q25: 55,
      median: 76,
      q75: 90,
      max: 98,
      iqr: 35,
      skewness: -0.42,
      kurtosis: -0.85,
      zeros_count: 0,
      negative_count: 0
    },
    {
      name: 'Science',
      dtype: 'numeric',
      count: 25,
      missing: 0,
      missing_pct: 0,
      mean: 73.8,
      std: 18.2,
      variance: 331.2,
      min: 38,
      q25: 60,
      median: 78,
      q75: 89,
      max: 96,
      iqr: 29,
      skewness: -0.38,
      kurtosis: -0.72,
      zeros_count: 0,
      negative_count: 0
    },
    {
      name: 'English',
      dtype: 'numeric',
      count: 25,
      missing: 0,
      missing_pct: 0,
      mean: 76.5,
      std: 14.8,
      variance: 219.0,
      min: 44,
      q25: 67,
      median: 82,
      q75: 88,
      max: 95,
      iqr: 21,
      skewness: -0.55,
      kurtosis: -0.45,
      zeros_count: 0,
      negative_count: 0
    },
    {
      name: 'Computer',
      dtype: 'numeric',
      count: 25,
      missing: 0,
      missing_pct: 0,
      mean: 75.3,
      std: 19.1,
      variance: 364.8,
      min: 39,
      q25: 62,
      median: 80,
      q75: 92,
      max: 98,
      iqr: 30,
      skewness: -0.41,
      kurtosis: -0.81,
      zeros_count: 0,
      negative_count: 0
    },
    {
      name: 'Attendance',
      dtype: 'numeric',
      count: 25,
      missing: 0,
      missing_pct: 0,
      mean: 83.2,
      std: 11.9,
      variance: 141.6,
      min: 58.0,
      q25: 75.0,
      median: 88.0,
      q75: 93.5,
      max: 98.5,
      iqr: 18.5,
      skewness: -0.62,
      kurtosis: -0.35,
      zeros_count: 0,
      negative_count: 0
    }
  ],
  categorical_stats: [
    {
      name: 'Student_ID',
      dtype: 'string',
      count: 25,
      missing: 0,
      missing_pct: 0,
      unique_count: 25,
      top_value: 'STU-1001',
      top_frequency: 1,
      top_categories: []
    },
    {
      name: 'Name',
      dtype: 'string',
      count: 25,
      missing: 0,
      missing_pct: 0,
      unique_count: 25,
      top_value: 'Aarav Sharma',
      top_frequency: 1,
      top_categories: []
    }
  ]
};

export const MOCK_STUDENT_OVERVIEW: DashboardOverviewResponse = {
  domain: 'student',
  domain_display_name: 'Student & Academic Domain',
  domain_confidence: 0.98,
  domain_reason: 'Detected student identifiers, exam marks, and attendance scores.',
  detected_fields: {
    student_id: 'Student_ID',
    name: 'Name',
    maths: 'Maths',
    science: 'Science',
    english: 'English',
    computer: 'Computer',
    attendance: 'Attendance'
  },
  kpis: [
    {
      key: 'overall_avg',
      title: 'Class Average',
      value: '74.4%',
      numeric_value: 74.4,
      change_pct: 4.8,
      change_type: 'increase',
      trend_description: 'vs previous semester baseline',
      icon: 'TrendingUp'
    },
    {
      key: 'pass_rate',
      title: 'Pass Percentage',
      value: '88.0%',
      numeric_value: 88.0,
      change_pct: 2.1,
      change_type: 'increase',
      trend_description: '22 out of 25 passed comfortably',
      icon: 'Award'
    },
    {
      key: 'top_scorer',
      title: 'Top Aggregate Score',
      value: '96.2%',
      numeric_value: 96.2,
      change_pct: 0.0,
      change_type: 'neutral',
      trend_description: 'Riya Shah (STU-1016)',
      icon: 'Sparkles'
    },
    {
      key: 'avg_attendance',
      title: 'Avg Attendance',
      value: '83.2%',
      numeric_value: 83.2,
      change_pct: 3.5,
      change_type: 'increase',
      trend_description: 'Strong academic commitment',
      icon: 'Users'
    }
  ],
  ai_summary: 'Overall batch performance indicates high competency in English (76.5 avg) and Computer Science (75.3 avg). Maths shows high variance across the student cohort requiring focused problem sessions.'
};

export const MOCK_STUDENT_INSIGHTS: AIInsightsResponse = {
  dataset_id: 1,
  dataset_name: 'Student Academic Performance 2026',
  executive_summary: 'Cohort analysis confirms an overall class average of 74.4% with an 88% pass rate. Attendance shows a strong Pearson correlation (r=0.84) with final aggregate exam performance.',
  data_health_evaluation: 'Clean dataset with zero missing cells, zero duplicates, and standard score distributions across all academic subjects.',
  key_findings: [
    {
      title: 'High Correlation Between Attendance & Marks',
      summary: 'Students with >90% attendance achieved an average score of 89.4%, whereas students with <70% attendance averaged 46.2%.',
      bullet_points: [
        'Top quartile attendance corresponds directly to distinction tiers.',
        '4 students identified at high risk of academic drop if attendance remains below 65%.'
      ],
      sentiment: 'positive'
    }
  ],
  identified_trends: [
    {
      title: 'Computer Science and English High Proficiency',
      summary: 'Computer and English subjects display highest overall scoring density.',
      bullet_points: [
        'Mean Computer score: 75.3% with 6 students scoring 95%+',
        'English consistency: lowest standard deviation (14.8)'
      ],
      sentiment: 'positive'
    }
  ],
  anomalies_and_risks: [
    {
      title: 'Maths Disparity in Lower Quartile',
      summary: 'Maths standard deviation is 20.4, revealing noticeable polarization between high performers and at-risk students.',
      bullet_points: [
        '3 students scored under 40% in Mathematics.',
        'Targeted tutorial modules recommended.'
      ],
      sentiment: 'warning'
    }
  ],
  correlations_and_drivers: [
    {
      title: 'Cross-Subject Mastery',
      summary: 'Strong positive correlation (r=0.91) between Maths and Computer Science scores.',
      bullet_points: [
        'Analytical thinking in Maths translates directly to computational scores.'
      ],
      sentiment: 'positive'
    }
  ],
  strategic_recommendations: [
    {
      title: 'Peer Mentorship Program',
      summary: 'Pair distinction students (e.g. STU-1003, STU-1006, STU-1016) with students requiring support in Maths.',
      bullet_points: [
        'Weekly 1-hour structured math problem-solving circles.',
        'Target 15% improvement in lower quartile scores before final examinations.'
      ],
      sentiment: 'positive'
    }
  ],
  swot_analysis: {
    strengths: ['High aggregate pass rate (88%)', 'High Computer Science enthusiasm', 'Zero missing data records'],
    weaknesses: ['Wide variance in Mathematics', 'Low attendance in lower score quartile'],
    opportunities: ['Introduce coding contests to boost STEM interest', 'Adaptive LMS homework assignments'],
    threats: ['Dropouts or supplementary exams for students with attendance < 65%']
  },
  generated_by: 'AI DataSense Domain Inference Engine'
};
