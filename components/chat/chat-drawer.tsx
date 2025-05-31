"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/user/ui/button"
import ChatPage from "@/app/user/chat/page"
import useUserStore from "@/app/auth/userStore"

interface ChatDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChatDrawer({ isOpen, onClose }: ChatDrawerProps) {
  const [mounted, setMounted] = useState(false)

  // 안읽은 메시지 갱신 함수
  // const refetchUnread = async () => {
  //   if (!user?.id) return

  //   try {
  //     const res = await fetch(`/api/chat/unreadCount?userId=${user.id}`)
  //     const count = await res.json()

  //     // TODO: Zustand 등에서 unreadCount 저장 로직 추가 필요
  //     console.log("안읽은 메시지 갱신:", count)
  //   } catch (err) {
  //     console.error("안읽은 메시지 갱신 실패", err)
  //   }
  // }
  
  // 마운트 상태 관리
  useEffect(() => {
    setMounted(true)

    // 드로어가 열렸을 때 스크롤 방지
    if (isOpen) {
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  if (!mounted) return null

  return (
    <>
      {/* 오버레이 */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}

      {/* 채팅 드로어 */}
      <div
        className={`fixed top-0 right-0 h-full bg-black border-l border-gray-800 z-50 transition-all duration-300 ease-in-out ${
          isOpen ? "w-full lg:w-3/4 translate-x-0" : "w-0 translate-x-full"
        }`}
      >
        {isOpen && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="font-bold text-white">메시지</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              {/* <ChatPage isInDrawer={true} onClose={refetchUnread} /> */}
              <ChatPage isInDrawer={true} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
