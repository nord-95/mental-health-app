'use client';

import { useState } from 'react';
import { createCommentAction } from '@/app/actions/comments';
import { Form, Input, Button, List, Typography, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { formatRomanianDate } from '@/lib/utils';
import type { Comment } from '@/lib/types';

const { Text } = Typography;
const { TextArea } = Input;

interface ResponseCommentsProps {
  responseId: string;
  comments: Comment[];
  onCommentAdded: (comment: Comment) => void;
}

export function ResponseComments({ responseId, comments, onCommentAdded }: ResponseCommentsProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: { text: string }) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('responseId', responseId);
      formData.append('text', values.text);

      const result = await createCommentAction(formData);
      
      if (result.error) {
        message.error(result.error);
      } else {
        message.success('Comentariu adăugat cu succes!');
        form.resetFields();
        // Add the new comment to the list
        onCommentAdded({
          id: result.commentId || '',
          responseId,
          psychologistId: '', // Will be filled by the server
          text: values.text,
          createdAt: new Date(),
        });
      }
    } catch (error: any) {
      message.error(error.message || 'Eroare la adăugarea comentariului');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          name="text"
          rules={[{ required: true, message: 'Te rugăm să introduci un comentariu' }]}
        >
          <TextArea
            rows={4}
            placeholder="Adaugă un comentariu..."
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            loading={submitting}
          >
            Trimite Comentariu
          </Button>
        </Form.Item>
      </Form>

      <List
        dataSource={comments}
        renderItem={(comment) => (
          <List.Item>
            <div className="w-full">
              <Text>{comment.text}</Text>
              <div className="mt-2">
                <Text type="secondary" className="text-sm">
                  {formatRomanianDate(comment.createdAt)}
                </Text>
              </div>
            </div>
          </List.Item>
        )}
        locale={{ emptyText: 'Nu sunt comentarii' }}
      />
    </div>
  );
}

