// WIDGET: Thống kê dashboard cho Quản lý — thẻ số liệu đếm chạy + biểu đồ thanh theo nhóm.
import { Card, Progress } from 'antd';
import { AlertOutlined, CheckCircleOutlined, FileTextOutlined, FieldTimeOutlined, StarOutlined } from '@ant-design/icons';
import { CountUp, Reveal } from '@shared/ui.jsx';
import { PRIORITY_COLOR, PRIORITY_LABEL, STATUS_COLOR, STATUS_LABEL, TYPE_LABEL } from '@entities/ticket.jsx';
import './widgets.css';

const PALETTE = { volcano: '#fa541c', blue: '#1677ff', processing: '#1677ff', orange: '#fa8c16', success: '#52c41a', default: '#8c8c8c', error: '#f5222d', green: '#52c41a', red: '#f5222d' };

function StatCard({ icon, tone, label, children, delay }) {
  return (
    <Reveal delay={delay}>
      <Card className="stat-card lift" bordered={false}>
        <span className="stat-ico" style={{ background: `${tone}1a`, color: tone }}>{icon}</span>
        <div><div className="stat-val">{children}</div><div className="stat-label">{label}</div></div>
      </Card>
    </Reveal>
  );
}

function Distribution({ title, labels, data, colorOf, delay }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
  return (
    <Reveal delay={delay}>
      <Card title={title} className="lift" style={{ height: '100%' }}>
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="dist-row">
            <div className="dist-head"><span>{labels[k] || k}</span><b>{v}</b></div>
            <Progress percent={Math.round((v / total) * 100)} showInfo={false} strokeColor={PALETTE[colorOf?.(k)] || '#0b5ed7'} />
          </div>
        ))}
      </Card>
    </Reveal>
  );
}

export function DashboardStats({ data: d }) {
  return (
    <>
      <div className="stats">
        <StatCard delay={0} icon={<FileTextOutlined />} tone="#0b5ed7" label="Tổng phiếu"><CountUp value={d.total} /></StatCard>
        <StatCard delay={70} icon={<FieldTimeOutlined />} tone="#fa8c16" label="Chờ duyệt"><CountUp value={d.pending_approval} /></StatCard>
        <StatCard delay={140} icon={<AlertOutlined />} tone="#f5222d" label="Đã chuyển cấp"><CountUp value={d.escalated} /></StatCard>
        <StatCard delay={210} icon={<CheckCircleOutlined />} tone="#52c41a" label="Tỷ lệ giải quyết"><CountUp value={d.resolved_rate} suffix="%" /></StatCard>
        <StatCard delay={280} icon={<StarOutlined />} tone="#faad14" label={`Hài lòng TB (${d.rating_count} đánh giá)`}>
          {d.avg_rating == null ? '–' : <CountUp value={d.avg_rating} decimals={1} />}
        </StatCard>
      </div>
      <div className="grid3">
        <Distribution delay={0} title="Theo trạng thái" labels={STATUS_LABEL} data={d.by_status} colorOf={(k) => STATUS_COLOR[k]} />
        <Distribution delay={90} title="Theo mức ưu tiên" labels={PRIORITY_LABEL} data={d.by_priority} colorOf={(k) => PRIORITY_COLOR[k]} />
        <Distribution delay={180} title="Theo loại" labels={TYPE_LABEL} data={d.by_type} />
      </div>
    </>
  );
}
