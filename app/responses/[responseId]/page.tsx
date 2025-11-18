'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { 
  getResponse, 
  getTestTemplate, 
  getResponseComments, 
  getResponseViews,
  logResponseView,
  getUser,
} from '@/firebase/firestore';
import { Card, Typography, List, Tag, Divider, Empty, Spin, Space } from 'antd';
import { formatRomanianDate } from '@/lib/utils';
import type { TestResponse, TestTemplate, Comment, User } from '@/lib/types';
import { ResponseComments } from '@/components/ResponseComments';
import { AuthGuard } from '@/components/AuthGuard';

const { Title, Text } = Typography;

export default function ResponseDetailPage() {
  const params = useParams();
  const responseId = params.responseId as string;
  const [response, setResponse] = useState<TestResponse | null>(null);
  const [template, setTemplate] = useState<TestTemplate | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [views, setViews] = useState<Array<{ viewerId: string; viewedAt: Date }>>([]);
  const [viewers, setViewers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) return;

      const userData = await getUser(firebaseUser.uid);
      setCurrentUser(userData);

      const responseData = await getResponse(responseId);
      if (!responseData) {
        setLoading(false);
        return;
      }

      setResponse(responseData);
      
      const templateData = await getTestTemplate(responseData.templateId);
      setTemplate(templateData);

      const commentsData = await getResponseComments(responseId);
      setComments(commentsData);

      // Log view if psychologist
      if (userData?.role === 'psychologist') {
        await logResponseView(responseId, firebaseUser.uid);
      }

      const viewsData = await getResponseViews(responseId);
      setViews(viewsData);

      // Get viewer names
      const viewerIds = [...new Set(viewsData.map(v => v.viewerId))];
      const viewerData: Record<string, User> = {};
      for (const id of viewerIds) {
        const viewer = await getUser(id);
        if (viewer) viewerData[id] = viewer;
      }
      setViewers(viewerData);

      setLoading(false);
    });

    return () => unsubscribe();
  }, [responseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!response || !template) {
    return <Empty description="Răspuns nu a fost găsit" />;
  }

  const getAnswerText = (questionId: string, optionValue: string | number) => {
    const question = template.questions.find(q => q.id === questionId);
    const option = question?.options.find(o => 
      o.value === optionValue || String(o.value) === String(optionValue)
    );
    return option?.label || String(optionValue);
  };

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto">
        <Card>
          <Title level={2}>{template.title}</Title>
          <Text type="secondary" className="block mb-4">
            Completat pe {formatRomanianDate(response.createdAt)}
          </Text>
          <Tag color="blue" className="mb-4">
            Scor Total: {response.totalScore}
          </Tag>

          <Divider />

          <Title level={4}>Răspunsuri</Title>
          <List
            dataSource={response.answers}
            renderItem={(answer, index) => {
              const question = template.questions.find(q => q.id === answer.questionId);
              return (
                <List.Item>
                  <div className="w-full">
                    <Text strong>
                      {index + 1}. {question?.text || 'Întrebare necunoscută'}
                    </Text>
                    <div className="mt-2">
                      <Tag color="green">
                        {getAnswerText(answer.questionId, answer.optionValue)} (Scor: {answer.score})
                      </Tag>
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />

          {currentUser?.role === 'psychologist' && (
            <>
              <Divider />
              <Title level={4}>Comentarii</Title>
              <ResponseComments
                responseId={responseId}
                comments={comments}
                onCommentAdded={(comment) => setComments([...comments, comment])}
              />
            </>
          )}

          {currentUser?.role === 'psychologist' && views.length > 0 && (
            <>
              <Divider />
              <Title level={4}>Istoric Vizualizări</Title>
              <List
                dataSource={views}
                renderItem={(view) => (
                  <List.Item>
                    <Text>
                      {viewers[view.viewerId]?.name || 'Utilizator necunoscut'} -{' '}
                      {formatRomanianDate(view.viewedAt)}
                    </Text>
                  </List.Item>
                )}
              />
            </>
          )}
        </Card>
      </div>
    </AuthGuard>
  );
}

