// API GIẢ LẬP để demo giao diện khi chưa có backend (bật bằng VITE_USE_MOCK=true trong .env).
// Dữ liệu lưu trong localStorage để tải lại trang không mất. Chỉ dùng cho demo — KHÔNG phải backend thật.
import { ApiError } from './api.js';

const KEY = 'ccms_mock_v1';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ago = (h) => new Date(Date.now() - h * 3600e3).toISOString();
const ahead = (h) => new Date(Date.now() + h * 3600e3).toISOString();

const USERS = {
  'customer@demo.vn': { id: 1, name: 'Nguyễn Văn Cư Dân', role: 'customer', email: 'customer@demo.vn', phone: '0901234567' },
  'staff@demo.vn': { id: 2, name: 'Trần CSKH', role: 'cs_staff', email: 'staff@demo.vn' },
  'dept@demo.vn': { id: 3, name: 'Lê Kỹ Thuật', role: 'dept_staff', email: 'dept@demo.vn', department_id: 1 },
  'manager@demo.vn': { id: 4, name: 'Phạm Quản Lý', role: 'manager', email: 'manager@demo.vn' },
  'admin@demo.vn': { id: 5, name: 'Admin Hệ Thống', role: 'admin', email: 'admin@demo.vn' },
};
const DEPARTMENTS = [{ id: 1, name: 'Kỹ thuật' }, { id: 2, name: 'Vệ sinh' }, { id: 3, name: 'An ninh' }];
const OTHERS = { 11: ['Trần Thị Mai', '0912345678'], 12: ['Lê Văn Hùng', '0987654321'] };

const H = (action, from, to, h, by, note) => ({ action, from, to, at: ago(h), by, note });
const base = (o) => ({
  priority: null, escalated: false, attachments: [], responses: [], assignments: [], approval: null, rating: null,
  reopen_count: 0, rejected_reason: '', location: { building: 'Tòa 1', floor: '3', room: '', note: '' }, ...o,
});

