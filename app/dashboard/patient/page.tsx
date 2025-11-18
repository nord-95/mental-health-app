'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { getUser, getUserResponses, getAllTestTemplates, getTestSchedule } from '@/firebase/firestore';
import { Card, Row, Col, Statistic, List, Typography, Button, Empty, Spin } from 'antd';
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
    let unsubscribeResponses: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setLoading(false);
        return;
      }

      const userData = await getUser(firebaseUser.uid);
      if (userData) {
        setUser(userData);
      }

      // Load templates once
      const allTemplates = await getAllTestTemplates();
      setTemplates(allTemplates);
      setLoading(false);

      // Clean up previous listener if exists
      if (unsubscribeResponses) {
        unsubscribeResponses();
      }

      // Set up real-time listener for responses
      const responsesQuery = query(
        collection(db, 'responses'),
        where('userId', '==', firebaseUser.uid),
        orderBy('createdAt', 'desc')
      );

      unsubscribeResponses = onSnapshot(
        responsesQuery,
        (snapshot) => {
          const responsesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          } as TestResponse));
          setResponses(responsesData);
        },
        (error) => {
          console.error('Error listening to responses:', error);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeResponses) {
        unsubscribeResponses();
      }
    };
  }, []);

  const recentResponses = responses.slice(0, 5);
  const totalScore = responses.reduce((sum, r) => sum + r.totalScore, 0);
  const averageScore = responses.length > 0 ? totalScore / responses.length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

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

