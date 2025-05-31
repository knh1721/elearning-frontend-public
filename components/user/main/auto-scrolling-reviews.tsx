"use client"

import { useRef } from "react"
import Image from "next/image"
import { Star } from "lucide-react"

interface UserReview {
  userName: string
  profileUrl?: string | null
  courseName: string
  review: string
  rating: number
}

interface AutoScrollingReviewsProps {
  reviews: UserReview[]
}

export default function AutoScrollingReviews({ reviews }: AutoScrollingReviewsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // 리뷰가 없는 경우 처리
  if (!reviews || reviews.length === 0) {
    return <p className="text-center text-gray-300">후기가 없습니다.</p>
  }

  // 리뷰 데이터 복제하여 무한 스크롤 효과 만들기
  const duplicatedReviews = [...reviews, ...reviews]

  // 리뷰를 두 행으로 나누기
  const firstRowReviews = duplicatedReviews.slice(0, Math.ceil(duplicatedReviews.length / 2))
  const secondRowReviews = duplicatedReviews.slice(Math.ceil(duplicatedReviews.length / 2))

  return (
    <div className="relative overflow-hidden w-screen">
      <div className="w-full overflow-hidden">
        {/* 첫 번째 행 */}
        <div className="mb-6 overflow-hidden">
          <div className="flex auto-scroll gap-6" style={{ width: `${firstRowReviews.length * 400 + (firstRowReviews.length - 1) * 24}px` }}>
            {firstRowReviews.map((review, index) => (
              <ReviewCard key={`review-top-${index}`} review={review} />
            ))}
          </div>
        </div>

        {/* 두 번째 행 - 반대 방향으로 스크롤 */}
        <div className="overflow-hidden">
          <div
            className="flex auto-scroll gap-6"
            style={{
              width: `${secondRowReviews.length * 400 + (secondRowReviews.length - 1) * 24}px`,
              animationDirection: "reverse"
            }}
          >
            {secondRowReviews.map((review, index) => (
              <ReviewCard key={`review-bottom-${index}`} review={review} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// 리뷰 카드 컴포넌트
function ReviewCard({ review }: { review: UserReview }) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-5 w-[400px] h-[220px] flex flex-col border border-gray-700 space-y-2">
        {/* 상단: 사용자 + 별점 */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <Image
              src={review.profileUrl || "/placeholder.svg"}
              alt={review.userName}
              width={28}
              height={28}
              className="rounded-full object-cover mr-2"
            />
            <span className="text-sm text-gray-300">{review.userName}</span>
          </div>
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
  
        {/* 중간: 강조 - 강의 제목 */}
        <div className="mb-1">
            <h1 className="text-white font-bold text-base leading-tight line-clamp-1 mb-2">
                {review.courseName}
            </h1>
        </div>
  
        {/* 하단: 수강평 내용 */}
        <p className="text-sm text-white font-medium line-clamp-2 mb-5">
            “{review.review.length > 45 ? review.review.slice(0, 45) + "..." : review.review}”
        </p>
      </div>
    );
}
  