function seed() {
  const own = { customer_id: 1, customer_name: USERS['customer@demo.vn'].name, customer_phone: '0901234567' };
  const mai = { customer_id: 11, customer_name: OTHERS[11][0], customer_phone: OTHERS[11][1] };
  const hung = { customer_id: 12, customer_name: OTHERS[12][0], customer_phone: OTHERS[12][1] };
  return {
    seq: 100,
    tickets: [
      base({ id: 1, tracking_code: 'TM2041', type: 'complaint', service: 'Thang máy', priority: 'High', status: 'InProgress', ...own,
        title: 'Thang máy Tòa 2 kêu to khi di chuyển', description: 'Từ tối qua thang máy số 2 phát ra tiếng kêu lớn ở khoảng tầng 10–12, cư dân rất lo ngại.\nMong ban quản lý kiểm tra sớm.',
        location: { building: 'Tòa 2', floor: '12', room: '', note: 'thang máy số 2' }, created_at: ago(30), updated_at: ago(4),
        attachments: [{ original_name: 'tieng-on-thang-may.mp4.pdf', size_bytes: 482000, scan_status: 'clean' }],
        assignments: [{ id: 1, department_id: 1, department_name: 'Kỹ thuật', due_at: ahead(20), status: 'Open', result_note: '', solution: '' }],
        history: [H('Tạo phiếu', null, 'New', 30, 'Nguyễn Văn Cư Dân'), H('Phân loại', 'New', 'New', 28, 'Trần CSKH', 'Mức ưu tiên: Cao'), H('Phân công', 'New', 'Assigned', 27, 'Trần CSKH', 'Bộ phận Kỹ thuật'), H('Đổi trạng thái', 'Assigned', 'InProgress', 4, 'Lê Kỹ Thuật')],
        responses: [{ author: 'Trần CSKH', created_at: ago(27), content: 'Ban quản lý đã tiếp nhận và giao Bộ phận Kỹ thuật kiểm tra trong hôm nay.', solution: '', is_internal: false }] }),
      base({ id: 2, tracking_code: 'DN5810', type: 'complaint', service: 'Điện nước', priority: 'Critical', status: 'PendingApproval', escalated: true, ...hung,
        title: 'Mất nước toàn bộ tầng 8 từ sáng', description: 'Toàn bộ các căn hộ tầng 8 Tòa 1 không có nước từ 6 giờ sáng, ảnh hưởng sinh hoạt của khoảng 20 hộ.',
        location: { building: 'Tòa 1', floor: '8', room: '', note: 'cả tầng' }, created_at: ago(9), updated_at: ago(1),
        assignments: [{ id: 2, department_id: 1, department_name: 'Kỹ thuật', due_at: ahead(2), status: 'Done', result_note: 'Van tổng nhánh tầng 8 bị kẹt do cặn. Đã kiểm tra áp lực và xác nhận nguyên nhân.', solution: 'Thay van tổng nhánh tầng 8, xả cặn đường ống và theo dõi áp lực 24 giờ.' }],
        approval: { decision: 'pending', reason: '' },
        history: [H('Tạo phiếu', null, 'New', 9, 'Lê Văn Hùng'), H('Phân loại', 'New', 'New', 8.5, 'Trần CSKH', 'Mức ưu tiên: Khẩn cấp'), H('Phân công', 'New', 'Assigned', 8, 'Trần CSKH', 'Bộ phận Kỹ thuật'), H('Chuyển cấp', 'Assigned', 'Assigned', 7, 'Trần CSKH', 'Ảnh hưởng nhiều hộ'), H('Gửi kết quả', 'Assigned', 'PendingApproval', 1, 'Lê Kỹ Thuật')] }),
      base({ id: 3, tracking_code: 'VS7733', type: 'complaint', service: 'Vệ sinh', priority: 'Medium', status: 'Resolved', ...own,
        title: 'Rác tồn đọng nhiều ngày ở hầm B1', description: 'Khu vực thu gom rác hầm B1 có mùi hôi, rác chưa được dọn từ 3 ngày nay.',
        location: { building: 'Khu vực chung (sân, hầm xe, tiện ích)', floor: 'B1', room: '', note: 'gần cổng ra vào' }, created_at: ago(120), updated_at: ago(70),
        assignments: [{ id: 3, department_id: 2, department_name: 'Vệ sinh', due_at: ago(80), status: 'Done', result_note: 'Đã dọn sạch và khử mùi toàn bộ khu vực.', solution: 'Tăng tần suất thu gom lên 2 lần/ngày.' }],
        responses: [{ author: 'Trần CSKH', created_at: ago(70), content: 'Ban quản lý đã xử lý xong. Cảm ơn bạn đã phản ánh.', solution: 'Tăng tần suất thu gom rác lên 2 lần/ngày.', is_internal: false }],
        history: [H('Tạo phiếu', null, 'New', 120, 'Nguyễn Văn Cư Dân'), H('Phân công', 'New', 'Assigned', 110, 'Trần CSKH'), H('Đổi trạng thái', 'Assigned', 'InProgress', 100, 'Lê Kỹ Thuật'), H('Đổi trạng thái', 'InProgress', 'Resolved', 70, 'Trần CSKH')] }),
      base({ id: 4, tracking_code: 'GX3092', type: 'complaint', service: 'Gửi xe', priority: 'Low', status: 'Closed', ...own,
        title: 'Thẻ xe cư dân bị khóa nhầm', description: 'Thẻ xe của gia đình bị khóa dù đã đóng phí tháng này.',
        location: { building: 'Khu vực chung (sân, hầm xe, tiện ích)', floor: 'B2', room: '', note: 'quầy gửi xe' }, created_at: ago(300), updated_at: ago(250),
        responses: [{ author: 'Trần CSKH', created_at: ago(260), content: 'Đã mở khóa thẻ và đối soát lại phí.', solution: 'Mở khóa thẻ, cập nhật phí tháng.', is_internal: false }],
        rating: { stars: 5, comment: 'Xử lý nhanh, nhân viên nhiệt tình!' },
        history: [H('Tạo phiếu', null, 'New', 300, 'Nguyễn Văn Cư Dân'), H('Đổi trạng thái', 'New', 'Resolved', 262, 'Trần CSKH'), H('Đổi trạng thái', 'Resolved', 'Closed', 250, 'Trần CSKH')] }),
      base({ id: 5, tracking_code: 'AN1184', type: 'complaint', service: 'An ninh', status: 'New', ...mai,
        title: 'Cửa an ninh tầng hầm không đóng được', description: 'Cửa thoát hiểm hầm B1 Tòa 3 bị kẹt, không đóng hẳn, người lạ có thể vào.',
        location: { building: 'Tòa 3', floor: 'B1', room: '', note: 'cửa thoát hiểm' }, created_at: ago(3), updated_at: ago(3),
        history: [H('Tạo phiếu', null, 'New', 3, 'Trần Thị Mai')] }),
      base({ id: 6, tracking_code: 'GY9921', type: 'suggestion', service: 'Khác', priority: 'Low', status: 'New', ...own,
        title: 'Đề xuất lắp thêm ghế đá ở khu vườn', description: 'Khu vườn trung tâm còn ít chỗ ngồi, người lớn tuổi và trẻ em thường phải đứng. Đề xuất lắp thêm ghế đá.',
        location: { building: 'Khu vực chung (sân, hầm xe, tiện ích)', floor: '1', room: '', note: 'khu vườn trung tâm' }, created_at: ago(20), updated_at: ago(20),
        history: [H('Tạo phiếu', null, 'New', 20, 'Nguyễn Văn Cư Dân')] }),
      base({ id: 7, tracking_code: 'KP2204', type: 'praise', service: 'An ninh', status: 'New', ...mai,
        title: 'Cảm ơn bảo vệ Tòa 1 hỗ trợ nhiệt tình', description: 'Bác bảo vệ ca đêm đã giúp gia đình mang đồ lên căn hộ khi thang máy gặp sự cố. Rất cảm kích.',
        location: { building: 'Tòa 1', floor: '1', room: '', note: 'sảnh' }, created_at: ago(40), updated_at: ago(40),
        history: [H('Tạo phiếu', null, 'New', 40, 'Trần Thị Mai')] }),
      base({ id: 8, tracking_code: 'TN6650', type: 'complaint', service: 'Tiếng ồn', priority: 'High', status: 'Assigned', escalated: true, ...own,
        title: 'Khoan tường căn 1503 ngoài giờ cho phép', description: 'Căn hộ phía trên khoan tường từ 21 giờ đến gần nửa đêm nhiều ngày liên tiếp.',
        location: { building: 'Tòa 1', floor: '14', room: '1403', note: '' }, created_at: ago(52), updated_at: ago(16),
        assignments: [{ id: 4, department_id: 3, department_name: 'An ninh', due_at: ahead(8), status: 'Open', result_note: '', solution: '' }],
        history: [H('Tạo phiếu', null, 'New', 52, 'Nguyễn Văn Cư Dân'), H('Phân công', 'New', 'Assigned', 40, 'Trần CSKH', 'Bộ phận An ninh'), H('Chuyển cấp', 'Assigned', 'Assigned', 16, 'Trần CSKH', 'Tái diễn nhiều lần')] }),
      base({ id: 9, tracking_code: 'PD4471', type: 'complaint', service: 'Phí dịch vụ', priority: 'Medium', status: 'Reopened', ...mai, reopen_count: 1,
        title: 'Phí dịch vụ tháng 10 tính sai diện tích', description: 'Hóa đơn tháng 10 tính diện tích 78m² trong khi căn hộ là 72m².',
        location: { building: 'Tòa 2', floor: '7', room: '702', note: '' }, created_at: ago(200), updated_at: ago(12),
        responses: [{ author: 'Trần CSKH', created_at: ago(150), content: 'Đã đối soát và điều chỉnh hóa đơn.', solution: 'Điều chỉnh diện tích tính phí.', is_internal: false }],
        history: [H('Tạo phiếu', null, 'New', 200, 'Trần Thị Mai'), H('Đổi trạng thái', 'New', 'Resolved', 150, 'Trần CSKH'), H('Mở lại', 'Resolved', 'Reopened', 12, 'Trần Thị Mai', 'Hóa đơn vẫn chưa đúng')] }),
      base({ id: 10, tracking_code: 'SF0381', type: 'staff_feedback', service: 'Khác', status: 'New', ...hung,
        title: 'Lễ tân trả lời chậm khi đăng ký khách', description: 'Buổi chiều lễ tân Tòa 3 xử lý đăng ký khách chậm, tôi phải chờ gần 15 phút.',
        location: { building: 'Tòa 3', floor: '1', room: '', note: 'quầy lễ tân' }, created_at: ago(6), updated_at: ago(6),
        history: [H('Tạo phiếu', null, 'New', 6, 'Lê Văn Hùng')] }),
    ],
  };
}

