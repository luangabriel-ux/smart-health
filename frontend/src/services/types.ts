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
