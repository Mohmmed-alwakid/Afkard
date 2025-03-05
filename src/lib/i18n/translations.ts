import { useRTL } from '@/hooks/use-rtl';

// Define translation keys type
export type TranslationKey =
  | 'common.welcome'
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.save'
  | 'common.saving'
  | 'common.cancel'
  | 'common.delete'
  | 'common.edit'
  | 'common.create'
  | 'common.view'
  | 'common.search'
  | 'common.filter'
  | 'common.sort'
  | 'common.add'
  | 'common.remove'
  | 'common.back'
  | 'common.next'
  | 'common.previous'
  | 'common.settings'
  | 'common.profile'
  | 'common.logout'
  | 'common.login'
  | 'common.signup'
  | 'common.email'
  | 'common.password'
  | 'common.confirmPassword'
  | 'common.name'
  | 'common.firstName'
  | 'common.lastName'
  | 'common.submit'
  | 'common.reset'
  | 'common.continue'
  | 'common.upgrade'
  | 'common.notifications'
  | 'common.myAccount'
  | 'common.closeMenu'
  | 'common.openMenu'
  | 'common.copy'
  | 'common.close'
  | 'profile.manageSettings'
  | 'profile.saveSuccess'
  | 'profile.personalInfo'
  | 'profile.personalInfoDesc'
  | 'profile.firstNamePlaceholder'
  | 'profile.lastNamePlaceholder'
  | 'profile.emailPlaceholder'
  | 'profile.emailDesc'
  | 'profile.bio'
  | 'profile.bioPlaceholder'
  | 'profile.profilePhoto'
  | 'profile.uploadPhoto'
  | 'profile.dangerZone'
  | 'profile.deleteAccount'
  | 'profile.confirmDelete'
  | 'profile.deleteWarning'
  | 'profile.security'
  | 'profile.preferences'
  | 'profile.preferencesDesc'
  | 'profile.language'
  | 'profile.selectLanguage'
  | 'profile.theme'
  | 'profile.selectTheme'
  | 'profile.themeLight'
  | 'profile.themeDark'
  | 'profile.themeSystem'
  | 'nav.home'
  | 'nav.projects'
  | 'nav.participants'
  | 'nav.help'
  | 'nav.settings'
  | 'nav.profile'
  | 'projects.title'
  | 'projects.create'
  | 'projects.empty'
  | 'projects.name'
  | 'projects.description'
  | 'projects.category'
  | 'projects.goal'
  | 'projects.status'
  | 'projects.created'
  | 'projects.updated'
  | 'projects.delete.confirm'
  | 'projects.delete.success'
  | 'projects.delete.error'
  | 'projects.update.success'
  | 'projects.update.error'
  | 'projects.create.success'
  | 'projects.create.error'
  | 'studies.title'
  | 'studies.create'
  | 'studies.empty'
  | 'studies.name'
  | 'studies.description'
  | 'studies.type'
  | 'studies.type.test'
  | 'studies.type.interview'
  | 'studies.type.survey'
  | 'studies.status'
  | 'studies.status.draft'
  | 'studies.status.active'
  | 'studies.status.completed'
  | 'studies.status.archived'
  | 'studies.participants'
  | 'studies.questions'
  | 'studies.responses'
  | 'studies.launch'
  | 'studies.share'
  | 'studies.preview'
  | 'studies.settings'
  | 'studies.detail.overview'
  | 'studies.detail.participants'
  | 'studies.detail.responses'
  | 'studies.detail.notFound'
  | 'studies.detail.notFoundDesc'
  | 'studies.detail.createdOn'
  | 'studies.detail.lastUpdated'
  | 'studies.detail.status'
  | 'studies.detail.type'
  | 'studies.detail.targetParticipants'
  | 'studies.detail.activityLog'
  | 'studies.detail.completionRate'
  | 'studies.detail.averageTime'
  | 'studies.detail.backToProject'
  | 'studies.detail.launchStudy'
  | 'studies.detail.completeStudy'
  | 'studies.detail.reactivateStudy'
  | 'studies.detail.copyLink'
  | 'studies.detail.copied'
  | 'studies.detail.invite'
  | 'studies.detail.loadingStudy'
  | 'studies.detail.deleteConfirm'
  | 'studies.detail.progress'
  | 'studies.detail.tasks'
  | 'studies.detail.analytics'
  | 'studies.detail.shareLink'
  | 'studies.detail.viewResponses'
  | 'studies.detail.exportResults'
  | 'studies.detail.shareOptions'
  | 'participants.title'
  | 'participants.invite'
  | 'participants.empty'
  | 'participants.name'
  | 'participants.email'
  | 'participants.status'
  | 'participants.status.active'
  | 'participants.status.pending'
  | 'participants.status.inactive'
  | 'participants.lastActive'
  | 'participants.tags'
  | 'participants.import'
  | 'participants.export'
  | 'participants.total'
  | 'dashboard.title'
  | 'dashboard.overview'
  | 'dashboard.projects'
  | 'dashboard.participants'
  | 'dashboard.responses'
  | 'dashboard.analytics'
  | 'dashboard.recentActivity'
  | 'dashboard.metrics.totalProjects'
  | 'dashboard.metrics.totalStudies'
  | 'dashboard.metrics.participants'
  | 'dashboard.metrics.responseRate';

