import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DataTable, type Column } from "@/shared/components/molecules/DataTable";
import { Pagination } from "@/shared/components/molecules/Pagination";
import { SearchField } from "@/shared/components/molecules/SearchField";
import { Badge } from "@/shared/components/atoms/Badge";
import { Avatar } from "@/shared/components/atoms/Avatar";
import { useUserList } from "../hooks/useUserList";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useState } from "react";
import type { User } from "@/shared/types/user.type";

export default function UserListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const { data, isLoading, params, updateParams } = useUserList();

  const columns: Column<User>[] = [
    {
      key: "user",
      header: "Ngu?i d�ng",
      cell: (u) => (
        <div className="flex items-center gap-3">
          <Avatar src={u.avatarUrl} fallback={u.fullName} size="sm" />
          <div>
            <p className="font-medium text-slate-800">{u.fullName}</p>
            <p className="text-xs text-slate-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "roles",
      header: "Vai trò",
      cell: (u) => (
        <div className="flex flex-wrap gap-1">
          {u.roles.map((r) => <Badge key={r} variant="default" className="text-[11px]">{r}</Badge>)}
        </div>
      ),
    },
    {
      key: "verified",
      header: "Xc th?c",
      cell: (u) => (
        <Badge variant={u.isEmailVerified ? "success" : "secondary"}>
          {u.isEmailVerified ? "Đã xác thực" : "Chưa xác thực"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Users size={22} /> Ngu?i d�ng
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            T?ng: <span className="font-medium">{data?.total ?? 0}</span> t�i kho?n
          </p>
        </div>
        <SearchField value={search} onChange={(v) => { setSearch(v); updateParams({ search: debouncedSearch, page: 0 }); }} className="w-64" />
      </div>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(u) => u.id}
        isLoading={isLoading}
        emptyMessage="Kh�ng t�m th?y ngu?i d�ng n�o"
        onRowClick={(u) => navigate(`/users/${u.id}`)}
      />

      {data && data.totalPages > 1 && (
        <Pagination
          currentPage={params.page}
          totalPages={data.totalPages}
          totalElements={data.totalElements ?? data.total ?? 0}
          pageSize={params.size}
          onPageChange={(page) => updateParams({ page })}
          onPageSizeChange={(size) => updateParams({ size, page: 0 })}
        />
      )}
    </div>
  );
}
