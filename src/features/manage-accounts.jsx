/* FEATURE: Các form/modal quản lý account cho màn hình manager-accounts */
import { Alert, Button, Card, Descriptions, Form, Input, Popconfirm, Select, Space, Tag, Tooltip } from 'antd';
import {
  CheckCircleOutlined, LockOutlined, MailOutlined,
  PhoneOutlined, UnlockOutlined, UserOutlined,
} from '@ant-design/icons';
import { isEmail, isPhone } from '@shared/lib.js';
import { useAction } from '@shared/ui.jsx';
import {
  ACCOUNT_ROLE_COLOR, ACCOUNT_ROLE_LABEL, ACCOUNT_STATUS_COLOR, ACCOUNT_STATUS_LABEL,
  createStaffAccount, patchCustomerAccount, resetCustomerPassword,
  resetStaffPassword, toggleStaffStatus, updateCustomerAccount, updateStaffAccount,
} from '@entities/account.js';
import { DEPARTMENT_LABEL } from '@entities/staff.js';
import './features.css';

// ─── Huy hiệu trạng thái tài khoản ─────────────────────────────────────────
export function AccountStatusBadge({ active, blocked }) {
  if (blocked) return <Tag color="red">Bị khóa</Tag>;
  if (!active)  return <Tag color="default">Vô hiệu hóa</Tag>;
  return <Tag color="green">Hoạt động</Tag>;
}

// ─── Form tạo / sửa tài khoản nhân viên ────────────────────────────────────
const STAFF_ROLES = ['cs_staff', 'manager', 'dept_staff'];
const DEPT_OPTIONS = Object.entries(DEPARTMENT_LABEL).map(([v, l]) => ({ value: v, label: l }));
const ROLE_OPTIONS = STAFF_ROLES.map((r) => ({ value: r, label: ACCOUNT_ROLE_LABEL[r] }));

export function StaffAccountForm({ initial = null, onDone }) {
  const [form] = Form.useForm();
  const isEdit = Boolean(initial);
  const [submit, loading] = useAction(
    (v) => {
      const body = {
        fullName:   v.fullName.trim(),
        email:      v.email.trim(),
        phone:      v.phone?.trim() || '',
        role:       v.role,
        department: v.department || null,
        ...(isEdit ? {} : { password: v.password }),
      };
      return isEdit ? updateStaffAccount(initial.id, body) : createStaffAccount(body);
    },
    { form, success: isEdit ? 'Đã cập nhật tài khoản nhân viên.' : 'Đã tạo tài khoản nhân viên mới.', onDone },
  );

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={submit}
      initialValues={initial
        ? { fullName: initial.fullName, email: initial.email, phone: initial.phone, role: initial.role, department: initial.department }
        : { role: 'cs_staff' }
      }
    >
      <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, min: 2, message: 'Vui lòng nhập họ tên.' }]}>
        <Input prefix={<UserOutlined />} />
      </Form.Item>

      <div className="row2">
        <Form.Item name="email" label="Email" rules={[{ required: true }, { validator: (_, v) => isEmail(v) ? Promise.resolve() : Promise.reject(new Error('Email không hợp lệ.')) }]}>
          <Input prefix={<MailOutlined />} disabled={isEdit} />
        </Form.Item>
        <Form.Item name="phone" label="Số điện thoại" rules={[{ validator: (_, v) => !v || isPhone(v) ? Promise.resolve() : Promise.reject(new Error('10 chữ số, bắt đầu bằng 0.')) }]}>
          <Input prefix={<PhoneOutlined />} inputMode="tel" />
        </Form.Item>
      </div>

      <div className="row2">
        <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
          <Select options={ROLE_OPTIONS} />
        </Form.Item>
        <Form.Item name="department" label="Bộ phận">
          <Select allowClear options={DEPT_OPTIONS} placeholder="(không bắt buộc)" />
        </Form.Item>
      </div>

      {!isEdit && (
        <Form.Item
          name="password"
          label="Mật khẩu tạm"
          rules={[{ required: true, min: 8, message: 'Tối thiểu 8 ký tự.' }]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>
      )}

      <Button type="primary" htmlType="submit" loading={loading}>
        {isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}
      </Button>
    </Form>
  );
}

