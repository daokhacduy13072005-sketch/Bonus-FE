// Thực thể PHIẾU PHẢN HỒI / KHIẾU NẠI: từ điển nghiệp vụ, gọi API, và các khối hiển thị dùng lại nhiều nơi.
import { Link } from 'react-router-dom';
import { Alert, Steps, Tag, Timeline, Typography } from 'antd';
import { CheckCircleFilled, ClockCircleOutlined, PaperClipOutlined } from '@ant-design/icons';
import { api } from '@shared/api.js';
import { API_BASE_URL } from '@shared/config.js';
import { fmt, sizeText } from '@shared/lib.js';

const { Text } = Typography;

/* ===================== 1. TỪ ĐIỂN NGHIỆP VỤ ===================== */

// Loại phản hồi (BR-02, SC-07)
export const TYPE_LABEL = {
  complaint: 'Khiếu nại',
  suggestion: 'Góp ý',
  proposal: 'Đề xuất',
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
  New: 'Mới', Assigned: 'Đã phân công', InProgress: 'Đang xử lý', WaitingInfo: 'Chờ bổ sung',
  PendingApproval: 'Chờ duyệt', Resolved: 'Đã giải quyết', Closed: 'Đã đóng', Reopened: 'Mở lại',
  Rejected: 'Từ chối', Merged: 'Đã gộp',
};
export const PRIORITY_LABEL = { Low: 'Thấp', Medium: 'Trung bình', High: 'Cao', Critical: 'Khẩn cấp' };

// Màu của Tag antd theo trạng thái / mức ưu tiên
export const STATUS_COLOR = {
  New: 'volcano', Assigned: 'blue', InProgress: 'processing', WaitingInfo: 'gold',
  PendingApproval: 'orange', Resolved: 'success', Closed: 'default', Reopened: 'error',
  Rejected: 'default', Merged: 'default',
};
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
  if (typeof loc === 'string') return loc || '–';
  if (!loc || !loc.building) return '–';
  const parts = [loc.building];
  if (loc.floor) parts.push(/^B/i.test(loc.floor) ? `Hầm ${String(loc.floor).toUpperCase()}` : `Tầng ${loc.floor}`);
  if (loc.room) parts.push(`Phòng ${loc.room}`);
  return parts.join(' · ') + (loc.note ? ` (${loc.note})` : '');
}

/* ===================== 2. GỌI API ===================== */

const STATUS_MAP = {
  NEW: 'New',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'InProgress',
  WAITING_INFO: 'WaitingInfo',
  PENDING_APPROVAL: 'PendingApproval',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
  REJECTED: 'Rejected',
  MERGED: 'Merged',
};

const TYPE_MAP = {
  COMPLAINT: 'complaint',
  SUGGESTION: 'suggestion',
  PROPOSAL: 'proposal',
  PRAISE: 'praise',
};

function normalizeTicket(ticket, attachments) {
  const status = STATUS_MAP[ticket.status] || ticket.status;
  const createdAt = ticket.created_at ?? ticket.createdAt;
  const updatedAt = ticket.updated_at ?? ticket.updatedAt ?? createdAt;
  const priority = ticket.priority === 'NORMAL'
    ? 'Medium'
    : ticket.priority && /^[A-Z_]+$/.test(ticket.priority)
      ? ticket.priority[0] + ticket.priority.slice(1).toLowerCase()
      : ticket.priority;

  return {
    ...ticket,
    tracking_code: ticket.tracking_code ?? ticket.code,
    created_at: createdAt,
    updated_at: updatedAt,
    description: ticket.description ?? ticket.content ?? '',
    service: ticket.service ?? ticket.serviceName ?? 'Khác',
    location: ticket.location ?? ticket.apartmentCode,
    type: TYPE_MAP[ticket.type] || ticket.type,
    status,
    priority,
    customer: ticket.customer ?? {
      name: ticket.customer_name || (ticket.customerId ? `Cư dân #${ticket.customerId}` : '–'),
      phone: '',
    },
    attachments: attachments ?? ticket.attachments ?? [],
    responses: Array.isArray(ticket.responses) ? ticket.responses : [],
    assignments: Array.isArray(ticket.assignments) ? ticket.assignments : [],
    suspectedDuplicateIds: Array.isArray(ticket.suspectedDuplicateIds) ? ticket.suspectedDuplicateIds : [],
    history: Array.isArray(ticket.history)
      ? ticket.history
      : createdAt
        ? [{ action: 'Tiếp nhận', to: status, at: createdAt, by: 'Hệ thống' }]
        : [],
  };
}

