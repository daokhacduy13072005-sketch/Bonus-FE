// FEATURE: Cư dân mở lại phiếu khi chưa hài lòng (SC-11). Tối đa MAX_REOPEN lần.
import { Button, Form, Input } from 'antd';
import { api } from '@shared/api.js';
import { useAction } from '@shared/ui.jsx';
import { MAX_REOPEN } from '@entities/ticket.jsx';

const reopenTicket = (id, reason) => api(`/api/complaints/${id}/reopen`, { method: 'POST', body: { reason } });

export function ReopenForm({ ticket, onDone }) {
  const [form] = Form.useForm();
  const [submit, loading] = useAction((v) => reopenTicket(ticket.id, v.reason.trim()), { form, success: 'Phiếu đã được mở lại.', onDone });
  return (
    <Form form={form} layout="vertical" onFinish={submit}>
      <p className="mu" style={{ marginTop: 0 }}>Chưa hài lòng? Bạn có thể mở lại phiếu (tối đa {MAX_REOPEN} lần).</p>
      <Form.Item name="reason" label="Lý do mở lại" rules={[{ required: true, min: 5, message: 'Vui lòng nêu lý do (tối thiểu 5 ký tự).' }]}>
        <Input.TextArea rows={2} />
      </Form.Item>
      <Button htmlType="submit" loading={loading}>Mở lại phiếu</Button>
    </Form>
  );
}
