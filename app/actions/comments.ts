'use server';

import { auth } from '@/firebase/config';
import { createComment } from '@/firebase/firestore';
import { createCommentSchema } from '@/lib/zod-schemas';

export async function createCommentAction(formData: FormData) {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { error: 'Nu ești autentificat' };
    }

    const data = {
      responseId: formData.get('responseId') as string,
      text: formData.get('text') as string,
    };

    const validated = createCommentSchema.parse(data);

    const commentId = await createComment({
      responseId: validated.responseId,
      psychologistId: currentUser.uid,
      text: validated.text,
    });

    return { 
      success: true, 
      commentId,
      message: 'Comentariu adăugat cu succes!' 
    };
  } catch (error: any) {
    return { error: error.message || 'Eroare la adăugarea comentariului' };
  }
}

