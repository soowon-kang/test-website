
export function Explainer({ title, summary, formulas, order, refs } : {
  title: string,
  summary: string[],
  formulas: string[],
  order: string[],
  refs: { label: string, url: string }[]
}) {
  return (
    <div className="mt-6 p-4 border rounded bg-white">
      <h3 className="font-semibold mb-2">{title}</h3>
      <ul className="list-disc ml-5 text-sm">
        {summary.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
      <div className="mt-3">
        <div className="text-sm font-medium">공식</div>
        <ul className="list-disc ml-5 text-sm">{formulas.map((f,i)=><li key={i}><code>{f}</code></li>)}</ul>
      </div>
      <div className="mt-3">
        <div className="text-sm font-medium">적용 순서</div>
        <ol className="list-decimal ml-5 text-sm">{order.map((f,i)=><li key={i}>{f}</li>)}</ol>
      </div>
      <div className="mt-3">
        <div className="text-sm font-medium">근거</div>
        <ul className="list-disc ml-5 text-sm">
          {refs.map((r,i)=><li key={i}><a href={r.url} target="_blank" rel="noreferrer">{r.label}</a></li>)}
        </ul>
      </div>
    </div>
  )
}