let db;
function load() {
  if (db) return db;
  try { db = JSON.parse(localStorage.getItem(KEY)); } catch { db = null; }
  if (!db) db = seed();
  return db;
}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* bỏ qua */ } };
const clone = (x) => JSON.parse(JSON.stringify(x));
const fail = (status, message, fields) => { throw new ApiError(status, message, { fields }); };

const SIMPLE = ['suggestion', 'praise', 'staff_feedback'];
const NEXT = { New: ['Resolved'], Assigned: ['InProgress'], InProgress: ['Resolved'], Reopened: ['InProgress'], Resolved: ['Closed'] };

function whoami(token) {
  const role = String(token || '').replace('demo-token-', '');
  return Object.values(USERS).find((u) => u.role === role) || null;
}

// Biến phiếu nội bộ thành dữ liệu trả về theo vai trò
function view(t, me) {
  const o = clone(t);
  o.customer = { name: t.customer_name, phone: t.customer_phone };
  o.history = o.history.slice();
  o.can_rate = me?.role === 'customer' && ['Resolved', 'Closed'].includes(t.status) && !t.rating;
  o.can_reopen = me?.role === 'customer' && ['Resolved', 'Closed'].includes(t.status) && t.reopen_count < 3;
  if (me?.role === 'customer') o.responses = o.responses.filter((r) => !r.is_internal);
  return o;
}

