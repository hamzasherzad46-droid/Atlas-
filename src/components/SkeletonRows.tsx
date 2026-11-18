/** While a list loads: faint rows in the shape of what is coming, instead of the word "Loading". */
export function SkeletonRows({ rows = 4, label }: { rows?: number; label: string }) {
  return (
    <div className="skeleton-rows" role="status" aria-label={label}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton-row" aria-hidden>
          <span style={{ width: `${[72, 58, 66, 50, 62][i % 5]}%` }} />
          <span />
        </div>
      ))}
    </div>
  )
}
