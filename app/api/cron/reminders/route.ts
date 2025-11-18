import { NextRequest, NextResponse } from 'next/server';
import { getAllSchedules } from '@/firebase/firestore';
import { addDays, addWeeks, addMonths, isAfter, startOfDay } from 'date-fns';

// This endpoint should be called by Vercel Cron or a scheduled Cloud Function
// Vercel Cron: Add to vercel.json
// Cloud Function: Set up a scheduled function

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const schedules = await getAllSchedules();
    const now = new Date();
    const today = startOfDay(now);
    
    const dueSchedules = schedules.filter(schedule => {
      if (!schedule.nextDueAt) return false;
      const dueDate = startOfDay(schedule.nextDueAt);
      return dueDate <= today;
    });

    // TODO: Send email reminders
    // For each due schedule:
    // 1. Get patient email
    // 2. Get psychologist email (if remindPsychologist is true)
    // 3. Send email via email service (SendGrid, Resend, etc.)

    // Update nextDueAt based on frequency
    for (const schedule of dueSchedules) {
      let nextDue: Date;
      
      switch (schedule.frequency) {
        case 'daily':
          nextDue = addDays(today, 1);
          break;
        case 'weekly':
          nextDue = addWeeks(today, 1);
          break;
        case 'monthly':
          nextDue = addMonths(today, 1);
          break;
        case 'custom':
          // Calculate based on customDays
          // This is a simplified version
          nextDue = addDays(today, 7);
          break;
        default:
          nextDue = addDays(today, 7);
      }

      // Update schedule in Firestore
      // await setTestSchedule(schedule.userId, {
      //   ...schedule,
      //   nextDueAt: nextDue,
      //   lastCompletedAt: today,
      // });
    }

    return NextResponse.json({
      success: true,
      processed: dueSchedules.length,
      message: `Procesate ${dueSchedules.length} programări`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

