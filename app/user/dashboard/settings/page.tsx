"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/user/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/user/ui/card"
import { Button } from "@/components/user/ui/button"
import { Separator } from "@/components/user/ui/separator"
import { Badge } from "@/components/user/ui/badge"
import { Star, ChevronRight, Edit2, Bell, Shield, User, BookOpen, Clock, Award, MessageSquare, Code, Trophy, Heart, Bookmark, History, LogOut } from "lucide-react"
import UserHeader from "@/components/user/user-header"
import useUserStore from "@/app/auth/userStore"
import { useRouter } from "next/navigation"
import NetflixHeader from "@/components/netflix-header"
import PurchasesComponent from "@/components/user/purchases"
import CouponList from "@/components/user/CouponList"
import LearningComponent from "@/components/user/dashboard/learning-component"
import MyProfile from "@/components/user/dashboard/setting/myProfile"
import FollowWishlist from "@/components/user/dashboard/setting/follow-wishlist"
import Community from "@/components/user/dashboard/setting/community"

interface UserStats {
  enrolledCourses: number
  completedCourses: number
  totalReviews: number
  communityPosts: number
  communityComments: number
  codingTestScore: number
  codingTestRank: number
  bookmarkedCourses: number
  learningStreak: number
}

export default function MyPage() {
  const router = useRouter()
  const { user, isHydrated, clearUser, updateUser, setUser } = useUserStore()
  const [isClient, setIsClient] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [userStats, setUserStats] = useState<UserStats>({
    enrolledCourses: 0,
    completedCourses: 0,
    totalReviews: 0,
    communityPosts: 0,
    communityComments: 0,
    codingTestScore: 0,
    codingTestRank: 0,
    bookmarkedCourses: 0,
    learningStreak: 0
  })
  const [activeTab, setActiveTab] = useState("account")
  const [activeMenu, setActiveMenu] = useState("mypage")
  const [fetched, setFetched] = useState(false);
  const [userFetched, setUserFetched] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // fallback: userStore에 user가 없으면 서버에서 다시 가져옴
  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const res = await fetch("/api/user/me", { credentials: "include" })
        const result = await res.json()
        if (result.totalCount === 1 && result.data) {
          setUser(result.data);
          setUserFetched(true);
        }
        setFetched(true);
      } catch (err) {
        console.error("내 정보 조회 실패", err)
      }
    }

    if (isHydrated && (!user || !user.phone) && !userFetched) {
      fetchMyInfo()
    }
  }, [isHydrated, user, setUser])

  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/auth/user/login")
    }
  }, [isHydrated, user, router])

  useEffect(() => {
    // 사용자 통계 데이터 가져오기
    const fetchUserStats = async () => {
      if (!user?.id) return
      try {
        const response = await fetch(`/api/user/dashboard?userId=${user.id}`, {
          credentials: "include"
        })
        if (!response.ok) throw new Error("Failed to fetch user stats")
        const data = await response.json()
        
        setUserStats({
          enrolledCourses: data.enrolledCourses.length,
          completedCourses: data.completedCourses.length,
          totalReviews: data.completedCourses.filter((course: any) => course.hasRating).length,
          communityPosts: 0, // TODO: Implement community posts count
          communityComments: 0, // TODO: Implement community comments count
          codingTestScore: 0, // TODO: Implement coding test score
          codingTestRank: 0, // TODO: Implement coding test rank
          bookmarkedCourses: 0, // TODO: Implement bookmarked courses count
          learningStreak: data.learningStats.studyStreak || 0
        })
      } catch (error) {
        console.error("Error fetching user stats:", error)
      }
    }

    if (isClient && user?.id) {
      fetchUserStats()
    }
  }, [user?.id, isClient])

  // 클라이언트 사이드 렌더링이 완료되기 전에는 로딩 상태 표시
  if (!isClient || !isHydrated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 사용자가 로그인하지 않은 경우 로그인 페이지로 리디렉션
  if (!isClient || !isHydrated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4">로딩 중...</p>
        </div>
      </div>
    )
  }

  const handleUserUpdate = (updatedFields: Partial<{ email: string; phone: string; githubLink: string; bio: string; nickname: string; profileUrl: string }>) => {
    if (user) {
      updateUser({ ...user, ...updatedFields })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NetflixHeader />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 사이드바 */}
          <div className="w-full md:w-64 space-y-4">
            <div className="flex flex-col items-center p-6 bg-gray-900 rounded-lg border border-gray-800">
              <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden bg-gray-800 mb-4">
                <Image
                  src={user?.profileUrl || "/placeholder.svg?height=120&width=120"}
                  alt="프로필 이미지"
                  width={120}
                  height={120}
                  className="object-cover w-full h-full"
                />
              </div>
              <h2 className="text-xl font-bold mb-1">{user?.nickname || "사용자"}</h2>
              <p className="text-sm text-gray-400 mb-4">{user?.githubLink || "githubLink를 작성해주세요."}</p>

              <div className="grid grid-cols-2 w-full gap-2 text-center">
                <div className="p-2 bg-gray-800 rounded-md">
                  <p className="text-xs text-gray-400">수강 중</p>
                  <p className="font-bold">{userStats.enrolledCourses}</p>
                </div>
                <div className="p-2 bg-gray-800 rounded-md">
                  <p className="text-xs text-gray-400">완료</p>
                  <p className="font-bold">{userStats.completedCourses}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800">
              <div className="p-4 font-medium">메뉴</div>
              <Separator className="bg-gray-800" />
              <nav className="p-2">
                <ul className="space-y-1">
                  <li>
                    <Link href="/user/dashboard" className="flex items-center p-2 rounded-md hover:bg-gray-800">
                      <BookOpen className="h-4 w-4 mr-3 text-gray-400" />
                      <span>대시보드</span>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setActiveTab("account")
                        setActiveMenu("mypage")
                      }}
                      className={`flex items-center p-2 rounded-md w-full text-left ${
                        activeMenu === "mypage" ? "bg-gray-800 text-red-500" : "hover:bg-gray-800"
                      }`}
                    >
                      <User className={`h-4 w-4 mr-3 ${activeMenu === "mypage" ? "text-red-500" : "text-gray-400"}`} />
                      <span>마이페이지</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setActiveTab("purchases")
                        setActiveMenu("purchases")
                      }}
                      className={`flex items-center p-2 rounded-md w-full text-left ${
                        activeMenu === "purchases" ? "bg-gray-800 text-red-500" : "hover:bg-gray-800"
                      }`}
                    >
                      <Award className={`h-4 w-4 mr-3 ${activeMenu === "purchases" ? "text-red-500" : "text-gray-400"}`} />
                      <span>구매 내역</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setActiveTab("learning")
                        setActiveMenu("learning")
                      }}
                      className={`flex items-center p-2 rounded-md w-full text-left ${
                        activeMenu === "learning" ? "bg-gray-800 text-red-500" : "hover:bg-gray-800"
                      }`}
                    >
                      <BookOpen className={`h-4 w-4 mr-3 ${activeMenu === "learning" ? "text-red-500" : "text-gray-400"}`} />
                      <span>내 학습</span>
                    </button>
                  </li>
                  <li>
                  <button
                      onClick={() => {
                        setActiveTab("community")
                        setActiveMenu("community")
                      }}
                      className={`flex items-center p-2 rounded-md w-full text-left ${
                        activeMenu === "community" ? "bg-gray-800 text-red-500" : "hover:bg-gray-800"
                      }`}
                    >
                      <MessageSquare
                        className={`h-4 w-4 mr-3 ${activeMenu === "community" ? "text-red-500" : "text-gray-400"}`}
                      />
                      <span>내 커뮤니티</span>
                    </button>
                  </li>
                  <li>
                  <button
                      onClick={() => {
                        setActiveTab("likes")
                        setActiveMenu("likes")
                      }}
                      className={`flex items-center p-2 rounded-md w-full text-left ${
                        activeMenu === "likes" ? "bg-gray-800 text-red-500" : "hover:bg-gray-800"
                      }`}
                    >
                      <Heart className={`h-4 w-4 mr-3 ${activeMenu === "likes" ? "text-red-500" : "text-gray-400"}`} />
                      <span>팔로우/위시리스트</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setActiveTab("coupons")
                        setActiveMenu("coupons")
                      }}
                      className={`flex items-center p-2 rounded-md w-full text-left ${
                        activeMenu === "coupons" ? "bg-gray-800 text-red-500" : "hover:bg-gray-800"
                      }`}
                    >
                      <Award className={`h-4 w-4 mr-3 ${activeMenu === "coupons" ? "text-red-500" : "text-gray-400"}`} />
                      <span>쿠폰</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="account" className="pt-6 space-y-6">
                <MyProfile onUserUpdate={handleUserUpdate} />
              </TabsContent>
              <TabsContent value="purchases">
                <PurchasesComponent />
              </TabsContent>
              <TabsContent value="learning">
                <LearningComponent />
              </TabsContent>
              <TabsContent value="likes">
                <FollowWishlist/>
              </TabsContent>
              <TabsContent value="coupons">
                <CouponList />
              </TabsContent>
              <TabsContent value="community">
                <Community/>
              </TabsContent>
              
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

