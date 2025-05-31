"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/user/ui/tabs"
import { Card } from "@/components/user/ui/card"
import { Button } from "@/components/user/ui/button"
import { Progress } from "@/components/user/ui/progress"
import { Separator } from "@/components/user/ui/separator"
import { BookOpen, Clock, Award, User, PlayCircle, CheckCircle, Calendar } from "lucide-react"
import UserHeader from "@/components/user/user-header"
import userStore from "@/app/auth/userStore"

interface Course {
  id: number
  title: string
  instructor: string
  progress: number
  lastAccessed: string
  imageUrl: string
  slug: string
  totalLectures: number
  completedLectures: number
  nextLecture: string
  estimatedTimeLeft: string
  lastStudyDate: string
  completed: boolean
  completedDate: string | null
  certificateAvailable: boolean
  courseStatus: string
  courseProgress: number
}

interface DashboardData {
  lastLearningCourse: Course | null
  enrolledCourses: Course[]
  completedCourses: Course[]
  recommendedCourses: Course[]
  learningStats: {
    weeklyStudyTime: number
    monthlyStudyTime: number
    completionRate: number
    totalCertificates: number
  }
  learningGoals: {
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
}

export default function MyLearningPage() {
  const [activeTab, setActiveTab] = useState("in-progress")
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = userStore()

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/user/dashboard?userId=${user.id}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.status}`)
        }
        
        const data = await response.json()
        setDashboardData(data)
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
        <UserHeader />
        <div className="flex-1 pt-16">
          <div className="container mx-auto p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              <div className="h-64 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex min-h-screen bg-background">
        <UserHeader />
        <div className="flex-1 pt-16">
          <div className="container mx-auto p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">데이터를 불러올 수 없습니다</h1>
              <p className="text-gray-400">학습 데이터를 가져오는 중 문제가 발생했습니다.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <UserHeader />
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">내 학습</h1>
              <p className="text-gray-400">진행 중인 강의와 완료한 강의를 확인하세요.</p>
            </div>

            <Tabs defaultValue="in-progress" className="space-y-6">
              <TabsList className="bg-gray-900 border-b border-gray-800 w-full justify-start rounded-none h-auto p-0">
                <TabsTrigger
                  value="in-progress"
                  className="px-6 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-red-500 data-[state=active]:bg-transparent data-[state=active]:text-red-500"
                >
                  진행 중인 강의
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="px-6 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-red-500 data-[state=active]:bg-transparent data-[state=active]:text-red-500"
                >
                  완료한 강의
                </TabsTrigger>
              </TabsList>

              <TabsContent value="in-progress" className="mt-6">
                {dashboardData.enrolledCourses.length > 0 ? (
                  <div className="space-y-6">
                    {dashboardData.enrolledCourses.map((course) => (
                      <Link 
                        key={course.id} 
                        href={course.slug ? `/user/course/${course.slug}` : `/courses/${course.id}`}
                        className="block transition-transform hover:scale-[1.01]"
                      >
                        <Card className="bg-gray-900 border-gray-800 text-white overflow-hidden">
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/4">
                              <Image
                                src={course.imageUrl || "/placeholder.svg"}
                                alt={course.title}
                                width={200}
                                height={120}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-4 md:p-6 flex-1">
                              <h3 className="text-lg font-medium mb-2">{course.title}</h3>
                              <p className="text-sm text-gray-400 mb-4">{course.instructor}</p>

                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm">{course.progress}% 완료</span>
                                <span className="text-xs text-gray-400">최근 학습: {course.lastStudyDate || course.lastAccessed}</span>
                              </div>
                              <Progress
                                value={course.progress}
                                className="h-2 bg-gray-800 [&>div]:bg-red-500"
                              />

                              <div className="mt-4 flex justify-between items-center">
                                <div className="text-sm text-gray-400">
                                  <div className="flex items-center mb-1">
                                    <BookOpen className="h-4 w-4 mr-1" />
                                    <span>{course.completedLectures}/{course.totalLectures} 강의</span>
                                  </div>
                                  {course.estimatedTimeLeft && (
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-1" />
                                      <span>남은 시간: {course.estimatedTimeLeft}</span>
                                    </div>
                                  )}
                                </div>
                                <Button className="bg-red-600 hover:bg-red-700">
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  이어서 학습하기
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400">진행 중인 강의가 없습니다.</p>
                    <Link href="/courses" className="mt-4 inline-block">
                      <Button className="bg-red-600 hover:bg-red-700">
                        강의 둘러보기
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                {dashboardData.completedCourses.length > 0 ? (
                  <div className="space-y-6">
                    {dashboardData.completedCourses.map((course) => (
                      <Link 
                        key={course.id} 
                        href={course.slug ? `/user/course/${course.slug}` : `/courses/${course.id}`}
                        className="block transition-transform hover:scale-[1.01]"
                      >
                        <Card className="bg-gray-900 border-gray-800 text-white overflow-hidden">
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/4">
                              <Image
                                src={course.imageUrl || "/placeholder.svg"}
                                alt={course.title}
                                width={200}
                                height={120}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-4 md:p-6 flex-1">
                              <h3 className="text-lg font-medium mb-2">{course.title}</h3>
                              <p className="text-sm text-gray-400 mb-4">{course.instructor}</p>

                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm">완료됨</span>
                                <span className="text-xs text-gray-400">완료일: {course.completedDate}</span>
                              </div>
                              <Progress
                                value={100}
                                className="h-2 bg-gray-800 [&>div]:bg-green-500"
                              />

                              <div className="mt-4 flex justify-between items-center">
                                <div className="text-sm text-gray-400">
                                  <div className="flex items-center mb-1">
                                    <BookOpen className="h-4 w-4 mr-1" />
                                    <span>{course.completedLectures}/{course.totalLectures} 강의</span>
                                  </div>
                                  {course.certificateAvailable && (
                                    <div className="flex items-center">
                                      <Award className="h-4 w-4 mr-1" />
                                      <span>수료증 발급 가능</span>
                                    </div>
                                  )}
                                </div>
                                <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500/10">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  강의 복습하기
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400">완료한 강의가 없습니다.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

// Badge 컴포넌트 (필요한 경우)
function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${className}`}>{children}</span>
}

