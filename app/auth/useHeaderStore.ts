import { create } from 'zustand'

interface HeaderState {
  unreadCount: number
  setUnreadCount: (count: number) => void
  increaseUnreadCount: () => void
  resetUnreadCount: () => void // 추가
}

const useHeaderStore = create<HeaderState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  increaseUnreadCount: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),
  resetUnreadCount: () => set({ unreadCount: 0 }), // 추가
}))

export default useHeaderStore
