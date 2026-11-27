// Trang Quản lý hồ sơ cư dân cho CSKH / Quản lý (GET/PUT /api/customers).
import { useState } from 'react';
import { Button, Card, Input, Modal, Progress, Space, Table, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRequest } from '@shared/lib.js';
import { EmptyState, ErrorState, Page, PageBar } from '@shared/ui.jsx';
import { RESIDENT_TYPE_LABEL, listCustomers } from '@entities/customer.js';
import { CustomerInfoCard, CustomerProfileForm } from '@features/customer-profile.jsx';

export function StaffCustomersPage() {
  const { data, loading, error, reload } = useRequest(listCustomers);
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const kw = q.trim().toLowerCase();
  const filtered = (data || []).filter((c) => !kw || [c.fullName, c.email, c.phone, c.apartmentCode]
    .some((v) => String(v || '').toLowerCase().includes(kw)));
  const selected = (data || []).find((c) => c.id === selectedId) || null;

  return (
    <Page>
      <PageBar title="Danh sách cư dân" subtitle="Tra cứu hồ sơ, hợp đồng thuê và cập nhật thông tin liên hệ" />
      <Card styles={{ body: { padding: 16 } }}>
        <Input allowClear prefix={<SearchOutlined />} placeholder="Tìm theo tên, mã căn hộ, email hoặc số điện thoại"
          value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 400, marginBottom: 16 }} />
        {error ? <ErrorState error={error} onRetry={reload} /> : (
          <Table rowKey="id" size="middle" loading={loading} dataSource={filtered}
            pagination={filtered.length > 10 ? { pageSize: 10, showSizeChanger: false } : false}
            locale={{ emptyText: <EmptyState text="Không tìm thấy cư dân nào." /> }}
            columns={[
              { title: 'Họ tên', render: (_, c) => <><b>{c.fullName}</b><div className="mu">{c.apartmentCode || '–'} · {RESIDENT_TYPE_LABEL[c.residentType] || c.residentType}</div></> },
              { title: 'Liên hệ', render: (_, c) => <><div>{c.email}</div><div className="mu">{c.phone}</div></> },
              {
                title: 'Trạng thái',
                render: (_, c) => (
                  <Space wrap size={[4, 4]}>
                    <Tag color={c.verifiedResident ? 'green' : 'orange'}>{c.verifiedResident ? 'Đã xác minh' : 'Chưa xác minh'}</Tag>
                    {c.blocked && <Tag color="red">Bị khóa ({c.spamStrikes})</Tag>}
                  </Space>
                ),
              },
              { title: 'Tin cậy', responsive: ['md'], width: 150, render: (_, c) => <Progress percent={c.ratingTrustScore ?? 100} size="small" /> },
              { title: '', width: 110, render: (_, c) => <Button size="small" onClick={() => setSelectedId(c.id)}>Chi tiết / Sửa</Button> },
            ]} />
        )}
      </Card>

      <Modal open={Boolean(selected)} footer={null} width={760} destroyOnClose
        title={selected ? `Hồ sơ cư dân: ${selected.fullName}` : ''}
        onCancel={() => setSelectedId(null)}>
        {selected && (
          <div className="stack" style={{ marginTop: 12 }}>
            <CustomerInfoCard profile={selected} />
            <CustomerProfileForm profile={selected} customerId={selected.id} onDone={reload} />
          </div>
        )}
      </Modal>
    </Page>
  );
}
