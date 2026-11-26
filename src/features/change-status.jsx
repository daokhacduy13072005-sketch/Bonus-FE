// FEATURE: Đổi trạng thái phiếu (UC-11).
import { Button, Card, Form, Input, Select } from 'antd';
import { api } from '@shared/api.js';
import { useAction } from '@shared/ui.jsx';
import { SIMPLE_TYPES, STATUS_LABEL, TRANSITIONS } from '@entities/ticket.jsx';
import './features.css';

// Khiếu nại phải được phân công trước khi giải quyết (BR-09)
const nextStatuses = (c) => (TRANSITIONS.staff_like[c.status] || []).filter((s) => !(c.status === 'New' && !SIMPLE_TYPES.includes(c.type)));

export function ChangeStatusCard({ ticket: c, onDone }) {
  const [form] = Form.useForm();
  const [submit, loading] = useAction(
    (v) => api(`/api/feedbacks/${c.id}/status`, { method: 'PATCH', body: { to_status: v.to_status, note: v.note || '', expected_updated_at: c.updated_at } }),
    { form, success: 'Đã đổi trạng thái.', onDone });
  const next = nextStatuses(c);
  if (!next.length) return null;
  return (
    <Card title={<>Đổi trạng thái <span className="uc">UC-11</span></>} className="lift">
      <Form form={form} layout="vertical" onFinish={submit} initialValues={{ to_status: next[0] }}>
        <div className="row2">
          <Form.Item name="to_status" label="Chuyển sang"><Select options={next.map((s) => ({ value: s, label: STATUS_LABEL[s] }))} /></Form.Item>
          <Form.Item name="note" label="Ghi chú"><Input /></Form.Item>
        </div>
        <Button type="primary" htmlType="submit" loading={loading}>Cập nhật</Button>
        <p className="mu">Phiếu “Đã giải quyết” bắt buộc có giải pháp (BR-08).</p>
      </Form>
    </Card>
  );
}
