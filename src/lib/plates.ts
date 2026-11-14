/**
 * Where to hang the numbered tags of a plate's arrows. Each tag sits in the nearer side margin at
 * the height of the point it labels; tags on one side are pushed apart until none overlap, and
 * pulled back inside the plate if the column runs off the bottom.
 */
export interface Tag {
  /** Index of the label. */
  i: number
  side: 'l' | 'r'
  /** Height of the tag, as a percentage of the plate's height. */
  y: number
}

export function placeTags(points: { x: number; y: number }[], minGap: number, top = 2, bottom = 98): Tag[] {
  const tags: Tag[] = points.map((p, i) => ({ i, side: p.x < 50 ? 'l' : 'r', y: p.y }))
  for (const side of ['l', 'r'] as const) {
    const col = tags.filter((t) => t.side === side).sort((a, b) => a.y - b.y || a.i - b.i)
    // Push down, then pull up from the bottom, then down again from the top.
    for (let k = 0; k < col.length; k++) col[k].y = Math.max(col[k].y, top, k ? col[k - 1].y + minGap : top)
    for (let k = col.length - 1; k >= 0; k--) col[k].y = Math.min(col[k].y, k < col.length - 1 ? col[k + 1].y - minGap : bottom)
    for (let k = 0; k < col.length; k++) col[k].y = Math.max(col[k].y, k ? col[k - 1].y + minGap : top)
  }
  return tags
}
