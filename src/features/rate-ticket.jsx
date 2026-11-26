// FEATURE: Đánh giá mức hài lòng sau khi phiếu được giải quyết (SC-11).
import { Button, Form, Input, Rate } from 'antd';
import { api } from '@shared/api.js';
import { useAction } from '@shared/ui.jsx';

const rateTicket = (id, stars, comment) => api(`/api/feedbacks/${id}/rating`, { method: 'POST', body: { stars, comment } });
const LABELS = ['Rất tệ', 'Chưa tốt', 'Bình thường', 'Hài lòng', 'Rất hài lòng'];

export function RateForm({ ticket, onDone }) {
  const [form] = Form.useForm();
  const [submit, loading] = useAction((v) => rateTicket(ticket.id, v.stars, v.comment || ''), { form, success: 'Cảm ơn bạn đã đánh giá!', onDone });
  return (
    <Form form={form} layout="vertical" onFinish={submit}>
      <Form.Item name="stars" rules={[{ required: true, message: 'Vui lòng chọn số sao.' }]}>
        <Rate tooltips={LABELS} style={{ fontSize: 34 }} />
      </Form.Item>
      <Form.Item name="comment" label="Nhận xét (không bắt buộc)"><Input.TextArea rows={3} maxLength={500} showCount /></Form.Item>
      <Button type="primary" htmlType="submit" loading={loading}>Gửi đánh giá</Button>
    </Form>
  );
}

// Hiển thị đánh giá đã gửi
export const RatingView = ({ rating }) => (
  <>
    <Rate disabled value={rating.stars} style={{ fontSize: 26 }} />
    {rating.comment ? <p className="pre" style={{ marginTop: 8 }}>{rating.comment}</p> : null}
  </>
);
