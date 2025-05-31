"use client"

import type React from "react"
import {useState} from "react"
import Link from "next/link"
import {usePathname} from "next/navigation"
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Coins,
  FileCheck,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Tag,
  Users,
} from "lucide-react"
import {cn} from "@/lib/utils"
import {Button} from "@/components/user/ui/button"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/user/ui/avatar"
import {ModeToggle} from "@/components/admin/mode-toggle"
import {Toaster} from "@/components/user/ui/toaster"
import "@/app/admin/dashboard/dashboard.css"
import axios from "axios";

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({children}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()


  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    // 사용자에게 로그아웃 확인 메시지를 띄운다.
    const confirmLogout = window.confirm("로그아웃하시겠습니까?");
    if (confirmLogout) {
      try {
        setLoading(true);
        // 로그아웃 API 호출
        const response = await axios.post("/api/admin/logout");
        console.log(response);
        alert("로그아웃 성공");
        // 로그아웃 성공 후 필요한 동작 (예: 리디렉션)
        window.location.href = "/admin/login"; // 예시로 로그인 페이지로 리디렉션
      } catch (error) {
        alert("로그아웃 실패");
      } finally {
        setLoading(false);
      }
    }
  };

  const mainNavItems = [
    {
      title: "대시보드",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5"/>,
    },
    {
      title: "사용자 관리",
      href: "/admin/dashboard/users",
      icon: <Users className="h-5 w-5"/>,
    },
    {
      title: "강의 관리",
      href: "/admin/dashboard/courses",
      icon: <BookOpen className="h-5 w-5"/>,
    },
    {
      title: "강의 심사",
      href: "/admin/dashboard/reviews",
      icon: <FileCheck className="h-5 w-5"/>,
    },
    {
      title: "매출 관리",
      href: "/admin/dashboard/sales",
      icon: <Coins className="h-5 w-5"/>,
    },
    {
      title: "쿠폰 관리",
      href: "/admin/dashboard/coupons",
      icon: <Tag className="h-5 w-5"/>,
    },
    {
      title: "통계 분석",
      href: "/admin/dashboard/analytics",
      icon: <BarChart3 className="h-5 w-5"/>,
    },
    {
      title: "고객 지원",
      href: "/admin/dashboard/support",
      icon: <MessageSquare className="h-5 w-5"/>,
    },
  ]

  const utilityNavItems = [
    {
      title: "설정",
      href: "/admin/dashboard/settings",
      icon: <Settings className="h-5 w-5"/>,
    },
    {
      title: "로그아웃",
      href: "/auth/logout",
      icon: <LogOut className="h-5 w-5"/>,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <aside
          className={cn(
            "fixed inset-y-0 z-10 flex h-full flex-col border-r bg-background transition-all duration-300",
            collapsed ? "w-[80px]" : "w-[280px]",
          )}
        >
          <div className="flex h-16 items-center border-b px-4">
            <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
              {!collapsed && <span className="text-xl font-bold">개발자 e러닝</span>}
              {collapsed && <Home className="h-6 w-6"/>}
            </Link>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <ChevronRight className="h-5 w-5"/> : <ChevronLeft className="h-5 w-5"/>}
            </Button>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium">
              {mainNavItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent",
                    pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    collapsed ? "justify-center" : "",
                  )}
                >
                  {item.icon}
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto border-t p-4">
            <nav className="grid items-start gap-2 text-sm font-medium">
              {utilityNavItems.map((item, index) => (
                item.title === "로그아웃" ? (
                  // 로그아웃 버튼 처리
                  <button
                    key={index}
                    onClick={handleLogout}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent",
                      pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                      collapsed ? "justify-center" : "",
                    )}
                    disabled={loading}
                  >
                    <LogOut className="h-5 w-5"/>
                    {!collapsed && <span>{item.title}</span>}
                  </button>
                ) : (
                  // 다른 항목 처리
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent",
                      pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                      collapsed ? "justify-center" : "",
                    )}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                )
              ))}
            </nav>
          </div>
        </aside>
        <div className={cn("flex flex-1 flex-col transition-all duration-300", collapsed ? "ml-[80px]" : "ml-[280px]")}>
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <div className="flex flex-1 items-center gap-4">
              <h1 className="text-lg font-semibold">관리자 대시보드</h1>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle/>
              <Avatar>
                <AvatarImage src="/abstract-admin-interface.png" alt="관리자"/>
                <AvatarFallback>관리자</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="container py-6">{children}</div>
          </main>
        </div>
      </div>
      <Toaster/>
    </div>
  )
}
