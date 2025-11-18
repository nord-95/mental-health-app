import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { 
  User, 
  TestTemplate, 
  TestResponse, 
  Comment, 
  Invitation,
  TestSchedule,
  PatientPsychologistLink,
} from '@/lib/types';

// Users
export async function getUser(uid: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return null;
  const data = userDoc.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
  } as User;
}

export async function createUser(user: Omit<User, 'createdAt'>): Promise<void> {
  await setDoc(doc(db, 'users', user.uid), {
    ...user,
    createdAt: serverTimestamp(),
  });
}

// Test Templates
export async function getTestTemplate(templateId: string): Promise<TestTemplate | null> {
  const templateDoc = await getDoc(doc(db, 'testTemplates', templateId));
  if (!templateDoc.exists()) return null;
  const data = templateDoc.data();
  return {
    id: templateDoc.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
  } as TestTemplate;
}

export async function getAllTestTemplates(): Promise<TestTemplate[]> {
  const templatesSnapshot = await getDocs(collection(db, 'testTemplates'));
  return templatesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  } as TestTemplate));
}

export async function createTestTemplate(template: Omit<TestTemplate, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'testTemplates'), {
    ...template,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Responses
export async function createResponse(response: Omit<TestResponse, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'responses'), {
    ...response,
    createdAt: serverTimestamp(),
    immutable: true,
  });
  return docRef.id;
}

export async function getResponse(responseId: string): Promise<TestResponse | null> {
  const responseDoc = await getDoc(doc(db, 'responses', responseId));
  if (!responseDoc.exists()) return null;
  const data = responseDoc.data();
  return {
    id: responseDoc.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
  } as TestResponse;
}

export async function getUserResponses(userId: string): Promise<TestResponse[]> {
  const q = query(
    collection(db, 'responses'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  } as TestResponse));
}

export async function getResponsesByTemplate(templateId: string, userId?: string): Promise<TestResponse[]> {
  const constraints: QueryConstraint[] = [
    where('templateId', '==', templateId),
    orderBy('createdAt', 'desc'),
  ];
  if (userId) {
    constraints.unshift(where('userId', '==', userId));
  }
  const q = query(collection(db, 'responses'), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  } as TestResponse));
}

// Response Views
export async function logResponseView(responseId: string, viewerId: string): Promise<void> {
  await addDoc(collection(db, 'responses', responseId, 'views'), {
    viewerId,
    viewedAt: serverTimestamp(),
  });
}

export async function getResponseViews(responseId: string): Promise<Array<{ viewerId: string; viewedAt: Date }>> {
  const viewsSnapshot = await getDocs(collection(db, 'responses', responseId, 'views'));
  return viewsSnapshot.docs.map(doc => ({
    viewerId: doc.data().viewerId,
    viewedAt: doc.data().viewedAt?.toDate() || new Date(),
  }));
}

// Comments
export async function createComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'comments'), {
    ...comment,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getResponseComments(responseId: string): Promise<Comment[]> {
  const q = query(
    collection(db, 'comments'),
    where('responseId', '==', responseId),
    orderBy('createdAt', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  } as Comment));
}

// Invitations
export async function createInvitation(invitation: Omit<Invitation, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'invitations'), {
    ...invitation,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getInvitationByToken(token: string): Promise<Invitation | null> {
  const q = query(collection(db, 'invitations'), where('token', '==', token));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    acceptedAt: data.acceptedAt?.toDate(),
  } as Invitation;
}

export async function acceptInvitation(invitationId: string): Promise<void> {
  await updateDoc(doc(db, 'invitations', invitationId), {
    acceptedAt: serverTimestamp(),
  });
}

// Patient-Psychologist Links
export async function createPatientPsychologistLink(link: Omit<PatientPsychologistLink, 'createdAt'>): Promise<void> {
  await setDoc(
    doc(db, 'patientPsychologistLinks', `${link.patientId}_${link.psychologistId}`),
    {
      ...link,
      createdAt: serverTimestamp(),
    }
  );
}

export async function getPsychologistPatients(psychologistId: string): Promise<string[]> {
  const q = query(
    collection(db, 'patientPsychologistLinks'),
    where('psychologistId', '==', psychologistId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data().patientId);
}

export async function getPatientPsychologists(patientId: string): Promise<string[]> {
  const q = query(
    collection(db, 'patientPsychologistLinks'),
    where('patientId', '==', patientId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data().psychologistId);
}

// Schedules
export async function getTestSchedule(userId: string, templateId: string): Promise<TestSchedule | null> {
  const scheduleDoc = await getDoc(doc(db, 'testSchedules', userId, templateId));
  if (!scheduleDoc.exists()) return null;
  const data = scheduleDoc.data();
  return {
    ...data,
    lastCompletedAt: data.lastCompletedAt?.toDate(),
    nextDueAt: data.nextDueAt?.toDate(),
  } as TestSchedule;
}

export async function setTestSchedule(userId: string, schedule: TestSchedule): Promise<void> {
  await setDoc(doc(db, 'testSchedules', userId, schedule.templateId), {
    ...schedule,
    lastCompletedAt: schedule.lastCompletedAt ? Timestamp.fromDate(schedule.lastCompletedAt) : null,
    nextDueAt: schedule.nextDueAt ? Timestamp.fromDate(schedule.nextDueAt) : null,
  });
}

export async function getAllSchedules(): Promise<Array<TestSchedule & { userId: string }>> {
  const schedulesSnapshot = await getDocs(collection(db, 'testSchedules'));
  const schedules: Array<TestSchedule & { userId: string }> = [];
  
  for (const userDoc of schedulesSnapshot.docs) {
    const userSchedulesSnapshot = await getDocs(collection(db, 'testSchedules', userDoc.id));
    for (const scheduleDoc of userSchedulesSnapshot.docs) {
      const data = scheduleDoc.data();
      schedules.push({
        userId: userDoc.id,
        ...data,
        lastCompletedAt: data.lastCompletedAt?.toDate(),
        nextDueAt: data.nextDueAt?.toDate(),
      } as TestSchedule & { userId: string });
    }
  }
  
  return schedules;
}

