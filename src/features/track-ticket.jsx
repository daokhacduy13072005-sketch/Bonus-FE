// FEATURE: Tra cứu phiếu theo mã (SC-09). BR-13: chỉ xem được phiếu do chính mình gửi.
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './features.css';

export function TrackForm() {
  const navigate = useNavigate();
  return (
    <Form layout="vertical" size="large" requiredMark={false} onFinish={({ code }) => navigate('/customer/complaints/' + code.trim().toUpperCase())}>
      <Form.Item name="code" label="Mã phiếu" normalize={(v) => (v || '').toUpperCase()}
        rules={[{ required: true, pattern: /^[A-Z0-9-]{4,24}$/, message: 'Nhập mã phiếu hợp lệ, ví dụ FB-20261126-0001.' }]}>
        <Input prefix={<SearchOutlined />} placeholder="FB-20261126-0001" maxLength={24} autoComplete="off" className="code-input" />
      </Form.Item>
      <Button type="primary" htmlType="submit" block className="btn-accent">Tra cứu</Button>
    </Form>
  );
}
