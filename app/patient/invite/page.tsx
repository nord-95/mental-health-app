'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { createInvitationAction } from '@/app/actions/invitations';
import { Form, Input, Button, Card, Typography, message, Alert, Space, Row, Col } from 'antd';
import { MailOutlined, CopyOutlined, TeamOutlined } from '@ant-design/icons';
import { AuthGuard } from '@/components/AuthGuard';

const { Title, Text } = Typography;

export default function InvitePsychologistPage() {
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const onFinish = async (values: { psychologistEmail: string }) => {
    if (!userId) {
      message.error('Nu ești autentificat');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('psychologistEmail', values.psychologistEmail);

      const result = await createInvitationAction(formData);
      
      if (result.error) {
        message.error(result.error);
      } else {
        message.success('Invitație creată și email trimis cu succes!');
        setInviteLink(result.inviteLink || null);
      }
    } catch (error: any) {
      message.error(error.message || 'Eroare la crearea invitației');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      message.success('Link copiat în clipboard!');
    }
  };

  return (
    <AuthGuard requireRole="patient">
      <div>
        <Title level={2} className="mb-6">
          <TeamOutlined className="mr-2" />
          Invită Psiholog
        </Title>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16} xl={12}>
            <Card>
              <Text type="secondary" className="block mb-6">
                Trimite o invitație unui psiholog pentru a-ți putea vedea rezultatele testelor și a primi feedback profesional.
              </Text>

              <Form
                name="invite"
                onFinish={onFinish}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="psychologistEmail"
                  label="Email Psiholog"
                  rules={[
                    { required: true, message: 'Te rugăm să introduci email-ul psihologului!' },
                    { type: 'email', message: 'Email invalid!' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="email@example.com"
                  />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading}>
                    Trimite Invitație
                  </Button>
                </Form.Item>
              </Form>

              {inviteLink && (
                <Alert
                  message="Link de invitație generat"
                  description={
                    <Space direction="vertical" className="w-full mt-2">
                      <Text copyable={{ text: inviteLink }} className="block">
                        {inviteLink}
                      </Text>
                      <Button
                        icon={<CopyOutlined />}
                        onClick={copyToClipboard}
                        block
                      >
                        Copiază Link
                      </Button>
                    </Space>
                  }
                  type="success"
                  className="mt-4"
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </AuthGuard>
  );
}

