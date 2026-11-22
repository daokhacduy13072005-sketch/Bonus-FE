// WIDGET: Khung 2 cột (ảnh bên trái, form bên phải) dùng chung cho Đăng nhập / Đăng ký / OTP / Quên mật khẩu.
import { CheckCircleFilled } from '@ant-design/icons';
import nen from '@shared/assets/nen.jpg';
import './widgets.css';

export function AuthShell({ title, subtitle, children, footer, width = 980 }) {
  return (
    <section className="auth" style={{ maxWidth: width }}>
      <aside className="auth-side" style={{ backgroundImage: `linear-gradient(165deg, rgba(6,53,122,.93), rgba(11,94,215,.78)), url(${nen})` }} aria-hidden="true">
        <span className="pill">Cổng Cư Dân</span>
        <h2>Tiếng nói của cư dân, được lắng nghe &amp; xử lý minh bạch.</h2>
        <ul>
          <li><CheckCircleFilled /> Gửi phản ánh kèm hình ảnh chỉ trong vài phút</li>
          <li><CheckCircleFilled /> Theo dõi tiến độ theo mã tra cứu riêng</li>
          <li><CheckCircleFilled /> Đánh giá kết quả &amp; mở lại phiếu khi chưa hài lòng</li>
        </ul>
      </aside>
      <div className="auth-main">
        <h1>{title}</h1>
        {subtitle && <p className="mu auth-sub">{subtitle}</p>}
        {children}
        {footer && <div className="auth-foot">{footer}</div>}
      </div>
    </section>
  );
}
