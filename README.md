# Chung cư Sunrise — Phản hồi & Khiếu nại Cư dân (React + Ant Design)

Giao diện React 18 + **Ant Design 5**, tổ chức theo **Feature-Sliced Design (FSD)**,
**mỗi slice chỉ một file** để dễ tìm: muốn sửa "gửi phản hồi" → mở `src/features/create-ticket.jsx`.

## Chạy

```bash
copy .env.example .env      # Windows (macOS/Linux: cp .env.example .env) — chỉ làm 1 lần
npm install
npm run dev                 # mở http://localhost:5173
```

- `.env` (sao chép từ `.env.example`), cấu hình `VITE_API_URL` (mặc định `http://localhost:8080`) để gọi backend. Sau khi sửa `.env` phải chạy lại `npm run dev`.
- `npm run check:fsd` kiểm tra tự động luật kiến trúc · `npm run build` đóng gói.

## Tìm code ở đâu? (Ctrl+P rồi gõ tên file)

```
src/
├── app/        index.jsx (providers, vỏ trang, hiệu ứng chuyển trang) · routes.jsx (bảng route + phân quyền) · theme.js (màu/font antd)
├── pages/      MỖI TRANG MỘT FILE — chỉ ghép widgets + features
│   landing  login  register  forgot  errors
│   customer-new-ticket  customer-history  customer-track  customer-ticket  customer-profile
│   staff-queue  staff-customers  staff-directory  ticket-detail  manager-dashboard  manager-escalated  manager-accounts  dept-tasks  dept-task
├── widgets/    khối giao diện lớn: app-header · site-footer · auth-shell · ticket-table · ticket-stats
├── features/   MỖI HÀNH ĐỘNG MỘT FILE (form + gọi API + luật kiểm tra)
│   auth  create-ticket  track-ticket  rate-ticket  reopen-ticket  filter-tickets  customer-profile  manage-accounts
│   classify-ticket  assign-ticket  respond-ticket  change-status  escalate-ticket  approve-ticket  merge-ticket  upload-attachment  submit-task-result
├── entities/   thực thể nghiệp vụ: ticket (từ điển, API, tag, timeline) · user (vai trò, phiên) · customer · staff · category · assignment · department · account
└── shared/     không biết nghiệp vụ: api · config · lib (hook, format) · ui (khối dùng chung) · styles.css
```

Luật phụ thuộc (kiểm tra bằng `npm run check:fsd`): **app → pages → widgets → features → entities → shared**.
Tầng trên được import tầng dưới, không ngược lại; hai file cùng tầng không import nhau.
Ví dụ `ticket-detail` ghép nhiều feature, còn các feature không biết nhau.

## Ant Design dùng ở đâu

| Thành phần antd | Nơi dùng |
|---|---|
| `ConfigProvider` + `theme` | `app/theme.js` — đổi màu thương hiệu, bo góc, font một chỗ |
| `Form` + `rules` | mọi form: kiểm tra từng ô, lỗi hiện đúng dưới ô nhập |
| `Table`, `Tabs`, `Tag` | `widgets/ticket-table`, `pages/staff-queue`, `pages/staff-customers`, `pages/staff-directory` |
| `Steps`, `Timeline`, `Descriptions` | tiến độ phiếu, lịch sử, thông tin chi tiết, hồ sơ cư dân |
| `Upload.Dragger`, `Rate`, `DatePicker` | tạo phiếu, bổ sung đính kèm, đánh giá, hợp đồng thuê, bộ lọc ngày |
| `Progress`, `Card`, `Result`, `Skeleton` | dashboard, điểm tin cậy cư dân, 404/403, trạng thái đang tải |

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

- Màn Quên mật khẩu chưa có trong Screen Flow — vẫn là trang giữ chỗ.
- Danh sách tòa nhà hiện khai báo tĩnh ở FE (giới hạn tệp đính kèm đã chốt khớp BE: tối đa 5 tệp, 10 MB/tệp).
- Chưa có chế độ tối (bản JS thuần cũ có).

---

## Nhật ký sửa lỗi & bổ sung tính năng FE

### 1. Các lỗi đã sửa (Bug Fixes)

