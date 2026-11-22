// Thực thể PHIẾU PHẢN HỒI / KHIẾU NẠI: từ điển nghiệp vụ, gọi API, và các khối hiển thị dùng lại nhiều nơi.
import { Link } from 'react-router-dom';
import { Alert, Steps, Tag, Timeline, Typography } from 'antd';
import { CheckCircleFilled, ClockCircleOutlined, PaperClipOutlined } from '@ant-design/icons';
import { api } from '@shared/api.js';
import { fmt, sizeText } from '@shared/lib.js';

const { Text } = Typography;

/* ===================== 1. TỪ ĐIỂN NGHIỆP VỤ ===================== */

// Loại phản hồi (BR-02, SC-07)
export const TYPE_LABEL = {
  complaint: 'Khiếu nại',
  suggestion: 'Góp ý, đề xuất',
  praise: 'Khen ngợi',
  staff_feedback: 'Phản hồi về tiến độ / thái độ nhân viên',
};
// BR-09: góp ý/khen ngợi đi luồng đóng đơn giản (không điều tra, không duyệt)
export const SIMPLE_TYPES = ['suggestion', 'praise', 'staff_feedback'];

// Dịch vụ liên quan (bối cảnh chung cư)
export const SERVICES = ['Vệ sinh', 'Điện nước', 'Thang máy', 'Gửi xe', 'Tiếng ồn', 'An ninh', 'Phí dịch vụ', 'Khác'];

// ⚠ Danh sách tòa là ví dụ — sửa theo chung cư thật (hoặc lấy từ backend qua /api/meta).
export const BUILDINGS = ['Tòa 1', 'Tòa 2', 'Tòa 3', 'Khu vực chung (sân, hầm xe, tiện ích)'];
// Tầng: số 1–99 hoặc hầm B1–B3. Phòng: chữ/số/dấu gạch, tối đa 10 ký tự (không bắt buộc).
export const FLOOR_RE = /^(B[1-3]|[1-9]\d?)$/i;
export const ROOM_RE = /^[A-Za-z0-9-]{1,10}$/;

// Vòng đời trạng thái (BR-07; các trạng thái trung gian là đề xuất)
export const STATUS_LABEL = {
  New: 'Mới', Assigned: 'Đã phân công', InProgress: 'Đang xử lý', PendingApproval: 'Chờ duyệt',
  Resolved: 'Đã giải quyết', Closed: 'Đã đóng', Reopened: 'Mở lại',
};
export const PRIORITY_LABEL = { Low: 'Thấp', Medium: 'Trung bình', High: 'Cao', Critical: 'Khẩn cấp' };

// Màu của Tag antd theo trạng thái / mức ưu tiên
export const STATUS_COLOR = { New: 'volcano', Assigned: 'blue', InProgress: 'processing', PendingApproval: 'orange', Resolved: 'success', Closed: 'default', Reopened: 'error' };
export const PRIORITY_COLOR = { Low: 'green', Medium: 'blue', High: 'orange', Critical: 'red' };

// Chuyển trạng thái nhân viên được phép (UI chỉ gợi ý; backend mới là nơi quyết định)
export const TRANSITIONS = {
  staff_like: { // cs_staff + manager
    New: ['Resolved'],            // chỉ cho góp ý/khen ngợi (BR-09)
    Assigned: ['InProgress'],
    InProgress: ['Resolved'],
    Reopened: ['InProgress'],
    Resolved: ['Closed'],
  },
  dept_staff: { Assigned: ['InProgress'], Reopened: ['InProgress'] },
};
export const MAX_REOPEN = 3;

// "Tòa 1 · Tầng 3 · Phòng 302 (cạnh thang máy)". Phiếu cũ chưa có vị trí → "–"
export function locationText(loc) {
  if (!loc || !loc.building) return '–';
  const parts = [loc.building];
  if (loc.floor) parts.push(/^B/i.test(loc.floor) ? `Hầm ${String(loc.floor).toUpperCase()}` : `Tầng ${loc.floor}`);
  if (loc.room) parts.push(`Phòng ${loc.room}`);
  return parts.join(' · ') + (loc.note ? ` (${loc.note})` : '');
}

/* ===================== 2. GỌI API ===================== */

export const listTickets = (params) => api('/api/complaints' + (params ? '?' + new URLSearchParams(params) : ''));
export const listMyTickets = () => api('/api/complaints/mine');
export const getTicket = (idOrCode) => api('/api/complaints/' + encodeURIComponent(idOrCode));
export const getDashboard = () => api('/api/dashboard');

/* ===================== 3. KHỐI HIỂN THỊ ===================== */

