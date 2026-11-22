// SC-01 Trang chủ (khách chưa đăng nhập).
import { Link } from 'react-router-dom';
import { Button, Steps } from 'antd';
import { AuditOutlined, ClearOutlined, CarOutlined, CreditCardOutlined, EllipsisOutlined, FormOutlined, ColumnHeightOutlined, SafetyCertificateOutlined,
  SoundOutlined, StarOutlined, ThunderboltOutlined, ToolOutlined, EyeOutlined, MobileOutlined, SafetyOutlined } from '@ant-design/icons';
import { Reveal } from '@shared/ui.jsx';
import { SERVICES } from '@entities/ticket.jsx';
import './pages.css';

const ICON = { 'Vệ sinh': <ClearOutlined />, 'Điện nước': <ThunderboltOutlined />, 'Thang máy': <ColumnHeightOutlined />, 'Gửi xe': <CarOutlined />,
  'Tiếng ồn': <SoundOutlined />, 'An ninh': <SafetyCertificateOutlined />, 'Phí dịch vụ': <CreditCardOutlined />, 'Khác': <EllipsisOutlined /> };

const STEPS = [
  { title: 'Gửi phản hồi', description: 'Chọn loại phản hồi, vị trí sự cố, mô tả và đính kèm hình ảnh.', icon: <FormOutlined /> },
  { title: 'Tiếp nhận & phân loại', description: 'Nhân viên CSKH xác nhận, phân loại và đặt mức ưu tiên.', icon: <AuditOutlined /> },
  { title: 'Bộ phận xử lý', description: 'Phân công đúng bộ phận; phiếu khẩn cấp được Quản lý duyệt phương án.', icon: <ToolOutlined /> },
  { title: 'Đánh giá kết quả', description: 'Nhận phản hồi, chấm sao hoặc mở lại phiếu nếu chưa hài lòng.', icon: <StarOutlined /> },
];

const FEATURES = [
  { icon: <EyeOutlined />, title: 'Minh bạch từng bước', text: 'Mỗi phản hồi có mã tra cứu riêng, theo dõi trạng thái và lịch sử xử lý ngay trên điện thoại.' },
  { icon: <MobileOutlined />, title: 'Gửi nhanh trong vài phút', text: 'Chọn vị trí, mô tả sự cố, đính kèm ảnh. Không cần đến văn phòng Ban quản lý.' },
  { icon: <SafetyOutlined />, title: 'Phân quyền rõ ràng', text: 'Cư dân, CSKH, bộ phận kỹ thuật và Quản lý chỉ thấy đúng phần việc của mình.' },
];

export function LandingPage() {
  return (
    <>
      <section className="hero">
        <i className="blob b1" /><i className="blob b2" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="pill pill-hero">Cổng Cư Dân · Chung cư Sunrise</span>
            <h1>Mọi phản ánh của cư dân đều được <em>lắng nghe</em> và xử lý minh bạch</h1>
            <p className="lead">Gửi khiếu nại, góp ý và đề xuất trực tuyến. Ban quản lý tiếp nhận, phân công và phản hồi — bạn theo dõi tiến độ theo thời gian thực bằng mã tra cứu riêng.</p>
            <div className="hero-actions">
              <Link to="/register"><Button size="large" className="btn-accent" type="primary">Đăng ký tài khoản</Button></Link>
              <Link to="/login"><Button size="large" ghost className="btn-ghost">Đăng nhập</Button></Link>
            </div>
          </div>
          <div className="hero-card" aria-label="Minh hoạ tiến độ xử lý">
            <div className="hc-head"><span>Mã phiếu</span><b>A1B2C3</b></div>
            <div className="hc-title">Thang máy Tòa 2 kêu to khi di chuyển</div>
            <Steps direction="vertical" size="small" current={2}
              items={[{ title: 'Đã tiếp nhận' }, { title: 'Đã phân công' }, { title: 'Đang xử lý' }, { title: 'Đã giải quyết' }]} />
            <small className="mu">Minh hoạ giao diện theo dõi phiếu</small>
          </div>
        </div>
      </section>

      <section className="section"><div className="container">
        <Reveal><h2 className="section-title">Bạn cần phản ánh về dịch vụ nào?</h2></Reveal>
        <div className="tiles">
          {SERVICES.map((s, i) => (
            <Reveal key={s} delay={i * 60}>
              <Link to="/login" className="tile"><span className="tile-ico">{ICON[s]}</span><span>{s}</span></Link>
            </Reveal>
          ))}
        </div>
      </div></section>

      <section className="section alt"><div className="container">
        <Reveal><h2 className="section-title">Quy trình xử lý 4 bước</h2></Reveal>
        <Reveal delay={100}><Steps responsive items={STEPS.map((x) => ({ ...x, status: 'process' }))} className="landing-steps" /></Reveal>
      </div></section>

      <section className="section"><div className="container">
        <div className="features">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <div className="feature lift"><span className="feature-ico">{f.icon}</span><h3>{f.title}</h3><p>{f.text}</p></div>
            </Reveal>
          ))}
        </div>
      </div></section>

      <section className="section" style={{ paddingTop: 0 }}><div className="container">
        <Reveal>
          <div className="cta-band">
            <div><h2>Sẵn sàng gửi phản hồi đầu tiên?</h2><p>Đăng ký bằng email, xác thực OTP và bắt đầu trong chưa đầy một phút.</p></div>
            <Link to="/register"><Button size="large" type="primary" className="btn-accent">Bắt đầu ngay</Button></Link>
          </div>
        </Reveal>
      </div></section>
    </>
  );
}
