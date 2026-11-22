// FEATURE: Đăng nhập · Đăng ký · Xác thực OTP (SC-02, SC-03, SC-04).
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, Tag } from 'antd';
import { LockOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { api } from '@shared/api.js';
import { USE_MOCK } from '@shared/config.js';
import { isEmail, isPhone, isStrongPassword, safeNext } from '@shared/lib.js';
import { useAction } from '@shared/ui.jsx';
import { ROLES, homeFor, useAuth } from '@entities/user.jsx';

/* ---------- API ---------- */
const login = (email, password) => api('/api/auth/login', { method: 'POST', auth: false, body: { email, password } });
const register = (payload) => api('/api/auth/register', { method: 'POST', auth: false, body: payload });
const verifyOtp = (email, otp) => api('/api/auth/otp/verify', { method: 'POST', auth: false, body: { email, otp } });

/* ---------- Email đang chờ xác thực OTP (mất khi đóng tab) ---------- */
const PENDING = 'ccms_pending_email';
export const getPendingEmail = () => { try { return sessionStorage.getItem(PENDING) || ''; } catch { return ''; } };
const setPendingEmail = (v) => { try { sessionStorage.setItem(PENDING, v); } catch { /* bỏ qua */ } };
const clearPendingEmail = () => { try { sessionStorage.removeItem(PENDING); } catch { /* bỏ qua */ } };

/* ---------- Tài khoản demo (chỉ hiện khi chạy dữ liệu giả) ---------- */
const DEMO = [['customer@demo.vn', 'customer'], ['staff@demo.vn', 'cs_staff'], ['dept@demo.vn', 'dept_staff'], ['manager@demo.vn', 'manager']];

/* ---------- SC-04 Đăng nhập ---------- */
export function LoginForm({ next }) {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login: setLogin } = useAuth();
  const [submit, loading] = useAction(async ({ email, password }) => {
    const res = await login(email.trim(), password);
    setLogin({ token: res.token, user: res.user });
    navigate(safeNext(next) || homeFor(res.user.role), { replace: true });
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
      {USE_MOCK && (
        <div className="demo-box">
          <div className="mu">Chạy dữ liệu giả — bấm để điền sẵn tài khoản (mật khẩu <b>Demo@1234</b>):</div>
          <div className="demo-tags">
            {DEMO.map(([email, role]) => (
              <Tag key={role} color="blue" style={{ cursor: 'pointer' }} onClick={() => form.setFieldsValue({ email, password: 'Demo@1234' })}>{ROLES[role]}</Tag>
            ))}
          </div>
        </div>
      )}
    </Form>
  );
}

/* ---------- SC-02 Đăng ký (BR-04: xác thực OTP trước khi tạo tài khoản) ---------- */
export function RegisterForm() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [submit, loading] = useAction(async (v) => {
    // Backend tạo và gửi OTP (email/SMS). FE chỉ gọi API rồi chuyển sang màn nhập mã.
    await register({ full_name: v.full_name.trim(), email: v.email.trim(), phone: v.phone.trim(), password: v.password });
    setPendingEmail(v.email.trim());
    navigate('/otp');
  }, { form });

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
      <Button type="primary" htmlType="submit" block loading={loading} className="btn-accent">Nhận mã OTP</Button>
    </Form>
  );
}

/* ---------- SC-03 Nhập mã OTP ---------- */
export function OtpForm({ email }) {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [submit, loading] = useAction(async ({ otp }) => {
    await verifyOtp(email, otp);
    clearPendingEmail();
    navigate('/login');
  }, { form, success: 'Tạo tài khoản thành công. Hãy đăng nhập.' });

  return (
    <Form form={form} layout="vertical" size="large" onFinish={submit} style={{ textAlign: 'center' }}>
      <Form.Item name="otp" rules={[{ pattern: /^\d{6}$/, required: true, message: 'Nhập đủ 6 chữ số.' }]}>
        <Input.OTP length={6} size="large" />
      </Form.Item>
      <Button type="primary" htmlType="submit" block loading={loading} className="btn-accent">Xác thực</Button>
    </Form>
  );
}
