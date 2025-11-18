'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { getUser, getUserResponses, getAllTestTemplates, getTestSchedule } from '@/firebase/firestore';
import { Card, Row, Col, Statistic, List, Typography, Button, Empty } from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { formatRomanianDate } from '@/lib/utils';
import type { User, TestResponse, TestTemplate } from '@/lib/types';

const { Title, Text } = Typography;

export default function PatientDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [responses, setResponses] = useState<TestResponse[]>([]);
  const [templates, setTemplates] = useState<TestTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) return;

      const userData = await getUser(firebaseUser.uid);
      if (userData) {
        setUser(userData);
        const userResponses = await getUserResponses(firebaseUser.uid);
        setResponses(userResponses);
      }

      const allTemplates = await getAllTestTemplates();
      setTemplates(allTemplates);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const recentResponses = responses.slice(0, 5);
  const totalScore = responses.reduce((sum, r) => sum + r.totalScore, 0);
  const averageScore = responses.length > 0 ? totalScore / responses.length : 0;

  return (
    <div>
      <Title level={2}>Bun venit, {user?.name}!</Title>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Teste Completate"
              value={responses.length}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Teste Disponibile"
              value={templates.length}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Scor Mediu"
              value={averageScore.toFixed(1)}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Teste Programate"
              value={0}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Teste Recente" extra={<Link href="/patient/history">Vezi toate</Link>}>
            {recentResponses.length === 0 ? (
              <Empty description="Nu ai completat încă niciun test" />
            ) : (
              <List
                dataSource={recentResponses}
                renderItem={(response) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Link href={`/responses/${response.id}`}>
                          Test #{response.id.slice(0, 8)}
                        </Link>
                      }
                      description={
                        <div>
                          <Text type="secondary">
                            {formatRomanianDate(response.createdAt)}
                          </Text>
                          <br />
                          <Text strong>Scor: {response.totalScore}</Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title="Teste Disponibile" 
            extra={<Link href="/tests">Vezi toate</Link>}
          >
            {templates.length === 0 ? (
              <Empty description="Nu sunt teste disponibile" />
            ) : (
              <List
                dataSource={templates.slice(0, 5)}
                renderItem={(template) => (
                  <List.Item
                    actions={[
                      <Link key="take" href={`/tests/${template.id}`}>
                        <Button type="primary" size="small">
                          Completează
                        </Button>
                      </Link>,
                    ]}
                  >
                    <List.Item.Meta
                      title={template.title}
                      description={template.description?.substring(0, 100)}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

