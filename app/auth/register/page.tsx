'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { createUser } from '@/firebase/firestore';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: { name: string; email: string; password: string }) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      
      await createUser({
        uid: userCredential.user.uid,
        name: values.name,
        email: values.email,
        role: 'patient',
      });
      
      message.success('Cont creat cu succes!');
      router.push('/dashboard');
    } catch (error: any) {
      message.error(error.message || 'Eroare la crearea contului');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-6">
          <Title level={2}>Înregistrare</Title>
          <Text type="secondary">Creează un cont nou (Pacient)</Text>
        </div>
        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Te rugăm să introduci numele!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nume complet"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Te rugăm să introduci email-ul!' },
              { type: 'email', message: 'Email invalid!' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
            />
          </Form.Item>

          <Form.Item
            name="password"
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
              Înregistrare
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <Text>
            Ai deja cont?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Autentifică-te
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}

