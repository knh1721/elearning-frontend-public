"use client"

import Image from "next/image"
import { Bell, Edit, Home, BookOpen, MessageSquare, FileText, Star } from "lucide-react"
import { Button } from "@/components/user/ui/button"
import { Separator } from "@/components/user/ui/separator"

export type InstructorData = {
  nickName: string
  bio: string
  githubLink: string
  expertise: string
  profileUrl: string
  totalStudents: number
  totalReviews: number
  totalRating: number
  expertiseName: string
}

type InstructorSidebarProps = {
  instructorData: InstructorData
  isMyPage: boolean
  isFollowing: boolean
  followerCount: number
  activeTab: string
  setActiveTab: (tab: string) => void
  expertiseOptions: { id: number; name: string }[]
  isEditingExpertise: boolean
  setIsEditingExpertise: (value: boolean) => void
  selectedExpertiseId: number | null
  setSelectedExpertiseId: (id: number) => void
  handleSaveExpertise: () => Promise<void>
  handleFollowToggle: () => Promise<void>
}

export default function InstructorHomeSidebar({
  instructorData,
  isMyPage,
  isFollowing,
  followerCount,
  activeTab,
  setActiveTab,
  expertiseOptions,
  isEditingExpertise,
  setIsEditingExpertise,
  selectedExpertiseId,
  setSelectedExpertiseId,
  handleSaveExpertise,
  handleFollowToggle,
}: InstructorSidebarProps) {
  return (
    <div className="p-4 pt-8 w-[250px]">
      <div className="flex flex-col items-center mb-6">
        <Image
          src={instructorData.profileUrl || "/placeholder.svg"}
          alt="강사명"
          width={200}
          height={200}
          className="w-32 h-32 rounded-full object-cover border border-gray-800 mb-4"
        />
        <h2 className="font-bold text-xl text-white">{instructorData.nickName}</h2>

        {isMyPage && isEditingExpertise ? (
          <div className="flex w-full mt-2">
            <select
              value={selectedExpertiseId ?? ""}
              onChange={(e) => setSelectedExpertiseId(Number(e.target.value))}
              className="text-white w-full p-1 rounded"
            >
              <option value="" disabled>
                전문 분야 선택
              </option>
              {expertiseOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
            <Button className="ml-2 bg-red-600 text-white hover:bg-red-700" onClick={handleSaveExpertise}>
              저장
            </Button>
          </div>
        ) : (
          <p className="text-sm text-gray-400 flex items-center">
            {instructorData.expertiseName || "전문분야 없음"}
            {isMyPage && (
              <Edit className="h-4 w-4 ml-2 cursor-pointer" onClick={() => setIsEditingExpertise(true)} />
            )}
          </p>
        )}

        <div className="flex flex-col items-center mt-4 space-y-2 w-full">
          <div className="flex justify-between w-full text-sm">
            <span className="text-gray-400">수강생</span>
            <span className="font-medium text-white">{instructorData.totalStudents ?? 0}명</span>
          </div>
          <div className="flex justify-between w-full text-sm">
            <span className="text-gray-400">수강평</span>
            <span className="font-medium text-white">{instructorData.totalReviews ?? 0}개</span>
          </div>
          <div className="flex justify-between w-full text-sm">
            <span className="text-gray-400">평점</span>
            <div className="flex items-center">
              <span className="font-medium text-white mr-1">{instructorData.totalRating ?? 0}</span>
              <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
            </div>
          </div>

          {instructorData.githubLink && (
            <div className="flex justify-between w-full text-sm mt-2">
              <span className="text-gray-400">GitHub</span>
              <a
                href={instructorData.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline break-all max-w-[150px] text-right"
              >
                {instructorData.githubLink}
              </a>
            </div>
          )}

          {isMyPage ? (
            <div className="mt-4 text-white text-sm">팔로워 수 : {followerCount ?? 0}명</div>
          ) : (
            <Button
              onClick={handleFollowToggle}
              className={`mt-4 w-full flex items-center justify-center gap-2 rounded-full border text-sm font-semibold transition
                ${
                  isFollowing
                    ? "bg-red-600 text-white hover:bg-red-700 border-red-600"
                    : "bg-white text-red-600 border-red-600 hover:bg-red-100"
                }`}
            >
              <Bell className="h-4 w-4" />
              {isFollowing ? "팔로우 취소" : "팔로우"}
            </Button>
          )}
        </div>
      </div>

      <Separator className="my-4 bg-gray-800" />

      <nav>
        <ul className="space-y-2">
          {[
            { label: "홈", value: "home", icon: <Home className="h-4 w-4 mr-2" /> },
            { label: "강의", value: "courses", icon: <BookOpen className="h-4 w-4 mr-2" /> },
            { label: "수강평", value: "reviews", icon: <MessageSquare className="h-4 w-4 mr-2" /> },
            { label: "게시글", value: "posts", icon: <FileText className="h-4 w-4 mr-2" /> },
          ].map((tab) => (
            <li key={tab.value}>
              <Button
                variant={activeTab === tab.value ? "default" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === tab.value ? "bg-red-600 hover:bg-red-700 text-white" : "hover:bg-gray-800 text-white"
                }`}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.icon}
                {tab.label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