// Define the type for all translations
export type TranslationsType = Record<TranslationKey, string>;

// Define translations

// English translations
const en: TranslationsType = {
  'common.welcome': 'Welcome',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.save': 'Save',
  'common.saving': 'Saving...',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.create': 'Create',
  'common.view': 'View',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.sort': 'Sort',
  'common.add': 'Add',
  'common.remove': 'Remove',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.previous': 'Previous',
  'common.settings': 'Settings',
  'common.profile': 'Profile',
  'common.logout': 'Logout',
  'common.login': 'Login',
  'common.signup': 'Sign up',
  'common.email': 'Email',
  'common.password': 'Password',
  'common.confirmPassword': 'Confirm Password',
  'common.name': 'Name',
  'common.firstName': 'First Name',
  'common.lastName': 'Last Name',
  'common.submit': 'Submit',
  'common.reset': 'Reset',
  'common.continue': 'Continue',
  'common.upgrade': 'Upgrade now',
  'common.notifications': 'Notifications',
  'common.myAccount': 'My Account',
  'common.closeMenu': 'Close Menu',
  'common.openMenu': 'Open Menu',
  'common.copy': 'Copy',
  'common.close': 'Close',
  'profile.manageSettings': 'Manage your account settings and preferences',
  'profile.saveSuccess': 'Your changes have been saved successfully.',
  'profile.personalInfo': 'Personal Information',
  'profile.personalInfoDesc': 'Update your personal information and how others see you on the platform',
  'profile.firstNamePlaceholder': 'Your first name',
  'profile.lastNamePlaceholder': 'Your last name',
  'profile.emailPlaceholder': 'Your email address',
  'profile.emailDesc': 'This email will be used for account notifications and communications.',
  'profile.bio': 'Bio',
  'profile.bioPlaceholder': 'Tell us a bit about yourself...',
  'profile.profilePhoto': 'Profile Photo',
  'profile.uploadPhoto': 'Upload Photo',
  'profile.dangerZone': 'Danger Zone',
  'profile.deleteAccount': 'Delete Account',
  'profile.confirmDelete': 'Are you absolutely sure?',
  'profile.deleteWarning': 'This action cannot be undone. This will permanently delete your account and remove all your data from our servers.',
  'profile.security': 'Security',
  'profile.preferences': 'Preferences',
  'profile.preferencesDesc': 'Customize your application experience',
  'profile.language': 'Language',
  'profile.selectLanguage': 'Select a language',
  'profile.theme': 'Theme',
  'profile.selectTheme': 'Select a theme',
  'profile.themeLight': 'Light',
  'profile.themeDark': 'Dark',
  'profile.themeSystem': 'System Default',
  'nav.home': 'Home',
  'nav.projects': 'Projects',
  'nav.participants': 'Participants',
  'nav.help': 'Help & Support',
  'nav.settings': 'Settings',
  'nav.profile': 'Profile',

  'projects.title': 'Projects',
  'projects.create': 'Create Project',
  'projects.empty': 'No projects yet',
  'projects.name': 'Project Name',
  'projects.description': 'Description',
  'projects.category': 'Category',
  'projects.goal': 'Goal',
  'projects.status': 'Status',
  'projects.created': 'Created',
  'projects.updated': 'Updated',
  'projects.delete.confirm': 'Are you sure you want to delete this project?',
  'projects.delete.success': 'Project deleted successfully',
  'projects.delete.error': 'Failed to delete project',
  'projects.update.success': 'Project updated successfully',
  'projects.update.error': 'Failed to update project',
  'projects.create.success': 'Project created successfully',
  'projects.create.error': 'Failed to create project',

  'studies.title': 'Studies',
  'studies.create': 'Create Study',
  'studies.empty': 'No studies yet',
  'studies.name': 'Study Name',
  'studies.description': 'Description',
  'studies.type': 'Type',
  'studies.type.test': 'Usability Test',
  'studies.type.interview': 'Interview',
  'studies.type.survey': 'Survey',
  'studies.status': 'Status',
  'studies.status.draft': 'Draft',
  'studies.status.active': 'Active',
  'studies.status.completed': 'Completed',
  'studies.status.archived': 'Archived',
  'studies.participants': 'Participants',
  'studies.questions': 'Questions',
  'studies.responses': 'Responses',
  'studies.launch': 'Launch Study',
  'studies.share': 'Share',
  'studies.preview': 'Preview',
  'studies.settings': 'Settings',
  'studies.detail.overview': 'Overview',
  'studies.detail.participants': 'Participants',
  'studies.detail.responses': 'Responses',
  'studies.detail.notFound': 'Study Not Found',
  'studies.detail.notFoundDesc': 'The study you are looking for does not exist or has been removed.',
  'studies.detail.createdOn': 'Created on',
  'studies.detail.lastUpdated': 'Last updated',
  'studies.detail.status': 'Status',
  'studies.detail.type': 'Type',
  'studies.detail.targetParticipants': 'Target Participants',
  'studies.detail.activityLog': 'Activity Log',
  'studies.detail.completionRate': 'Completion Rate',
  'studies.detail.averageTime': 'Average Time',
  'studies.detail.backToProject': 'Back to Project',
  'studies.detail.launchStudy': 'Launch Study',
  'studies.detail.completeStudy': 'Complete Study',
  'studies.detail.reactivateStudy': 'Reactivate',
  'studies.detail.copyLink': 'Copy Link',
  'studies.detail.copied': 'Copied!',
  'studies.detail.invite': 'Invite Participants',
  'studies.detail.loadingStudy': 'Loading study details...',
  'studies.detail.deleteConfirm': 'Are you sure you want to delete this study? This action cannot be undone.',
  'studies.detail.progress': 'Progress',
  'studies.detail.tasks': 'Tasks',
  'studies.detail.analytics': 'Analytics',
  'studies.detail.shareLink': 'Share Link',
  'studies.detail.viewResponses': 'View Responses',
  'studies.detail.exportResults': 'Export Results',
  'studies.detail.shareOptions': 'Share Options',

  'participants.title': 'Participants',
  'participants.invite': 'Invite Participants',
  'participants.empty': 'No participants yet',
  'participants.name': 'Name',
  'participants.email': 'Email',
  'participants.status': 'Status',
  'participants.status.active': 'Active',
  'participants.status.pending': 'Pending',
  'participants.status.inactive': 'Inactive',
  'participants.lastActive': 'Last Active',
  'participants.tags': 'Tags',
  'participants.import': 'Import Participants',
  'participants.export': 'Export Participants',
  'participants.total': 'Total Participants',

  'dashboard.title': 'Dashboard',
  'dashboard.overview': 'Overview',
  'dashboard.projects': 'Projects',
  'dashboard.participants': 'Participants',
  'dashboard.responses': 'Responses',
  'dashboard.analytics': 'Analytics',
  'dashboard.recentActivity': 'Recent Activity',
  'dashboard.metrics.totalProjects': 'Total Projects',
  'dashboard.metrics.totalStudies': 'Total Studies',
  'dashboard.metrics.participants': 'Participants',
  'dashboard.metrics.responseRate': 'Response Rate',
};

