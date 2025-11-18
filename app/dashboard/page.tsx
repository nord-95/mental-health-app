'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { getUser } from '@/firebase/firestore';
import { Spin } from 'antd';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/auth/login');
        return;
      }

      const userData = await getUser(firebaseUser.uid);
      if (userData) {
        if (userData.role === 'patient') {
          router.push('/dashboard/patient');
        } else if (userData.role === 'psychologist') {
          router.push('/dashboard/psychologist');
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spin size="large" />
    </div>
  );
}
