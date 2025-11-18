export type UserRole = 'patient' | 'psychologist';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface TestTemplate {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  scoringRules?: ScoringRule;
  version: number;
  createdAt: Date;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  section?: string;
}

export interface QuestionOption {
  label: string;
  value: string | number;
  score: number;
}

export interface ScoringRule {
  minScore?: number;
  maxScore?: number;
  interpretation?: {
    ranges: Array<{
      min: number;
      max: number;
      label: string;
      description?: string;
    }>;
  };
}

export interface TestResponse {
  id: string;
  userId: string;
  testId: string;
  templateId: string;
  answers: Answer[];
  totalScore: number;
  createdAt: Date;
  immutable: boolean;
}

export interface Answer {
  questionId: string;
  optionValue: string | number;
  score: number;
}

export interface ResponseView {
  id: string;
  viewerId: string;
  viewedAt: Date;
}

export interface Comment {
  id: string;
  responseId: string;
  psychologistId: string;
  text: string;
  createdAt: Date;
}

export interface Invitation {
  id: string;
  fromUserId: string;
  toEmail: string;
  token: string;
  role: 'psychologist';
  createdAt: Date;
  acceptedAt?: Date;
}

export interface TestSchedule {
  templateId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  customDays?: number[];
  lastCompletedAt?: Date;
  nextDueAt?: Date;
  remindByEmail: boolean;
  remindPsychologist: boolean;
}

export interface PatientPsychologistLink {
  patientId: string;
  psychologistId: string;
  createdAt: Date;
}

