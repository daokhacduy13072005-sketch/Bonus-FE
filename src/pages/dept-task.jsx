// SC-16 Cập nhật kết quả (Department Staff).
import { Link, useParams } from 'react-router-dom';
import { Alert, Button, Card, Descriptions, Result } from 'antd';
import { fmt, useRequest } from '@shared/lib.js';
import { ErrorState, Loading, Page, PageBar } from '@shared/ui.jsx';
import { listMyAssignments } from '@entities/assignment.js';
import { AttachmentList, PriorityTag, StatusTag, locationText } from '@entities/ticket.jsx';
import { TaskResultCard } from '@features/submit-task-result.jsx';
import './pages.css';

export function TaskDetailPage() {
  const { id } = useParams();
  const { data: list, loading, error, reload } = useRequest(listMyAssignments, [id]);
  if (loading) return <Page><Loading /></Page>;
  if (error) return <Page><ErrorState error={error} onRetry={reload} /></Page>;

  const a = list.find((x) => String(x.id) === id);
  if (!a) return <Page><Result status="404" title="Không tìm thấy việc" extra={<Link to="/dept/tasks"><Button type="primary">← Quay lại</Button></Link>} /></Page>;
  const c = a.complaint;

  return (
    <Page size="wide">
      <PageBar title={c.title} extra={<Link to="/dept/tasks"><Button>← Danh sách</Button></Link>} />
      <div className="stack">
        <Card className="lift">
          <Descriptions size="small" column={{ xs: 1, sm: 2 }} items={[
            { key: 'c', label: 'Mã', children: <b>{c.tracking_code}</b> },
            { key: 's', label: 'Dịch vụ', children: c.service },
            { key: 'p', label: 'Ưu tiên', children: <PriorityTag priority={c.priority} /> },
            { key: 'st', label: 'Trạng thái phiếu', children: <StatusTag status={c.status} /> },
            { key: 'h', label: 'Hạn', children: fmt(a.due_at) },
            { key: 'l', label: '📍 Vị trí sự cố', span: 2, children: locationText(c.location) },
          ]} />
          <h3 className="sec-title">Nội dung khiếu nại</h3>
          <p className="pre">{c.description}</p>
          <AttachmentList items={c.attachments} />
          {c.rejected_reason && <Alert style={{ marginTop: 16 }} type="error" showIcon message={`Quản lý đã từ chối phương án trước: ${c.rejected_reason}. Vui lòng sửa lại.`} />}
        </Card>
        <TaskResultCard assignment={a} ticket={c} onDone={reload} />
      </div>
    </Page>
  );
}
