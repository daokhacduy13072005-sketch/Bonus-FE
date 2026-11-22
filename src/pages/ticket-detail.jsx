// SC-14 (CS Staff) và SC-18/19 (Manager): chi tiết phiếu + các hành động theo vai trò.
// Trang này chỉ GHÉP các feature; mỗi hành động nằm trong file riêng ở tầng features.
// Hiển thị/ẩn nút chỉ để giao diện gọn — backend mới là nơi kiểm tra quyền thật (IA-CF02).
import { Link, useParams } from 'react-router-dom';
import { Button, Card, Descriptions } from 'antd';
import { fmt, useRequest } from '@shared/lib.js';
import { ErrorState, Loading, Page, PageBar } from '@shared/ui.jsx';
import { ApprovalBanner, AttachmentList, AuditLog, EscalatedTag, PriorityTag, StatusTag, TYPE_LABEL, getTicket, locationText } from '@entities/ticket.jsx';
import { getDepartments } from '@entities/department.js';
import { useAuth } from '@entities/user.jsx';
import { ApproveCard } from '@features/approve-ticket.jsx';
import { ClassifyCard } from '@features/classify-ticket.jsx';
import { AssignCard } from '@features/assign-ticket.jsx';
import { RespondCard } from '@features/respond-ticket.jsx';
import { ChangeStatusCard } from '@features/change-status.jsx';
import { EscalateCard } from '@features/escalate-ticket.jsx';
import './pages.css';

export function TicketDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data, loading, error, reload } = useRequest(async () => {
    const [ticket, departments] = await Promise.all([getTicket(id), getDepartments()]);
    return { ticket, departments };
  }, [id]);

  const back = user.role === 'manager' ? '/manager/escalated' : '/staff/queue';
  if (loading) return <Page><Loading /></Page>;
  if (error) return <Page><ErrorState error={error} onRetry={reload} /></Page>;
  const { ticket: c, departments } = data;
  const ctx = { ticket: c, user, onDone: reload };

  return (
    <Page size="wide">
      <PageBar title={c.title} extra={<Link to={back}><Button>← Danh sách</Button></Link>} />
      <div className="stack">
        <Card className="lift">
          <Descriptions size="small" column={{ xs: 1, sm: 2 }} items={[
            { key: 'c', label: 'Mã', children: <b>{c.tracking_code}</b> },
            { key: 't', label: 'Loại', children: TYPE_LABEL[c.type] },
            { key: 's', label: 'Dịch vụ', children: c.service },
            { key: 'st', label: 'Trạng thái', children: <><StatusTag status={c.status} />{c.escalated ? <> <EscalatedTag /></> : null}</> },
            { key: 'p', label: 'Ưu tiên', children: <PriorityTag priority={c.priority} /> },
            { key: 'u', label: 'Người gửi', children: `${c.customer.name} · ${c.customer.phone}` },
            { key: 'd', label: 'Gửi lúc', children: fmt(c.created_at) },
            { key: 'l', label: '📍 Vị trí sự cố', span: 2, children: locationText(c.location) },
          ]} />
          <h3 className="sec-title">Nội dung</h3>
          <p className="pre">{c.description}</p>
          <AttachmentList items={c.attachments} showScan />
        </Card>

        <ApprovalBanner approval={c.approval} />
        <ApproveCard {...ctx} />
        <ClassifyCard {...ctx} />
        <AssignCard {...ctx} departments={departments} />
        <RespondCard {...ctx} />
        <ChangeStatusCard {...ctx} />
        <EscalateCard {...ctx} />
        <Card title="Lịch sử thao tác" className="lift"><AuditLog history={c.history} /></Card>
      </div>
    </Page>
  );
}
