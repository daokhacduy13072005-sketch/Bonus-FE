// FEATURE: Đăng nhập · Đăng ký (SC-02, SC-04).
import { useNavigate } from 'react-router-dom';
import { App, Button, DatePicker, Form, Input, Radio } from 'antd';
import { HomeOutlined, LockOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { api } from '@shared/api.js';
import { isEmail, isPhone, isStrongPassword, safeNext } from '@shared/lib.js';
import { useAction } from '@shared/ui.jsx';
import { homeFor, useAuth } from '@entities/user.jsx';

/* ---------- API ---------- */
const login = (email, password) => api('/api/auth/login', { method: 'POST', auth: false, body: { username: email, password } });
const register = (payload) => api('/api/auth/register', { method: 'POST', auth: false, body: payload });
const ROLE_MAP = { cs_manager: 'manager' };

/* ---------- SC-04 Đăng nhập ---------- */
export function LoginForm({ next }) {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login: setLogin } = useAuth();
  const [submit, loading] = useAction(async ({ email, password }) => {
    const res = await login(email.trim(), password);
    const payload = res?.data || res;
    const rawUser = payload?.user || payload || {};
    const rawRole = String(rawUser.role || 'customer').toLowerCase();
    const user = {
      ...rawUser,
      username: rawUser.username || email.trim(),
      email: rawUser.email || email.trim(),
      name: rawUser.name || rawUser.fullName || rawUser.full_name || rawUser.username || email.trim(),
      role: ROLE_MAP[rawRole] || rawRole,
      id: rawUser.id || rawUser.accountId || rawUser.userId,
      customer_id: rawUser.customerId || rawUser.customer_id,
      staff_id: rawUser.staffId || rawUser.staff_id,
      apartment_code: rawUser.apartmentCode || rawUser.apartment_code,
    };
    setLogin({ token: payload?.token || payload?.accessToken, user });
    navigate(safeNext(next) || homeFor(user.role), { replace: true });
  }, { form });

  return (
    <Form form={form} layout="vertical" size="large" requiredMark={false} onFinish={submit}>
      <Form.Item name="email" label="Email đăng nhập" rules={[{ required: true, message: 'Vui lòng nhập email.' }, { type: 'email', message: 'Email không hợp lệ.' }]}>
        <Input prefix={<MailOutlined />} placeholder="ten@email.com" autoComplete="username" />
      </Form.Item>
      <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu.' }]}>
        <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" autoComplete="current-password" />
      </Form.Item>
      <Button type="primary" htmlType="submit" block loading={loading} className="btn-accent">Đăng nhập</Button>
    </Form>
  );
}

/* ---------- SC-02 Đăng ký ---------- */
export function RegisterForm() {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const residentType = Form.useWatch('residentType', form);
  const [submit, loading] = useAction(async (v) => {
    const isTenant = v.residentType === 'TENANT';
    const [start, end] = v.contractRange || [];
    const res = await register({
      username: v.email.trim(),
      fullName: v.full_name.trim(),
      email: v.email.trim(),
      phone: v.phone.trim(),
      password: v.password,
      apartmentCode: v.apartmentCode.trim().toUpperCase(),
      residentType: v.residentType,
      ...(isTenant && start && end ? {
        rentalContractStartDate: start.format('YYYY-MM-DD'),
        rentalContractEndDate: end.format('YYYY-MM-DD'),
      } : {}),
    });
    if (res?.accountStatus === 'PENDING') {
      message.success('Đăng ký thành công! Tài khoản đang chờ Ban quản lý duyệt trước khi đăng nhập.', 6);
    } else {
      message.success('Tạo tài khoản thành công. Hãy đăng nhập.');
    }
    navigate('/login', { replace: true });
  }, { form });

  return (
    <Form form={form} layout="vertical" size="large" requiredMark={false} onFinish={submit}
      initialValues={{ residentType: 'OWNER' }}>
      <div className="row2">
        <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true, min: 2, message: 'Vui lòng nhập họ tên.' }]}>
          <Input prefix={<UserOutlined />} autoComplete="name" />
        </Form.Item>
        <Form.Item name="apartmentCode" label="Mã căn hộ" rules={[{ required: true, min: 2, message: 'Vui lòng nhập mã căn hộ.' }]}>
          <Input prefix={<HomeOutlined />} placeholder="Ví dụ: A1-0501" autoComplete="off" />
        </Form.Item>
      </div>
      <div className="row2">
        <Form.Item name="email" label="Email" rules={[{ validator: (_, v) => isEmail(v) ? Promise.resolve() : Promise.reject(new Error('Email không hợp lệ.')) }]}>
          <Input prefix={<MailOutlined />} autoComplete="email" />
        </Form.Item>
        <Form.Item name="phone" label="Số điện thoại" rules={[{ validator: (_, v) => isPhone(v) ? Promise.resolve() : Promise.reject(new Error('10 chữ số, bắt đầu bằng 0.')) }]}>
          <Input prefix={<PhoneOutlined />} placeholder="0901234567" inputMode="tel" autoComplete="tel" />
        </Form.Item>
      </div>
      <Form.Item name="residentType" label="Loại cư dân">
        <Radio.Group optionType="button" buttonStyle="solid" options={[
          { value: 'OWNER', label: 'Chủ căn hộ' },
          { value: 'TENANT', label: 'Người thuê' },
        ]} />
      </Form.Item>
      {residentType === 'TENANT' && (
        <Form.Item name="contractRange" label="Thời hạn hợp đồng thuê"
          rules={[{ required: true, message: 'Người thuê cần chọn ngày bắt đầu và kết thúc hợp đồng.' }]}>
          <DatePicker.RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder={['Ngày bắt đầu', 'Ngày kết thúc']} />
        </Form.Item>
      )}
      <div className="row2">
        <Form.Item name="password" label="Mật khẩu" extra="Tối thiểu 8 ký tự, gồm chữ và số."
          rules={[{ validator: (_, v) => isStrongPassword(v) ? Promise.resolve() : Promise.reject(new Error('Mật khẩu chưa đủ mạnh.')) }]}>
          <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
        </Form.Item>
        <Form.Item name="password2" label="Nhập lại mật khẩu" dependencies={['password']}
          rules={[({ getFieldValue }) => ({ validator: (_, v) => v && v === getFieldValue('password') ? Promise.resolve() : Promise.reject(new Error('Mật khẩu nhập lại không khớp.')) })]}>
          <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
        </Form.Item>
      </div>
      <Button type="primary" htmlType="submit" block loading={loading} className="btn-accent">Tạo tài khoản</Button>
    </Form>
  );
}
