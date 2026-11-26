// FEATURE: Đăng nhập · Đăng ký (SC-02, SC-04).
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input } from 'antd';
import { LockOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { api } from '@shared/api.js';
import { isEmail, isPhone, isStrongPassword, safeNext } from '@shared/lib.js';
import { useAction } from '@shared/ui.jsx';
import { homeFor, useAuth } from '@entities/user.jsx';

/* ---------- API ---------- */
const login = (email, password) => api('/api/auth/login', { method: 'POST', auth: false, body: { username: email, password } });
const register = (payload) => api('/api/auth/register', { method: 'POST', auth: false, body: payload });


/* ---------- SC-04 Đăng nhập ---------- */
export function LoginForm({ next }) {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login: setLogin } = useAuth();
  const [submit, loading] = useAction(async ({ email, password }) => {
  const res = await login(email.trim(), password);
  const payload = res?.data || res;
  const rawUser = payload?.user || payload || {};
  const user = {
    ...rawUser,
    username: rawUser.username || email.trim(),
    email: rawUser.email || email.trim(),
    name: rawUser.name || rawUser.fullName || rawUser.full_name || rawUser.username || email.trim(),
    role: String(rawUser.role || 'customer').toLowerCase(),
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
  const navigate = useNavigate();
  const [submit, loading] = useAction(async (v) => {
    await register({
      username: v.email.trim(),
      full_name: v.full_name.trim(),
      email: v.email.trim(),
      phone: v.phone.trim(),
      password: v.password,
      apartment_code: 'Chưa cung cấp'
    });
    navigate('/login', { replace: true });
  }, { form, success: 'Tạo tài khoản thành công. Hãy đăng nhập.' });

  return (
    <Form form={form} layout="vertical" size="large" requiredMark={false} onFinish={submit}>
      <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true, min: 2, message: 'Vui lòng nhập họ tên.' }]}>
        <Input prefix={<UserOutlined />} autoComplete="name" />
      </Form.Item>
      <div className="row2">
        <Form.Item name="email" label="Email" rules={[{ validator: (_, v) => isEmail(v) ? Promise.resolve() : Promise.reject(new Error('Email không hợp lệ.')) }]}>
          <Input prefix={<MailOutlined />} autoComplete="email" />
        </Form.Item>
        <Form.Item name="phone" label="Số điện thoại" rules={[{ validator: (_, v) => isPhone(v) ? Promise.resolve() : Promise.reject(new Error('10 chữ số, bắt đầu bằng 0.')) }]}>
          <Input prefix={<PhoneOutlined />} placeholder="0901234567" inputMode="tel" autoComplete="tel" />
        </Form.Item>
      </div>
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
