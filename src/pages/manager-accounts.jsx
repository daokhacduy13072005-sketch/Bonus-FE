// Trang Quản lý Account — CSKH / Quản lý (GET/POST/PUT /api/accounts/*)
// Tab 1: Tài khoản nhân viên (cs_staff, manager, dept_staff)
// Tab 2: Tài khoản khách hàng (customer)
import { useState } from 'react';
import {
  Badge, Button, Card, Input, Modal, Space, Table, Tag, Tooltip,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, TeamOutlined, UserOutlined,
} from '@ant-design/icons';
import { useRequest } from '@shared/lib.js';
import { EmptyState, ErrorState, Page, PageBar } from '@shared/ui.jsx';
import { useAuth } from '@entities/user.jsx';
import { ACCOUNT_ROLE_COLOR, ACCOUNT_ROLE_LABEL, listCustomerAccounts, listStaffAccounts } from '@entities/account.js';
import { DEPARTMENT_LABEL } from '@entities/staff.js';
import {
  CustomerAccountActions, CustomerAccountCard, CustomerAccountForm,
  StaffAccountActions, StaffAccountCard, StaffAccountForm,
} from '@features/manage-accounts.jsx';

// ─── Tab nhân viên ───────────────────────────────────────────────────────────
function StaffTab({ isManager }) {
  const { data, loading, error, reload } = useRequest(listStaffAccounts);
  const [q, setQ]           = useState('');
  const [selected, setSelected] = useState(null);  // { mode: 'view'|'edit'|'create', staff? }
  const close = () => { setSelected(null); reload(); };

  const kw = q.trim().toLowerCase();
  const filtered = (data || []).filter((s) =>
    !kw || [s.fullName, s.email, s.phone, s.role, s.department].some((v) => String(v || '').toLowerCase().includes(kw)),
  );

  const columns = [
    {
      title: 'Nhân viên',
      render: (_, s) => (
        <>
          <b>{s.fullName}</b>
          <div className="mu">{s.email}</div>
        </>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      render: (r) => <Tag color={ACCOUNT_ROLE_COLOR[r]}>{ACCOUNT_ROLE_LABEL[r] || r}</Tag>,
    },
    {
      title: 'Bộ phận',
      dataIndex: 'department',
      responsive: ['md'],
      render: (d) => DEPARTMENT_LABEL[d] || d || '–',
    },
    {
      title: 'Trạng thái',
      render: (_, s) => (
        <Tag color={s.active ? 'green' : 'default'}>
          {s.active ? 'Hoạt động' : 'Vô hiệu hóa'}
        </Tag>
      ),
    },
    {
      title: '',
      width: 80,
      render: (_, s) => (
        <Button size="small" onClick={() => setSelected({ mode: 'view', staff: s })}>
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tên, email, vai trò, bộ phận…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ width: 320 }}
        />
        {isManager && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setSelected({ mode: 'create' })}>
            Tạo tài khoản nhân viên
          </Button>
        )}
      </Space>

      {error ? <ErrorState error={error} onRetry={reload} /> : (
        <Table
          rowKey="id"
          size="middle"
          loading={loading}
          dataSource={filtered}
          columns={columns}
          pagination={filtered.length > 15 ? { pageSize: 15, showSizeChanger: false } : false}
          locale={{ emptyText: <EmptyState text="Không tìm thấy tài khoản nhân viên nào." /> }}
        />
      )}

      {/* Modal chi tiết / sửa / tạo nhân viên */}
      <Modal
        open={Boolean(selected)}
        footer={null}
        width={680}
        destroyOnClose
        title={
          selected?.mode === 'create'
            ? 'Tạo tài khoản nhân viên mới'
            : `Tài khoản nhân viên: ${selected?.staff?.fullName}`
        }
        onCancel={() => setSelected(null)}
      >
        {selected?.mode === 'create' && <StaffAccountForm onDone={close} />}
        {selected && selected.mode !== 'create' && (
          <div className="stack" style={{ marginTop: 8 }}>
            <StaffAccountCard staff={selected.staff} />

            {isManager && (
              <>
                <h4 style={{ margin: '12px 0 4px' }}>Chỉnh sửa thông tin</h4>
                <StaffAccountForm initial={selected.staff} onDone={close} />
                <div style={{ marginTop: 12 }}>
                  <StaffAccountActions staff={selected.staff} onDone={close} />
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

// ─── Tab khách hàng ──────────────────────────────────────────────────────────
function CustomerTab() {
  const { data, loading, error, reload } = useRequest(listCustomerAccounts);
  const [q, setQ]               = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const close = () => { setSelectedId(null); reload(); };

  const kw = q.trim().toLowerCase();
  const filtered = (data || []).filter((c) =>
    !kw || [c.fullName, c.email, c.phone, c.apartmentCode].some((v) => String(v || '').toLowerCase().includes(kw)),
  );
  const selected = (data || []).find((c) => c.id === selectedId) || null;

  const columns = [
    {
      title: 'Khách hàng',
      render: (_, c) => (
        <>
          <b>{c.fullName}</b>
          <div className="mu">{c.apartmentCode || '–'} · {c.email}</div>
        </>
      ),
    },
    {
      title: 'Liên hệ',
      dataIndex: 'phone',
      responsive: ['md'],
      render: (p) => p || '–',
    },
    {
      title: 'Trạng thái',
      render: (_, c) => (
        <Space wrap size={[4, 4]}>
          <Tag color={c.verifiedResident ? 'green' : 'orange'}>
            {c.verifiedResident ? 'Đã xác minh' : 'Chưa xác minh'}
          </Tag>
          {c.blocked && <Tag color="red">Bị khóa</Tag>}
        </Space>
      ),
    },
    {
      title: 'Spam',
      dataIndex: 'spamStrikes',
      responsive: ['lg'],
      render: (n) =>
        n > 0
          ? <Tooltip title={`${n} lần vi phạm`}><Badge count={n} color="volcano" /></Tooltip>
          : '–',
    },
    {
      title: '',
      width: 80,
      render: (_, c) => (
        <Button size="small" onClick={() => setSelectedId(c.id)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <>
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder="Tìm theo tên, mã căn hộ, email, số điện thoại…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ maxWidth: 400, marginBottom: 16 }}
      />

      {error ? <ErrorState error={error} onRetry={reload} /> : (
        <Table
          rowKey="id"
          size="middle"
          loading={loading}
          dataSource={filtered}
          columns={columns}
          pagination={filtered.length > 15 ? { pageSize: 15, showSizeChanger: false } : false}
          locale={{ emptyText: <EmptyState text="Không tìm thấy tài khoản khách hàng nào." /> }}
        />
      )}

      {/* Modal chi tiết khách hàng */}
      <Modal
        open={Boolean(selected)}
        footer={null}
        width={700}
        destroyOnClose
        title={selected ? `Tài khoản khách hàng: ${selected.fullName}` : ''}
        onCancel={() => setSelectedId(null)}
      >
        {selected && (
          <div className="stack" style={{ marginTop: 8 }}>
            <CustomerAccountCard customer={selected} />
            <h4 style={{ margin: '12px 0 4px' }}>Chỉnh sửa thông tin liên hệ</h4>
            <CustomerAccountForm profile={selected} onDone={close} />
            <div style={{ marginTop: 12 }}>
              <CustomerAccountActions customer={selected} onDone={close} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

// ─── Page chính ──────────────────────────────────────────────────────────────
import { Tabs } from 'antd';

export function AccountManagementPage() {
  const { user } = useAuth();
  const isManager = user?.role === 'manager';

  const tabs = [
    {
      key: 'staff',
      label: (
        <Space>
          <TeamOutlined />
          Tài khoản nhân viên
        </Space>
      ),
      children: <StaffTab isManager={isManager} />,
    },
    {
      key: 'customer',
      label: (
        <Space>
          <UserOutlined />
          Tài khoản khách hàng
        </Space>
      ),
      children: <CustomerTab />,
    },
  ];

  return (
    <Page>
      <PageBar
        title="Quản lý tài khoản"
        subtitle={
          isManager
            ? 'Quản lý toàn bộ tài khoản nhân viên CSKH và khách hàng thuộc hệ thống'
            : 'Tra cứu và xử lý tài khoản khách hàng thuộc phạm vi chăm sóc'
        }
      />
      <Card styles={{ body: { padding: 16 } }}>
        <Tabs items={tabs} destroyInactiveTabPane />
      </Card>
    </Page>
  );
}