// Arabic translations
const ar: TranslationsType = {
  'common.welcome': 'مرحباً',
  'common.loading': 'جاري التحميل...',
  'common.error': 'خطأ',
  'common.success': 'نجاح',
  'common.save': 'حفظ',
  'common.saving': 'جاري الحفظ...',
  'common.cancel': 'إلغاء',
  'common.delete': 'حذف',
  'common.edit': 'تعديل',
  'common.create': 'إنشاء',
  'common.view': 'عرض',
  'common.search': 'بحث',
  'common.filter': 'تصفية',
  'common.sort': 'ترتيب',
  'common.add': 'إضافة',
  'common.remove': 'إزالة',
  'common.back': 'رجوع',
  'common.next': 'التالي',
  'common.previous': 'السابق',
  'common.settings': 'الإعدادات',
  'common.profile': 'الملف الشخصي',
  'common.logout': 'تسجيل الخروج',
  'common.login': 'تسجيل الدخول',
  'common.signup': 'إنشاء حساب',
  'common.email': 'البريد الإلكتروني',
  'common.password': 'كلمة المرور',
  'common.confirmPassword': 'تأكيد كلمة المرور',
  'common.name': 'الاسم',
  'common.firstName': 'الاسم الأول',
  'common.lastName': 'اسم العائلة',
  'common.submit': 'إرسال',
  'common.reset': 'إعادة ضبط',
  'common.continue': 'متابعة',
  'common.upgrade': 'ترقية الآن',
  'common.notifications': 'الإشعارات',
  'common.myAccount': 'حسابي',
  'common.closeMenu': 'إغلاق القائمة',
  'common.openMenu': 'فتح القائمة',
  'common.copy': 'نسخ',
  'common.close': 'إغلاق',
  'profile.manageSettings': 'إدارة إعدادات وتفضيلات حسابك',
  'profile.saveSuccess': 'تم حفظ التغييرات بنجاح.',
  'profile.personalInfo': 'المعلومات الشخصية',
  'profile.personalInfoDesc': 'تحديث معلوماتك الشخصية وكيفية رؤية الآخرين لك على المنصة',
  'profile.firstNamePlaceholder': 'الاسم الأول',
  'profile.lastNamePlaceholder': 'اسم العائلة',
  'profile.emailPlaceholder': 'عنوان بريدك الإلكتروني',
  'profile.emailDesc': 'سيتم استخدام هذا البريد الإلكتروني لإشعارات الحساب والاتصالات.',
  'profile.bio': 'السيرة الذاتية',
  'profile.bioPlaceholder': 'أخبرنا قليلاً عن نفسك...',
  'profile.profilePhoto': 'الصورة الشخصية',
  'profile.uploadPhoto': 'تحميل الصورة',
  'profile.dangerZone': 'منطقة الخطر',
  'profile.deleteAccount': 'حذف الحساب',
  'profile.confirmDelete': 'هل أنت متأكد تمامًا؟',
  'profile.deleteWarning': 'لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف حسابك نهائيًا وإزالة جميع بياناتك من خوادمنا.',
  'profile.security': 'الأمان',
  'profile.preferences': 'التفضيلات',
  'profile.preferencesDesc': 'تخصيص تجربة التطبيق الخاصة بك',
  'profile.language': 'اللغة',
  'profile.selectLanguage': 'اختر لغة',
  'profile.theme': 'المظهر',
  'profile.selectTheme': 'اختر مظهرًا',
  'profile.themeLight': 'فاتح',
  'profile.themeDark': 'داكن',
  'profile.themeSystem': 'افتراضي النظام',
  'nav.home': 'الرئيسية',
  'nav.projects': 'المشاريع',
  'nav.participants': 'المشاركين',
  'nav.help': 'المساعدة والدعم',
  'nav.settings': 'الإعدادات',
  'nav.profile': 'الملف الشخصي',

  'projects.title': 'المشاريع',
  'projects.create': 'إنشاء مشروع',
  'projects.empty': 'لا توجد مشاريع حتى الآن',
  'projects.name': 'اسم المشروع',
  'projects.description': 'الوصف',
  'projects.category': 'الفئة',
  'projects.goal': 'الهدف',
  'projects.status': 'الحالة',
  'projects.created': 'تم الإنشاء',
  'projects.updated': 'تم التحديث',
  'projects.delete.confirm': 'هل أنت متأكد من رغبتك في حذف هذا المشروع؟',
  'projects.delete.success': 'تم حذف المشروع بنجاح',
  'projects.delete.error': 'فشل في حذف المشروع',
  'projects.update.success': 'تم تحديث المشروع بنجاح',
  'projects.update.error': 'فشل في تحديث المشروع',
  'projects.create.success': 'تم إنشاء المشروع بنجاح',
  'projects.create.error': 'فشل في إنشاء المشروع',

  'studies.title': 'الدراسات',
  'studies.create': 'إنشاء دراسة',
  'studies.empty': 'لا توجد دراسات حتى الآن',
  'studies.name': 'اسم الدراسة',
  'studies.description': 'الوصف',
  'studies.type': 'النوع',
  'studies.type.test': 'اختبار قابلية الاستخدام',
  'studies.type.interview': 'مقابلة',
  'studies.type.survey': 'استبيان',
  'studies.status': 'الحالة',
  'studies.status.draft': 'مسودة',
  'studies.status.active': 'نشط',
  'studies.status.completed': 'مكتمل',
  'studies.status.archived': 'مؤرشف',
  'studies.participants': 'المشاركين',
  'studies.questions': 'الأسئلة',
  'studies.responses': 'الإجابات',
  'studies.launch': 'إطلاق الدراسة',
  'studies.share': 'مشاركة',
  'studies.preview': 'معاينة',
  'studies.settings': 'إعدادات',
  'studies.detail.overview': 'نظرة عامة',
  'studies.detail.participants': 'المشاركين',
  'studies.detail.responses': 'الإجابات',
  'studies.detail.notFound': 'الدراسة غير موجودة',
  'studies.detail.notFoundDesc': 'الدراسة التي تبحث عنها غير موجودة أو تمت إزالتها.',
  'studies.detail.createdOn': 'تم إنشاؤها في',
  'studies.detail.lastUpdated': 'آخر تحديث',
  'studies.detail.status': 'الحالة',
  'studies.detail.type': 'النوع',
  'studies.detail.targetParticipants': 'المشاركين المستهدفين',
  'studies.detail.activityLog': 'سجل النشاط',
  'studies.detail.completionRate': 'معدل الإكمال',
  'studies.detail.averageTime': 'متوسط الوقت',
  'studies.detail.backToProject': 'العودة إلى المشروع',
  'studies.detail.launchStudy': 'إطلاق الدراسة',
  'studies.detail.completeStudy': 'إكمال الدراسة',
  'studies.detail.reactivateStudy': 'إعادة تنشيط',
  'studies.detail.copyLink': 'نسخ الرابط',
  'studies.detail.copied': 'تم النسخ!',
  'studies.detail.invite': 'دعوة المشاركين',
  'studies.detail.loadingStudy': 'جاري تحميل تفاصيل الدراسة...',
  'studies.detail.deleteConfirm': 'هل أنت متأكد أنك تريد حذف هذه الدراسة؟ لا يمكن التراجع عن هذا الإجراء.',
  'studies.detail.progress': 'التقدم',
  'studies.detail.tasks': 'المهام',
  'studies.detail.analytics': 'التحليلات',
  'studies.detail.shareLink': 'مشاركة الرابط',
  'studies.detail.viewResponses': 'عرض الردود',
  'studies.detail.exportResults': 'تصدير النتائج',
  'studies.detail.shareOptions': 'خيارات المشاركة',

  'participants.title': 'المشاركون',
  'participants.invite': 'دعوة المشاركين',
  'participants.empty': 'لا يوجد مشاركين حتى الآن',
  'participants.name': 'الاسم',
  'participants.email': 'البريد الإلكتروني',
  'participants.status': 'الحالة',
  'participants.status.active': 'نشط',
  'participants.status.pending': 'قيد الانتظار',
  'participants.status.inactive': 'غير نشط',
  'participants.lastActive': 'آخر نشاط',
  'participants.tags': 'العلامات',
  'participants.import': 'استيراد المشاركين',
  'participants.export': 'تصدير المشاركين',
  'participants.total': 'إجمالي المشاركين',

  'dashboard.title': 'لوحة التحكم',
  'dashboard.overview': 'نظرة عامة',
  'dashboard.projects': 'المشاريع',
  'dashboard.participants': 'المشاركين',
  'dashboard.responses': 'الإجابات',
  'dashboard.analytics': 'التحليلات',
  'dashboard.recentActivity': 'النشاط الأخير',
  'dashboard.metrics.totalProjects': 'إجمالي المشاريع',
  'dashboard.metrics.totalStudies': 'إجمالي الدراسات',
  'dashboard.metrics.participants': 'المشاركين',
  'dashboard.metrics.responseRate': 'معدل الاستجابة',
};

