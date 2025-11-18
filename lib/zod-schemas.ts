import { z } from 'zod';

export const createInvitationSchema = z.object({
  psychologistEmail: z.string().email('Email invalid'),
});

export const createResponseSchema = z.object({
  testId: z.string(),
  templateId: z.string(),
  answers: z.array(z.object({
    questionId: z.string(),
    optionValue: z.union([z.string(), z.number()]),
    score: z.number(),
  })),
});

export const createCommentSchema = z.object({
  responseId: z.string(),
  text: z.string().min(1, 'Comentariul nu poate fi gol'),
});

export const updateScheduleSchema = z.object({
  templateId: z.string(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  customDays: z.array(z.number()).optional(),
  remindByEmail: z.boolean(),
  remindPsychologist: z.boolean(),
});

export const acceptInvitationSchema = z.object({
  token: z.string(),
  name: z.string().min(1, 'Numele este obligatoriu'),
  email: z.string().email('Email invalid'),
  password: z.string().min(6, 'Parola trebuie să aibă minim 6 caractere'),
});

