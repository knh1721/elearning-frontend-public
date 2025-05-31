"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/user/ui/button"
import { Textarea } from "@/components/user/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/user/ui/dialog"
import axios from "axios"

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  courseId: number
  userId: number
  onSuccess: () => void
}

export default function RatingModal({ isOpen, onClose, courseId, userId, onSuccess }: RatingModalProps) {
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("별점을 선택해주세요.")
      return
    }

    try {
      setIsSubmitting(true)
      await axios.post("/api/course/rating", {
        userId,
        courseId,
        rating,
        content
      })
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("Failed to submit rating:", error)
      if (error.response?.data?.message === "You have already rated this course") {
        alert("이미 수강평을 작성하셨습니다.")
      } else {
        alert("수강평 등록에 실패했습니다.")
      }
    } finally {
      setIsSubmitting(false)
      setRating(0)
      setContent("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>수강평 작성</DialogTitle>
          <DialogDescription>
            강의에 대한 별점과 수강평을 작성해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setRating(value)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-8 w-8 ${
                    value <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="수강평을 작성해주세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "등록하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 