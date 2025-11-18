'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { getUser, getPsychologistPatients, getUser as getPatientUser } from '@/firebase/firestore';
import { Card, Row, Col, Statistic, List, Typography, Button, Empty } from 'antd';
import {
  TeamOutlined,
  FileTextOutlined,
  CommentOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import type { User } from '@/lib/types';

const { Title, Text } = Typography;

export default function PsychologistDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [patients, setPatients] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) return;

      const userData = await getUser(firebaseUser.uid);
      if (userData) {
        setUser(userData);
        
        const patientIds = await getPsychologistPatients(firebaseUser.uid);
        const patientData = await Promise.all(
          patientIds.map(async (id) => {
            const patient = await getPatientUser(id);
            return patient ? { id, name: patient.name, email: patient.email } : null;
          })
        );
        setPatients(patientData.filter((p): p is { id: string; name: string; email: string } => p !== null));
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <Title level={2}>Bun venit, {user?.name}!</Title>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pacienți"
              value={patients.length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Teste Vizualizate"
              value={0}
              prefix={<EyeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Comentarii"
              value={0}
              prefix={<CommentOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Activități"
              value={0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Pacienții Mei" extra={<Link href="/psychologist/patients">Vezi toți</Link>}>
            {patients.length === 0 ? (
              <Empty description="Nu ai pacienți asociați încă" />
            ) : (
              <List
                dataSource={patients}
                renderItem={(patient) => (
                  <List.Item
                    actions={[
                      <Link key="view" href={`/psychologist/patients/${patient.id}`}>
                        <Button type="primary" size="small">
                          Vezi Istoric
                        </Button>
                      </Link>,
                    ]}
                  >
                    <List.Item.Meta
                      title={patient.name}
                      description={patient.email}
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