export const StatusTag = ({ status }) => <Tag color={STATUS_COLOR[status]} style={{ marginInlineEnd: 0 }}>{STATUS_LABEL[status] || status}</Tag>;
export const PriorityTag = ({ priority }) => priority
  ? <Tag color={PRIORITY_COLOR[priority]} style={{ marginInlineEnd: 0 }}>{PRIORITY_LABEL[priority] || priority}</Tag>
  : <Tag style={{ marginInlineEnd: 0 }}>Chưa phân loại</Tag>;
export const EscalatedTag = () => <Tag color="gold">Chuyển cấp</Tag>;

export const AttachmentList = ({ items, showScan = false }) => items?.length ? (
  <div style={{ marginTop: 12, display: 'grid', gap: 6 }}>
    {items.map((a, i) => (
      <Text key={i} type="secondary"><PaperClipOutlined /> {a.original_name} ({sizeText(a.size_bytes)}){showScan ? ` · quét: ${a.scan_status}` : ''}</Text>
    ))}
  </div>
) : null;

// Thanh tiến trình tổng quan cho cư dân theo dõi
const STEP_OF = { New: 0, Assigned: 1, InProgress: 2, PendingApproval: 2, Reopened: 2, Resolved: 3, Closed: 4 };
export const TicketSteps = ({ status, simple }) => {
  const items = simple
    ? [{ title: 'Đã tiếp nhận' }, { title: 'Đã giải quyết' }, { title: 'Đã đóng' }]
    : [{ title: 'Tiếp nhận' }, { title: 'Phân công' }, { title: status === 'PendingApproval' ? 'Chờ duyệt' : status === 'Reopened' ? 'Mở lại' : 'Đang xử lý' }, { title: 'Giải quyết' }, { title: 'Đã đóng' }];
  let current = STEP_OF[status] ?? 0;
  if (simple) current = { New: 0, Resolved: 1, Closed: 2 }[status] ?? 0;
  return <Steps size="small" current={current} items={items} status={status === 'Reopened' ? 'error' : 'process'} responsive />;
};

// Tiến trình đơn giản dành cho khách hàng
export const StatusTimeline = ({ history }) => (
  <Timeline items={history.map((h, i) => ({
    color: i === history.length - 1 ? 'blue' : 'green',
    dot: i === history.length - 1 ? <ClockCircleOutlined /> : <CheckCircleFilled />,
    children: <><b>{STATUS_LABEL[h.to] || h.to}</b> <Text type="secondary">· {fmt(h.at)}</Text></>,
  }))} />
);

// Nhật ký thao tác chi tiết dành cho nhân viên (mới nhất ở trên)
export const AuditLog = ({ history }) => (
  <Timeline items={[...history].reverse().map((h) => ({
    children: (
      <>
        <b>{h.action}</b>{h.from && h.to && h.from !== h.to ? <> {STATUS_LABEL[h.from] || h.from} → {STATUS_LABEL[h.to] || h.to}</> : null}
        <div><Text type="secondary" style={{ fontSize: 12.5 }}>{h.by} · {fmt(h.at)}{h.note ? ` · ${h.note}` : ''}</Text></div>
      </>
    ),
  }))} />
);

// Một phản hồi trong luồng trao đổi (ghi chú nội bộ có viền nét đứt màu vàng)
export const ReplyBlock = ({ reply: r, showInternal = false }) => {
  const internal = showInternal && r.is_internal;
  return (
    <div style={{ padding: '12px 16px', margin: '10px 0', borderRadius: 12, background: internal ? '#fffbeb' : '#f8fafc',
      border: `1px ${internal ? 'dashed' : 'solid'} ${internal ? '#f59e0b' : '#e5e9f0'}`, borderLeft: `4px solid ${internal ? '#f59e0b' : '#0b5ed7'}` }}>
      <Text type="secondary" style={{ fontSize: 12.5 }}>{r.author} · {fmt(r.created_at)}{internal ? ' · nội bộ' : ''}</Text>
      <p className="pre" style={{ marginTop: 4 }}>{r.content}</p>
      {r.solution ? <p style={{ margin: '6px 0 0' }}><b>Giải pháp:</b> {r.solution}</p> : null}
    </div>
  );
};

export const ApprovalBanner = ({ approval }) => (approval && approval.decision !== 'pending') ? (
  <Alert style={{ marginBottom: 16 }} showIcon type={approval.decision === 'approved' ? 'success' : 'error'}
    message={<>Phê duyệt: <b>{approval.decision === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}</b>{approval.reason ? ` — ${approval.reason}` : ''}</>} />
) : null;

// Mã phiếu dạng liên kết bấm được
export const CodeLink = ({ to, code }) => <Link className="code-link" to={to} onClick={(e) => e.stopPropagation()}>{code}</Link>;
