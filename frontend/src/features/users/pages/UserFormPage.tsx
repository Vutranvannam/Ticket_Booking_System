import { useParams } from "react-router-dom";

export default function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">{id ? "Chỉnh sửa người dùng" : "Tạo người dùng"}</h1>
      <p className="mt-2 text-slate-500">Ch?c nang dang ph�t tri?n...</p>
    </div>
  );
}
