// WIDGET: Bảng danh sách phiếu — 3 biến thể cột cho từng vai trò (customer / staff / manager).
import { useNavigate } from 'react-router-dom';
import { Table } from 'antd';
import { fmt } from '@shared/lib.js';
import { EmptyState } from '@shared/ui.jsx';
import { CodeLink, EscalatedTag, PriorityTag, StatusTag, TYPE_LABEL, locationText } from '@entities/ticket.jsx';

const titleCell = (c, extra) => (
  <><div style={{ fontWeight: 600 }}>{c.title}</div><div className="mu">{locationText(c.location)}{extra ? ` · ${extra}` : ''}</div></>
);

// Mỗi variant = (đường dẫn chi tiết, cột)
const VARIANTS = {
  customer: {
    href: (c) => `/customer/complaints/${c.tracking_code}`,
    columns: (href) => [
      { title: 'Mã', width: 175, render: (_, c) => <CodeLink to={href(c)} code={c.tracking_code} /> },
      { title: 'Tiêu đề', render: (_, c) => titleCell(c) },
      { title: 'Loại', responsive: ['md'], render: (_, c) => TYPE_LABEL[c.type] },
      { title: 'Trạng thái', render: (_, c) => <StatusTag status={c.status} /> },
      { title: 'Ngày gửi', responsive: ['md'], render: (_, c) => fmt(c.created_at) },
    ],
  },
  staff: {
    href: (c) => `/staff/complaints/${c.id}`,
    columns: (href) => [
      { title: 'Mã', width: 175, render: (_, c) => <CodeLink to={href(c)} code={c.tracking_code} /> },
      { title: 'Tiêu đề', render: (_, c) => titleCell(c, c.service) },
      { title: 'Người gửi', responsive: ['md'], dataIndex: 'customer_name' },
      { title: 'Ưu tiên', render: (_, c) => <><PriorityTag priority={c.priority} />{c.escalated ? <> <EscalatedTag /></> : null}</> },
      { title: 'Trạng thái', render: (_, c) => <StatusTag status={c.status} /> },
      { title: 'Cập nhật', responsive: ['lg'], render: (_, c) => fmt(c.updated_at) },
    ],
  },
  manager: {
    href: (c) => `/manager/complaints/${c.id}`,
    columns: (href) => [
      { title: 'Mã', width: 175, render: (_, c) => <CodeLink to={href(c)} code={c.tracking_code} /> },
      { title: 'Tiêu đề', render: (_, c) => titleCell(c, TYPE_LABEL[c.type]) },
      { title: 'Người gửi', responsive: ['md'], dataIndex: 'customer_name' },
      { title: 'Ưu tiên', render: (_, c) => <PriorityTag priority={c.priority} /> },
      { title: 'Trạng thái', render: (_, c) => <StatusTag status={c.status} /> },
      { title: 'Cập nhật', responsive: ['lg'], render: (_, c) => fmt(c.updated_at) },
    ],
  },
};

export function TicketTable({ list, variant, loading, emptyText = 'Không có phiếu nào.', pagination }) {
  const navigate = useNavigate();
  const v = VARIANTS[variant];
  const pager = pagination !== undefined
    ? pagination
    : list?.length > 8 ? { pageSize: 8, showSizeChanger: false } : false;
  return (
    <Table rowKey="id" size="middle" loading={loading} dataSource={list} columns={v.columns(v.href)}
      pagination={pager}
      locale={{ emptyText: <EmptyState text={emptyText} /> }}
      rowClassName="row-click" onRow={(c) => ({ onClick: () => navigate(v.href(c)) })} />
  );
}
