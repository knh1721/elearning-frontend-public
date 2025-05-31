"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import axios from "axios"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/user/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/user/ui/card"
import { Button } from "@/components/user/ui/button"
import { Heart, Bookmark, Star } from "lucide-react"
import { Badge } from "@/components/user/ui/badge"
import { useRouter } from "next/navigation"

interface FollowItem {
  id: number;
  instructorId?: number;
  name: string;
  profileUrl: string;
  authorName?: string;
  expertiseName?: string;
  courseCount?: number;
  rating?: number;
  price?: number;
  discountedPrice?: number;
  level?: string;
  followerCount?: number;
  subject?: string;
  instructor?: string;
  isInstructor: boolean;
}

export default function FollowWishlist() {
  const [activeTab, setActiveTab] = useState("follow")
  const [activeFollowTab, setActiveFollowTab] = useState("instructor")
  const [instructors, setInstructors] = useState<FollowItem[]>([])
  const [users, setUsers] = useState<FollowItem[]>([])
  const [courses, setCourses] = useState<FollowItem[]>([])

  const router = useRouter()

  useEffect(() => {
    fetchUsers()
    fetchCourses()
  }, [])

  const fetchUsers = async () => {
    const res = await axios.get("/api/mypage/followed-users")
    const allUsers: FollowItem[] = res.data.data || []

    setInstructors(allUsers.filter(user => user.isInstructor))
    setUsers(allUsers.filter(user => !user.isInstructor))
  }

  const fetchCourses = async () => {
    const res = await axios.get("/api/mypage/wishlisted-courses")
    setCourses(res.data.data || [])
  }

  const deleteLike = async (targetId: number, type: number) => {
    try {
      let confirmMessage = ""

      if (type === 1) {
        confirmMessage = "위시리스트에서 삭제하시겠습니까?"
      } else if (type === 2) {
        confirmMessage = "팔로우 취소하시겠습니까?"
      }

      const isConfirmed = window.confirm(confirmMessage)
      if (!isConfirmed) return

      await axios.post(
        "/api/mypage/delete-like",
        { targetId, type },
        { withCredentials: true }
      )

      alert("삭제되었습니다.")

      if (type === 1) {
        setCourses(prev => prev.filter(c => c.id !== targetId))
      } else if (type === 2) {
        // 강사/유저 모두 type=2
        setInstructors(prev => prev.filter(i => i.id !== targetId))
        setUsers(prev => prev.filter(u => u.id !== targetId))
      }
    } catch (error) {
      console.error("삭제 실패", error)
      alert("삭제에 실패했습니다.")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-lg">팔로우/위시리스트</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger
                value="follow"
                className={`data-[state=active]:bg-gray-700 ${activeTab === "follow" ? "text-red-500" : "text-gray-400"}`}
              >
                <Heart className="h-4 w-4 mr-2" />
                팔로우
              </TabsTrigger>
              <TabsTrigger
                value="wishlist"
                className={`data-[state=active]:bg-gray-700 ${activeTab === "wishlist" ? "text-red-500" : "text-gray-400"}`}
              >
                <Bookmark className="h-4 w-4 mr-2" />
                위시리스트
              </TabsTrigger>
            </TabsList>

            {/* 팔로우 탭 */}
            <TabsContent value="follow" className="pt-6">
              <div className="flex space-x-2 mb-6 justify-start">
                <Button
                  variant={activeFollowTab === "instructor" ? "default" : "outline"}
                  className="w-auto px-4 py-2 text-sm"
                  onClick={() => setActiveFollowTab("instructor")}
                >
                  강사
                </Button>
                <Button
                  variant={activeFollowTab === "user" ? "default" : "outline"}
                  className="w-auto px-4 py-2 text-sm"
                  onClick={() => setActiveFollowTab("user")}
                >
                  유저
                </Button>
              </div>

              {/* 강사 목록 */}
              {activeFollowTab === "instructor" && (
                instructors.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>팔로우한 강사가 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {instructors.map((instructor) => (
                      <div key={instructor.id} className="flex items-center p-4 bg-gray-800 rounded-lg">
                        <div className="relative w-[60px] h-[60px] rounded-full overflow-hidden bg-gray-700 mr-4">
                          <Image src={instructor.profileUrl || "/placeholder.svg"} alt={instructor.name} width={60} height={60} className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3
                              className="font-medium cursor-pointer hover:underline"
                              onClick={() => {
                                if (instructor.isInstructor && instructor.instructorId) {
                                  router.push(`/instructor/${instructor.instructorId}/home`);
                                } else {
                                  router.push(`/user/${instructor.id}/home`);
                                }
                              }}
                            >
                              {instructor.name}
                            </h3>
                            <div className="flex items-center ml-2 text-yellow-400 text-sm">
                              <Star className="h-3 w-3 mr-1" />
                              {instructor.rating ?? 0}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">팔로워 {instructor.followerCount?.toLocaleString()}명</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-700 text-gray-300 hover:bg-gray-700"
                          onClick={() => deleteLike(instructor.id, 2)}
                        >
                          <Heart className="h-4 w-4 mr-1 fill-red-500 text-red-500" />
                          팔로우 취소
                        </Button>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* 유저 목록 */}
              {activeFollowTab === "user" && (
                users.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>팔로우한 유저가 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center p-4 bg-gray-800 rounded-lg">
                        <div className="relative w-[60px] h-[60px] rounded-full overflow-hidden bg-gray-700 mr-4">
                          <Image src={user.profileUrl || "/placeholder.svg"} alt={user.name} width={60} height={60} className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-1">
                          <h3
                            className="font-medium cursor-pointer hover:underline"
                            onClick={() => {
                              if (user.isInstructor && user.instructorId) {
                                router.push(`/instructor/${user.instructorId}/home`);
                              } else {
                                router.push(`/user/${user.id}/home`);
                              }
                            }}
                          >
                            {user.name}
                          </h3>
                          <p className="text-xs text-gray-500">팔로워 {user.followerCount}명</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-700 text-gray-300 hover:bg-gray-700"
                          onClick={() => deleteLike(user.id, 2)}
                        >
                          <Heart className="h-4 w-4 mr-1 fill-red-500 text-red-500" />
                          팔로우 취소
                        </Button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </TabsContent>

            {/* 위시리스트 탭 */}
            <TabsContent value="wishlist" className="pt-6">
              {courses.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>위시리스트에 담긴 강의가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="flex p-4 bg-gray-800 rounded-lg">
                      <div className="relative w-[120px] h-[80px] rounded-md overflow-hidden bg-gray-700 mr-4">
                        <Image src={course.profileUrl || "/placeholder.svg"} alt={course.name} width={120} height={80} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1">
                        <h3
                          className="font-medium cursor-pointer hover:underline"
                          onClick={() => router.push(`/user/course/${course.id}`)}
                        >
                          {course.name}
                        </h3>
                        <p className="text-sm text-gray-400">{course.authorName}</p>
                        <div className="flex items-center mt-1 space-x-2">
                          <Badge variant="outline" className="text-xs bg-gray-700 text-gray-300 border-gray-600">{course.level}</Badge>
                          <div className="flex items-center text-yellow-400 text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            {course.rating}
                          </div>
                        </div>
                        <div className="flex items-center mt-2">
                          <span className="text-red-500 font-medium">{course.discountedPrice?.toLocaleString()}원</span>
                          {course.discountedPrice !== course.price && (
                            <span className="text-gray-400 text-sm line-through ml-2">
                              {course.price?.toLocaleString()}원
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-700 text-gray-300 hover:bg-gray-700"
                        onClick={() => deleteLike(course.id, 1)}
                      >
                        <Bookmark className="h-4 w-4 mr-1 fill-red-500 text-red-500" />
                        삭제
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
