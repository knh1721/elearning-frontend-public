"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/user/ui/button"
import { Input } from "@/components/user/ui/input"
import { Badge } from "@/components/user/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/user/ui/dropdown-menu"
import InstructorHeader from "@/components/netflix-header"
import InstructorSidebar from "@/components/instructor/instructor-sidebar"
import useUserStore from "@/app/auth/userStore"

interface Question {
  id: number
  title: string
  courseTitle: string
  author: string
  regDate: string
  likeCount: number
  commentCount: number
  viewCount: number
  status: string
}

export default function InstructorQuestionsPage() {
  const { user, restoreFromStorage } = useUserStore()

  const [questions, setQuestions] = useState<Question[]>([])
  const [courseList, setCourseList] = useState<{ id: number; title: string }[]>([])

  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("전체")
  const [filterCourse, setFilterCourse] = useState("전체")
  const [sortBy, setSortBy] = useState("최신순")

   const [pendingQuery, setPendingQuery] = useState({
    searchQuery: "",
    status: "전체",
    course: "전체",
    sortBy: "최신순",
  })

  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    if (!user) restoreFromStorage()
  }, [user, restoreFromStorage])

  const instructorId = user?.instructorId

  useEffect(() => {
    if (!instructorId) return

    const fetchCourses = async () => {
      const res = await axios.get(`/api/instructor/sales/${instructorId}/courses`)
      setCourseList(res.data.data || [])
    }
    fetchCourses()
  }, [instructorId])

  useEffect(() => {
    if (!instructorId) return

    const fetchQuestions = async () => {
      const params: any = {
        page: currentPage - 1,
        size: itemsPerPage,
      }
      if (pendingQuery.searchQuery) params.keyword = pendingQuery.searchQuery
      if (pendingQuery.status !== "전체") params.status = pendingQuery.status
      if (pendingQuery.course !== "전체") params.courseId = pendingQuery.course
      if (pendingQuery.sortBy) params.sortBy = pendingQuery.sortBy

      const res = await axios.get(`/api/instructor/questions/${instructorId}`, { params })
      setQuestions(res.data.data.content || [])
      setTotalCount(res.data.totalCount || 0)
    }
    fetchQuestions()
  }, [instructorId, pendingQuery, currentPage])

  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const pageGroup = Math.floor((currentPage - 1) / 10)
  const startPage = pageGroup * 10 + 1
  const endPage = Math.min(startPage + 9, totalPages)

  return (
    <div className="min-h-screen bg-black text-white">
      <InstructorHeader />
      <div className="flex">
        <InstructorSidebar />
        <main className="ml-64 flex-1 px-6 py-8 pt-24">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">강의 질문 관리</h1>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-8">
            {/* 필터 영역 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                {/* 상태 필터 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                      상태: {filterStatus}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                    {["전체", "미답변", "답변완료"].map((status) => (
                      <DropdownMenuItem key={status} onClick={() => setFilterStatus(status)}>
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* 강의 필터 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                      강의: {filterCourse === "전체" ? "전체" : courseList.find(c => c.id.toString() === filterCourse)?.title || "선택됨"}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white max-h-60 overflow-y-auto">
                    <DropdownMenuItem onClick={() => setFilterCourse("전체")}>전체</DropdownMenuItem>
                    {courseList.map((course) => (
                      <DropdownMenuItem key={course.id} onClick={() => setFilterCourse(course.id.toString())}>
                        {course.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* 정렬 필터 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                      정렬: {sortBy}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                    {["최신순", "최근 답변순", "추천순"].map((option) => (
                      <DropdownMenuItem key={option} onClick={() => setSortBy(option)}>
                        {option}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* 검색 */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="질문 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setPendingQuery({
                      searchQuery,
                      status: filterStatus,
                      course: filterCourse,
                      sortBy,
                    })
                    setCurrentPage(1)
                  }}
                >
                  검색
                </Button>
              </div>
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                    <th className="pb-3 pl-4">제목</th>
                    <th className="pb-3">작성자</th>
                    <th className="pb-3">작성일</th>
                    <th className="pb-3 text-center">좋아요</th>
                    <th className="pb-3 text-center">댓글</th>
                    <th className="pb-3 text-center">조회수</th>
                    <th className="pb-3 text-center">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((question) => (
                    <tr key={question.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-4 pl-4">
                      <Link
                        href={`/instructor/questions/${question.id}`}
                        className="hover:text-blue-400"
                      >
                        <div className="font-medium">{question.title}</div>
                        <div className="text-xs text-gray-400 mt-1">{question.courseTitle}</div>
                      </Link>
                      </td>
                      <td className="py-4">{question.author}</td>
                      <td className="py-4">{question.regDate.split("T")[0]}</td>
                      <td className="py-4 text-center">{question.likeCount}</td>
                      <td className="py-4 text-center">{question.commentCount}</td>
                      <td className="py-4 text-center">{question.viewCount}</td>
                      <td className="py-4 text-center">
                        <Badge className={question.status === "미답변" ? "bg-red-600" : "bg-green-600"}>
                          {question.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이징 */}
            <div className="mt-6 flex justify-center items-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  onClick={() => setCurrentPage(Math.max(startPage - 1, 1))}
                  disabled={startPage === 1}
                >
                  이전
                </Button>

                {Array.from({ length: endPage - startPage + 1 }, (_, i) => (
                  <Button
                    key={startPage + i}
                    variant="outline"
                    className={`border-gray-700 ${
                      currentPage === startPage + i
                        ? "bg-gray-700 text-white"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                    onClick={() => setCurrentPage(startPage + i)}
                  >
                    {startPage + i}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  onClick={() => setCurrentPage(endPage + 1)}
                  disabled={endPage === totalPages}
                >
                  다음
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
