
// features/register-device/components/RegisterDeviceListTable.tsx
"use client";

export type HistoryRow = {
  id: string;
  deviceType?: string | null;
  brandName?: string | null;
  modelName?: string | null;
  serialNumber?: string | null;
  status?: string | null;
  createdAt: string; // ISO
  problem?: string | null;
};

function StatusBadge({ status }: { status: string | null | undefined }) {
  const label = status ?? "-";
  const base = "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium";
  const cls =
    label === "WAITING_FOR_CUSTOMER_DEVICE" ? "bg-yellow-500/15 text-yellow-200 border border-yellow-600/30" :
    label === "IN_PROGRESS"                 ? "bg-blue-500/15 text-blue-200 border border-blue-600/30" :
    label === "COMPLETED"                   ? "bg-green-500/15 text-green-200 border border-green-600/30" :
                                              "bg-zinc-500/15 text-zinc-200 border border-zinc-600/30";
  return <span className={`${base} ${cls}`}>{label}</span>;
}

export default function RegisterDeviceListTable({ items = [] }: { items?: HistoryRow[] }) {
  const hasNoItems = (items?.length ?? 0) === 0;

  return (
    <div className="rounded-lg border border-zinc-700 overflow-hidden">
      <div className="bg-zinc-800 px-3 py-2 text-sm font-semibold">ประวัติการส่งซ่อม/กู้ข้อมูลล่าสุด</div>

      {/* Mobile cards */}
      <div className="md:hidden p-2 space-y-2">
        {hasNoItems ? (
          <div className="text-center text-zinc-300 py-6">ยังไม่มีประวัติ</div>
        ) : (
          items?.map((d) => (
            <div key={d.id} className="rounded-lg border border-zinc-700 bg-zinc-800 p-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{new Date(d.createdAt).toLocaleString("th-TH")}</span>
                <StatusBadge status={d.status} />
              </div>
              <div className="mt-1 text-sm">
                <span>{d.deviceType ?? '-'}</span>
                <span className="mx-1">•</span>
                <span>{d.brandName ?? '-'}</span>
                {d.modelName ? <span className="ml-1">{d.modelName}</span> : null}
              </div>
              <div className="mt-1 font-mono text-xs">SN: {d.serialNumber ?? '-'}</div>
              {d.problem ? (
                <div className="mt-1 text-xs text-zinc-300 line-clamp-2">{d.problem}</div>
              ) : null}
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="max-h-64 overflow-auto">
          <table className="w-full border-collapse text-sm text-left text-white border border-zinc-600">
            <thead className="bg-zinc-900 sticky top-0">
              <tr>
                <th className="border border-zinc-700 px-3 py-2 text-center">วันที่รับ</th>
                <th className="border border-zinc-700 px-3 py-2 text-center">ประเภท</th>
                <th className="border border-zinc-700 px-3 py-2 text-center">ยี่ห้อ</th>
                <th className="border border-zinc-700 px-3 py-2 text-center">รุ่น</th>
                <th className="border border-zinc-700 px-3 py-2 text-center">SN</th>
                <th className="border border-zinc-700 px-3 py-2 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="bg-zinc-800">
              {hasNoItems && (
                <tr>
                  <td colSpan={6} className="border border-zinc-700 px-3 py-6 text-center text-zinc-300">ยังไม่มีประวัติ</td>
                </tr>
              )}
              {items?.map((d) => (
                <tr key={d.id}>
                  <td className="border border-zinc-700 px-3 py-2 whitespace-nowrap">{new Date(d.createdAt).toLocaleString("th-TH")}</td>
                  <td className="border border-zinc-700 px-3 py-2">{d.deviceType ?? '-'}</td>
                  <td className="border border-zinc-700 px-3 py-2">{d.brandName ?? '-'}</td>
                  <td className="border border-zinc-700 px-3 py-2">{d.modelName ?? '-'}</td>
                  <td className="border border-zinc-700 px-3 py-2 font-mono">{d.serialNumber ?? '-'}</td>
                  <td className="border border-zinc-700 px-3 py-2"><StatusBadge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
