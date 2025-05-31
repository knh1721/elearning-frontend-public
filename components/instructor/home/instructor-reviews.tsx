"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Star } from "lucide-react"
import { Button } from "@/components/user/ui/button"
import { Card } from "@/components/user/ui/card"
import { useRouter } from "next/navigation"
import Pagination from "@/components/user/coding-test/pagination"

type Review = {
  id: number
  courseId: number
  subject: string
  thumbnailUrl: string
  nickname: string
  rating: number
  content: string
  regDate: string
  likes: number
}

type InstructorReviewsProps = {
  reviews: Review[]
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function InstructorReviews({ reviews, activeTab, setActiveTab }: InstructorReviewsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const router = useRouter()

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  const visibleReviews =
    activeTab === "home" ? reviews.slice(0, 6) : reviews.slice(startIndex, endIndex)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = `0${date.getMonth() + 1}`.slice(-2)
    const day = `0${date.getDate()}`.slice(-2)
    return `${year}. ${month}. ${day}.`
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 text-white">수강평</h2>

      {reviews.length === 0 ? (
        <p className="text-white">수강평이 없습니다.</p>
      ) : (
        <>
          <div className="space-y-4">
            {visibleReviews.map((review) => (
              <Card
                key={review.id}
                onClick={() => router.push(`/user/course/${review.courseId}?tab=reviews`)}
                className="p-4 border border-gray-800 bg-gray-900 shadow-md hover:bg-gray-800 transition-colors flex items-start"
              >
                <Image
                  src={review.thumbnailUrl || "/placeholder.svg"}
                  alt="강의 썸네일"
                  width={60}
                  height={60}
                  className="rounded-md object-cover w-14 h-14 mr-4"
                />
                <div className="flex-1">
                  <div className="flex items-center text-sm text-white font-medium">
                    <div className="flex mr-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? "text-yellow-400" : "text-gray-600"}`}
                          fill={i < review.rating ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-white mr-1">{review.nickname}</span>
                    <span className="text-gray-400">· {formatDate(review.regDate)}</span>
                  </div>
                  <div className="text-sm text-gray-300 mt-1 mb-2">
                    <span className="ml-1 px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full text-xs">
                      {review.subject}
                    </span>
                  </div>
                  <p className="text-white whitespace-pre-line text-sm">{review.content}</p>
                </div>
              </Card>
            ))}
          </div>

          {activeTab === "home" && reviews.length > 5 && (
            <div className="mt-4 flex justify-center">
              <Button variant="ghost" className="text-red-500 hover:underline" onClick={() => setActiveTab("reviews")}>
                수강평 전체 보기 →
              </Button>
            </div>
          )}

          {activeTab === "reviews" && reviews.length > itemsPerPage && (
            <Pagination
              totalItems={reviews.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  )
}
