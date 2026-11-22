// FEATURE: Nhân viên bộ phận gửi kết quả điều tra + đề xuất giải pháp (UC-10, SC-16).
import { Alert, Button, Card, Form, Input } from 'antd';
import { api } from '@shared/api.js';
import { useAction } from '@shared/ui.jsx';
import './features.css';

export function TaskResultCard({ assignment: a, ticket, onDone }) {
  const [form] = Form.useForm();
  const [submit, loading] = useAction(
    (v) => api(`/api/assignments/${a.id}/result`, { method: 'PATCH', body: { result_note: v.result_note, solution: v.solution } }),
    { form, success: 'Đã gửi kết quả.', onDone });
  const canEdit = a.status === 'Open';
  return (
    <Card title={<>Kết quả điều tra &amp; giải pháp <span className="uc">UC-10</span></>} className="lift">
      {!canEdit && <Alert type="success" showIcon message="Đã gửi kết quả." style={{ marginBottom: 16 }} />}
      <Form form={form} layout="vertical" disabled={!canEdit} onFinish={submit} initialValues={{ result_note: a.result_note, solution: a.solution }}>
        <Form.Item name="result_note" label="Kết quả điều tra" rules={[{ required: true, min: 10, message: 'Tối thiểu 10 ký tự.' }]}><Input.TextArea rows={4} /></Form.Item>
        <Form.Item name="solution" label="Đề xuất giải pháp" rules={[{ required: true, min: 5, message: 'Vui lòng đề xuất giải pháp (tối thiểu 5 ký tự).' }]}><Input.TextArea rows={3} /></Form.Item>
        {canEdit && <Button type="primary" htmlType="submit" loading={loading}>Gửi kết quả</Button>}
      </Form>
      {ticket.priority === 'Critical' && <p className="mu">Phiếu khẩn cấp: kết quả sẽ được chuyển cho Quản lý duyệt trước khi gửi khách.</p>}
    </Card>
  );
}