const touch = (t, action, to, by, note) => {
  t.history.push({ action, from: t.status, to: to ?? t.status, at: new Date().toISOString(), by, note });
  if (to) t.status = to;
  t.updated_at = new Date().toISOString();
};
const find = (idOrCode) => load().tickets.find((t) => String(t.id) === String(idOrCode) || t.tracking_code === idOrCode);
const stale = (t, body) => { if (body?.expected_updated_at && body.expected_updated_at !== t.updated_at) fail(409); };

function dashboard() {
  const ts = load().tickets;
  const count = (key) => ts.reduce((a, t) => { const k = t[key] || 'None'; if (k !== 'None') a[k] = (a[k] || 0) + 1; return a; }, {});
  const rated = ts.filter((t) => t.rating);
  const done = ts.filter((t) => ['Resolved', 'Closed'].includes(t.status)).length;
  return {
    total: ts.length, pending_approval: ts.filter((t) => t.status === 'PendingApproval').length, escalated: ts.filter((t) => t.escalated).length,
    resolved_rate: Math.round((done / ts.length) * 100),
    avg_rating: rated.length ? +(rated.reduce((s, t) => s + t.rating.stars, 0) / rated.length).toFixed(1) : null, rating_count: rated.length,
    by_status: count('status'), by_priority: count('priority'), by_type: count('type'),
  };
}

