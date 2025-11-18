'use client';

import { useState } from 'react';
import { createInvitationAction } from '@/app/actions/invitations';
import { Form, Input, Button, Card, Typography, message, Alert, Space } from 'antd';
import { MailOutlined, CopyOutlined } from '@ant-design/icons';
import { AuthGuard } from '@/components/AuthGuard';

const { Title, Text } = Typography;

export default function InvitePsychologistPage() {
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const onFinish = async (values: { psychologistEmail: string }) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('psychologistEmail', values.psychologistEmail);

      const result = await createInvitationAction(formData);
      
      if (result.error) {
        message.error(result.error);
      } else {
        message.success('Invitație creată cu succes!');
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
      <div className="max-w-2xl mx-auto">
        <Card>
          <Title level={2}>Invită Psiholog</Title>
          <Text type="secondary" className="block mb-6">
            Trimite o invitație unui psiholog pentru a-ți putea vedea rezultatele testelor
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
                <Space direction="vertical" className="w-full">
                  <Text copyable={{ text: inviteLink }}>
                    {inviteLink}
                  </Text>
                  <Button
                    icon={<CopyOutlined />}
                    onClick={copyToClipboard}
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
      </div>
    </AuthGuard>
  );
}

