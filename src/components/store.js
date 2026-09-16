import { create } from 'zustand'

export const usePlayerStore = create((set) => ({
  position: { x: 0, y: 2, z: 0 },
  setPosition: (position) => set({ position }),
  health: 100,
  damagePlayer: (amount) =>
    set((s) => ({ health: Math.max(0, s.health - amount) })),
}))
