"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Bell, ChevronDown } from "lucide-react"
import { Button } from "@/components/user/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/user/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import useUserStore from "@/app/auth/userStore"

export default function InstructorHeader() {
  const restoreFromStorage = useUserStore((state) => state.restoreFromStorage)

  const [isScrolled, setIsScrolled] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const { user, clearUser } = useUserStore()
  const router = useRouter()

  //localStorage에 저장된 유저 정보를 Zustand 상태로 복원
  useEffect(() => {
    restoreFromStorage()
  }, [restoreFromStorage])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // 알림 더미 데이터
  const notifications = [
    { id: 1, date: "2023/10/27", content: "수강생이 새로운 후기를 남겼습니다." },
    { id: 2, date: "2023/10/26", content: "정산 내역이 업데이트되었습니다." },
  ]

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-colors duration-300 ${isScrolled ? "bg-black" : "bg-gradient-to-b from-black/80 to-transparent"}`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/user" className="text-primary font-bold text-2xl">
              <Image
                src="/logo/CodeFlix.png?height=40&width=120"
                alt="로고"
                width={120}
                height={40}
                className="h-8"
              />
            </Link>

            <nav className="hidden md:flex space-x-6">
              <Link href="/instructor" className="font-bold text-red-500">대시보드</Link>
              <Link href="/instructor/courses" className="text-white hover:text-gray-300">내 강의</Link>
              <Link href="/instructor/analytics" className="text-white hover:text-gray-300">통계</Link>
              <Link href="/instructor/earnings" className="text-white hover:text-gray-300">수익</Link>
              <Link href="/instructor/community" className="text-white hover:text-gray-300">커뮤니티</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-white">
              <Search className="h-5 w-5" />
            </Button>

            <div className="relative" ref={notificationRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-white relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notifications.length}
                </span>
              </Button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-black border border-gray-800 rounded-md shadow-lg z-50">
                  <div className="p-4 border-b border-gray-800">
                    <h3 className="font-medium text-white">알림</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-4 border-b border-gray-800 hover:bg-gray-900 text-white">
                        <p className="text-sm">{notification.content}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.date}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 flex justify-center border-t border-gray-800">
                    <button className="text-gray-400 hover:text-white text-sm w-full py-2">모든 알림 보기</button>
                  </div>
                </div>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-white">
                  {user?.profileUrl ? (
                    <Image
                      src={user.profileUrl}
                      alt={user.nickname}
                      width={32}
                      height={32}
                      className="rounded-md"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-red-600 flex items-center justify-center">
                      <span className="font-bold">I</span>
                    </div>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/90 border-gray-700 text-white">
                <DropdownMenuLabel>{user?.nickname} 님</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="hover:bg-gray-800">
                  <Link href="/user/dashboard/settings" className="w-full">마이페이지</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="hover:bg-gray-800"
                  onClick={async () => {
                    await fetch("/api/user/logout", { method: "POST", credentials: "include" })
                    clearUser()
                    router.push("/auth/user/login")
                  }}
                >
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