// ─── Thẻ hành động nhanh cho nhân viên ──────────────────────────────────────
export function StaffAccountActions({ staff, onDone }) {
  const [doToggle, toggling]  = useAction((active) => toggleStaffStatus(staff.id, { active }), { success: 'Đã cập nhật trạng thái.', onDone });
  const [doReset,  resetting] = useAction(() => resetStaffPassword(staff.id),                  { success: 'Đã gửi email đặt lại mật khẩu.', onDone });

  return (
    <Space wrap>
      {staff.active ? (
        <Popconfirm title="Khoá tài khoản này?" onConfirm={() => doToggle(false)} okText="Khoá" okButtonProps={{ danger: true }}>
          <Button danger icon={<LockOutlined />} loading={toggling}>Khoá tài khoản</Button>
        </Popconfirm>
      ) : (
        <Popconfirm title="Mở khoá tài khoản này?" onConfirm={() => doToggle(true)} okText="Mở khoá">
          <Button icon={<UnlockOutlined />} loading={toggling}>Mở khoá</Button>
        </Popconfirm>
      )}
      <Popconfirm title="Đặt lại mật khẩu và gửi email cho nhân viên?" onConfirm={doReset} okText="Xác nhận">
        <Button loading={resetting}>Đặt lại mật khẩu</Button>
      </Popconfirm>
    </Space>
  );
}

// ─── Form sửa thông tin khách hàng ──────────────────────────────────────────
export function CustomerAccountForm({ profile: c, onDone }) {
  const [form] = Form.useForm();
  const [submit, loading] = useAction(
    (v) => updateCustomerAccount(c.id, { fullName: v.fullName.trim(), phone: v.phone.trim(), email: v.email.trim() }),
    { form, success: 'Đã cập nhật thông tin khách hàng.', onDone },
  );

  return (
    <Form form={form} layout="vertical" onFinish={submit}
      key={`${c.id}-${c.email}`}
      initialValues={{ fullName: c.fullName, email: c.email, phone: c.phone }}
    >
      <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, min: 2 }]}>
        <Input prefix={<UserOutlined />} />
      </Form.Item>
      <div className="row2">
        <Form.Item name="email" label="Email" rules={[{ required: true }, { validator: (_, v) => isEmail(v) ? Promise.resolve() : Promise.reject(new Error('Email không hợp lệ.')) }]}>
          <Input prefix={<MailOutlined />} />
        </Form.Item>
        <Form.Item name="phone" label="Số điện thoại" rules={[{ validator: (_, v) => !v || isPhone(v) ? Promise.resolve() : Promise.reject(new Error('10 chữ số, bắt đầu bằng 0.')) }]}>
          <Input prefix={<PhoneOutlined />} inputMode="tel" />
        </Form.Item>
      </div>
      <Button type="primary" htmlType="submit" loading={loading}>Lưu thay đổi</Button>
    </Form>
  );
}

