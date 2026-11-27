//  giao việc cho bộ phận xử lí
import { api } from '@shared/api.js';

export const ASSIGN_LABEL = { Open: 'Chờ xử lý', Done: 'Đã báo kết quả' };
export const listMyAssignments = () => api('/api/assignments/mine');
