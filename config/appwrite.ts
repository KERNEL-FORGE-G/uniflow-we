/**
 * Configuration Officielle Appwrite Production Auto-Hébergé (VPS KERNEL FORGE)
 * Endpoint : https://vps.kernelforge.codes/v1
 * Console  : https://vps.kernelforge.codes/projects/uniflow/overview
 *
 * Partagée par les 3 clients : Web (React), Mobile (Flutter) et Desktop (Rust/Tauri).
 */

export const APPWRITE_CONFIG = {
  endpoint: 'https://vps.kernelforge.codes/v1',
  projectId: 'uniflow',
  databases: {
    uniflow: 'uniflow',
    independant: 'independant',
  },
  databaseId: 'uniflow',
  buckets: {
    assets: 'uniflow_assets',
    badges: 'uniflow_badges',
    quests: 'uniflow_quests',
    academic: 'uniflow_academic',
    avatars: 'uniflow_avatars',
    assignments: 'uniflow_assignments',
  },
  collections: {
    users: 'users',
    personalSubjects: 'personal_subjects',
    personalSchedules: 'personal_schedules',
    personalTasks: 'personal_tasks',
    personalGrades: 'personal_grades',
    forumPosts: 'forum_posts',
    forumReactions: 'forum_reactions',
    contactMessages: 'contact_messages',
    notifications: 'notifications',
    chatConversations: 'chat_conversations',
    chatMessages: 'chat_messages',
    attendanceQrTokens: 'attendance_qr_tokens',
    attendanceSessionLocations: 'attendance_session_locations',
    attendanceRecords: 'attendance_records',
    attendanceSessions: 'attendance_sessions',
    subscriptionPaymentRequests: 'subscription_payment_requests',
    subscriptionPlans: 'subscription_plans',
    subscriptionStatuses: 'subscription_statuses',
    academicCourses: 'academic_courses',
    academicSchedules: 'academic_schedules',
    academicDirectory: 'academic_directory',
    academicGrades: 'academic_grades',
    academicLibrary: 'academic_library',
    academicEnrollments: 'academic_enrollments',
    academicAssignments: 'academic_assignments',
    academicSubmissions: 'academic_submissions',
    universities: 'universities',
    faculties: 'faculties',
    academicPrograms: 'academic_programs',
    classrooms: 'classrooms',
    siteVisits: 'site_visits',
    siteMetricsDaily: 'site_metrics_daily',
    badgesCatalog: 'badges_catalog',
    userBadges: 'user_badges',
    questsCatalog: 'quests_catalog',
    userQuestProgress: 'user_quest_progress',
    userXp: 'user_xp',
    leaderboard: 'leaderboard',
    teamMembers: 'team_members',
    appReleases: 'app_releases',
  },
  roles: {
    student: 'STUDENT',
    delegate: 'DELEGATE',
    teacher: 'TEACHER',
    admin: 'ADMIN',
    personal: 'PERSONAL',
  } as const,
};