// ─── Thẻ hành động nhanh cho khách hàng ─────────────────────────────────────
export function CustomerAccountActions({ customer: c, onDone }) {
  const [doBlock,   blocking]  = useAction((blocked) => patchCustomerAccount(c.id, { blocked }),                    { success: 'Đã cập nhật trạng thái khóa.', onDone });
  const [doVerify,  verifying] = useAction(() => patchCustomerAccount(c.id, { verifiedResident: true }),             { success: 'Đã xác minh cư dân.', onDone });
  const [doReset,   resetting] = useAction(() => resetCustomerPassword(c.id),                                       { success: 'Đã gửi link đặt lại mật khẩu.', onDone });
  const [doClear,   clearing]  = useAction(() => patchCustomerAccount(c.id, { spamStrikes: 0 }),                     { success: 'Đã xóa vi phạm spam.', onDone });

  return (
    <Space wrap size={[8, 8]}>
      {c.blocked ? (
        <Popconfirm title="Mở khóa tài khoản khách hàng này?" onConfirm={() => doBlock(false)} okText="Mở khóa">
          <Button icon={<UnlockOutlined />} loading={blocking}>Mở khóa</Button>
        </Popconfirm>
      ) : (
        <Popconfirm title="Khóa tài khoản khách hàng này?" onConfirm={() => doBlock(true)} okText="Khóa" okButtonProps={{ danger: true }}>
          <Button danger icon={<LockOutlined />} loading={blocking}>Khóa tài khoản</Button>
        </Popconfirm>
      )}

      {!c.verifiedResident && (
        <Popconfirm title="Xác minh cư dân cho khách hàng này?" onConfirm={doVerify} okText="Xác minh">
          <Button icon={<CheckCircleOutlined />} loading={verifying}>Xác minh cư dân</Button>
        </Popconfirm>
      )}

      {(c.spamStrikes ?? 0) > 0 && (
        <Tooltip title={`Hiện có ${c.spamStrikes} vi phạm`}>
          <Popconfirm title="Xóa toàn bộ vi phạm spam?" onConfirm={doClear} okText="Xóa">
            <Button loading={clearing}>Xóa vi phạm spam</Button>
          </Popconfirm>
        </Tooltip>
      )}

      <Popconfirm title="Gửi link đặt lại mật khẩu cho khách hàng?" onConfirm={doReset} okText="Gửi">
        <Button loading={resetting}>Đặt lại mật khẩu</Button>
      </Popconfirm>
    </Space>
  );
}

// ─── Thẻ thông tin chi tiết tài khoản nhân viên ─────────────────────────────
export function StaffAccountCard({ staff: s }) {
  return (
    <Descriptions size="small" column={{ xs: 1, sm: 2 }} items={[
      { key: 'id',    label: 'ID',        children: <code>{s.id}</code> },
      { key: 'role',  label: 'Vai trò',   children: <Tag color={ACCOUNT_ROLE_COLOR[s.role]}>{ACCOUNT_ROLE_LABEL[s.role] || s.role}</Tag> },
      { key: 'dept',  label: 'Bộ phận',   children: DEPARTMENT_LABEL[s.department] || s.department || '–' },
      { key: 'email', label: 'Email',      children: s.email },
      { key: 'phone', label: 'Điện thoại', children: s.phone || '–' },
      { key: 'st',    label: 'Trạng thái', children: <Tag color={s.active ? ACCOUNT_STATUS_COLOR.active : ACCOUNT_STATUS_COLOR.inactive}>{s.active ? ACCOUNT_STATUS_LABEL.active : ACCOUNT_STATUS_LABEL.inactive}</Tag> },
    ]} />
  );
}

// ─── Thẻ thông tin chi tiết tài khoản khách hàng ────────────────────────────
export function CustomerAccountCard({ customer: c }) {
  return (
    <Descriptions size="small" column={{ xs: 1, sm: 2 }} items={[
      { key: 'id',    label: 'ID',              children: <code>{c.id}</code> },
      { key: 'apt',   label: 'Mã căn hộ',       children: <b>{c.apartmentCode || '–'}</b> },
      { key: 'email', label: 'Email',             children: c.email },
      { key: 'phone', label: 'Điện thoại',        children: c.phone || '–' },
      { key: 'ver',   label: 'Xác minh cư dân',   children: <Tag color={c.verifiedResident ? 'green' : 'orange'}>{c.verifiedResident ? 'Đã xác minh' : 'Chưa xác minh'}</Tag> },
      { key: 'blk',   label: 'Khóa',              children: <Tag color={c.blocked ? 'red' : 'green'}>{c.blocked ? 'Đang bị khóa' : 'Bình thường'}</Tag> },
      { key: 'spam',  label: 'Vi phạm spam',       children: `${c.spamStrikes ?? 0} lần` },
      { key: 'trust', label: 'Điểm tin cậy',       children: `${c.ratingTrustScore ?? 100}%` },
    ]} />
  );
}
