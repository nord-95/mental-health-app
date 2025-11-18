import { redirect } from 'next/navigation';
import { auth } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

export default function HomePage() {
  redirect('/auth/login');
}

