'use client';

import { useEffect, useState } from 'react';
import { getAllTestTemplates } from '@/firebase/firestore';
import { Card, List, Button, Typography, Empty, Spin } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import Link from 'next/link';
import type { TestTemplate } from '@/lib/types';

const { Title, Text } = Typography;

export default function TestsPage() {
  const [templates, setTemplates] = useState<TestTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTestTemplates().then((data) => {
      setTemplates(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>Teste Disponibile</Title>
      {templates.length === 0 ? (
        <Empty description="Nu sunt teste disponibile" />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
          dataSource={templates}
          renderItem={(template) => (
            <List.Item>
              <Card
                title={template.title}
                extra={
                  <Link href={`/tests/${template.id}`}>
                    <Button type="primary">Completează</Button>
                  </Link>
                }
                className="h-full"
              >
                <Text type="secondary">
                  {template.description?.substring(0, 150) || 'Fără descriere'}
                </Text>
                <div className="mt-4">
                  <Text type="secondary" className="text-sm">
                    {template.questions.length} întrebări
                  </Text>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
}