// French translations (partial)
const fr: Partial<TranslationsType> = {
  'common.welcome': 'Bienvenue',
  'common.loading': 'Chargement...',
  'common.error': 'Erreur',
  'common.success': 'Succès',
  'common.save': 'Enregistrer',
  'common.saving': 'Enregistrement...',
  'common.cancel': 'Annuler',
  'common.delete': 'Supprimer',
  'common.edit': 'Modifier',
  'common.create': 'Créer',
  'common.view': 'Voir',
  'common.search': 'Rechercher',
  'common.filter': 'Filtrer',
  'common.sort': 'Trier',
  'common.add': 'Ajouter',
  'common.remove': 'Supprimer',
  'common.back': 'Retour',
  'common.next': 'Suivant',
  'common.previous': 'Précédent',
  'common.settings': 'Paramètres',
  'common.profile': 'Profil',
  'common.logout': 'Déconnexion',
  'common.login': 'Connexion',
  'common.signup': 'Inscription',
  'common.email': 'Email',
  'common.password': 'Mot de passe',
  'common.confirmPassword': 'Confirmer le mot de passe',
  'common.name': 'Nom',
  'common.firstName': 'Prénom',
  'common.lastName': 'Nom de famille',
  'common.submit': 'Soumettre',
  'common.reset': 'Réinitialiser',
  'common.continue': 'Continuer',
  'common.upgrade': 'Mettre à niveau',
  'common.notifications': 'Notifications',
  'common.myAccount': 'Mon compte',
  'common.closeMenu': 'Fermer le menu',
  'common.openMenu': 'Ouvrir le menu',
  'common.copy': 'Copier',
  'common.close': 'Fermer',
  'profile.manageSettings': 'Gérer les paramètres',
  'profile.saveSuccess': 'Vos modifications ont été enregistrées avec succès.',
  'profile.personalInfo': 'Informations personnelles',
  'profile.personalInfoDesc': 'Mettez à jour vos informations personnelles et la façon dont les autres vous voient sur la plateforme',
  'profile.firstNamePlaceholder': 'Votre prénom',
  'profile.lastNamePlaceholder': 'Votre nom de famille',
  'profile.emailPlaceholder': 'Votre adresse e-mail',
  'profile.emailDesc': 'Cet e-mail sera utilisé pour les notifications de compte et les communications.',
  'profile.bio': 'Bio',
  'profile.bioPlaceholder': 'Parlez-nous un peu de vous...',
  'profile.profilePhoto': 'Photo de profil',
  'profile.uploadPhoto': 'Télécharger une photo',
  'profile.dangerZone': 'Zone de danger',
  'profile.deleteAccount': 'Supprimer le compte',
  'profile.confirmDelete': 'Êtes-vous absolument sûr?',
  'profile.deleteWarning': 'Cette action ne peut pas être annulée. Cela supprimera définitivement votre compte et supprimera toutes vos données de nos serveurs.',
  'profile.security': 'Sécurité',
  'profile.preferences': 'Préférences',
  'profile.preferencesDesc': 'Personnalisez votre expérience d\'application',
  'profile.language': 'Langue',
  'profile.selectLanguage': 'Sélectionnez une langue',
  'profile.theme': 'Thème',
  'profile.selectTheme': 'Sélectionnez un thème',
  'profile.themeLight': 'Clair',
  'profile.themeDark': 'Sombre',
  'profile.themeSystem': 'Système par défaut',
  'nav.home': 'Accueil',
  'nav.projects': 'Projets',
  'nav.participants': 'Participants',
  'nav.help': 'Aide et support',
  'nav.settings': 'Paramètres',
  'nav.profile': 'Profil',

  'projects.title': 'Projets',
  'projects.create': 'Créer un Projet',
  'projects.empty': 'Pas de projets pour le moment',
  'studies.detail.deleteConfirm': 'Êtes-vous sûr de vouloir supprimer cette étude? Cette action ne peut pas être annulée.',
  'studies.detail.progress': 'Progression',
  'studies.detail.tasks': 'Tâches',
  'studies.detail.analytics': 'Analytique',
  'studies.detail.shareLink': 'Partager le lien',
  'studies.detail.viewResponses': 'Voir les réponses',
  'studies.detail.exportResults': 'Exporter les résultats',
  'studies.detail.shareOptions': 'Options de partage',
  
  'participants.title': 'Participants',
  'participants.export': 'Exporter les participants',
  'participants.total': 'Total des participants',
  
  'dashboard.title': 'Tableau de bord',
};

