'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { getPsychologistPatients, getUser as getPatientUser } from '@/firebase/firestore';
import { Card, List, Typography, Button, Empty, Spin } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import Link from 'next/link';
import type { User } from '@/lib/types';
import { AuthGuard } from '@/components/AuthGuard';

const { Title, Text } = Typography;

export default function PsychologistPatientsPage() {
  const [patients, setPatients] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) return;

      const patientIds = await getPsychologistPatients(firebaseUser.uid);
      const patientData = await Promise.all(
        patientIds.map(async (id) => {
          const patient = await getPatientUser(id);
          return patient ? { id, name: patient.name, email: patient.email } : null;
        })
      );
      setPatients(patientData.filter((p): p is { id: string; name: string; email: string } => p !== null));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <AuthGuard requireRole="psychologist">
      <div>
        <Title level={2}>Pacienții Mei</Title>
        {patients.length === 0 ? (
          <Empty description="Nu ai pacienți asociați încă" />
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
            dataSource={patients}
            renderItem={(patient) => (
              <List.Item>
                <Card
                  title={patient.name}
                  extra={
                    <Link href={`/psychologist/patients/${patient.id}`}>
                      <Button type="primary" size="small">
                        Vezi Istoric
                      </Button>
                    </Link>
                  }
                >
                  <Text type="secondary">{patient.email}</Text>
                </Card>
              </List.Item>
            )}
          />
        )}
      </div>
    </AuthGuard>
  );
}

