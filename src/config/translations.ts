export type TranslationKeys = keyof typeof translations.en

export interface Translations {
  [key: string]: string;  // Add index signature to support string indexing
  
  // Common
  loading: string
  error: string
  success: string
  save: string
  cancel: string
  delete: string
  edit: string
  create: string
  search: string
  filter: string
  sort: string
  more: string
  learnMore: string
  
  // Navigation
  home: string
  projects: string
  participant: string
  helpAndSupport: string
  upgradeNow: string
  
  // Auth
  signIn: string
  signUp: string
  signOut: string
  forgotPassword: string
  rememberMe: string
  email: string
  password: string
  confirmPassword: string
  
  // Home Page
  welcomeMessage: string
  letsCreateProject: string
  emptyProjectsTitle: string
  emptyProjectsDescription: string
  newProject: string
  
  // Templates
  createTemplate: string
  templateDescription: string
  usabilityTesting: string
  featureInsights: string
  productTesting: string
  
  // Resources
  exploreAfkar: string
  resourcesDescription: string
  helpCenter: string
  helpCenterDescription: string
  afkarBlogs: string
  afkarBlogsDescription: string
  
  // Landing Page
  products: string
  company: string
  resources: string
  pricing: string
  becomeTester: string
  startNow: string
  new: string
  aiAnalytics: string
  heroTitle: string
  heroSubtitle: string
  startFree: string
  watchDemo: string
  trustedBy: string
  
  // Features
  featuresTitle: string
  featuresSubtitle: string
  'targetCustomers.title': string
  'targetCustomers.description': string
  'userTesting.title': string
  'userTesting.description': string
  'ai.title': string
  'ai.description': string
  'prototype.title': string
  'prototype.description': string
  'analysis.title': string
  'analysis.description': string
  'consultation.title': string
  'consultation.description': string
  
  // Stats
  statsTitle: string
  statsSubtitle: string
  'stats.projects': string
  'stats.roi': string
  'stats.testers': string
  
  // CTA
  ctaTitle: string
  ctaSubtitle: string
  signUpFree: string
  contactSales: string
  
  // Footer
  footerDescription: string
  overview: string
  features: string
  solutions: string
  blog: string
  events: string
  tutorials: string
  newsletter: string
  emailPlaceholder: string
  subscribe: string
  rights: string
  terms: string
  privacy: string
  cookies: string
  
  // Profile
  viewProfile: string
  settings: string
  billing: string
  changeLanguage: string
  help: string
}