1. **Sửa lỗi không gửi được phản hồi (`src/features/create-ticket.jsx`)**
   - Chuyển `POST /api/feedbacks` từ `FormData` (`multipart/form-data`) sang `application/json` khớp `CreateFeedbackRequestDto` của BE (`customerId`, `type` viết hoa, `content`, `serviceName`, `location`, `apartmentCode`).
   - Tách bước upload tệp đính kèm sang `POST /api/feedbacks/{id}/attachments` với field `file` cho từng tệp.
   - Đọc mã phiếu trả về từ `res.code || res.tracking_code` thay vì chỉ `res.tracking_code`.
   - Cập nhật `FILE_RULES` khớp cấu hình BE: tối đa 5 tệp, 10 MB/tệp, hỗ trợ `jpg, jpeg, png, webp, gif, pdf`.

2. **Sửa lỗi tra cứu & xem chi tiết phiếu theo mã (`src/entities/ticket.jsx`, `src/features/track-ticket.jsx`)**
   - Sửa `getTicket(idOrCode)`: nhận diện nếu là số thì gọi `GET /api/feedbacks/{id}`, nếu là mã tra cứu (vd `FB-20261126-0001`) thì gọi `GET /api/feedbacks/code/{code}`, tránh lỗi 400 `"Tham số 'id' không đúng định dạng"`.
   - Gọi thêm `GET /api/feedbacks/{id}/attachments` để lấy danh sách tệp đính kèm và gắn link tải từ `fileUrl`.
   - Chuẩn hóa dữ liệu (`normalizeTicket`) dùng chung cho `listTickets`, `listMyTickets`, `getTicket` (map `content` → `description`, `serviceName` → `service`, trạng thái `WAITING_INFO`/`REJECTED`/`MERGED`, loại `PROPOSAL`, mức ưu tiên, và giá trị mặc định cho `history`/`responses`/`assignments` để tránh crash trang chi tiết).
   - Mở rộng regex nhập mã phiếu trong `TrackForm` từ 6 ký tự lên `4–24` ký tự gồm chữ, số và dấu `-`.

3. **Sửa lỗi hiển thị mã phiếu bị xuống dòng (`src/shared/styles.css`, `src/widgets/ticket-table.jsx`, `src/pages/dept-tasks.jsx`, `src/features/features.css`)**
   - Thêm `display: inline-block; white-space: nowrap;` cho `.code-link`.
   - Tăng độ rộng cột `Mã` trong bảng từ `110` lên `175` và giảm `letter-spacing` của `.code-input` / `.big-code` xuống `2px`.

4. **Sửa lỗi nút form xoay mãi khi gặp lỗi (`src/shared/ui.jsx`)**
   - Trong `useAction`, cập nhật `useEffect` gán lại `mounted.current = true` khi component mount/remount dưới `<React.StrictMode>`, đảm bảo `setLoading(false)` luôn chạy ở `finally`.

5. **Sửa lỗi đăng ký & phân quyền Manager (`src/features/auth.jsx`)**
   - Sửa payload `RegisterForm` từ `full_name`, `apartment_code` sang `fullName`, `apartmentCode` khớp `RegisterRequestDto`.
   - Map role `CS_MANAGER` từ BE về `'manager'` trong `LoginForm` để tài khoản Quản lý CSKH truy cập đúng `/manager/dashboard` và `/manager/*`.

6. **Đồng bộ tài liệu & dọn trang không dùng (`README.md`, `src/app/routes.jsx`, `src/entities/user.jsx`, `src/widgets/app-header.jsx`)**
   - Xóa `src/pages/admin.jsx` và gỡ các tham chiếu `/admin`.
   - Bỏ hướng dẫn `VITE_USE_MOCK` cũ vì dự án đã kết nối backend thật.

### 2. Các chức năng mới đã bổ sung (New Features)

