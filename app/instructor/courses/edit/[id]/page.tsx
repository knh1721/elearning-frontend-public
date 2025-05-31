"use client"

import { use } from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/user/ui/button"
import CourseCreateForm from "@/components/instructor/course-create/CourseCreateForm"

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)  // ✅ use()로 unwrap
  const router = useRouter() // ✅ 선언
  const [initialData, setInitialData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`/api/courses/${id}`, { withCredentials: true })
        setInitialData(res.data)
      } catch (err) {
        console.error("강의 정보를 불러오지 못했습니다:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [id])

  if (loading) return <div className="text-white">로딩 중...</div>

 
  return (
    <div className="min-h-screen bg-black text-white">
      {/* ✅ 상단 바 추가 */}
      <div className="bg-gray-900 text-white py-3 px-6 flex items-center justify-between border-b border-gray-800">
        <h1 className="text-xl font-bold">{initialData?.title || "강의 수정"}</h1>
        <div className="flex items-center gap-2">
          
          <Button
            variant="outline"
            className="bg-transparent text-white hover:bg-gray-800"
            onClick={() => {
              const confirmed = window.confirm("정말 수정을 취소하고 나가시겠습니까?");
              if (confirmed) router.push("/instructor")
            }}
          >
            X
          </Button>
        </div>
      </div>

      {/* 기존 폼 렌더링 */}
      <CourseCreateForm initialData={initialData} isEdit />
    </div>
  )
}