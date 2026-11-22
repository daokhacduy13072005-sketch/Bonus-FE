// Mọi lời gọi tới backend đi qua đây. Màn hình không bao giờ gọi fetch trực tiếp.
//
// Lớp shared KHÔNG được biết về phiên đăng nhập (đó là nghiệp vụ của entities/user).
// Vì vậy tầng app "tiêm" hai hàm qua configureApi() lúc khởi động (dependency injection).
import { USE_MOCK, API_BASE_URL } from './config.js';

// Lỗi chuẩn hoá từ API: 400, 401, 403, 404, 409, 429
export class ApiError extends Error {
  constructor(status, message, { code = null, fields = null } = {}) {
    super(message || `Lỗi ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;     // ví dụ 'LOCKED'
    this.fields = fields; // { tenTruong: 'thông báo' } cho lỗi 400
  }
}

export function defaultMessage(status) {
  return {
    400: 'Dữ liệu chưa hợp lệ, vui lòng kiểm tra lại.',
    401: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
    403: 'Bạn không có quyền thực hiện thao tác này.',
    404: 'Không tìm thấy dữ liệu (hoặc không thuộc phạm vi của bạn).',
    409: 'Dữ liệu vừa được người khác cập nhật. Hãy tải lại trang rồi thử lại.',
    429: 'Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại.',
  }[status] || 'Có lỗi xảy ra, vui lòng thử lại.';
}

let hooks = { getToken: () => null, onUnauthorized: () => {} };
export const configureApi = (h) => { hooks = { ...hooks, ...h }; };

/**
 * @param {string} path  ví dụ '/api/complaints/mine'
 * @param {{method?:string, body?:object, form?:FormData, auth?:boolean}} opts
 *   - body: gửi JSON; form: gửi multipart (upload file)
 *   - auth:false cho login/register (401 không có nghĩa là hết phiên)
 */
export async function api(path, { method = 'GET', body, form, auth = true } = {}) {
  const token = hooks.getToken();
  try {
    if (USE_MOCK) {
      const { handle } = await import('./mock.js');
      return await handle({ method, path, body, form, token });
    }
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body) headers['Content-Type'] = 'application/json';

    let res;
    try {
      res = await fetch(API_BASE_URL + path, { method, headers, body: form ?? (body ? JSON.stringify(body) : undefined) });
    } catch {
      throw new ApiError(0, 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.');
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.message || defaultMessage(res.status), { code: data.code, fields: data.fields });
    return data;
  } catch (e) {
    if (e instanceof ApiError && e.status === 401 && auth) hooks.onUnauthorized(e);
    throw e;
  }
}
