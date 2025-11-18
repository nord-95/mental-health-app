'use server';

import { auth } from '@/firebase/config';
import { createResponse, getTestTemplate } from '@/firebase/firestore';
import { createResponseSchema } from '@/lib/zod-schemas';
import type { Answer } from '@/lib/types';

export async function createResponseAction(formData: FormData) {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { error: 'Nu ești autentificat' };
    }

    const testId = formData.get('testId') as string;
    const templateId = formData.get('templateId') as string;
    const answersJson = formData.get('answers') as string;

    const answers: Answer[] = JSON.parse(answersJson);
    
    const validated = createResponseSchema.parse({
      testId,
      templateId,
      answers,
    });

    // Calculate total score
    const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);

    const responseId = await createResponse({
      userId: currentUser.uid,
      testId: validated.testId,
      templateId: validated.templateId,
      answers: validated.answers,
      totalScore,
      immutable: true,
    });

    return { 
      success: true, 
      responseId,
      message: 'Răspuns salvat cu succes!' 
    };
  } catch (error: any) {
    return { error: error.message || 'Eroare la salvarea răspunsului' };
  }
}

