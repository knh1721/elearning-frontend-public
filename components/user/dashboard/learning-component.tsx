"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Play, Clock, CheckCircle, BookOpen } from "lucide-react"
import { Button } from "@/components/user/ui/button"
import { Badge } from "@/components/user/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/user/ui/tabs"
import { Progress } from "@/components/user/ui/progress"
import userStore from "@/app/auth/userStore"
import RatingModal from "@/components/user/course/rating-modal"

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
  hasRating: boolean
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

export default function LearningComponent() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = userStore()

  const API_URL = "/api"

  const fetchDashboardData = async () => {
    if (!user?.id) {
      console.log("No user ID found, skipping data fetch");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Fetching dashboard data for user:", user.id);
      const response = await fetch(`/api/user/dashboard?userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json();
      console.log("=== 내 학습 컴포넌트 데이터 ===");
      console.log("전체 대시보드 데이터:", data);
      console.log("수강 중인 강의 상세:", data.enrolledCourses.map((course: Course) => ({
        id: course.id,
        title: course.title,
        progress: course.progress,
        courseProgress: course.courseProgress,
        completedLectures: course.completedLectures,
        totalLectures: course.totalLectures,
        slug: course.slug
      })));
      console.log("완료한 강의 상세:", data.completedCourses.map((course: Course) => ({
        id: course.id,
        title: course.title,
        completedDate: course.completedDate,
        certificateAvailable: course.certificateAvailable,
        slug: course.slug
      })));
      setDashboardData(data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  const calculateProgress = (course: Course) => {
    // courseProgress가 문자열로 들어오는 경우를 처리
    if (typeof course.courseProgress === 'string') {
      const progress = parseFloat(course.courseProgress);
      console.log(`Converting courseProgress string to number for ${course.title}:`, progress);
      return isNaN(progress) ? 0 : progress;
    }

    // progress 값이 있는 경우 사용
    if (typeof course.progress === 'number') {
      console.log(`Using progress number for ${course.title}:`, course.progress);
      return course.progress;
    }

    // completedLectures와 totalLectures로 계산
    if (course.completedLectures !== null && course.totalLectures > 0) {
      const calculatedProgress = (course.completedLectures / course.totalLectures) * 100;
      console.log(`Calculating progress from lectures for ${course.title}:`, calculatedProgress);
      return calculatedProgress;
    }

    console.log(`No valid progress data for ${course.title}, returning 0`);
    return 0;
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>다시 시도</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
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
              {dashboardData.enrolledCourses.map((course, index) => {
                const progress = calculateProgress(course);
                console.log(`Course ${course.title} progress:`, progress);
                return (
                  <Link href={`/user/course/${course.id}`} key={`enrolled-${course.id}-${course.title}-${index}`}>
                    <div className="group bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-red-500/30 transition-all duration-300 h-[360px] flex flex-col">
                      <div className="relative h-48 flex-shrink-0">
                        <Image
                          src={course.imageUrl || "/placeholder.svg"}
                          alt={course.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                            <Play className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold mb-2 line-clamp-2 h-[56px]">{course.title}</h3>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center text-sm text-gray-400">
                              <BookOpen className="h-4 w-4 mr-1" />
                              <span>{course.completedLectures}/{course.totalLectures} 강의</span>
                            </div>
                            {progress > 0 && (
                              <span className="text-sm font-medium text-green-500">
                                {progress}%
                              </span>
                            )}
                          </div>
                          <div className="relative w-full h-2 bg-gray-800 rounded-full mb-3 overflow-hidden">
                            <div
                              className="absolute left-0 top-0 h-full bg-green-600 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(100, Math.max(0, progress))}%`,
                                minWidth: '0%',
                                maxWidth: '100%'
                              }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-sm text-gray-400">
                            <span>마지막 학습: {course.lastStudyDate}</span>
                            <span>남은 시간: {course.estimatedTimeLeft}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
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
                  <Link href={`/user/course/${course.id}`}>
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
                        <div className="flex gap-2">
                          {!course.hasRating && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-600 text-blue-500 hover:bg-blue-600/10"
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedCourse(course);
                                setIsRatingModalOpen(true);
                              }}
                            >
                              후기 작성
                            </Button>
                          )}
                          {course.certificateAvailable && (
                            <Button size="sm" variant="outline" className="border-green-600 text-green-500 hover:bg-green-600/10">
                              수료증 보기
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
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

      {/* Rating Modal */}
      {selectedCourse && user && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => {
            setIsRatingModalOpen(false)
            setSelectedCourse(null)
          }}
          courseId={selectedCourse.id}
          userId={user.id}
          onSuccess={() => {
            fetchDashboardData()
          }}
        />
      )}
    </div>
  )
}