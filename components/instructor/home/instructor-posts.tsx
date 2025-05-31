"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/user/ui/button"
import { Card } from "@/components/user/ui/card"
import { useRouter } from "next/navigation"
import Pagination from "@/components/user/coding-test/pagination"

type Post = {
  id: number
  type: string
  title: string
  date: string
  content: string
  views: number | null
  comments: number
  likes: number
  reply: string
}

type InstructorPostsProps = {
  posts: Post[]
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function InstructorPosts({ posts, activeTab, setActiveTab }: InstructorPostsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const router = useRouter()

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  const visiblePosts = activeTab === "home" ? posts.slice(0, 6) : posts.slice(startIndex, endIndex)

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-white">게시글</h2>
      <div className="space-y-4">
      {visiblePosts.length === 0 ? (
        <p className="text-white">
          게시글이 없습니다.
        </p>
      ) : (
        visiblePosts.map((post) => (
          <Card
            key={post.id}
            onClick={() => router.push(`/user/community/post/${post.id}`)}
            className="p-4 border border-gray-800 bg-gray-900 shadow-md hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {/* 상단: 게시글 타입 + 날짜 */}
            <div className="flex justify-between text-sm text-gray-400">
              <span>{post.type}</span>
              <span>{post.date}</span>
            </div>

            {/* 제목 */}
            <h3 className="mt-1 text-white font-semibold text-sm">{post.title}</h3>

            {/* 본문 */}
            <p className="text-sm text-white mt-2 whitespace-pre-line">{post.content}</p>

            {/* 강사 댓글이 있을 경우 */}
            {post.reply && (
              <div className="mt-3 pl-4 border-l-2 border-gray-600 text-sm text-gray-300">
                <span className="mr-1 text-red-500">↳</span>
                {post.reply}
              </div>
            )}

            {/* 하단: 조회수, 댓글수 */}
            <div className="flex items-center mt-3 text-sm text-gray-500">
              <span className="mr-4">👍 {post.likes ?? 0}</span>
              <span className="mr-4">💬 {post.comments ?? 0}</span>
              <span>👁 {post.views ?? 0}</span>
            </div>
          </Card>
        ))
      )}
      </div>

      {/* 홈일 때만 전체 보기 버튼 노출 */}
      {activeTab === "home" && posts.length > 5 && (
        <div className="mt-4 flex justify-center">
          <Button variant="ghost" className="text-red-500 hover:underline" onClick={() => setActiveTab("posts")}>
            게시글 전체 보기 →
          </Button>
        </div>
      )}

      {/* 전체 보기일 때 페이징 */}
      {activeTab === "posts" && posts.length > itemsPerPage && (
        <Pagination
          totalItems={posts.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}
