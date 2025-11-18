'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { getInvitationByToken, acceptInvitation, createUser, createPatientPsychologistLink } from '@/firebase/firestore';
import { Form, Input, Button, Card, message, Typography, Spin, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import type { Invitation } from '@/lib/types';

const { Title, Text } = Typography;

export default function AcceptInvitePage() {
  const [loading, setLoading] = useState(false);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      message.error('Token de invitație lipsă!');
      router.push('/auth/login');
      return;
    }

    getInvitationByToken(token).then((inv) => {
      if (!inv) {
        message.error('Invitație invalidă sau expirată!');
        router.push('/auth/login');
        return;
      }
      if (inv.acceptedAt) {
        message.warning('Această invitație a fost deja acceptată!');
        router.push('/auth/login');
        return;
      }
      setInvitation(inv);
      setChecking(false);
    }).catch(() => {
      message.error('Eroare la verificarea invitației!');
      router.push('/auth/login');
    });
  }, [searchParams, router]);

  const onFinish = async (values: { name: string; password: string }) => {
    if (!invitation) return;

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        invitation.toEmail,
        values.password
      );
      
      await createUser({
        uid: userCredential.user.uid,
        name: values.name,
        email: invitation.toEmail,
        role: 'psychologist',
      });
      
      await acceptInvitation(invitation.id);
      await createPatientPsychologistLink({
        patientId: invitation.fromUserId,
        psychologistId: userCredential.user.uid,
      });
      
      message.success('Invitație acceptată cu succes!');
      router.push('/dashboard');
    } catch (error: any) {
      message.error(error.message || 'Eroare la acceptarea invitației');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-6">
          <Title level={2}>Acceptă Invitația</Title>
          <Text type="secondary">Completează datele pentru a deveni psiholog</Text>
        </div>

        <Alert
          message={`Ai fost invitat să devii psiholog pentru pacientul asociat cu acest email: ${invitation.toEmail}`}
          type="info"
          className="mb-4"
        />

        <Form
          name="accept-invite"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          initialValues={{ email: invitation.toEmail }}
        >
          <Form.Item
            label="Email"
            name="email"
          >
            <Input
              prefix={<MailOutlined />}
              disabled
            />
          </Form.Item>

          <Form.Item
            name="name"
            label="Nume complet"
            rules={[{ required: true, message: 'Te rugăm să introduci numele!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nume complet"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Parolă"
            rules={[
              { required: true, message: 'Te rugăm să introduci parola!' },
              { min: 6, message: 'Parola trebuie să aibă minim 6 caractere!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Parolă"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Acceptă Invitația
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

