// Cấu hình kỹ thuật dùng chung — KHÔNG chứa nghiệp vụ.
// Bật/tắt dữ liệu giả trong file .env ở thư mục gốc (VITE_USE_MOCK=true/false).
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const BRAND = 'Chung cư Sunrise';
