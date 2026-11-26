// FEATURE: CS Staff chuyển cấp phiếu lên Quản lý (UC-12).
import { Button, Card, Form, Input } from 'antd';
import { api } from '@shared/api.js';
import { useAction } from '@shared/ui.jsx';
import './features.css';

export function EscalateCard({ ticket: c, user, onDone }) {
  const [form] = Form.useForm();
  const [submit, loading] = useAction((v) => api(`/api/feedbacks/${c.id}/escalation`, { method: 'POST', body: { reason: v.reason } }),
    { form, success: 'Đã chuyển cấp.', onDone });
  if (user.role !== 'cs_staff' || c.escalated || c.status === 'Closed') return null;
  return (
    <Card title={<>Chuyển cấp lên Quản lý <span className="uc">UC-12</span></>} className="lift">
      <Form form={form} layout="vertical" onFinish={submit}>
        <Form.Item name="reason" label="Lý do" rules={[{ required: true, min: 5, message: 'Nêu lý do (tối thiểu 5 ký tự).' }]}><Input /></Form.Item>
        <Button danger type="primary" htmlType="submit" loading={loading}>Chuyển cấp</Button>
      </Form>
    </Card>
  );
}
