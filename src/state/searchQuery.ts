import { create } from 'zustand'

/** The search query outlives the screen, so Back from a result returns to the same results. */
export const useSearchQuery = create<{ q: string; set(q: string): void }>()((set) => ({ q: '', set: (q) => set({ q }) }))
