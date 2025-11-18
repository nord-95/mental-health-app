'use client';

import { useEffect, useState } from 'react';
import { getAllTestTemplates } from '@/firebase/firestore';
import { Card, List, Button, Typography, Empty, Spin, Row, Col } from 'antd';
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
      <Title level={2} className="mb-6">Teste Disponibile</Title>
      
      {templates.length === 0 ? (
        <Card>
          <Empty description="Nu sunt teste disponibile" />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {templates.map((template) => (
            <Col xs={24} sm={12} md={8} lg={6} key={template.id}>
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <FileTextOutlined />
                    <span className="truncate">{template.title}</span>
                  </div>
                }
                extra={
                  <Link href={`/tests/${template.id}`}>
                    <Button type="primary" size="small">
                      Completează
                    </Button>
                  </Link>
                }
                className="h-full"
                hoverable
              >
                <Text type="secondary" className="block mb-4">
                  {template.description?.substring(0, 120) || 'Fără descriere'}
                  {template.description && template.description.length > 120 && '...'}
                </Text>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Text type="secondary" className="text-sm">
                    <FileTextOutlined className="mr-1" />
                    {template.questions.length} întrebări
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