// Spanish translations (partial)
const es: Partial<TranslationsType> = {
  'common.welcome': 'Bienvenido',
  'common.loading': 'Cargando...',
  'common.error': 'Error',
  'common.success': 'Éxito',
  'common.save': 'Guardar',
  'common.saving': 'Guardando...',
  'common.cancel': 'Cancelar',
  'common.delete': 'Eliminar',
  'common.edit': 'Editar',
  'common.create': 'Crear',
  'common.view': 'Ver',
  'common.search': 'Buscar',
  'common.filter': 'Filtrar',
  'common.sort': 'Ordenar',
  'common.add': 'Añadir',
  'common.remove': 'Eliminar',
  'common.back': 'Atrás',
  'common.next': 'Siguiente',
  'common.previous': 'Anterior',
  'common.settings': 'Configuración',
  'common.profile': 'Perfil',
  'common.logout': 'Cerrar sesión',
  'common.login': 'Iniciar sesión',
  'common.signup': 'Registrarse',
  'common.email': 'Correo electrónico',
  'common.password': 'Contraseña',
  'common.confirmPassword': 'Confirmar contraseña',
  'common.name': 'Nombre',
  'common.firstName': 'Nombre',
  'common.lastName': 'Apellido',
  'common.submit': 'Enviar',
  'common.reset': 'Restablecer',
  'common.continue': 'Continuar',
  'common.upgrade': 'Actualizar ahora',
  'common.notifications': 'Notificaciones',
  'common.myAccount': 'Mi cuenta',
  'common.closeMenu': 'Cerrar menú',
  'common.openMenu': 'Abrir menú',
  'common.copy': 'Copiar',
  'common.close': 'Cerrar',
  'profile.manageSettings': 'Administrar configuración',
  'profile.saveSuccess': 'Sus cambios se han guardado correctamente.',
  'profile.personalInfo': 'Información personal',
  'profile.personalInfoDesc': 'Actualice su información personal y cómo lo ven los demás en la plataforma',
  'profile.firstNamePlaceholder': 'Su nombre',
  'profile.lastNamePlaceholder': 'Su apellido',
  'profile.emailPlaceholder': 'Su dirección de correo electrónico',
  'profile.emailDesc': 'Este correo electrónico se utilizará para notificaciones de cuenta y comunicaciones.',
  'profile.bio': 'Biografía',
  'profile.bioPlaceholder': 'Cuéntanos un poco sobre ti...',
  'profile.profilePhoto': 'Foto de perfil',
  'profile.uploadPhoto': 'Subir foto',
  'profile.dangerZone': 'Zona de peligro',
  'profile.deleteAccount': 'Eliminar cuenta',
  'profile.confirmDelete': '¿Estás absolutamente seguro?',
  'profile.deleteWarning': 'Esta acción no se puede deshacer. Esto eliminará permanentemente su cuenta y eliminará todos sus datos de nuestros servidores.',
  'profile.security': 'Seguridad',
  'profile.preferences': 'Preferencias',
  'profile.preferencesDesc': 'Personalice su experiencia de aplicación',
  'profile.language': 'Idioma',
  'profile.selectLanguage': 'Seleccione un idioma',
  'profile.theme': 'Tema',
  'profile.selectTheme': 'Seleccione un tema',
  'profile.themeLight': 'Claro',
  'profile.themeDark': 'Oscuro',
  'profile.themeSystem': 'Predeterminado del sistema',
  'nav.home': 'Inicio',
  'nav.projects': 'Proyectos',
  'nav.participants': 'Participantes',
  'nav.help': 'Ayuda y soporte',
  'nav.settings': 'Configuración',
  'nav.profile': 'Perfil',

  'projects.title': 'Proyectos',
  'projects.create': 'Crear Proyecto',
  'projects.empty': 'No hay proyectos todavía',
  'studies.detail.deleteConfirm': '¿Estás seguro de que quieres eliminar este estudio? Esta acción no se puede deshacer.',
  'studies.detail.progress': 'Progreso',
  'studies.detail.tasks': 'Tareas',
  'studies.detail.analytics': 'Analítica',
  'studies.detail.shareLink': 'Compartir enlace',
  'studies.detail.viewResponses': 'Ver respuestas',
  'studies.detail.exportResults': 'Exportar resultados',
  'studies.detail.shareOptions': 'Opciones de compartir',
  
  'participants.title': 'Participantes',
  'participants.export': 'Exportar participantes',
  'participants.total': 'Total de participantes',
  
  'dashboard.title': 'Panel de control',
};

// Combine all translations
const translations: Record<string, Partial<TranslationsType>> = {
  en,
  ar,
  fr,
  es,
};

// Create a hook to access translations
export const useTranslations = () => {
  const { getLanguage, isRTL } = useRTL();
  const language = getLanguage();

  // Get translation function
  const t = (key: TranslationKey, params?: Record<string, string>): string => {
    const languageTranslations = translations[language] || translations.en;
    let translation = languageTranslations[key] || translations.en[key] || key;
    
    // Replace any parameters
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{${paramKey}}`, paramValue);
      });
    }
    
    return translation;
  };
  
  return { t, language, isRTL };
};

export default translations; 