export const listTickets = async (params) => {
  const response = await api('/api/feedbacks' + (params ? '?' + new URLSearchParams(params) : ''));
  const tickets = Array.isArray(response) ? response : response?.content;
  if (!Array.isArray(tickets)) {
    throw new Error('API danh sách phiếu trả về dữ liệu không hợp lệ.');
  }
  return tickets.map((t) => normalizeTicket(t));
};

export const listMyTickets = async ({ page = 0, size = 10 } = {}) => {
  const response = await api(`/api/feedbacks/mine?${new URLSearchParams({ page, size })}`);
  const tickets = Array.isArray(response) ? response : response?.content;
  if (!Array.isArray(tickets)) {
    throw new Error('API danh sách phiếu trả về dữ liệu không hợp lệ.');
  }
  return {
    items: tickets.map((t) => normalizeTicket(t)),
    total: typeof response?.totalElements === 'number' ? response.totalElements : tickets.length,
    page: typeof response?.number === 'number' ? response.number : page,
    size: typeof response?.size === 'number' ? response.size : size,
  };
};

export const uploadTicketAttachment = (feedbackId, file) => {
  const fd = new FormData();
  fd.append('file', file);
  return api(`/api/feedbacks/${encodeURIComponent(feedbackId)}/attachments`, { method: 'POST', form: fd });
};

export const mergeTicket = (duplicateId, body) =>
  api(`/api/feedbacks/${encodeURIComponent(duplicateId)}/merge`, { method: 'POST', body });

export const getTicket = async (idOrCode) => {
  const key = String(idOrCode ?? '').trim();
  const path = /^\d+$/.test(key)
    ? `/api/feedbacks/${encodeURIComponent(key)}`
    : `/api/feedbacks/code/${encodeURIComponent(key)}`;
  const ticket = await api(path);
  let attachments = ticket.attachments;
  if (!Array.isArray(attachments) && ticket?.id != null) {
    attachments = await api(`/api/feedbacks/${ticket.id}/attachments`).catch(() => []);
  }
  return normalizeTicket(ticket, attachments);
};
export const getDashboard = () => api('/api/dashboard');

/* ===================== 3. KHỐI HIỂN THỊ ===================== */

export const StatusTag = ({ status }) => <Tag color={STATUS_COLOR[status]} style={{ marginInlineEnd: 0 }}>{STATUS_LABEL[status] || status}</Tag>;
export const PriorityTag = ({ priority }) => priority
  ? <Tag color={PRIORITY_COLOR[priority]} style={{ marginInlineEnd: 0 }}>{PRIORITY_LABEL[priority] || priority}</Tag>
  : <Tag style={{ marginInlineEnd: 0 }}>Chưa phân loại</Tag>;
export const EscalatedTag = () => <Tag color="gold">Chuyển cấp</Tag>;

export const AttachmentList = ({ items, showScan = false }) => items?.length ? (
  <div style={{ marginTop: 12, display: 'grid', gap: 6 }}>
    {items.map((a, i) => {
      const name = a.original_name ?? a.fileName;
      const bytes = a.size_bytes ?? a.sizeBytes;
      const href = a.fileUrl ? `${API_BASE_URL}${a.fileUrl}` : null;
      return (
        <Text key={a.id ?? i} type="secondary">
          <PaperClipOutlined /> {href ? <a href={href} target="_blank" rel="noreferrer">{name}</a> : name}
          {bytes != null ? ` (${sizeText(bytes)})` : ''}
          {showScan && a.scan_status ? ` · quét: ${a.scan_status}` : ''}
        </Text>
      );
    })}
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
