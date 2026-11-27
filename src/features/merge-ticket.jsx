// FEATURE: CS Staff / Manager gộp phiếu trùng vào phiếu gốc (POST /api/feedbacks/{id}/merge).
import { Link } from 'react-router-dom';
import { Alert, Button, Card, Form, Input, InputNumber, Space, Tag } from 'antd';
import { useAction } from '@shared/ui.jsx';
import { mergeTicket } from '@entities/ticket.jsx';
import './features.css';

const FINAL_STATUSES = ['Closed', 'Rejected', 'Merged'];

export function MergeCard({ ticket: c, user, onDone }) {
  const [form] = Form.useForm();
  const basePath = user.role === 'manager' ? '/manager/complaints' : '/staff/complaints';
  const [submit, loading] = useAction(
    (v) => mergeTicket(c.id, {
      originalFeedbackId: Number(v.originalFeedbackId),
      note: (v.note || '').trim() || undefined,
    }),
    { form, success: 'Đã gộp phiếu trùng vào phiếu gốc.', onDone },
  );

  if (FINAL_STATUSES.includes(c.status)) return null;
  const suspected = c.suspectedDuplicateIds || [];

  return (
    <Card title={<>Gộp phiếu trùng lặp <span className="uc">BE</span></>} className="lift">
      {suspected.length > 0 && (
        <Alert type="warning" showIcon style={{ marginBottom: 16 }}
          message="Hệ thống phát hiện phiếu có dấu hiệu trùng lặp"
          description={
            <Space wrap style={{ marginTop: 6 }}>
              <span>Các phiếu nghi trùng:</span>
              {suspected.map((dupId) => (
                <Link key={dupId} to={`${basePath}/${dupId}`}>
                  <Tag color="orange">Phiếu #{dupId}</Tag>
                </Link>
              ))}
            </Space>
          } />
      )}
      <Form form={form} layout="vertical" onFinish={submit}
        initialValues={{ originalFeedbackId: suspected[0] }}>
        <div className="row2">
          <Form.Item name="originalFeedbackId" label="ID phiếu gốc muốn gộp vào"
            rules={[{ required: true, message: 'Nhập ID phiếu gốc.' }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Ví dụ: 1" />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú gộp phiếu (không bắt buộc)">
            <Input placeholder="Trùng nội dung phản ánh..." maxLength={300} />
          </Form.Item>
        </div>
        <Button type="primary" htmlType="submit" loading={loading}>Gộp vào phiếu gốc</Button>
      </Form>
    </Card>
  );
}
