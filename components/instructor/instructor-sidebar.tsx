"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronRight,
  Home,
  BookOpen,
  Users,
  DollarSign,
  Star,
  PlusCircle,
  MessageSquare,
  HelpCircle,
  ExternalLink,
} from "lucide-react"
import useUserStore from "@/app/auth/userStore"
import { useEffect } from "react"

export default function InstructorSidebar() {
  const { user, restoreFromStorage } = useUserStore()
  const pathname = usePathname()

  useEffect(() => {
    if (!user) {
      restoreFromStorage();
    }
  }, [user, restoreFromStorage]);

  if (!user) {
    return <div className="text-white text-center py-10">로딩 중...</div>;
  }

  return (
    <div className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 fixed top-16 pt-6 pb-20 overflow-y-auto">
      <div className="px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">강의 관리 바로 이동</h3>
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-md">
            <div className="flex items-center">
              <ExternalLink className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm">지식공유자 홈</span>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <nav className="space-y-1">
          <div className="text-sm font-medium text-gray-400 py-2">메뉴</div>

          {[
            { href: "/instructor", label: "대시보드", icon: <Home className="h-4 w-4 mr-3" /> },
            { href: "/instructor/courses/create", label: "새 강의 만들기", icon: <PlusCircle className="h-4 w-4 mr-3" /> },
            { href: "/instructor/courses/manage", label: "강의 관리", icon: <BookOpen className="h-4 w-4 mr-3" /> },
            { href: "/instructor/questions", label: "강의 질문 관리", icon: <MessageSquare className="h-4 w-4 mr-3" /> },
            { href: "/instructor/reviews", label: "수강평 리스트", icon: <Star className="h-4 w-4 mr-3" /> },
            { href: "/instructor/sales", label: "수익 확인", icon: <DollarSign className="h-4 w-4 mr-3" /> },
            { href: "/instructor/inquiries", label: "수강전 문의관리", icon: <Users className="h-4 w-4 mr-3" /> },
            { href: "/instructor/guide", label: "지식공유자 가이드", icon: <HelpCircle className="h-4 w-4 mr-3" /> },
          ].map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center px-3 py-2 text-sm rounded-md ${
                pathname === menu.href
                  ? "bg-red-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              {menu.icon}
              {menu.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
