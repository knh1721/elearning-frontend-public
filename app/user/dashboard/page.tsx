"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/user/ui/card"
import { Badge } from "@/components/user/ui/badge"
import { Progress } from "@/components/user/ui/progress"
import { Button } from "@/components/user/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/user/ui/tabs"
import { Calendar } from "@/components/user/ui/calendar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/user/ui/avatar"
import { Skeleton } from "@/components/user/ui/skeleton"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts"
import {
  Play,
  Clock,
  BarChart3,
  CalendarIcon,
  BookOpen,
  ChevronRight,
  Trophy,
  FileText,
  User,
  BookMarked,
  Target,
} from "lucide-react"
import userStore from "@/app/auth/userStore"
import NetflixHeader from "@/components/netflix-header"

interface Course {
  id: number
  title: string
  instructor: string
  progress: number | null
  lastAccessed: string | null
  imageUrl: string
  slug: string
  totalLectures: number
  completedLectures: number
  nextLecture?: string
  estimatedTimeLeft?: string
  category: string
  lastStudyDate: string
  completed?: boolean | null
  completedDate?: string | null
  certificateAvailable?: boolean | null
  courseStatus?: string
  courseProgress?: string
  rating?: number
  students?: number
  level?: string
  relatedTo?: string
}

interface LearningStats {
  weeklyStudyTime: number
  monthlyStudyTime: number
  completionRate: number
  totalCertificates: number
}

interface LearningGoals {
  weekly: {
    target: number
    current: number
    progress: number
  }
  courses: {
    target: number
    current: number
    progress: number
  }
}

interface DashboardData {
  lastLearningCourse: Course | null
  enrolledCourses: Course[]
  completedCourses: Course[]
  recommendedCourses: Course[]
  learningStats: LearningStats
  learningGoals: LearningGoals
  attendanceData: {
    month: number
    days: number[]
  }[]
  studyTimeByMonth: {
    month: string
    hours: number
  }[]
  todoCount: number
  noteCount: number
  upcomingEvents: {
    id: number
    title: string
    date: string
    type: string
  }[]
  studyDates: string[]
  codingTestStats?: {
    completionRate: number
    solvedProblems: number
    totalProblems: number
    languageStats: {
      language: string
      count: number
      percentage: number
    }[]
  }
}

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444"]

