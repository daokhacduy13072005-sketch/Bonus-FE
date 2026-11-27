// SC-14 (CS Staff) và SC-18/19 (Manager): chi tiết phiếu + các hành động theo vai trò.
// Trang này chỉ GHÉP các feature; mỗi hành động nằm trong file riêng ở tầng features.
// Hiển thị/ẩn nút chỉ để giao diện gọn — backend mới là nơi kiểm tra quyền thật (IA-CF02).
import { Link, useParams } from 'react-router-dom';
import { Button, Card, Descriptions, Space, Tag } from 'antd';
import { fmt, useRequest } from '@shared/lib.js';
import { ErrorState, Loading, Page, PageBar } from '@shared/ui.jsx';
import { ApprovalBanner, AttachmentList, AuditLog, EscalatedTag, PriorityTag, StatusTag, TYPE_LABEL, getTicket, locationText } from '@entities/ticket.jsx';
import { getDepartments } from '@entities/department.js';
import { listCategories } from '@entities/category.js';
import { listStaff } from '@entities/staff.js';
import { useAuth } from '@entities/user.jsx';
import { ApproveCard } from '@features/approve-ticket.jsx';
import { ClassifyCard } from '@features/classify-ticket.jsx';
import { AssignCard } from '@features/assign-ticket.jsx';
import { RespondCard } from '@features/respond-ticket.jsx';
import { ChangeStatusCard } from '@features/change-status.jsx';
import { EscalateCard } from '@features/escalate-ticket.jsx';
import { MergeCard } from '@features/merge-ticket.jsx';
import './pages.css';

export function TicketDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data, loading, error, reload } = useRequest(async () => {
    const [ticket, departments, categories, staffList] = await Promise.all([
      getTicket(id),
      getDepartments().catch(() => []),
      listCategories().catch(() => []),
      listStaff().catch(() => []),
    ]);
    return { ticket, departments, categories, staffList };
  }, [id]);

  const back = user.role === 'manager' ? '/manager/escalated' : '/staff/queue';
  if (loading) return <Page><Loading /></Page>;
  if (error) return <Page><ErrorState error={error} onRetry={reload} /></Page>;
  const { ticket: c, departments, categories, staffList } = data;
  const ctx = { ticket: c, user, onDone: reload };
  const catId = c.categoryId ?? c.autoCategoryId;
  const categoryName = categories.find((x) => x.id === catId)?.name;
  const assignedStaff = staffList.find((s) => s.id === c.assignedStaffId);
  const confidenceText = c.classifiedBy === 'AUTO' && c.autoConfidence > 0 ? ` (${c.classifiedBy} · ${Math.round(c.autoConfidence * 100)}%)` : '';

  return (
    <Page size="wide">
      <PageBar title={c.title} extra={<Link to={back}><Button>← Danh sách</Button></Link>} />
      <div className="stack">
        <Card className="lift">
          <Descriptions size="small" column={{ xs: 1, sm: 2 }} items={[
            { key: 'c', label: 'Mã', children: <b>{c.tracking_code}</b> },
            { key: 't', label: 'Loại', children: TYPE_LABEL[c.type] || c.type },
            { key: 's', label: 'Dịch vụ', children: c.service },
            { key: 'cat', label: 'Danh mục', children: `${categoryName || (catId ? `#${catId}` : 'Chưa phân loại')}${confidenceText}` },
            {
              key: 'st',
              label: 'Trạng thái',
              children: (
                <Space wrap size={[4, 4]}>
                  <StatusTag status={c.status} />
                  {c.escalated && <EscalatedTag />}
                  {c.afterHours && <Tag color="purple">Ngoài giờ</Tag>}
                  {c.missingInfo && <Tag color="warning">Thiếu thông tin</Tag>}
                  {c.requiresManagerApproval && <Tag color="orange">Cần duyệt</Tag>}
                  {c.duplicateOfId && <Tag>Trùng #{c.duplicateOfId}</Tag>}
                  {c.duplicateCount > 0 && <Tag color="cyan">Đã gộp {c.duplicateCount} phiếu</Tag>}
                </Space>
              ),
            },
            { key: 'p', label: 'Ưu tiên', children: <PriorityTag priority={c.priority} /> },
            { key: 'u', label: 'Người gửi', children: `${c.customer.name}${c.customer.phone ? ` · ${c.customer.phone}` : ''}` },
            { key: 'as', label: 'Nhân sự phụ trách', children: assignedStaff ? `${assignedStaff.fullName} (${assignedStaff.department})` : (c.assignedStaffId ? `NV #${c.assignedStaffId}` : 'Chưa gán') },
            { key: 'd', label: 'Gửi lúc', children: fmt(c.created_at) },
            ...(c.responseDueAt || c.resolveDueAt ? [{
              key: 'sla',
              label: 'Hạn SLA',
              children: `Phản hồi: ${fmt(c.responseDueAt)} · Xử lý: ${fmt(c.resolveDueAt)}`,
            }] : []),
            { key: 'l', label: '📍 Vị trí sự cố', span: 2, children: locationText(c.location) },
          ]} />
          <h3 className="sec-title">Nội dung</h3>
          <p className="pre">{c.description}</p>
          <AttachmentList items={c.attachments} showScan />
        </Card>

        <ApprovalBanner approval={c.approval} />
        <ApproveCard {...ctx} />
        <MergeCard {...ctx} />
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
