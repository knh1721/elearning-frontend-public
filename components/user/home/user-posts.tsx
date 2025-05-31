"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/user/ui/button";
import { Card } from "@/components/user/ui/card";
import Pagination from "@/components/user/coding-test/pagination";

type Post = {
  postId: number;
  bname: string;
  subject: string;
  content: string;
  createdDate: string;
  viewCount: number | null;
  likeCount: number | null;
  commentCount: number | null;
  reply: string | null;
  authorId: number;
  isInstructor: boolean;
};

type UserPostsProps = {
  posts: Post[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export default function UserPosts({ posts, activeTab, setActiveTab }: UserPostsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const router = useRouter();

  useEffect(() => {
    // 탭 바뀌면 항상 1페이지로 초기화
    setCurrentPage(1);
  }, [activeTab]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const visiblePosts = activeTab === "home" ? posts.slice(0, 6) : posts.slice(startIndex, endIndex);

  // 프로필 이동 함수
  const goToProfile = (userId: number, isInstructor: boolean) => {
    if (isInstructor) {
      router.push(`/instructor/${userId}`);
    } else {
      router.push(`/user/${userId}`);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-white">게시글</h2>
      {visiblePosts.length === 0 ? (
        <p className="text-white whitespace-pre-line">
          작성한 게시글이 없습니다.
        </p>
      ) : (
      <div className="space-y-4">
        {visiblePosts.map((post) => (
          <Card
            key={post.postId}
            onClick={() => router.push(`/user/community/post/${post.postId}`)}
            className="p-4 border border-gray-800 bg-gray-900 shadow-md hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {/* 상단: 게시글 타입 + 날짜 + 작성자 */}
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>{post.bname}</span>
              <div className="flex items-center gap-2">
                {/* <span
                  onClick={(e) => {
                    e.stopPropagation(); // 카드 클릭 막기
                    goToProfile(post.authorId, post.isInstructor);
                  }}
                  className="text-blue-400 hover:underline cursor-pointer"
                >
                  작성자 프로필
                </span> */}
                <span>{post.createdDate}</span>
              </div>
            </div>

            {/* 제목 */}
            <h3 className="mt-1 text-white font-semibold text-sm">{post.subject}</h3>

            {/* 본문 요약 */}
            <p className="text-sm text-white mt-2 whitespace-pre-line">{post.content}</p>

            {/* 답글이 있으면 보여주기 */}
            {post.reply && (
              <div className="mt-3 pl-4 border-l-2 border-gray-600 text-sm text-gray-300">
                <span className="mr-1 text-red-500">↳</span>
                {post.reply}
              </div>
            )}

            {/* 하단: 좋아요, 댓글, 조회수 */}
            <div className="flex items-center mt-3 text-sm text-gray-500">
              <span className="mr-4">👍 {post.likeCount  ?? 0}</span>
              <span className="mr-4">💬 {post.commentCount  ?? 0}</span>
              <span>👁 {post.viewCount  ?? 0}</span>
            </div>
          </Card>
        ))}
      </div>
      )}

      {/* 홈 탭에서는 전체 보기 버튼 */}
      {activeTab === "home" && posts.length > 5 && (
        <div className="mt-4 flex justify-center">
          <Button variant="ghost" className="text-red-500 hover:underline" onClick={() => setActiveTab("posts")}>
            게시글 전체 보기 →
          </Button>
        </div>
      )}

      {/* 전체 보기에서는 페이징 처리 */}
      {activeTab === "posts" && posts.length > itemsPerPage && (
        <Pagination
          totalItems={posts.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
