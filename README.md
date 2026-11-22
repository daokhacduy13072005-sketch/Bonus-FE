# Chung cư Sunrise — Phản hồi & Khiếu nại Cư dân (React + Ant Design)

Giao diện React 18 + **Ant Design 5**, tổ chức theo **Feature-Sliced Design (FSD)**,
**mỗi slice chỉ một file** để dễ tìm: muốn sửa "gửi phản hồi" → mở `src/features/create-ticket.jsx`.

## Chạy

```bash
copy .env.example .env      # Windows (macOS/Linux: cp .env.example .env) — chỉ làm 1 lần
npm install
npm run dev                 # mở http://localhost:5173
```

- `.env` (sao chép từ `.env.example`) → `VITE_USE_MOCK=true`: dùng dữ liệu giả (không cần backend). Đăng nhập bằng nút chọn vai trò ở trang đăng nhập (mật khẩu `Demo@1234`).
- Đổi `VITE_USE_MOCK=false` (và `VITE_API_URL`) để gọi backend thật. Sau khi sửa `.env` phải chạy lại `npm run dev`.
- `npm run check:fsd` kiểm tra tự động luật kiến trúc · `npm run build` đóng gói.

## Tìm code ở đâu? (Ctrl+P rồi gõ tên file)

```
src/
├── app/        index.jsx (providers, vỏ trang, hiệu ứng chuyển trang) · routes.jsx (bảng route + phân quyền) · theme.js (màu/font antd)
├── pages/      MỖI TRANG MỘT FILE — chỉ ghép widgets + features
│   landing  login  register  otp  forgot  admin  errors
│   customer-new-ticket  customer-history  customer-track  customer-ticket
│   staff-queue  ticket-detail  manager-dashboard  manager-escalated  dept-tasks  dept-task
├── widgets/    khối giao diện lớn: app-header · site-footer · auth-shell · ticket-table · ticket-stats
├── features/   MỖI HÀNH ĐỘNG MỘT FILE (form + gọi API + luật kiểm tra)
│   auth  create-ticket  track-ticket  rate-ticket  reopen-ticket  filter-tickets
│   classify-ticket  assign-ticket  respond-ticket  change-status  escalate-ticket  approve-ticket  submit-task-result
├── entities/   thực thể nghiệp vụ: ticket (từ điển, API, tag, timeline) · user (vai trò, phiên) · assignment · department
└── shared/     không biết nghiệp vụ: api · config · lib (hook, format) · ui (khối dùng chung) · mock · styles.css
```

Luật phụ thuộc (kiểm tra bằng `npm run check:fsd`): **app → pages → widgets → features → entities → shared**.
Tầng trên được import tầng dưới, không ngược lại; hai file cùng tầng không import nhau.
Ví dụ `ticket-detail` ghép 6 feature, còn các feature không biết nhau.

## Ant Design dùng ở đâu

| Thành phần antd | Nơi dùng |
|---|---|
| `ConfigProvider` + `theme` | `app/theme.js` — đổi màu thương hiệu, bo góc, font một chỗ |
| `Form` + `rules` | mọi form: kiểm tra từng ô, lỗi hiện đúng dưới ô nhập |
| `Table`, `Tabs`, `Tag` | `widgets/ticket-table`, `pages/staff-queue`, trạng thái/ưu tiên |
| `Steps`, `Timeline`, `Descriptions` | tiến độ phiếu, lịch sử, thông tin chi tiết |
| `Upload.Dragger`, `Input.OTP`, `Rate`, `DatePicker` | tạo phiếu, OTP, đánh giá, bộ lọc ngày |
| `Progress`, `Card`, `Result`, `Skeleton` | dashboard, 404/403, trạng thái đang tải |

## Hiệu ứng chuyển động (nằm trong `shared/styles.css`, `shared/ui.jsx`)

Thanh tiến trình trên cùng mỗi lần đổi trang · trang trượt vào · các khối hiện dần khi cuộn (`Reveal`) ·
thẻ nổi lên khi rê chuột · số liệu dashboard đếm chạy (`CountUp`) · nút cam có vệt sáng quét ·
hero nền chuyển màu + thẻ minh hoạ nổi. Tự tắt khi hệ điều hành bật "giảm chuyển động".

## Câu hỏi giám khảo thường gặp

**Vì sao FSD?** Chia theo nghiệp vụ chứ không theo loại file: một tính năng nằm gọn trong một file, không rải rác.
**Làm sao khỏi rối khi lớn thêm?** Luật import một chiều được máy kiểm tra, có thể gắn vào CI.
**Vì sao dùng antd?** Bộ thành phần chín muồi (form, bảng, bước tiến trình), có tiếng Việt, đổi theme tập trung.
**Chống XSS?** React tự escape mọi giá trị hiển thị; quyền thật do backend kiểm tra, giao diện chỉ ẩn/hiện cho gọn.
**Phiên đăng nhập?** Token lưu `sessionStorage` (mất khi đóng tab); lớp `shared/api` nhận token qua `configureApi` (tiêm phụ thuộc) nên không import ngược tầng.

## Việc còn mở

- Màn Quản trị (UC-18→21) và Quên mật khẩu chưa có trong Screen Flow — vẫn là trang giữ chỗ.
- Danh sách tòa nhà và giới hạn tệp đính kèm là giá trị tạm, cần chốt với nhóm.
- Chưa có chế độ tối (bản JS thuần cũ có). Dữ liệu giả chỉ để demo, không thay thế backend.
