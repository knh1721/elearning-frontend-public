"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Play, Clock, CheckCircle, BookOpen } from "lucide-react"
import { Button } from "@/components/user/ui/button"
import { Badge } from "@/components/user/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/user/ui/tabs"
import { Progress } from "@/components/user/ui/progress"
import NetflixHeader from "@/components/netflix-header"
import Footer from "@/components/footer"
import axios from "axios"
import userStore from "@/app/auth/userStore"

interface Course {
  id: number
  title: string
  instructor: string
  imageUrl: string
  slug: string
  category: string
  courseStatus: string
  rating: number
  students: number
  level: string
  relatedTo: string
  progress: number
  lastAccessed: string
  completed: boolean
  completedDate: string | null
  certificateAvailable: boolean
  totalLectures: number
  completedLectures: number
  nextLecture: string
  estimatedTimeLeft: string
  lastStudyDate: string
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

export default function LearningPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { restoreFromStorage, accessToken, user } = userStore()
  
  const API_URL = "/api"

  useEffect(() => {
    restoreFromStorage()
  }, [])

  useEffect(() => {
    if (user) {
      setIsLoading(true)
      axios.get(`${API_URL}/user/dashboard?userId=${user.id}`, { withCredentials: true })
        .then(res => {
          console.log("=== 내 학습 탭 데이터 ===")
          console.log("전체 대시보드 데이터:", res.data)
          console.log("수강 중인 강의 상세:", res.data.data.enrolledCourses.map((course: Course) => ({
            id: course.id,
            title: course.title,
            progress: course.progress,
            courseProgress: course.courseProgress,
            completedLectures: course.completedLectures,
            totalLectures: course.totalLectures
          })))
          console.log("완료한 강의 상세:", res.data.data.completedCourses.map((course: Course) => ({
            id: course.id,
            title: course.title,
            completedDate: course.completedDate,
            certificateAvailable: course.certificateAvailable
          })))
          setDashboardData(res.data.data)
          setIsLoading(false)
        })
        .catch(err => {
          console.error("대시보드 데이터 로드 실패", err)
          setError("데이터를 불러오는데 실패했습니다.")
          setIsLoading(false)
        })
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "데이터를 불러오는데 실패했습니다."}</p>
          <Button onClick={() => window.location.reload()}>다시 시도</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NetflixHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">내 학습</h1>
          <p className="text-gray-400">수강 중인 강의와 완료한 강의를 확인하세요.</p>
        </div>

        <Tabs defaultValue="enrolled" className="w-full">
          <TabsList className="bg-gray-800 mb-6">
            <TabsTrigger value="enrolled" className="data-[state=active]:bg-red-600 transition-all">
              수강 중인 강의
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-red-600 transition-all">
              완료한 강의
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enrolled" className="mt-0">
            {dashboardData.enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData.enrolledCourses.map((course) => (
                  <div key={course.id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-red-500/30 transition-all duration-300">
                    <div className="relative h-48">
                      <Image
                        src={course.imageUrl || "/placeholder.svg"}
                        alt={course.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-lg font-bold mb-1 line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-gray-300">{course.instructor}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center text-sm text-gray-400">
                          <BookOpen className="h-4 w-4 mr-1" />
                          <span>{course.completedLectures}/{course.totalLectures} 강의</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>마지막 학습: {course.lastStudyDate}</span>
                        </div>
                      </div>
                      <Progress value={course.courseProgress} className="h-1.5 bg-gray-800 mb-3" />
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-400">
                          다음 강의: <span className="text-white">{course.nextLecture}</span>
                        </div>
                        <Link href={`/user/course/${course.slug}`}>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700">
                            이어서 학습하기
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">수강 중인 강의가 없습니다</h3>
                <p className="text-gray-400 mb-6">새로운 강의를 둘러보고 학습을 시작해보세요.</p>
                <Link href="/user/course">
                  <Button className="bg-red-600 hover:bg-red-700">
                    강의 둘러보기
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            {dashboardData.completedCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData.completedCourses.map((course) => (
                  <div key={course.id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-green-500/30 transition-all duration-300">
                    <div className="relative h-48">
                      <Image
                        src={course.imageUrl || "/placeholder.svg"}
                        alt={course.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-lg font-bold mb-1 line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-gray-300">{course.instructor}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          완료
                        </Badge>
                        <div className="text-sm text-gray-400">
                          완료일: {course.completedDate}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-400">
                          총 {course.totalLectures}개 강의
                        </div>
                        {course.certificateAvailable && (
                          <Link href={`/user/certificate/${course.id}`}>
                            <Button size="sm" variant="outline" className="border-green-600 text-green-500 hover:bg-green-600/10">
                              수료증 보기
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">완료한 강의가 없습니다</h3>
                <p className="text-gray-400 mb-6">강의를 완료하면 여기에 표시됩니다.</p>
                <Link href="/user/course">
                  <Button className="bg-red-600 hover:bg-red-700">
                    강의 둘러보기
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
} 