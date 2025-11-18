'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { getResponseComments, getResponse, getTestTemplate } from '@/firebase/firestore';
import { Card, List, Typography, Empty, Spin } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { formatRomanianDate } from '@/lib/utils';
import type { Comment } from '@/lib/types';
import { AuthGuard } from '@/components/AuthGuard';

const { Title, Text } = Typography;

export default function PsychologistCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Get all comments for psychologist's patients
    // For now, show empty state
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <AuthGuard requireRole="psychologist">
      <div>
        <Title level={2}>Comentarii</Title>
        {comments.length === 0 ? (
          <Empty description="Nu ai comentarii încă" />
        ) : (
          <List
            dataSource={comments}
            renderItem={(comment) => (
              <List.Item>
                <Card className="w-full">
                  <Text>{comment.text}</Text>
                  <div className="mt-2">
                    <Text type="secondary" className="text-sm">
                      {formatRomanianDate(comment.createdAt)}
                    </Text>
                    <Link href={`/responses/${comment.responseId}`} className="ml-4">
                      Vezi Răspuns
                    </Link>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        )}
      </div>
    </AuthGuard>
  );
}

