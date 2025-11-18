'use server';

import { auth } from '@/firebase/config';
import { createInvitation, getInvitationByToken } from '@/firebase/firestore';
import { createInvitationSchema } from '@/lib/zod-schemas';
import { randomBytes } from 'crypto';

export async function createInvitationAction(formData: FormData) {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { error: 'Nu ești autentificat' };
    }

    const data = {
      psychologistEmail: formData.get('psychologistEmail') as string,
    };

    const validated = createInvitationSchema.parse(data);
    
    // Generate token
    const token = randomBytes(32).toString('hex');
    
    const invitationId = await createInvitation({
      fromUserId: currentUser.uid,
      toEmail: validated.psychologistEmail,
      token,
      role: 'psychologist',
    });

    // TODO: Send email via Cloud Function
    // For now, return the invitation link
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/accept-invite?token=${token}`;

    return { 
      success: true, 
      invitationId,
      inviteLink,
      message: 'Invitație creată cu succes! Link-ul a fost generat.' 
    };
  } catch (error: any) {
    return { error: error.message || 'Eroare la crearea invitației' };
  }
}

