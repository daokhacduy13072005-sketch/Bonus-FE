// SC-15 Danh sách việc được giao (Department Staff).
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag } from 'antd';
import { fmt, useRequest } from '@shared/lib.js';
import { EmptyState, ErrorState, Page, PageBar } from '@shared/ui.jsx';
import { ASSIGN_LABEL, listMyAssignments } from '@entities/assignment.js';
import { CodeLink, PriorityTag, locationText } from '@entities/ticket.jsx';

export function MyTasksPage() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useRequest(listMyAssignments);
  const href = (a) => `/dept/tasks/${a.id}`;
  return (
    <Page>
      <PageBar title="Việc được giao" subtitle="Các phiếu đã được phân công cho bộ phận của bạn" />
      {error ? <ErrorState error={error} onRetry={reload} /> : (
        <Card styles={{ body: { padding: 8 } }}>
          <Table rowKey="id" loading={loading} dataSource={data} pagination={false} rowClassName="row-click"
            locale={{ emptyText: <EmptyState text="Chưa có việc nào được giao cho bộ phận của bạn." /> }}
            onRow={(a) => ({ onClick: () => navigate(href(a)) })}
            columns={[
              { title: 'Mã', width: 175, render: (_, a) => <CodeLink to={href(a)} code={a.complaint.tracking_code} /> },
              { title: 'Nội dung', render: (_, a) => <><div style={{ fontWeight: 600 }}>{a.complaint.title}</div><div className="mu">{locationText(a.complaint.location)} · {a.complaint.service}</div></> },
              { title: 'Ưu tiên', render: (_, a) => <PriorityTag priority={a.complaint.priority} /> },
              { title: 'Hạn xử lý', responsive: ['md'], render: (_, a) => fmt(a.due_at) },
              { title: 'Tình trạng', render: (_, a) => <Tag color={a.status === 'Done' ? 'green' : 'blue'}>{ASSIGN_LABEL[a.status] || a.status}</Tag> },
            ]} />
        </Card>
      )}
    </Page>
  );
}
