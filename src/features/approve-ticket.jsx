// FEATURE: Quản lý phê duyệt / từ chối phương án của bộ phận (BR-11) cho phiếu khẩn cấp.
import { useState } from 'react';
import { Button, Card, Form, Input, Space } from 'antd';
import { api } from '@shared/api.js';
import { useAction } from '@shared/ui.jsx';
import './features.css';

export function ApproveCard({ ticket: c, user, onDone }) {
  const [form] = Form.useForm();
  const [decision, setDecision] = useState('approve');          // nút nào được bấm quyết định approve/reject
  const [submit, loading] = useAction((v) => api(`/api/complaints/${c.id}/approval`, { method: 'POST', body: { decision, reason: (v.reason || '').trim() } }),
    { form, success: 'Đã ghi nhận quyết định.', onDone });
  if (user.role !== 'manager' || c.status !== 'PendingApproval') return null;

  return (
    <Card title={<>Phê duyệt phương án <span className="uc">BR-11</span></>} className="lift approve-card">
      {c.assignments.filter((a) => a.status === 'Done').map((a, i) => (
        <div key={i} className="proposal">
          <div className="mu">{a.department_name} đề xuất:</div>
          <p className="pre">{a.result_note}</p>
          <p style={{ margin: '6px 0 0' }}><b>Giải pháp:</b> {a.solution}</p>
        </div>
      ))}
      <Form form={form} layout="vertical" onFinish={submit} style={{ marginTop: 16 }}>
        <Form.Item name="reason" label="Lý do / ghi chú (bắt buộc khi từ chối)"
          rules={[({ getFieldValue }) => ({ validator: (_, v) => decision === 'reject' && !(v || '').trim() ? Promise.reject(new Error('Bắt buộc khi từ chối.')) : Promise.resolve() })]}>
          <Input.TextArea rows={2} />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading} onClick={() => setDecision('approve')}>Duyệt</Button>
          <Button danger type="primary" htmlType="submit" loading={loading} onClick={() => setDecision('reject')}>Từ chối</Button>
        </Space>
      </Form>
    </Card>
  );
}
