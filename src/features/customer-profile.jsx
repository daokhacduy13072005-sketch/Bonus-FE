// FEATURE: Xem & cập nhật hồ sơ cư dân (/api/customers/me hoặc /api/customers/{id}).
import { Alert, Button, Card, Descriptions, Form, Input, Progress, Table, Tag } from 'antd';
import { MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { fmt, isEmail, isPhone } from '@shared/lib.js';
import { EmptyState, useAction } from '@shared/ui.jsx';
import {
  CONTRACT_STATUS_COLOR, CONTRACT_STATUS_LABEL, RESIDENT_TYPE_LABEL,
  updateCustomer, updateMyProfile,
} from '@entities/customer.js';
import './features.css';

export function CustomerInfoCard({ profile: c }) {
  return (
    <Card title="Thông tin cư dân & hợp đồng" className="lift">
      <Descriptions size="small" column={{ xs: 1, sm: 2 }} items={[
        { key: 'a', label: 'Mã căn hộ', children: <b>{c.apartmentCode || '–'}</b> },
        { key: 'r', label: 'Loại cư dân', children: RESIDENT_TYPE_LABEL[c.residentType] || c.residentType || '–' },
        { key: 'v', label: 'Xác minh cư dân', children: <Tag color={c.verifiedResident ? 'green' : 'orange'}>{c.verifiedResident ? 'Đã xác minh' : 'Chưa xác minh'}</Tag> },
        { key: 'st', label: 'Trạng thái', children: c.blocked ? <Tag color="red">Đang bị khóa gửi phản ánh</Tag> : c.active ? <Tag color="green">Hoạt động</Tag> : <Tag>Vô hiệu hóa</Tag> },
        { key: 'sp', label: 'Vi phạm spam', children: `${c.spamStrikes ?? 0} lần` },
        { key: 'tr', label: 'Điểm tin cậy', children: <Progress percent={c.ratingTrustScore ?? 100} size="small" style={{ maxWidth: 160 }} /> },
        { key: 'cr', label: 'Ngày tạo hồ sơ', span: 2, children: fmt(c.createdAt) },
      ]} />

      {Array.isArray(c.rentalContracts) && c.rentalContracts.length > 0 && (
        <>
          <h4 style={{ margin: '18px 0 8px' }}>Hợp đồng thuê căn hộ</h4>
          <Table size="small" rowKey="id" pagination={false} dataSource={c.rentalContracts}
            locale={{ emptyText: <EmptyState text="Không có hợp đồng thuê." /> }}
            columns={[
              { title: 'Căn hộ', dataIndex: 'apartmentCode' },
              { title: 'Từ ngày', dataIndex: 'startDate' },
              { title: 'Đến ngày', dataIndex: 'endDate' },
              { title: 'Trạng thái', dataIndex: 'status', render: (s) => <Tag color={CONTRACT_STATUS_COLOR[s]}>{CONTRACT_STATUS_LABEL[s] || s}</Tag> },
            ]} />
        </>
      )}
    </Card>
  );
}

export function CustomerProfileForm({ profile, customerId = null, onDone }) {
  const [form] = Form.useForm();
  const isSelf = customerId == null;
  const disabled = isSelf && profile.blocked;
  const [submit, loading] = useAction(
    (v) => {
      const body = { fullName: v.fullName.trim(), phone: v.phone.trim(), email: v.email.trim() };
      return isSelf ? updateMyProfile(body) : updateCustomer(customerId, body);
    },
    { form, success: 'Đã cập nhật thông tin liên hệ.', onDone },
  );

  return (
    <Card title={isSelf ? 'Cập nhật thông tin liên hệ' : 'Chỉnh sửa thông tin liên hệ cư dân'} className="lift">
      {disabled && (
        <Alert type="error" showIcon style={{ marginBottom: 16 }}
          message="Tài khoản đang bị khóa do vi phạm nên không thể tự cập nhật hồ sơ. Vui lòng liên hệ Ban quản lý." />
      )}
      <Form key={profile.id + profile.email + profile.phone + profile.fullName} form={form} layout="vertical"
        disabled={disabled} onFinish={submit}
        initialValues={{ fullName: profile.fullName, phone: profile.phone, email: profile.email }}>
        <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, min: 2, message: 'Vui lòng nhập họ tên.' }]}>
          <Input prefix={<UserOutlined />} />
        </Form.Item>
        <div className="row2">
          <Form.Item name="email" label="Email" rules={[{ validator: (_, v) => isEmail(v) ? Promise.resolve() : Promise.reject(new Error('Email không hợp lệ.')) }]}>
            <Input prefix={<MailOutlined />} />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ validator: (_, v) => isPhone(v) ? Promise.resolve() : Promise.reject(new Error('10 chữ số, bắt đầu bằng 0.')) }]}>
            <Input prefix={<PhoneOutlined />} inputMode="tel" />
          </Form.Item>
        </div>
        <Button type="primary" htmlType="submit" loading={loading}>Lưu thay đổi</Button>
      </Form>
    </Card>
  );
}
