
export function ResultTable({ rows, total } : { rows: { key: string, label: string, amount: number }[], total: number }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full text-sm border bg-white">
        <thead className="bg-zinc-100">
          <tr>
            <th className="text-left p-2 border">항목</th>
            <th className="text-right p-2 border">금액 (원)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.key}>
              <td className="p-2 border">{r.label}</td>
              <td className="p-2 border text-right">{r.amount.toLocaleString()}</td>
            </tr>
          ))}
          <tr>
            <td className="p-2 border font-semibold">합계</td>
            <td className="p-2 border text-right font-semibold">{total.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
