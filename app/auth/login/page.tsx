'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, values.email, values.password);
      message.success('Autentificare reușită!');
      router.push('/dashboard');
    } catch (error: any) {
      message.error(error.message || 'Eroare la autentificare');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-6">
          <Title level={2}>Autentificare</Title>
          <Text type="secondary">Conectează-te la contul tău</Text>
        </div>
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Te rugăm să introduci email-ul!' },
              { type: 'email', message: 'Email invalid!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Te rugăm să introduci parola!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Parolă"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Autentificare
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <Text>
            Nu ai cont?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:underline">
              Înregistrează-te
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}