export const translations: { ar: Translations; en: Translations } = {
  ar: {
    // Common
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    success: 'تم بنجاح',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    create: 'إنشاء',
    search: 'بحث',
    filter: 'تصفية',
    sort: 'ترتيب',
    more: 'المزيد',
    learnMore: 'اعرف المزيد',
    
    // Navigation
    home: 'الرئيسية',
    projects: 'المشاريع',
    participant: 'المشاركين',
    helpAndSupport: 'المساعدة والدعم',
    upgradeNow: 'الترقية الآن',
    
    // Auth
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    signOut: 'تسجيل الخروج',
    forgotPassword: 'نسيت كلمة المرور؟',
    rememberMe: 'تذكرني',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    
    // Home Page
    welcomeMessage: 'مرحباً بك في منصة أفكار، {name} 👋',
    letsCreateProject: 'هيا بنا ننشئ مشروعاً جديداً',
    emptyProjectsTitle: 'ابدأ بإنشاء مشروع',
    emptyProjectsDescription: 'لا يوجد لديك أي مشاريع حالياً. هيا نبدأ بإنشاء مشروع جديد.',
    newProject: 'مشروع جديد',
    
    // Templates
    createTemplate: 'إنشاء قالب أفكار',
    templateDescription: 'اختر من قوالبنا الجاهزة أو قم بإنشاء قالب خاص بك من الصفر.',
    usabilityTesting: 'اختبار قابلية الاستخدام لمنتج جديد',
    featureInsights: 'جمع آراء حول المميزات',
    productTesting: 'اختبار المنتج',
    
    // Resources
    exploreAfkar: 'استكشف أفكار',
    resourcesDescription: 'ارتقِ ببحثك من خلال تعلم الأساسيات والوصول إلى نصائح وموارد متقدمة',
    helpCenter: 'مركز المساعدة',
    helpCenterDescription: 'تصفح مقالاتنا مع الأسئلة الشائعة والنصائح والحيل.',
    afkarBlogs: 'مدونات أفكار',
    afkarBlogsDescription: 'طور مهاراتك في أفكار من خلال جلسات التدريب المباشرة المجانية ومقاطع الفيديو عند الطلب',
    
    // Landing Page
    products: 'المنتجات',
    company: 'الشركة',
    resources: 'الموارد',
    pricing: 'التسعير',
    becomeTester: 'كن مختبراً',
    startNow: 'ابدأ الآن',
    new: '✨ جديد',
    aiAnalytics: 'تحليلات الذكاء الاصطناعي المتقدمة',
    heroTitle: 'اكتشف رؤى العملاء، اتخذ قرارات أفضل للمنتج',
    heroSubtitle: 'أفضل منصة لأبحاث المستخدمين في المملكة العربية السعودية. احصل على رؤى قيمة من عملائك المستهدفين.',
    startFree: 'ابدأ مجاناً',
    watchDemo: 'شاهد العرض التوضيحي',
    trustedBy: 'موثوق به من قبل الشركات الرائدة في المملكة',
    
    // Features
    featuresTitle: 'اكتشف عملائك للوصول إلى منتج مبتكر وتنافسي',
    featuresSubtitle: 'حلول شاملة لفهم احتياجات المستخدم وتحسين تجربة المنتج',
    'targetCustomers.title': 'استهدف عملائك',
    'targetCustomers.description': 'فهم احتياجات جمهورك المستهدف من خلال البحث المتعمق.',
    'userTesting.title': 'اختبار المستخدم',
    'userTesting.description': 'إنشاء خطة اختبار للحصول على رؤى قيمة من المستخدمين.',
    'ai.title': 'الذكاء الاصطناعي',
    'ai.description': 'استخدم أدوات الذكاء الاصطناعي القوية لفهم سلوك العملاء بشكل أعمق.',
    'prototype.title': 'إدارة النماذج الأولية',
    'prototype.description': 'إدارة واختبار النماذج الأولية الخاصة بك بفعالية.',
    'analysis.title': 'تحليل النتائج',
    'analysis.description': 'احصل على تحليل مفصل ورؤى قابلة للتنفيذ.',
    'consultation.title': 'جلسة استشارية',
    'consultation.description': 'استشارة خبير للمساعدة في تفسير نتائج أبحاثك.',
    
    // Stats
    statsTitle: 'أطلق العنان للقوة الكاملة للبيانات',
    statsSubtitle: 'كل ما تحتاجه لتحويل وإشراك والاحتفاظ بالمزيد من المستخدمين',
    'stats.projects': 'مشروع مكتمل',
    'stats.roi': 'عائد الاستثمار',
    'stats.testers': 'مختبر',
    
    // CTA
    ctaTitle: 'تحدث مع المستخدمين اليوم. نحن سريعون حقاً.',
    ctaSubtitle: 'ابدأ في جمع الرؤى القيمة من عملائك المستهدفين',
    signUpFree: 'سجل مجاناً',
    contactSales: 'تواصل مع المبيعات',
    
    // Footer
    footerDescription: 'منصة أفكار تستخدم لفهم احتياجات وسلوكيات وتجارب ودوافع المستخدمين النهائيين من خلال تقنيات منهجية ومراقبة لحل مشاكل التصميم المعقدة.',
    overview: 'نظرة عامة',
    features: 'المميزات',
    solutions: 'الحلول',
    blog: 'المدونة',
    events: 'الفعاليات',
    tutorials: 'الدروس التعليمية',
    newsletter: 'اشترك في نشرتنا الإخبارية',
    emailPlaceholder: 'أدخل بريدك الإلكتروني',
    subscribe: 'اشترك',
    rights: 'جميع الحقوق محفوظة',
    terms: 'الشروط',
    privacy: 'الخصوصية',
    cookies: 'ملفات تعريف الارتباط',
    
    // Profile
    viewProfile: 'عرض الملف الشخصي',
    settings: 'الإعدادات',
    billing: 'الفواتير',
    changeLanguage: 'تغيير اللغة',
    help: 'المساعدة'
  },
  en: {
    // Common
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    more: 'More',
    learnMore: 'Learn More',
    
    // Navigation
    home: 'Home',
    projects: 'Projects',
    participant: 'Participant',
    helpAndSupport: 'Help & Support',
    upgradeNow: 'Upgrade now',
    
    // Auth
    signIn: 'Sign in',
    signUp: 'Sign up',
    signOut: 'Sign out',
    forgotPassword: 'Forgot password?',
    rememberMe: 'Remember me',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
    
    // Home Page
    welcomeMessage: 'Welcome to Afkar Platform, {name} 👋',
    letsCreateProject: 'Let\'s create a new project',
    emptyProjectsTitle: 'Get to start by creating a project',
    emptyProjectsDescription: 'Currently you don\'t have any projects synced on your dashboard. Let\'s add some data create new project',
    newProject: 'New Project',
    
    // Templates
    createTemplate: 'Create Afkar Template',
    templateDescription: 'Choose from our pre-built afkar templates or create your own maze from the ground up.',
    usabilityTesting: 'Usability testing a new product',
    featureInsights: 'Collect insights on features',
    productTesting: 'Product testing',
    
    // Resources
    exploreAfkar: 'Explore Afkar',
    resourcesDescription: 'Elevate your research by learning the basics, and access advanced tips and resources',
    helpCenter: 'Help Center',
    helpCenterDescription: 'Check our articles with frequently asked questions, tips, and tricks.',
    afkarBlogs: 'Afkar Blogs',
    afkarBlogsDescription: 'Build your Afkar skills through free live training sessions and on-demand videos',
    
    // Landing Page
    products: 'Products',
    company: 'Company',
    resources: 'Resources',
    pricing: 'Pricing',
    becomeTester: 'Become a Tester',
    startNow: 'Start Now',
    new: '✨ New',
    aiAnalytics: 'Advanced AI Analytics',
    heroTitle: 'Discover Customer Insights, Make Better Product Decisions',
    heroSubtitle: 'The best user research platform in Saudi Arabia. Get valuable insights from your target customers.',
    startFree: 'Start Free',
    watchDemo: 'Watch Demo',
    trustedBy: 'Trusted by leading companies in the Kingdom',
    
    // Features
    featuresTitle: 'Explore Your Customers to Reach an Innovative Product',
    featuresSubtitle: 'Comprehensive solutions for understanding user needs and improving product experience',
    'targetCustomers.title': 'Target Your Customers',
    'targetCustomers.description': 'Understand the needs of your target audience through in-depth research.',
    'userTesting.title': 'User Testing',
    'userTesting.description': 'Create a test plan to get valuable insights from your users.',
    'ai.title': 'Artificial Intelligence',
    'ai.description': 'Deploy powerful AI tools to gain deeper insights into customer behavior.',
    'prototype.title': 'Prototype Management',
    'prototype.description': 'Manage and test your prototypes effectively.',
    'analysis.title': 'Analysis of Results',
    'analysis.description': 'Get detailed analysis and actionable insights.',
    'consultation.title': 'Consultation Session',
    'consultation.description': 'Expert consultation to help interpret your research findings.',
    
    // Stats
    statsTitle: 'Unleash the Full Power of Data',
    statsSubtitle: 'Everything you need to convert, engage and retain more users',
    'stats.projects': 'Projects Completed',
    'stats.roi': 'Return on Investment',
    'stats.testers': 'Testers',
    
    // CTA
    ctaTitle: 'Talk to Users Today. We\'re Really Fast.',
    ctaSubtitle: 'Start collecting valuable insights from your target customers',
    signUpFree: 'Sign up free',
    contactSales: 'Contact Sales',
    
    // Footer
    footerDescription: 'Afkar platform is used to understand end-user needs, behaviors, experiences and motivations through methodological techniques and observation to solve complex design problems.',
    overview: 'Overview',
    features: 'Features',
    solutions: 'Solutions',
    blog: 'Blog',
    events: 'Events',
    tutorials: 'Tutorials',
    newsletter: 'Subscribe to our newsletter',
    emailPlaceholder: 'Enter your email',
    subscribe: 'Subscribe',
    rights: 'All rights reserved',
    terms: 'Terms',
    privacy: 'Privacy',
    cookies: 'Cookies',
    
    // Profile
    viewProfile: 'View Profile',
    settings: 'Settings',
    billing: 'Billing',
    changeLanguage: 'Change Language',
    help: 'Help'
  }
} 