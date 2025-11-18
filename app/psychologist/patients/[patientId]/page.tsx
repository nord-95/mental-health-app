'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { getUserResponses, getTestTemplate, getUser } from '@/firebase/firestore';
import { Card, List, Typography, Button, Tag, Empty, Spin } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatRomanianDate, formatRomanianDateShort } from '@/lib/utils';
import type { TestResponse, TestTemplate, User } from '@/lib/types';
import { AuthGuard } from '@/components/AuthGuard';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.patientId as string;
  const [patient, setPatient] = useState<User | null>(null);
  const [responses, setResponses] = useState<Array<TestResponse & { template?: TestTemplate }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) return;

      const patientData = await getUser(patientId);
      setPatient(patientData);

      const userResponses = await getUserResponses(patientId);
      const responsesWithTemplates = await Promise.all(
        userResponses.map(async (response) => {
          const template = await getTestTemplate(response.templateId);
          return { ...response, template: template || undefined };
        })
      );
      setResponses(responsesWithTemplates);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [patientId]);

  // Prepare chart data
  const chartData = responses
    .filter(r => r.template)
    .map((response, index) => ({
      name: `Test ${index + 1}`,
      score: response.totalScore,
      date: formatRomanianDateShort(response.createdAt),
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!patient) {
    return <Empty description="Pacient nu a fost găsit" />;
  }

  return (
    <AuthGuard requireRole="psychologist">
      <div>
        <Title level={2}>Pacient: {patient.name}</Title>
        <Text type="secondary" className="block mb-6">{patient.email}</Text>

        {responses.length > 0 && (
          <Card title="Evoluția Scorurilor" className="mb-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#1890ff" name="Scor" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        <Card title="Istoric Teste">
          {responses.length === 0 ? (
            <Empty description="Pacientul nu a completat încă teste" />
          ) : (
            <List
              dataSource={responses}
              renderItem={(response) => (
                <List.Item>
                  <div className="w-full">
                    <Title level={4}>
                      {response.template?.title || 'Test necunoscut'}
                    </Title>
                    <Text type="secondary" className="block mb-2">
                      {formatRomanianDate(response.createdAt)}
                    </Text>
                    <Tag color="blue">Scor: {response.totalScore}</Tag>
                    <div className="mt-2">
                      <Link href={`/responses/${response.id}`}>
                        <Button type="primary">Vezi Detalii</Button>
                      </Link>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>
    </AuthGuard>
  );
}

