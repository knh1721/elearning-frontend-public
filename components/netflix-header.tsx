"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Bell, ChevronDown, ShoppingCart,MessageSquare } from "lucide-react"
import { Button } from "@/components/user/ui/button"
import { Input } from "@/components/user/ui/input"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/user/ui/dropdown-menu"
import { useRouter, usePathname } from "next/navigation"
import useUserStore from "@/app/auth/userStore"
import axios from "axios"
import ChatDrawer from "./chat/chat-drawer"
import useHeaderStore from "@/app/auth/useHeaderStore"

export default function NetflixHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const [messageCount, setMessageCount] = useState(2) // Example count, replace with actual data
  const [cartCount, setCartCount] = useState(0)
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const messageRef = useRef<HTMLDivElement>(null)
  const { user, clearUser, restoreFromStorage } = useUserStore()
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState("")

  const unreadCount = useHeaderStore((state) => state.unreadCount)

  // 알림 데이터
  const notifications = [
    { id: 1, date: "2023/10/27", content: "새로운 강의가 추가되었습니다: Docker 입문" },
    { id: 2, date: "2023/10/25", content: "질문에 답변이 달렸습니다" },
    { id: 3, date: "2023/10/20", content: "강의 할인 쿠폰이 ��급되었습니다" },
  ]

  // 메시지 데이터
  const messages = [
    { id: 1, date: "2023/10/28", sender: "김강사", content: "질문에 답변드렸습니다. 확인해보세요!" },
    { id: 2, date: "2023/10/26", sender: "이멘토", content: "프로젝트 피드백 보내드렸습니다." },
  ]

  // 현재 활성화된 경로를 확인하는 함수
  const isActive = (path: string) => {
    return pathname.startsWith(path)
  }

  // 알림창 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (messageRef.current && !messageRef.current.contains(event.target as Node)) {
        setShowMessages(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // 채팅 드로어 상태에 따라 body 클래스 추가/제거
  useEffect(() => {
    if (isChatDrawerOpen) {
      document.body.classList.add("chat-drawer-open")
    } else {
      document.body.classList.remove("chat-drawer-open")
    }
  }, [isChatDrawerOpen])

  // 장바구니

  useEffect(() => {
    if (!user) return
  
    axios.get("/api/cart", { withCredentials: true })
      .then((res) => {
        if (res.data.totalCount === 1 && res.data.data?.items) {
          setCartCount(res.data.data.items.length)
        } else {
          setCartCount(0)
        }
      })
      .catch((err) => {
        console.error("장바구니 수량 가져오기 실패:", err)
        setCartCount(0)
      })
  }, [user])

  useEffect(() => {
    if (!user) return;
  
    fetch(`/api/chat/unreadCount?userId=${user.id}`)
      .then(res => res.json())
      .then(count => {
        useHeaderStore.getState().setUnreadCount(count);
      })
      .catch(err => {
        console.error("안읽은 메시지 개수 조회 실패", err);
      });
  }, [user]);
  
  
  // 프로필 고정 랜덤 색
  const colors = [
    "#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FF8C33", "#33FFF6",
    "#FF33F6", "#F6FF33", "#33FF8C", "#8C33FF", "#FF3333", "#33FF33",
    "#3333FF", "#F6A833", "#33A8FF", "#A833FF", "#FF33A8", "#A8FF33",
    "#33FFA8", "#A833A8", "#FF33A3", "#A3FF33", "#33A3FF", "#A3A833",
    "#A8A833", "#33A8A8", "#A8A8FF", "#FF33A0", "#FF0F33", "#0FFF33",
    "#FF0F0F", "#0F33FF", "#0F33A8", "#A8330F", "#FF0FA8", "#A80FFF",
    "#0FA8FF", "#A80F33", "#0FA833", "#A80F0F", "#0F0FFF", "#FF0F33",
    "#0F33A8", "#A80F33", "#FF0FA8", "#A80FFF", "#0FA8FF", "#A80F33",
    "#0FA833", "#A80F0F", "#0F0FFF", "#FF0F33", "#0F33A8", "#A80F33",
    "#FF0FA8", "#A80FFF", "#0FA8FF", "#A80F33", "#0FA833", "#A80F0F",
    "#0F0FFF", "#FF0F33", "#0F33A8", "#A80F33", "#FF0FA8", "#A80FFF",
    "#0FA8FF", "#A80F33", "#0FA833", "#A80F0F", "#0F0FFF", "#FF0F33",
    "#0F33A8", "#A80F33", "#FF0FA8", "#A80FFF", "#0FA8FF", "#A80F33",
    "#0FA833", "#A80F0F", "#0F0FFF", "#FF0F33", "#0F33A8", "#A80F33",
    "#FF0FA8", "#A80FFF", "#0FA8FF", "#A80F33", "#0FA833", "#A80F0F",
  ]

  const getColorByString = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }


  // 스크롤 감지
  useEffect(() => {
    // 서버 사이드 렌더링 중에는 실행하지 않음
    if (typeof window === "undefined") return

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    // 초기 스크롤 위치 확인
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const query = (e.target as HTMLInputElement).value.trim()
      if (query) {
        router.push(`/user/courses?search=${encodeURIComponent(query)}`)
      }
    }
  }

  const openChatDrawer = () => {
    setIsChatDrawerOpen(true)
    setShowMessages(false) // 메시지 드롭다운 닫기
  }

  // NetflixHeader.tsx 맨 아래 useEffect 추가
  useEffect(() => {
    console.log("헤더에 보이는 unreadCount: ", unreadCount)
  }, [unreadCount])

  useEffect(() => {
    if (!user) return;
  
    fetch(`/api/chat/unreadCount?userId=${user.id}`)
      .then(res => res.json())
      .then(count => {
        console.log("API에서 가져온 unreadCount: ", count)
        useHeaderStore.getState().setUnreadCount(count)
      })
      .catch(err => {
        console.error("안읽은 메시지 개수 조회 실패", err);
      });
  }, [user])
  


  return (
    <>
    <header
      className={`fixed top-0 w-full z-50 transition-colors duration-300 ${isScrolled ? "bg-black" : "bg-gradient-to-b from-black/80 to-transparent"}`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/user" className="text-primary font-bold text-2xl">
              <Image
                // src="/placeholder.svg?height=40&width=120"
                src="/logo/CodeFlix.png?height=40&width=120"
                // src="/logo/CodeFlix_Logo.png?height=40&width=120"
                alt="CODEFLIX 로고"
                width={120}
                height={40}
                className="h-8"
              />
            </Link>

            <nav className="hidden md:flex space-x-6">
              <Link
                href="/user/courses"
                className={`text-white hover:text-gray-300 ${isActive("/user/courses") ? "font-bold text-red-500" : ""}`}
              >
                강의
              </Link>
              <Link
                href="/user/coding-test"
                className={`text-white hover:text-gray-300 ${isActive("/user/coding-test") ? "font-bold text-red-500" : ""}`}
              >
                코딩테스트
              </Link>
              <Link
                href="/user/community"
                className={`text-white hover:text-gray-300 ${isActive("/user/community") ? "font-bold text-red-500" : ""}`}
              >
                커뮤니티
              </Link>
              { user && (
                <Link
                  href="/user/dashboard"
                  className={`text-white hover:text-gray-300 ${isActive("/user/dashboard") ? "font-bold text-red-500" : ""}`}
                >
                  내 학습
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              {showSearch ? (
                <div className="flex items-center bg-black/80 border border-gray-600 rounded-md overflow-hidden">
                  <Input
                    type="text"
                    placeholder="강의 검색"
                    className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearch}
                    onBlur={() => {
                      if (!searchQuery) setShowSearch(false)
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (searchQuery) {
                        router.push(`/user/courses?search=${encodeURIComponent(searchQuery)}`)
                      }
                    }}
                  >
                    <Search className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)} className="text-white">
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* 알림 아이콘 및 드롭다운 */}
            {user && (
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
            )}

              {/* 메시지 아이콘 및 드롭다운 */}
              {user && (
                <div className="relative" ref={messageRef}>
                  <Button
                    onClick={openChatDrawer}
                    variant="ghost"
                    size="icon"
                    className="text-white relative"
                  >
                    <MessageSquare className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </div>
              )}

              {/* 장바구니 아이콘 */}
              {user && (
                <Link href="/user/cart">
                  <Button variant="ghost" size="icon" className="text-white relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </Link>
              )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-white">
                  {user ? (
                    user.profileUrl ? (
                      <Image
                        src={user.profileUrl}
                        alt={user.nickname}
                        width={32}
                        height={32}
                        className="rounded-md"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-md bg-red-600 flex items-center justify-center">
                        <span className="font-bold">N</span>
                      </div>
                    )
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-red-600 flex items-center justify-center">
                      <span className="font-bold">U</span>
                    </div>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/90 border-gray-700 text-white">
              {user ? (
                  <>
                    <DropdownMenuLabel>{user.nickname} 님</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem className="hover:bg-gray-800">
                      <Link href="/user/dashboard/settings" className="w-full">마이페이지</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-gray-800">
                      <Link href="/user/dashboard/purchases" className="w-full">구매 내역</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-gray-800">
                      <Link
                        href={
                          user.isInstructor && user.instructorId
                            ? `/instructor/`
                            : "/instructor/signup"
                        }
                        className="w-full"
                      >
                        {user.isInstructor && user.instructorId ? "대시보드" : "강사 전환"}
                      </Link>
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
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem className="hover:bg-gray-800">
                        <Link href="/auth/user/login" className="w-full">
                          로그인
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-gray-800">
                        <Link href="/auth/user/signup" className="w-full">
                          회원가입
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* 채팅 드로어 */}
      <ChatDrawer isOpen={isChatDrawerOpen} onClose={() => setIsChatDrawerOpen(false)} />
    </>
  )
}
