'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { getUserResponses, getTestTemplate } from '@/firebase/firestore';
import { Card, List, Typography, Button, Tag, Empty, Spin, Space } from 'antd';
import { FileTextOutlined, DownloadOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { formatRomanianDate } from '@/lib/utils';
import type { TestResponse, TestTemplate } from '@/lib/types';
import { AuthGuard } from '@/components/AuthGuard';

const { Title, Text } = Typography;

export default function PatientHistoryPage() {
  const [responses, setResponses] = useState<Array<TestResponse & { template?: TestTemplate }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) return;

      const userResponses = await getUserResponses(firebaseUser.uid);
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <AuthGuard requireRole="patient">
      <div>
        <Title level={2}>Istoric Teste</Title>
        {responses.length === 0 ? (
          <Empty description="Nu ai completat încă niciun test" />
        ) : (
          <List
            dataSource={responses}
            renderItem={(response) => (
              <List.Item>
                <Card className="w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <Title level={4}>
                        {response.template?.title || 'Test necunoscut'}
                      </Title>
                      <Text type="secondary" className="block mb-2">
                        {formatRomanianDate(response.createdAt)}
                      </Text>
                      <Tag color="blue">Scor: {response.totalScore}</Tag>
                    </div>
                    <Space>
                      <Link href={`/responses/${response.id}`}>
                        <Button type="primary">Vezi Detalii</Button>
                      </Link>
                      <Button
                        icon={<DownloadOutlined />}
                        href={`/api/pdf/${response.id}`}
                        target="_blank"
                      >
                        Exportă PDF
                      </Button>
                    </Space>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        )}
      </div>
    </AuthGuard>
  );
}

