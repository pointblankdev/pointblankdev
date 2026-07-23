import { create } from 'zustand'

/**
 * Shared interaction state between the DOM and the 3D canvas.
 *
 * DOM components write to this store from event handlers; canvas components
 * read it inside useFrame via useInteraction.getState() so reacting to it
 * never triggers a React re-render.
 */
type InteractionState = {
  /** Title of the service card currently hovered, or null. */
  hoveredCard: string | null
  /** Monotonic counter; increments on every click pulse. */
  pulseCount: number
  /** Camera view index, one per service card; 0 is the default framing. */
  view: number
  setHoveredCard: (card: string | null) => void
  triggerPulse: () => void
  setView: (view: number) => void
}

export const useInteraction = create<InteractionState>((set) => ({
  hoveredCard: null,
  pulseCount: 0,
  view: 0,
  setHoveredCard: (hoveredCard) => set({ hoveredCard }),
  triggerPulse: () => set((s) => ({ pulseCount: s.pulseCount + 1 })),
  setView: (view) => set({ view }),
}))
