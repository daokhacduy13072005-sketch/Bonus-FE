// FEATURE: Trao đổi & phản hồi cho khách, hoặc ghi chú nội bộ (UC-09).
import { Alert, Button, Card, Checkbox, Form, Input } from 'antd';
import { api } from '@shared/api.js';
import { EmptyState, useAction } from '@shared/ui.jsx';
import { ReplyBlock } from '@entities/ticket.jsx';
import './features.css';

export function RespondCard({ ticket: c, onDone }) {
  const [form] = Form.useForm();
  const [submit, loading] = useAction(
    (v) => api(`/api/complaints/${c.id}/responses`, { method: 'POST', body: { content: v.content, solution: v.solution || '', is_internal: !!v.is_internal } }),
    { form, success: 'Đã gửi.', onDone: async () => { form.resetFields(); await onDone(); } });
  const closed = c.status === 'Closed';
  const critNeedsApproval = c.priority === 'Critical' && c.type === 'complaint' && c.approval?.decision !== 'approved';

  return (
    <Card title={<>Trao đổi &amp; phản hồi <span className="uc">UC-09</span></>} className="lift">
      {c.responses.length ? c.responses.map((r, i) => <ReplyBlock key={i} reply={r} showInternal />) : <EmptyState text="Chưa có phản hồi." />}
      {!closed && (
        <>
          {critNeedsApproval && <Alert type="warning" showIcon style={{ margin: '12px 0' }} message="Phiếu khẩn cấp: cần Quản lý duyệt phương án trước khi gửi kết quả cho khách (server sẽ từ chối nếu chưa duyệt)." />}
          <Form form={form} layout="vertical" onFinish={submit} style={{ marginTop: 12 }}>
            <Form.Item name="content" label="Nội dung trả lời" rules={[{ required: true, min: 3, message: 'Vui lòng nhập nội dung.' }]}><Input.TextArea rows={3} /></Form.Item>
            <Form.Item name="solution" label="Giải pháp"><Input /></Form.Item>
            <Form.Item name="is_internal" valuePropName="checked"><Checkbox>Ghi chú nội bộ (khách không thấy)</Checkbox></Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>Gửi</Button>
          </Form>
        </>
      )}
    </Card>
  );
}