export default function DashboardPage() {
  const { user } = userStore()
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    lastLearningCourse: null,
    enrolledCourses: [],
    completedCourses: [],
    recommendedCourses: [],
    learningStats: {
      weeklyStudyTime: 0,
      monthlyStudyTime: 0,
      completionRate: 0,
      totalCertificates: 0,
    },
    learningGoals: {
      weekly: { target: 0, current: 0, progress: 0 },
      courses: { target: 0, current: 0, progress: 0 },
    },
    attendanceData: [],
    studyTimeByMonth: [],
    todoCount: 0,
    noteCount: 0,
    upcomingEvents: [],
    studyDates: [],
  })
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        console.log("Fetching dashboard data for user:", user.id)
        const response = await fetch(`/api/user/dashboard?userId=${user.id}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.status}`)
        }

        const result = await response.json()
        console.log("Dashboard data received:", result)

        // Data validation
        if (!result || typeof result !== "object") {
          throw new Error("Invalid data format")
        }

        // Set default values for missing fields
        const validatedData = {
          lastLearningCourse: result.lastLearningCourse || null,
          enrolledCourses: Array.isArray(result.enrolledCourses) ? result.enrolledCourses : [],
          completedCourses: Array.isArray(result.completedCourses) ? result.completedCourses : [],
          recommendedCourses: Array.isArray(result.recommendedCourses) ? result.recommendedCourses : [],
          learningStats: {
            weeklyStudyTime: Number(result.learningStats?.weeklyStudyTime) || 0,
            monthlyStudyTime: Number(result.learningStats?.monthlyStudyTime) || 0,
            completionRate: Number(result.learningStats?.completionRate) || 0,
            totalCertificates: Number(result.learningStats?.totalCertificates) || 0,
          },
          learningGoals: {
            weekly: {
              target: Number(result.learningGoals?.weekly?.target) || 0,
              current: Number(result.learningGoals?.weekly?.current) || 0,
              progress: Number(result.learningGoals?.weekly?.progress) || 0,
            },
            courses: {
              target: Number(result.learningGoals?.courses?.target) || 0,
              current: Number(result.learningGoals?.courses?.current) || 0,
              progress: Number(result.learningGoals?.courses?.progress) || 0,
            },
          },
          attendanceData: Array.isArray(result.attendanceData) ? result.attendanceData : [],
          studyTimeByMonth: Array.isArray(result.studyTimeByMonth) ? result.studyTimeByMonth : [],
          todoCount: Number(result.todoCount) || 0,
          noteCount: Number(result.noteCount) || 0,
          upcomingEvents: Array.isArray(result.upcomingEvents) ? result.upcomingEvents : [],
          studyDates: Array.isArray(result.studyDates) ? result.studyDates : [],
          codingTestStats: result.codingTestStats || undefined,
        }

        setDashboardData(validatedData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user?.id])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <NetflixHeader />
        <div className="flex-1 pt-16">
          <div className="container mx-auto p-6">
            <Skeleton className="h-32 w-full mb-6 rounded-xl" />
            <Skeleton className="h-12 w-full mb-6 rounded-lg" />
            <Skeleton className="h-[500px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  const formatDate = () => {
    const today = new Date()
    return today.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
  }

  return (
    <div className="flex min-h-screen bg-background">
      <NetflixHeader />

      {/* Main content */}
      <div className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-6">
          {/* Welcome and stats section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mb-8 text-white shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-1">안녕하세요, {user?.nickname || "사용자"}님!</h1>
                <p className="text-indigo-100">오늘도 학습을 계속해보세요.</p>
                <p className="text-indigo-200 text-sm mt-1">{formatDate()}</p>
              </div>
              {dashboardData.lastLearningCourse && (
                <Button size="sm" className="mt-4 md:mt-0 bg-white text-indigo-700 hover:bg-indigo-100" asChild>
                  <Link href={`/course/${dashboardData.lastLearningCourse.id}/learn`}>
                    <Play className="h-3.5 w-3.5 mr-1.5" /> 이어서 학습하기
                  </Link>
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-indigo-200" />
                  <span className="text-sm font-medium text-indigo-100">주간 학습</span>
                </div>
                <p className="text-2xl font-bold">{dashboardData.learningStats.weeklyStudyTime}시간</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarIcon className="h-4 w-4 text-indigo-200" />
                  <span className="text-sm font-medium text-indigo-100">월간 학습</span>
                </div>
                <p className="text-2xl font-bold">{dashboardData.learningStats.monthlyStudyTime}시간</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="h-4 w-4 text-indigo-200" />
                  <span className="text-sm font-medium text-indigo-100">완료율</span>
                </div>
                <p className="text-2xl font-bold">{Math.round(dashboardData.learningStats.completionRate)}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-indigo-200" />
                  <span className="text-sm font-medium text-indigo-100">수료 강의</span>
                </div>
                <p className="text-2xl font-bold">{dashboardData.learningStats.totalCertificates}개</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-indigo-200" />
                  <span className="text-sm font-medium text-indigo-100">코딩테스트</span>
                </div>
                <p className="text-2xl font-bold">{dashboardData.codingTestStats?.completionRate || 0}%</p>
              </div>
            </div>
          </div>

          {/* Main tabs */}
          <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="overview">개요</TabsTrigger>
              <TabsTrigger value="courses">내 강의</TabsTrigger>
              <TabsTrigger value="progress">학습 진행</TabsTrigger>
              <TabsTrigger value="coding">코딩 테스트</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left column - 2/3 width */}
                <div className="md:col-span-2 space-y-6">
                  {/* Continue learning section */}
                  {dashboardData.lastLearningCourse ? (
                    <Card className="overflow-hidden border-0 shadow-md">
                      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 pb-2">
                        <CardTitle className="flex items-center text-lg">
                          <Play className="h-5 w-5 mr-2 text-indigo-600" />
                          계속 학습하기
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden shadow-md">
                            <Image
                              src={
                                dashboardData.lastLearningCourse.imageUrl ||
                                "/placeholder.svg?height=128&width=192&query=course thumbnail" ||
                                "/placeholder.svg" ||
                                "/placeholder.svg" ||
                                "/placeholder.svg"
                              }
                              alt={dashboardData.lastLearningCourse.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <Badge className="absolute top-2 right-2 bg-indigo-600">
                              {dashboardData.lastLearningCourse.category}
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{dashboardData.lastLearningCourse.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              강사: {dashboardData.lastLearningCourse.instructor}
                            </p>

                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-1.5">
                                <span className="font-medium">진행률</span>
                                <span className="font-medium">{dashboardData.lastLearningCourse.progress}%</span>
                              </div>
                              <Progress value={dashboardData.lastLearningCourse.progress || 0} className="h-2.5" />
                            </div>

                            <div className="flex flex-wrap gap-4 items-center">
                              <div className="flex items-center text-sm">
                                <BookOpen className="h-4 w-4 mr-1.5 text-indigo-500" />
                                <span>
                                  {dashboardData.lastLearningCourse.completedLectures}/
                                  {dashboardData.lastLearningCourse.totalLectures} 강의 완료
                                </span>
                              </div>

                              <Button className="ml-auto" asChild>
                                <Link href={`/course/${dashboardData.lastLearningCourse.id}/learn`}>
                                  <Play className="h-4 w-4 mr-1.5" /> 이어서 학습하기
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="overflow-hidden border-0 shadow-md">
                      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 pb-2">
                        <CardTitle className="flex items-center text-lg">
                          <Play className="h-5 w-5 mr-2 text-indigo-600" />
                          학습 시작하기
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="rounded-full bg-indigo-100 p-6 mb-4">
                            <BookOpen className="h-8 w-8 text-indigo-600" />
                          </div>
                          <h3 className="text-xl font-semibold mb-2">아직 학습을 시작하지 않으셨네요!</h3>
                          <p className="text-muted-foreground mb-6">
                            다양한 강의를 둘러보고 학습을 시작해보세요.
                          </p>
                          <Button asChild>
                            <Link href="/user/course">
                              강의 둘러보기
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Learning progress chart */}
                  <Card className="border-0 shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <BarChart3 className="h-5 w-5 mr-2 text-indigo-500" />
                        학습 진행 현황
                      </CardTitle>
                      <CardDescription>월별 학습 시간 통계</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dashboardData.studyTimeByMonth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "var(--background)",
                                border: "1px solid var(--border)",
                                borderRadius: "8px",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                              }}
                              formatter={(value) => [`${value} 시간`, "학습 시간"]}
                              labelFormatter={(label) => `${label}월`}
                            />
                            <Bar dataKey="hours" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right column - 1/3 width */}
                <div className="space-y-6">
                  {/* User profile card */}
                  <Card className="border-0 shadow-md overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 pb-2">
                      <CardTitle className="flex items-center text-lg">
                        <User className="h-5 w-5 mr-2 text-indigo-500" />내 프로필
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center">
                        <Avatar className="h-24 w-24 mb-4 border-4 border-white shadow-lg">
                          <AvatarImage src="/abstract-user-icon.png" alt={user?.nickname || "사용자"} />
                          <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xl font-bold">
                            {user?.nickname?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-bold mb-1">{user?.nickname || "사용자"}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          @{user?.email?.split("@")[0] || "username"}
                        </p>

                        <div className="grid grid-cols-3 gap-4 w-full mt-2 text-center">
                          <div className="bg-indigo-50 dark:bg-indigo-950/50 rounded-lg p-3">
                            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                              {dashboardData.enrolledCourses.length}
                            </p>
                            <p className="text-xs text-muted-foreground">수강과목</p>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-950/50 rounded-lg p-3">
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {dashboardData.learningStats.monthlyStudyTime}
                            </p>
                            <p className="text-xs text-muted-foreground">수강일수</p>
                          </div>
                          <div className="bg-amber-50 dark:bg-amber-950/50 rounded-lg p-3">
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">-</p>
                            <p className="text-xs text-muted-foreground">강의평점</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Coding test statistics */}
                  <Card className="border-0 shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center text-lg">
                        <FileText className="h-5 w-5 mr-2 text-indigo-500" />
                        코딩 테스트 진행률
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center">
                        <div className="relative w-40 h-40 mb-4">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-3xl font-bold text-indigo-600">
                              {dashboardData.codingTestStats?.completionRate || 0}%
                            </div>
                          </div>
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#E2E8F0" strokeWidth="10" />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="#4F46E5"
                              strokeWidth="10"
                              strokeDasharray={`${(2 * Math.PI * 45 * (dashboardData.codingTestStats?.completionRate || 0)) / 100} ${2 * Math.PI * 45}`}
                              strokeDashoffset="0"
                              strokeLinecap="round"
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                        </div>
                        <p className="text-sm text-center">
                          <span className="font-medium">{dashboardData.codingTestStats?.solvedProblems || 0}</span> /{" "}
                          {dashboardData.codingTestStats?.totalProblems || 0} 문제 해결
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Learning goals */}
                  <Card className="border-0 shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center text-lg">
                        <Target className="h-5 w-5 mr-2 text-amber-500" />
                        학습 목표
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">주간 학습 목표</span>
                            <span className="text-sm font-medium">
                              {dashboardData.learningGoals.weekly.current}/{dashboardData.learningGoals.weekly.target}
                              시간
                            </span>
                          </div>
                          <Progress
                            value={dashboardData.learningGoals.weekly.progress}
                            className="h-2.5 bg-amber-200"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            목표 달성까지{" "}
                            {dashboardData.learningGoals.weekly.target - dashboardData.learningGoals.weekly.current}시간
                            남았습니다
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-6">
              <Card className="overflow-hidden border-0 shadow-md">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
                  <CardTitle className="flex items-center text-lg">
                    <BookMarked className="h-5 w-5 mr-2 text-indigo-500" />내 강의
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs defaultValue="enrolled" className="w-full">
                    <div className="px-6 pt-4">
                      <TabsList className="grid w-full grid-cols-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 p-1">
                        <TabsTrigger
                          value="enrolled"
                          className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-900"
                        >
                          수강중인 강의
                        </TabsTrigger>
                        <TabsTrigger
                          value="completed"
                          className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-900"
                        >
                          완료한 강의
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="enrolled" className="p-6 pt-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {dashboardData.enrolledCourses.length > 0 ? (
                          dashboardData.enrolledCourses.map((course) => (
                            <div
                              key={course.id}
                              className="flex flex-col border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800"
                            >
                              <div className="relative aspect-[4/3]">
                                <Image
                                  src={
                                    course.imageUrl || "/placeholder.svg?height=180&width=320&query=course thumbnail"
                                  }
                                  alt={course.title}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                <Badge className="absolute top-2 right-2 bg-indigo-600 text-xs">
                                  {course.category}
                                </Badge>
                              </div>
                              <div className="p-3">
                                <h3 className="font-medium line-clamp-1 text-sm mb-1">{course.title}</h3>
                                <p className="text-xs text-muted-foreground mb-2">{course.instructor}</p>

                                <div className="mt-1 mb-2">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>진행률</span>
                                    <span>{course.progress}%</span>
                                  </div>
                                  <Progress value={course.progress || 0} className="h-1.5" />
                                </div>

                                <div className="flex justify-between items-center mt-auto">
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <BookOpen className="h-3 w-3 mr-1 text-indigo-500" />
                                    <span>
                                      {course.completedLectures}/{course.totalLectures}
                                    </span>
                                  </div>
                                  <Button size="sm" className="h-7 text-xs px-2" asChild>
                                    <Link href={`/course/${course.id}/learn`}>계속</Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full py-8 text-center text-muted-foreground">
                            수강 중인 강의가 없습니다.
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="completed" className="p-6 pt-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {dashboardData.completedCourses.length > 0 ? (
                          dashboardData.completedCourses.map((course) => (
                            <div
                              key={course.id}
                              className="flex flex-col border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800"
                            >
                              <div className="relative aspect-[4/3]">
                                <Image
                                  src={
                                    course.imageUrl || "/placeholder.svg?height=180&width=320&query=course thumbnail"
                                  }
                                  alt={course.title}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                <Badge className="absolute top-2 right-2 bg-indigo-600 text-xs">
                                  {course.category}
                                </Badge>
                                <Badge className="absolute top-2 left-2 bg-green-500 text-xs">완료됨</Badge>
                              </div>
                              <div className="p-3">
                                <h3 className="font-medium line-clamp-1 text-sm mb-1">{course.title}</h3>
                                <p className="text-xs text-muted-foreground mb-2">{course.instructor}</p>

                                <div className="mt-1 mb-2">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>진행률</span>
                                    <span>100%</span>
                                  </div>
                                  <Progress value={100} className="h-1.5" />
                                </div>

                                <div className="flex justify-between items-center mt-auto">
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <Trophy className="h-3 w-3 mr-1 text-amber-500" />
                                    <span>수료</span>
                                  </div>
                                  <Button size="sm" variant="outline" className="h-7 text-xs px-2" asChild>
                                    <Link href={`/course/${course.id}`}>리뷰</Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full py-8 text-center text-muted-foreground">
                            완료한 강의가 없습니다.
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Recommended courses */}
              <Card className="border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-lg">
                      <BookOpen className="h-5 w-5 mr-2 text-emerald-500" />
                      추천 강의
                    </CardTitle>
                    <CardDescription>관심 있을 만한 강의를 확인해보세요</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1" asChild>
                    <Link href="/courses/recommended">
                      더보기 <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {dashboardData.recommendedCourses.slice(0, 8).map((course) => (
                      <div
                        key={course.id}
                        className="flex border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 h-24"
                      >
                        <div className="relative w-24 h-full">
                          <Image
                            src={course.imageUrl || "/placeholder.svg?height=96&width=96&query=course thumbnail"}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 p-2 flex flex-col justify-between">
                          <div>
                            <Badge className="mb-1 text-xs px-1 py-0" variant="outline">
                              {course.category}
                            </Badge>
                            <h3 className="font-medium text-xs line-clamp-1">{course.title}</h3>
                            <p className="text-[10px] text-muted-foreground">{course.instructor}</p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-amber-500 mr-1 text-xs">★</span>
                              <span className="text-[10px]">{course.rating || 0}</span>
                            </div>
                            <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" asChild>
                              <Link href={`/course/${course.id}`}>자세히</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Learning progress chart */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <BarChart3 className="h-5 w-5 mr-2 text-indigo-500" />
                      월별 학습 시간
                    </CardTitle>
                    <CardDescription>월별 학습 시간 통계</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboardData.studyTimeByMonth}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "var(--background)",
                              border: "1px solid var(--border)",
                              borderRadius: "8px",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                            }}
                            formatter={(value) => [`${value} 시간`, "학습 시간"]}
                            labelFormatter={(label) => `${label}월`}
                          />
                          <Bar dataKey="hours" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Study calendar */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <CalendarIcon className="h-5 w-5 mr-2 text-purple-500" />
                      학습 캘린더
                    </CardTitle>
                    <CardDescription>학습 일자 확인</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border w-full"
                        modifiers={{
                          studied: (date) => {
                            return dashboardData.studyDates.includes(date.toISOString().split("T")[0])
                          },
                        }}
                        modifiersStyles={{
                          studied: {
                            backgroundColor: "#4F46E5",
                            color: "white",
                            fontWeight: "bold",
                          },
                        }}
                      />
                      <div className="mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                          <span>학습일: {dashboardData.studyDates.length}일</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Learning goals */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Target className="h-5 w-5 mr-2 text-amber-500" />
                    학습 목표
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">주간 학습 목표</span>
                        <span className="text-sm font-medium">
                          {dashboardData.learningGoals.weekly.current}/{dashboardData.learningGoals.weekly.target}시간
                        </span>
                      </div>
                      <Progress value={dashboardData.learningGoals.weekly.progress} className="h-2.5 bg-amber-200" />
                      <p className="text-xs text-muted-foreground mt-2">
                        목표 달성까지{" "}
                        {dashboardData.learningGoals.weekly.target - dashboardData.learningGoals.weekly.current}시간
                        남았습니다
                      </p>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">강의 완료 목표</span>
                        <span className="text-sm font-medium">
                          {dashboardData.learningGoals.courses.current}/{dashboardData.learningGoals.courses.target}개
                        </span>
                      </div>
                      <Progress value={dashboardData.learningGoals.courses.progress} className="h-2.5 bg-emerald-200" />
                      <p className="text-xs text-muted-foreground mt-2">
                        목표 달성까지{" "}
                        {dashboardData.learningGoals.courses.target - dashboardData.learningGoals.courses.current}개
                        남았습니다
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Coding Test Tab */}
            <TabsContent value="coding" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coding test statistics */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <FileText className="h-5 w-5 mr-2 text-indigo-500" />
                      코딩 테스트 진행률
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <div className="relative w-48 h-48 mb-4">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-4xl font-bold text-indigo-600">
                            {dashboardData.codingTestStats?.completionRate || 0}%
                          </div>
                        </div>
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#E2E8F0" strokeWidth="10" />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#4F46E5"
                            strokeWidth="10"
                            strokeDasharray={`${(2 * Math.PI * 45 * (dashboardData.codingTestStats?.completionRate || 0)) / 100} ${2 * Math.PI * 45}`}
                            strokeDashoffset="0"
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                      </div>
                      <p className="text-lg font-medium text-center mb-2">
                        <span className="font-bold">{dashboardData.codingTestStats?.solvedProblems || 0}</span> /{" "}
                        {dashboardData.codingTestStats?.totalProblems || 0} 문제 해결
                      </p>
                      <Button className="mt-4" asChild>
                        <Link href="/coding-test">코딩 테스트 계속하기</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Language-wise problem solving statistics */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <BookOpen className="h-5 w-5 mr-2 text-indigo-500" />
                      언어별 문제 해결 통계
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardData.codingTestStats?.languageStats}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, language, percentage }) => `${language || name} ${Math.round(percentage)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="percentage"
                          >
                            {dashboardData.codingTestStats?.languageStats?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "var(--background)",
                              border: "1px solid var(--border)",
                              borderRadius: "8px",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                            }}
                            formatter={(value: any) => {
                              const numValue = typeof value === 'number' ? value : Number(value);
                              return [`${Math.round(numValue)}%`, '비율'];
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {dashboardData.codingTestStats?.languageStats?.map((stat, index) => (
                        <div key={index} className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="text-xs">
                            {stat.language}: {stat.count}문제
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
