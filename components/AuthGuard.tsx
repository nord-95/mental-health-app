'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Spin } from 'antd';
import { getUser } from '@/firebase/firestore';

export function AuthGuard({ 
  children, 
  requireRole 
}: { 
  children: React.ReactNode;
  requireRole?: 'patient' | 'psychologist';
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/auth/login');
        return;
      }

      if (requireRole) {
        const userData = await getUser(firebaseUser.uid);
        if (!userData || userData.role !== requireRole) {
          router.push('/auth/login');
          return;
        }
      }

      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, requireRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