1. **Đăng ký đầy đủ theo `RegisterRequestDto` (`src/features/auth.jsx`)**
   - Bổ sung ô nhập **Mã căn hộ (`apartmentCode`)**.
   - Bổ sung chọn **Loại cư dân (`residentType`)**: `OWNER` (Chủ căn hộ) hoặc `TENANT` (Người thuê).
   - Khi chọn `TENANT`, hiển thị chọn **Thời hạn hợp đồng thuê** (`rentalContractStartDate`, `rentalContractEndDate`).
   - Hiển thị thông báo rõ ràng khi tài khoản mới ở trạng thái `PENDING` chờ Ban quản lý duyệt.

2. **Hồ sơ cư dân & quản lý danh sách cư dân (`src/entities/customer.js`, `src/features/customer-profile.jsx`, `src/pages/customer-profile.jsx`, `src/pages/staff-customers.jsx`)**
   - **Cư dân (`/customer/profile`)**: xem thông tin căn hộ, trạng thái xác minh, điểm tin cậy (`ratingTrustScore`), số lần vi phạm (`spamStrikes`), danh sách hợp đồng thuê (`rentalContracts`) và tự cập nhật họ tên, email, SĐT qua `GET/PUT /api/customers/me` (chặn tự sửa khi tài khoản đang bị khóa `blocked`).
   - **CSKH / Quản lý (`/staff/customers`)**: xem danh sách cư dân (`GET /api/customers`), tìm kiếm theo tên/căn hộ/email/SĐT, xem chi tiết và sửa thông tin liên hệ cư dân (`PUT /api/customers/{id}`).

3. **Danh mục phản hồi động & Danh sách nhân sự (`src/entities/category.js`, `src/entities/staff.js`, `src/pages/staff-directory.jsx`, `src/features/create-ticket.jsx`)**
   - Bổ sung trang **`/staff/directory`** cho CSKH/Quản lý xem danh sách nhân sự (`GET /api/staff`: vai trò, bộ phận, trạng thái hoạt động, đang trực ca) và danh mục phân loại tự động (`GET /api/categories`: mã, nhóm, ưu tiên mặc định, từ khóa).
   - Trong form tạo phiếu (`src/features/create-ticket.jsx`), bổ sung chọn **Danh mục sự cố (`categoryId`)**, chọn **Nhân viên liên quan (`aboutStaffId`)**, và cảnh báo chặn gửi nếu `user.blocked === true`.

4. **Gộp phiếu trùng lặp (`src/features/merge-ticket.jsx`, `src/pages/ticket-detail.jsx`)**
   - Hiển thị cảnh báo các phiếu nghi trùng (`suspectedDuplicateIds`) có link bấm tới từng phiếu.
   - Cho phép CSKH / Quản lý nhập ID phiếu gốc + ghi chú và gọi `POST /api/feedbacks/{id}/merge`.

5. **Upload bổ sung tệp đính kèm & Phân trang server (`src/features/upload-attachment.jsx`, `src/pages/customer-history.jsx`, `src/widgets/ticket-table.jsx`)**
   - Bổ sung `UploadAttachmentCard` ở trang chi tiết phiếu của cư dân (`/customer/complaints/:code`) để tải thêm tệp đính kèm cho phiếu chưa kết thúc.
   - Bổ sung phân trang phía server (`page`, `size`, `totalElements`) cho `GET /api/feedbacks/mine` tại trang **Phiếu của tôi**.

6. **Hiển thị thông tin xử lý & lọc danh sách (`src/pages/customer-ticket.jsx`, `src/pages/ticket-detail.jsx`, `src/pages/staff-queue.jsx`, `src/pages/manager-escalated.jsx`)**
   - Hiển thị thêm các nhãn & thông tin từ BE: `Ngoài giờ` (`afterHours`), `Thiếu thông tin` (`missingInfo`), `Cần duyệt` (`requiresManagerApproval`), thông tin gộp trùng (`duplicateOfId`, `duplicateCount`), độ tin cậy phân loại tự động (`classifiedBy`, `autoConfidence`), hạn SLA (`responseDueAt`, `resolveDueAt`), và tên nhân sự phụ trách (`assignedStaffId`).
   - Bổ sung lọc phía client dự phòng trên `StaffQueuePage` (thêm tab `proposal`) và `EscalatedPage`, đồng thời bọc `.catch(() => [])` cho `getDepartments()` để không làm lỗi trang chi tiết khi BE chưa có `/api/meta`.

