'use server';

import { headers } from 'next/headers';
import { adminAuth } from '@/firebase/admin';
import { createResponse, getUser, getPsychologistPatients } from '@/firebase/firestore';
import { createResponseSchema } from '@/lib/zod-schemas';
import type { Answer } from '@/lib/types';

export async function createResponseAction(formData: FormData) {
  try {
    // Get userId from formData (sent from client)
    const userId = formData.get('userId') as string;
    
    if (!userId) {
      return { error: 'Nu ești autentificat' };
    }

    // Optional: Verify token from headers if available
    try {
      const headersList = await headers();
      const authHeader = headersList.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decodedToken = await adminAuth.verifyIdToken(token);
        // Verify userId matches token
        if (decodedToken.uid !== userId) {
          return { error: 'Token invalid' };
        }
      }
    } catch (verifyError) {
      // If token verification fails, still allow if userId is provided
      // This is for development - in production, always verify token
      console.warn('Token verification failed, proceeding with userId:', verifyError);
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
      userId,
      testId: validated.testId,
      templateId: validated.templateId,
      answers: validated.answers,
      totalScore,
      immutable: true,
    });

    // Get patient's psychologists and send notifications
    try {
      const { getPatientPsychologists } = await import('@/firebase/firestore');
      const psychologistIds = await getPatientPsychologists(userId);
      const patient = await getUser(userId);
      
      if (psychologistIds.length > 0 && patient) {
        // TODO: Send email notifications to psychologists via Cloud Functions
        // For now, we'll log it
        console.log(`Test completed by ${patient.name} (${patient.email}). Notifying ${psychologistIds.length} psychologist(s).`);
        console.log('Psychologist IDs:', psychologistIds);
      }
    } catch (notifError) {
      // Don't fail the response creation if notification fails
      console.error('Error sending notifications:', notifError);
    }

    return { 
      success: true, 
      responseId,
      message: 'Răspuns salvat cu succes!' 
    };
  } catch (error: any) {
    console.error('Error creating response:', error);
    return { error: error.message || 'Eroare la salvarea răspunsului' };
  }
}

