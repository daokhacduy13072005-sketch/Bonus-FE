// Trang tra cứu Nhân sự & Danh mục phản hồi cho CSKH / Quản lý (GET /api/staff, GET /api/categories).
import { Card, Space, Table, Tabs, Tag } from 'antd';
import { useRequest } from '@shared/lib.js';
import { EmptyState, ErrorState, Page, PageBar } from '@shared/ui.jsx';
import { DEPARTMENT_LABEL, STAFF_ROLE_LABEL, listStaff } from '@entities/staff.js';
import { CATEGORY_GROUP_LABEL, listCategories } from '@entities/category.js';
import { PriorityTag } from '@entities/ticket.jsx';

const toPriority = (p) => (p === 'NORMAL' ? 'Medium' : p ? p[0] + p.slice(1).toLowerCase() : p);

export function StaffDirectoryPage() {
  const { data, loading, error, reload } = useRequest(async () => {
    const [staff, categories] = await Promise.all([listStaff(), listCategories()]);
    return { staff, categories };
  });

  if (error) return <Page><ErrorState error={error} onRetry={reload} /></Page>;

  return (
    <Page>
      <PageBar title="Nhân sự &amp; Danh mục" subtitle="Danh sách nhân sự xử lý và cấu hình danh mục phân loại tự động" />
      <Card styles={{ body: { padding: 16 } }}>
        <Tabs items={[
          {
            key: 'staff',
            label: `Nhân sự (${data?.staff?.length ?? 0})`,
            children: (
              <Table rowKey="id" size="middle" loading={loading} dataSource={data?.staff || []}
                pagination={false} locale={{ emptyText: <EmptyState text="Chưa có dữ liệu nhân sự." /> }}
                columns={[
                  { title: 'ID', dataIndex: 'id', width: 70 },
                  { title: 'Họ và tên', dataIndex: 'fullName', render: (v) => <b>{v}</b> },
                  { title: 'Vai trò', dataIndex: 'role', render: (r) => <Tag color="blue">{STAFF_ROLE_LABEL[r] || r}</Tag> },
                  { title: 'Bộ phận', dataIndex: 'department', render: (d) => DEPARTMENT_LABEL[d] || d || '–' },
                  { title: 'Trạng thái', render: (_, s) => <Tag color={s.active ? 'green' : 'default'}>{s.active ? 'Hoạt động' : 'Ngưng'}</Tag> },
                  { title: 'Trực ca', render: (_, s) => <Tag color={s.onDuty ? 'processing' : 'default'}>{s.onDuty ? 'Đang trực' : 'Ngoài ca'}</Tag> },
                ]} />
            ),
          },
          {
            key: 'categories',
            label: `Danh mục phản hồi (${data?.categories?.length ?? 0})`,
            children: (
              <Table rowKey="id" size="middle" loading={loading} dataSource={data?.categories || []}
                pagination={false} locale={{ emptyText: <EmptyState text="Chưa có danh mục phản hồi." /> }}
                columns={[
                  { title: 'Mã', dataIndex: 'code', width: 120, render: (v) => <code>{v}</code> },
                  { title: 'Tên danh mục', dataIndex: 'name', render: (v) => <b>{v}</b> },
                  { title: 'Nhóm', dataIndex: 'group', render: (g) => CATEGORY_GROUP_LABEL[g] || g || '–' },
                  { title: 'Ưu tiên mặc định', dataIndex: 'defaultPriority', render: (p) => <PriorityTag priority={toPriority(p)} /> },
                  {
                    title: 'Từ khóa tự phân loại',
                    dataIndex: 'keywords',
                    render: (kws) => (kws?.length ? <Space wrap size={[4, 4]}>{kws.map((k, i) => <Tag key={i}>{k}</Tag>)}</Space> : '–'),
                  },
                  { title: 'Kích hoạt', dataIndex: 'active', width: 110, render: (a) => <Tag color={a ? 'green' : 'default'}>{a ? 'Đang bật' : 'Đã tắt'}</Tag> },
                ]} />
            ),
          },
        ]} />
      </Card>
    </Page>
  );
}
