"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ChatSettingsState {
  fontSize: number
  fontFamily: string
  setFontSize: (size: number) => void
  setFontFamily: (family: string) => void
}

export const useChatSettings = create<ChatSettingsState>()(
  persist(
    (set) => ({
      fontSize: 16,
      fontFamily: "sans",
      setFontSize: (size) => set({ fontSize: size }),
      setFontFamily: (family) => set({ fontFamily: family }),
    }),
    {
      name: "chat-settings",
    },
  ),
)
