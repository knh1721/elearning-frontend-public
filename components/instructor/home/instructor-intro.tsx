"use client"

import { useState } from "react"
import { Edit } from "lucide-react"
import { Button } from "@/components/user/ui/button"
import { Textarea } from "@/components/user/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/user/ui/dialog"

type InstructorIntroProps = {
  instructorData: {
    nickName: string
    bio: string
    expertise: string
    profileUrl: string
    totalStudents: number
    totalReviews: number
    totalRating: number
    expertiseName: string
  }
  bio: string
  setBio: (bio: string) => void
  isMyPage: boolean
  isFollowing: boolean
  followerCount: number
  expertiseOptions: { id: number; name: string }[]
  isEditingExpertise: boolean
  setIsEditingExpertise: (value: boolean) => void
  selectedExpertiseId: number | null
  setSelectedExpertiseId: (id: number) => void
  handleSaveExpertise: () => Promise<void>
  handleFollowToggle: () => Promise<void>
  handleSaveBio: () => Promise<void>
}

export default function InstructorIntro({
  instructorData,
  bio,
  setBio,
  isMyPage,
  isFollowing,
  followerCount,
  expertiseOptions,
  isEditingExpertise,
  setIsEditingExpertise,
  selectedExpertiseId,
  setSelectedExpertiseId,
  handleSaveExpertise,
  handleFollowToggle,
  handleSaveBio,
}: InstructorIntroProps) {
  const [editBio, setEditBio] = useState(bio ?? "")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showFullBio, setShowFullBio] = useState(false)

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">소개</h2>
        {isMyPage && (
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              setEditBio(bio ?? "")
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 border-gray-700 text-white hover:bg-gray-800 bg-transparent"
              >
                <Edit className="h-4 w-4" /> 수정
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-white">소개글 수정</DialogTitle>
                <DialogDescription className="text-gray-400">자기소개를 입력하세요.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="min-h-[200px] bg-gray-800 border-gray-700 text-white focus-visible:ring-red-600 focus-visible:ring-offset-0"
                  placeholder="자기소개를 입력해주세요"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                >
                  취소
                </Button>
                <Button
                  onClick={() => {
                    console.log("🔍 저장 버튼 클릭");
                    console.log("🔍 수정된 bio:", editBio);
                    setBio(editBio)
                    handleSaveBio()
                    setIsDialogOpen(false)
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  저장하기
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div>
      {(bio ?? "").trim() === "" ? (
        <p className="text-white">작성한 소개글이 없습니다.</p>
      ) : (
        <>
          <p
            className={`text-white whitespace-pre-line transition-all duration-300 ${showFullBio ? "" : "line-clamp-3"}`}
          >
            {bio}
          </p>

          {bio.length > 100 && (
            <div className="mt-4 flex justify-center">
              <button onClick={() => setShowFullBio(!showFullBio)} className="mt-2 text-red-500 text-sm hover:underline">
                {showFullBio ? "접기 ▲" : "더보기 ▼"}
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  )
}
