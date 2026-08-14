const fs = require('fs');
const path = require('path');

const replacements = [
  { file: 'src/shared/components/molecules/StatusBadge.tsx', search: /activeLabel = ".*?", inactiveLabel = ".*?"/, replace: 'activeLabel = "Hoạt động", inactiveLabel = "Vô hiệu"' },
  { file: 'src/shared/components/molecules/SearchField.tsx', search: /placeholder = ".*?"/, replace: 'placeholder = "Tìm kiếm..."' },
  { file: 'src/shared/components/molecules/Pagination.tsx', search: /Hi\ufffdn th\ufffd <span className="font-medium">{start}\ufffd{end}<\/span> trong \{" "\}/, replace: 'Hiển thị <span className="font-medium">{start}-{end}</span> trong {" "}' },
  { file: 'src/shared/components/molecules/DataTable.tsx', search: /emptyMessage = ".*?"/, replace: 'emptyMessage = "Không có dữ liệu"' },
  { file: 'src/shared/components/molecules/ConfirmModal.tsx', search: /title = ".*?"/, replace: 'title = "Xác nhận"' },
  { file: 'src/shared/components/molecules/ConfirmModal.tsx', search: /message = ".*?"/, replace: 'message = "Bạn có chắc chắn muốn thực hiện hành động này?"' },
  { file: 'src/shared/components/molecules/ConfirmModal.tsx', search: /confirmLabel = ".*?"/, replace: 'confirmLabel = "Xác nhận"' },
  { file: 'src/core/utils/error.ts', search: /message: ".*?"/, replace: 'message: "Không thể kết nối đến máy chủ"' },
  { file: 'src/features/users/schemas/user.schemas.ts', search: /\.min\(1, ".*?"\)/, replace: '.min(1, "Vui lòng nhập họ tên")' },
  { file: 'src/features/users/schemas/user.schemas.ts', search: /\.url\(".*?"\)/, replace: '.url("URL không hợp lệ")' },
  { file: 'src/features/users/pages/UserFormPage.tsx', search: /\{id \? ".*?" : ".*?"\}/, replace: '{id ? "Chỉnh sửa người dùng" : "Tạo người dùng"}' },
  { file: 'src/features/users/pages/UserFormPage.tsx', search: /Ch\ufffdc nang dang ph\ufffdt tri\ufffdn\.\.\./, replace: 'Chức năng đang phát triển...' },
  { file: 'src/features/users/pages/UserListPage.tsx', search: /header: "Ngu\ufffdi d\ufffdng"/, replace: 'header: "Người dùng"' },
  { file: 'src/features/users/pages/UserListPage.tsx', search: /header: "Vai tr\ufffd"/, replace: 'header: "Vai trò"' },
  { file: 'src/features/users/pages/UserListPage.tsx', search: /header: "X\ufffdc th\ufffdc"/, replace: 'header: "Xác thực"' },
  { file: 'src/features/users/pages/UserListPage.tsx', search: /\{u\.isEmailVerified \? ".*?" : ".*?"\}/, replace: '{u.isEmailVerified ? "Đã xác thực" : "Chưa xác thực"}' },
  { file: 'src/features/users/pages/UserListPage.tsx', search: /<Users size=\{22\} \/> Ngu\ufffdi d\ufffdng/, replace: '<Users size={22} /> Người dùng' },
  { file: 'src/features/users/pages/UserListPage.tsx', search: /T\ufffdng: <span className="font-medium">\{data\?\.total \?\? 0\}<\/span> t\ufffdi kho\ufffdn/, replace: 'Tổng: <span className="font-medium">{data?.total ?? 0}</span> tài khoản' },
  { file: 'src/features/users/pages/UserListPage.tsx', search: /emptyMessage="Kh\ufffdng t\ufffdm th\ufffdy ngu\ufffdi d\ufffdng n\ufffdo"/, replace: 'emptyMessage="Không tìm thấy người dùng nào"' },
  { file: 'src/features/users/pages/ProfilePage.tsx', search: /<h1 className="text-2xl font-bold text-slate-900">H\ufffd so c\ufffda t\ufffdi<\/h1>/, replace: '<h1 className="text-2xl font-bold text-slate-900">Hồ sơ của tôi</h1>' },
  { file: 'src/features/users/pages/ProfilePage.tsx', search: /<h2 className="font-semibold text-slate-800 flex items-center gap-2"><User size=\{16\} \/>Th\ufffdng tin c\ufffd nh\ufffdn<\/h2>/, replace: '<h2 className="font-semibold text-slate-800 flex items-center gap-2"><User size={16} />Thông tin cá nhân</h2>' },
  { file: 'src/features/users/pages/ProfilePage.tsx', search: /<FormField id="profile-fullname" label="H\ufffd v\ufffd t\ufffdn" required error=\{form\.formState\.errors\.fullName\?\.message\}>/, replace: '<FormField id="profile-fullname" label="Họ và tên" required error={form.formState.errors.fullName?.message}>' },
  { file: 'src/features/users/pages/ProfilePage.tsx', search: /\{success && <p className="text-sm text-emerald-600">C\ufffdp nh\ufffdt th\ufffdnh c\ufffdng!<\/p>\}/, replace: '{success && <p className="text-sm text-emerald-600">Cập nhật thành công!</p>}' },
  { file: 'src/features/users/hooks/useUserList.ts', search: /message \?\? "L\ufffdi t\ufffdi danh s\ufffdch"\); \}/, replace: 'message ?? "Lỗi tải danh sách"); }' },
  { file: 'src/features/dashboard/pages/DashboardPage.tsx', search: /label: "T\ufffdng don d\ufffdt v\ufffd", value: "\ufffd"/, replace: 'label: "Tổng đơn đặt vé", value: "0"' },
  { file: 'src/features/dashboard/pages/DashboardPage.tsx', search: /label: "Ngu\ufffdi d\ufffdng",\s+value: "\ufffd"/, replace: 'label: "Người dùng",       value: "0"' },
  { file: 'src/features/dashboard/pages/DashboardPage.tsx', search: /label: "S\ufffd ki\ufffdn",\s+value: "\ufffd"/, replace: 'label: "Sự kiện",          value: "0"' },
  { file: 'src/features/dashboard/pages/DashboardPage.tsx', search: /label: "Doanh thu",\s+value: "\ufffd"/, replace: 'label: "Doanh thu",        value: "0"' },
  { file: 'src/features/dashboard/pages/DashboardPage.tsx', search: /Xin ch\ufffdo, \{user\?\.fullName \?\? "b\ufffdn"\} \?\?/, replace: 'Xin chào, {user?.fullName ?? "bạn"} 👋' },
  { file: 'src/features/dashboard/pages/DashboardPage.tsx', search: /\ufffd\ufffdy l\ufffd t\ufffdng quan h\ufffd th\ufffdng TicketBook\./, replace: 'Đây là tổng quan hệ thống TicketHub.' },
  { file: 'src/features/auth/store/auth.slice.ts', search: /action\.payload \?\? action\.error\?\.message \?\? ".*?"/, replace: 'action.payload ?? action.error?.message ?? "Đã xảy ra lỗi"' },
  { file: 'src/features/auth/store/auth.thunk.ts', search: /message \?\? "\ufffdang nh\ufffdp th\ufffdt b\ufffdi"/, replace: 'message ?? "Đăng nhập thất bại"' },
  { file: 'src/features/auth/store/auth.thunk.ts', search: /message \?\? "\ufffdang k\ufffd th\ufffdt b\ufffdi"/, replace: 'message ?? "Đăng ký thất bại"' }
];

for (const r of replacements) {
  const p = path.join(__dirname, r.file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(r.search, r.replace);
    fs.writeFileSync(p, content, 'utf8');
  }
}
