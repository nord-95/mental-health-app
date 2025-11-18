'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTestTemplate } from '@/firebase/firestore';
import { createResponseAction } from '@/app/actions/responses';
import { Form, Radio, Button, Card, Typography, Space, message, Spin, Divider } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import type { TestTemplate, Answer } from '@/lib/types';
import { AuthGuard } from '@/components/AuthGuard';

const { Title, Text } = Typography;

export default function TakeTestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string;
  const [template, setTemplate] = useState<TestTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    getTestTemplate(testId).then((data) => {
      if (!data) {
        message.error('Test nu a fost găsit');
        router.push('/tests');
        return;
      }
      setTemplate(data);
      setLoading(false);
    });
  }, [testId, router]);

  const onFinish = async (values: Record<string, any>) => {
    if (!template) return;

    try {
      setSubmitting(true);
      
      const answers: Answer[] = Object.entries(values).map(([questionId, optionValue]) => {
        const question = template.questions.find(q => q.id === questionId);
        const option = question?.options.find(o => 
          o.value === optionValue || String(o.value) === String(optionValue)
        );
        return {
          questionId,
          optionValue: optionValue as string | number,
          score: option?.score || 0,
        };
      });

      const formData = new FormData();
      formData.append('testId', `test_${Date.now()}`);
      formData.append('templateId', template.id);
      formData.append('answers', JSON.stringify(answers));

      const result = await createResponseAction(formData);
      
      if (result.error) {
        message.error(result.error);
      } else {
        message.success('Test completat cu succes!');
        router.push(`/responses/${result.responseId}`);
      }
    } catch (error: any) {
      message.error(error.message || 'Eroare la salvarea răspunsului');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!template) {
    return null;
  }

  // Group questions by section if they have sections
  const questionsBySection = template.questions.reduce((acc, q) => {
    const section = q.section || 'general';
    if (!acc[section]) acc[section] = [];
    acc[section].push(q);
    return acc;
  }, {} as Record<string, typeof template.questions>);

  return (
    <AuthGuard requireRole="patient">
      <div className="max-w-4xl mx-auto">
        <Card>
          <Title level={2}>{template.title}</Title>
          {template.description && (
            <Text type="secondary" className="block mb-6">
              {template.description}
            </Text>
          )}

          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            className="mt-6"
          >
            {Object.entries(questionsBySection).map(([section, questions]) => (
              <div key={section}>
                {section !== 'general' && (
                  <>
                    <Title level={4} className="mt-6 mb-4">
                      {section}
                    </Title>
                    <Divider />
                  </>
                )}

                {questions.map((question, index) => (
                  <Form.Item
                    key={question.id}
                    name={question.id}
                    label={
                      <Text strong>
                        {section === 'general' ? `${index + 1}. ` : ''}
                        {question.text}
                      </Text>
                    }
                    rules={[{ required: true, message: 'Te rugăm să selectezi un răspuns' }]}
                    className="mb-6"
                  >
                    <Radio.Group>
                      <Space direction="vertical">
                        {question.options.map((option) => (
                          <Radio key={String(option.value)} value={option.value}>
                            {option.label}
                          </Radio>
                        ))}
                      </Space>
                    </Radio.Group>
                  </Form.Item>
                ))}
              </div>
            ))}

            <Form.Item className="mt-8">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<CheckCircleOutlined />}
                loading={submitting}
                block
              >
                Finalizează Testul
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AuthGuard>
  );
}

