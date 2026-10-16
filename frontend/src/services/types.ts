export interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  age: number | null;
  weightKg: number | null;
  heightCm: number | null;
  healthGoals: string | null;
  medicalConditions: string | null;
  createdAt: string;
  updatedAt: string;
}

export type Profile = Pick<User, 'name' | 'age' | 'weightKg' | 'heightCm' | 'healthGoals' | 'medicalConditions'>;
export interface Credentials { email: string; password: string }
export interface Session { accessToken: string; tokenType: 'Bearer'; expiresAt: string; user: User }
export type ActivityType = 'exercise' | 'water' | 'meal' | 'habit';
export interface ActivityInput {
  type: ActivityType;
  description: string;
  occurredAt: string;
  durationMinutes?: number;
  waterMl?: number;
  steps?: number;
  calories?: number;
}
export interface Activity extends Omit<ActivityInput, 'durationMinutes' | 'waterMl' | 'steps' | 'calories'> {
  id: string;
  userId: string;
  durationMinutes: number | null;
  waterMl: number | null;
  steps: number | null;
  calories: number | null;
  createdAt: string;
}

export type ReminderCategory = 'exercise' | 'medication' | 'water' | 'meal' | 'habit';
export interface ReminderInput { title: string; time: string; weekdays: number[]; timezone: string; active: boolean; category?: ReminderCategory }
export interface Reminder extends ReminderInput { id: string; userId: string; createdAt: string; updatedAt: string }
export interface ProgressDay { date: string; waterMl: number; steps: number; durationMinutes: number; calories: number }
export type GoalsInput = Partial<Pick<ProgressDay, 'waterMl' | 'steps' | 'durationMinutes' | 'calories'>>;
export interface Goals { waterMl: number | null; steps: number | null; durationMinutes: number | null; calories: number | null; updatedAt: string }
export interface Content {
  id: string; title: string; category: string; type: 'article' | 'video'; difficulty: string | null;
  isPremium: boolean; locked: boolean; textContent: string | null; url: string | null; createdAt: string;
}
export interface ContentFilters { category?: string; type?: 'article' | 'video'; difficulty?: string }
export interface Recommendations {
  status: 'ready' | 'profile_incomplete'; message?: string; missingFields?: string[]; medicalNotice?: string | null;
  recommendations: { code: string; title: string; message: string; basedOn: string[] }[];
}
