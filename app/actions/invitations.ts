'use server';

import { headers } from 'next/headers';
import { adminAuth } from '@/firebase/admin';
import { createInvitation, getInvitationByToken, getUser } from '@/firebase/firestore';
import { createInvitationSchema } from '@/lib/zod-schemas';
import { randomBytes } from 'crypto';

export async function createInvitationAction(formData: FormData) {
  try {
    // Get userId from formData (sent from client)
    const userId = formData.get('userId') as string;
    
    if (!userId) {
      return { error: 'Nu ești autentificat' };
    }

    const data = {
      psychologistEmail: formData.get('psychologistEmail') as string,
    };

    const validated = createInvitationSchema.parse(data);
    
    // Get patient info
    const patient = await getUser(userId);
    if (!patient) {
      return { error: 'Utilizatorul nu a fost găsit' };
    }
    
    // Generate token
    const token = randomBytes(32).toString('hex');
    
    const invitationId = await createInvitation({
      fromUserId: userId,
      toEmail: validated.psychologistEmail,
      token,
      role: 'psychologist',
    });

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/accept-invite?token=${token}`;

    // Send invitation email
    try {
      const { sendEmail, generateInvitationEmail } = await import('@/lib/email');
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      const emailHtml = generateInvitationEmail(
        patient.name,
        inviteLink,
        appUrl
      );
      
      await sendEmail({
        to: validated.psychologistEmail,
        subject: `Invitație Psiholog - ${patient.name}`,
        html: emailHtml,
      });
      
      console.log(`Email de invitație trimis către ${validated.psychologistEmail}`);
    } catch (emailError) {
      // Don't fail invitation creation if email fails
      console.error('Eroare la trimiterea email-ului de invitație:', emailError);
    }

    return { 
      success: true, 
      invitationId,
      inviteLink,
      message: 'Invitație creată cu succes! Email-ul a fost trimis.' 
    };
  } catch (error: any) {
    return { error: error.message || 'Eroare la crearea invitației' };
  }
}

