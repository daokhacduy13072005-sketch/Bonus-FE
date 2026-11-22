// FEATURE: Phân loại & đặt mức ưu tiên (UC-07) — CS Staff / Manager.
import { Button, Card, Form, Select } from 'antd';
import { api } from '@shared/api.js';
import { useAction } from '@shared/ui.jsx';
import { PRIORITY_LABEL, SERVICES, TYPE_LABEL } from '@entities/ticket.jsx';
import './features.css';

const toOptions = (obj) => Object.entries(obj).map(([value, label]) => ({ value, label }));

export function ClassifyCard({ ticket: c, onDone }) {
  const [form] = Form.useForm();
  const [submit, loading] = useAction(
    (v) => api(`/api/complaints/${c.id}/classification`, { method: 'PATCH', body: { ...v, expected_updated_at: c.updated_at } }),
    { form, success: 'Đã lưu phân loại.', onDone });
  if (c.status === 'Closed') return null;
  return (
    <Card title={<>Phân loại &amp; mức ưu tiên <span className="uc">UC-07</span></>} className="lift">
      <Form form={form} layout="vertical" onFinish={submit} initialValues={{ type: c.type, service: c.service, priority: c.priority }}>
        <div className="row3">
          <Form.Item name="type" label="Loại"><Select options={toOptions(TYPE_LABEL)} /></Form.Item>
          <Form.Item name="service" label="Dịch vụ"><Select options={SERVICES.map((s) => ({ value: s, label: s }))} /></Form.Item>
          <Form.Item name="priority" label="Ưu tiên"><Select allowClear placeholder="Chưa đặt" options={toOptions(PRIORITY_LABEL)} /></Form.Item>
        </div>
        <Button type="primary" htmlType="submit" loading={loading}>Lưu</Button>
      </Form>
    </Card>
  );
}