export async function handle({ method, path, body, form, token }) {
  await sleep(180 + Math.random() * 220);                       // giả lập độ trễ mạng để thấy hiệu ứng tải
  const url = new URL(path, 'http://mock');
  const p = url.pathname, q = url.searchParams;
  const me = whoami(token);
  const m = (re) => re.exec(p);
  let r;

  // ---- Xác thực ----
  if (p === '/api/auth/login' && method === 'POST') {
    const u = USERS[String(body?.email || '').toLowerCase()];
    if (!u || body?.password !== 'Demo@1234') fail(400, 'Sai email hoặc mật khẩu demo (mật khẩu: Demo@1234).');
    return { token: 'demo-token-' + u.role, user: u };
  }
  if (p === '/api/auth/register' && method === 'POST') return { ok: true };
  if (p === '/api/auth/otp/verify' && method === 'POST') return { ok: true };
  if (!me) fail(401);

  if (p === '/api/meta') return { departments: DEPARTMENTS };
  if (p === '/api/dashboard') return dashboard();

  // ---- Việc được giao cho bộ phận ----
  if (p === '/api/assignments/mine') {
    return load().tickets.flatMap((t) => t.assignments.filter((a) => a.department_id === (me.department_id || 1))
      .map((a) => ({ ...clone(a), complaint: view(t, me) }))).sort((a, b) => (a.status === 'Open' ? -1 : 1) - (b.status === 'Open' ? -1 : 1));
  }
  if ((r = m(/^\/api\/assignments\/(\d+)\/result$/)) && method === 'PATCH') {
    const t = load().tickets.find((x) => x.assignments.some((a) => a.id === +r[1]));
    if (!t) fail(404);
    const a = t.assignments.find((x) => x.id === +r[1]);
    a.result_note = body.result_note; a.solution = body.solution; a.status = 'Done';
    if (t.priority === 'Critical' && t.type === 'complaint') { t.approval = { decision: 'pending', reason: '' }; touch(t, 'Gửi kết quả', 'PendingApproval', me.name); }
    else touch(t, 'Gửi kết quả', 'InProgress', me.name);
    t.rejected_reason = ''; save(); return { ok: true };
  }

  // ---- Phiếu ----
  if (p === '/api/complaints/mine') return clone(load().tickets.filter((t) => t.customer_id === me.id)).map((t) => view(t, me)).sort((a, b) => b.created_at.localeCompare(a.created_at));

  if (p === '/api/complaints' && method === 'GET') {
    const kw = (q.get('q') || '').toLowerCase();
    return load().tickets.filter((t) =>
      (!q.get('type') || t.type === q.get('type')) && (!q.get('status') || t.status === q.get('status')) && (!q.get('building') || t.location.building === q.get('building'))
      && (!kw || [t.tracking_code, t.title, t.customer_name].join(' ').toLowerCase().includes(kw))
      && (!q.get('from') || t.created_at.slice(0, 10) >= q.get('from')) && (!q.get('to') || t.created_at.slice(0, 10) <= q.get('to'))
      && (q.get('view') !== 'escalated' || t.escalated) && (q.get('view') !== 'pending' || t.status === 'PendingApproval'))
      .map((t) => view(t, me)).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }

  if (p === '/api/complaints' && method === 'POST') {
    const g = (k) => String((form instanceof FormData ? form.get(k) : '') ?? '').trim();
    const d = load(); const id = ++d.seq;
    const code = Math.random().toString(36).slice(2, 8).toUpperCase().replace(/[^A-Z0-9]/g, 'X').padEnd(6, '7');
    const files = form instanceof FormData ? form.getAll('files').filter((f) => f && f.name) : [];
    const t = base({ id, tracking_code: code, type: g('type'), service: g('service'), status: 'New', title: g('title'), description: g('description'),
      location: { building: g('building'), floor: g('floor'), room: g('room'), note: g('location_note') },
      customer_id: me.id, customer_name: me.name, customer_phone: me.phone || '0901234567', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      attachments: files.map((f) => ({ original_name: f.name, size_bytes: f.size, scan_status: 'pending' })), history: [] });
    t.history.push({ action: 'Tạo phiếu', from: null, to: 'New', at: t.created_at, by: me.name });
    d.tickets.unshift(t); save(); return { tracking_code: code, id };
  }

  if ((r = m(/^\/api\/complaints\/([^/]+)$/)) && method === 'GET') {
    const t = find(decodeURIComponent(r[1]));
    if (!t || (me.role === 'customer' && t.customer_id !== me.id)) fail(404);
    return view(t, me);
  }

  if ((r = m(/^\/api\/complaints\/(\d+)\/(\w+)$/))) {
    const t = find(r[1]); if (!t) fail(404);
    const act = r[2];
    if (act === 'classification' && method === 'PATCH') {
      stale(t, body); t.type = body.type; t.service = body.service; t.priority = body.priority || null;
      touch(t, 'Phân loại', null, me.name, `Ưu tiên: ${body.priority || 'chưa đặt'}`); save(); return view(t, me);
    }
    if (act === 'assignments' && method === 'POST') {
      const dep = DEPARTMENTS.find((x) => String(x.id) === String(body.department_id));
      if (!dep) fail(400, 'Vui lòng chọn bộ phận.', { department_id: 'Chọn bộ phận.' });
      if (!body.due_at) fail(400, 'Vui lòng đặt hạn xử lý.', { due_at: 'Chọn hạn xử lý.' });
      t.assignments.push({ id: ++load().seq, department_id: dep.id, department_name: dep.name, due_at: body.due_at, status: 'Open', result_note: '', solution: '' });
      touch(t, 'Phân công', t.status === 'New' ? 'Assigned' : null, me.name, `Bộ phận ${dep.name}`); save(); return view(t, me);
    }
    if (act === 'responses' && method === 'POST') {
      const content = String(body.content || '').trim();
      if (content.length < 3) fail(400, 'Vui lòng nhập nội dung trả lời.', { content: 'Tối thiểu 3 ký tự.' });
      if (!body.is_internal && t.priority === 'Critical' && t.type === 'complaint' && t.approval?.decision !== 'approved') fail(400, 'Phiếu khẩn cấp cần Quản lý duyệt phương án trước khi gửi kết quả cho khách.');
      t.responses.push({ author: me.name, created_at: new Date().toISOString(), content, solution: body.solution || '', is_internal: !!body.is_internal });
      touch(t, body.is_internal ? 'Ghi chú nội bộ' : 'Phản hồi khách', null, me.name); save(); return view(t, me);
    }
    if (act === 'status' && method === 'PATCH') {
      stale(t, body);
      if (!(NEXT[t.status] || []).includes(body.to_status)) fail(400, 'Không thể chuyển sang trạng thái này.', { to_status: 'Trạng thái không hợp lệ.' });
      if (body.to_status === 'Resolved' && !SIMPLE.includes(t.type) && !t.responses.some((x) => x.solution) && !t.assignments.some((x) => x.solution))
        fail(400, 'Phiếu "Đã giải quyết" bắt buộc có giải pháp (BR-08).');
      touch(t, 'Đổi trạng thái', body.to_status, me.name, body.note); save(); return view(t, me);
    }
    if (act === 'escalation' && method === 'POST') {
      if (String(body.reason || '').trim().length < 5) fail(400, 'Vui lòng nêu lý do chuyển cấp.', { reason: 'Tối thiểu 5 ký tự.' });
      t.escalated = true; touch(t, 'Chuyển cấp', null, me.name, body.reason); save(); return view(t, me);
    }
    if (act === 'approval' && method === 'POST') {
      if (body.decision === 'approve') {
        t.approval = { decision: 'approved', reason: body.reason || '' };
        const a = t.assignments.find((x) => x.status === 'Done');
        t.responses.push({ author: me.name, created_at: new Date().toISOString(), content: 'Phương án xử lý đã được Quản lý phê duyệt.', solution: a?.solution || '', is_internal: false });
        touch(t, 'Phê duyệt', 'Resolved', me.name, body.reason);
      } else {
        t.approval = { decision: 'rejected', reason: body.reason }; t.rejected_reason = body.reason;
        t.assignments.forEach((x) => { if (x.status === 'Done') x.status = 'Open'; });
        touch(t, 'Từ chối phương án', 'InProgress', me.name, body.reason);
      }
      save(); return view(t, me);
    }
    if (act === 'rating' && method === 'POST') {
      t.rating = { stars: body.stars, comment: body.comment || '' }; touch(t, 'Đánh giá', null, me.name, `${body.stars} sao`); save(); return view(t, me);
    }
    if (act === 'reopen' && method === 'POST') {
      t.reopen_count += 1; touch(t, 'Mở lại', 'Reopened', me.name, body.reason); save(); return view(t, me);
    }
  }
  fail(404);
}