### 3. Route mới đã thêm (`src/app/routes.jsx`, `src/widgets/app-header.jsx`)

| Đường dẫn | Vai trò | Chức năng |
|---|---|---|
| `/customer/profile` | `customer` | Hồ sơ cá nhân & hợp đồng thuê của cư dân |
| `/staff/customers` | `cs_staff`, `manager` | Danh sách & chỉnh sửa liên hệ cư dân |
| `/staff/directory` | `cs_staff`, `manager` | Danh sách nhân sự & danh mục phản hồi |
| `/accounts` | `cs_staff`, `manager` | Quản lý tài khoản nhân viên & khách hàng |

---

### 4. Bổ sung 2026-11-27 — Quản lý Account

#### Entity & API mới (`src/entities/account.js`)

Thêm entity `account` chứa toàn bộ hằng số nhãn/màu và các hàm gọi API tập trung:

- **Staff accounts:** `listStaffAccounts`, `createStaffAccount`, `updateStaffAccount`, `resetStaffPassword`, `toggleStaffStatus`
- **Customer accounts:** `listCustomerAccounts`, `updateCustomerAccount`, `patchCustomerAccount`, `resetCustomerPassword`

#### Feature mới (`src/features/manage-accounts.jsx`)

Các component dùng lại trong trang quản lý:

- `StaffAccountForm` — form tạo / sửa tài khoản nhân viên (họ tên, email, SĐT, vai trò, bộ phận, mật khẩu tạm khi tạo mới).
- `StaffAccountActions` — khoá/mở khoá & đặt lại mật khẩu nhân viên (Popconfirm chống bấm nhầm).
- `StaffAccountCard` — thẻ Descriptions hiển thị thông tin chi tiết nhân viên.
- `CustomerAccountForm` — form sửa thông tin liên hệ khách hàng.
- `CustomerAccountActions` — khoá/mở khoá KH, xác minh cư dân, xóa vi phạm spam, đặt lại mật khẩu KH.
- `CustomerAccountCard` — thẻ Descriptions chi tiết tài khoản khách hàng.
- `AccountStatusBadge` — badge hiển thị trạng thái account (active / locked / inactive).

#### Trang mới (`src/pages/manager-accounts.jsx`)

Trang `/accounts` với 2 tab:

- **Tab "Tài khoản nhân viên"** — bảng có search theo tên/email/vai trò/bộ phận, bấm "Chi tiết" mở Modal xem + sửa + hành động; nút "Tạo tài khoản nhân viên" chỉ hiện cho `manager`.
- **Tab "Tài khoản khách hàng"** — bảng có search, badge vi phạm spam, Modal chi tiết tích hợp form sửa thông tin + toàn bộ actions.

#### Phân quyền

| Chức năng | `cs_staff` | `manager` |
|---|:---:|:---:|
| Xem danh sách nhân viên | ✅ | ✅ |
| Tạo / sửa tài khoản nhân viên | ❌ | ✅ |
| Khoá / đặt lại MK nhân viên | ❌ | ✅ |
| Xem / sửa thông tin KH | ✅ | ✅ |
| Khoá / mở khoá / xác minh KH | ✅ | ✅ |
| Xóa vi phạm spam KH | ✅ | ✅ |
| Đặt lại MK khách hàng | ✅ | ✅ |

#### Route & Nav (`src/app/routes.jsx`, `src/widgets/app-header.jsx`)

- Thêm route `/accounts` → `STAFF_OR_MANAGER` → `<AccountManagementPage />`.
- Thêm mục **"Quản lý Account"** vào thanh nav của cả `cs_staff` và `manager`.

#### API endpoints kỳ vọng backend

```
GET   /api/accounts/staff
POST  /api/accounts/staff
PUT   /api/accounts/staff/:id
POST  /api/accounts/staff/:id/reset-password
PATCH /api/accounts/staff/:id/status          { active }

GET   /api/accounts/customers
PUT   /api/accounts/customers/:id
PATCH /api/accounts/customers/:id/status      { blocked?, spamStrikes?, verifiedResident? }
POST  /api/accounts/customers/:id/reset-password
```
