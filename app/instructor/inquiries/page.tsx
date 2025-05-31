"use client"

import { useEffect, useState } from "react"
import { Search, ChevronDown, MessageSquare, Trash2, Pencil } from "lucide-react"
import { Button } from "@/components/user/ui/button"
import { Input } from "@/components/user/ui/input"
import { Badge } from "@/components/user/ui/badge"
import { Textarea } from "@/components/user/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/user/ui/dropdown-menu"
import InstructorHeader from "@/components/netflix-header"
import InstructorSidebar from "@/components/instructor/instructor-sidebar"
import useUserStore from "@/app/auth/userStore"

interface Inquiry {
  id: number
  courseTitle: string
  author: string
  subject: string
  content: string
  regDate: string
  replyCount: number
  replies: Reply[]
}

interface Reply {
  id: number
  author: string
  regDate: string
  content: string
}

export default function InstructorInquiriesPage() {
  // 현재 로그인한 유저 정보를 userStore에서 가져옴.
  const { user, restoreFromStorage } = useUserStore();

  // 컴포넌트 마운트 시 localStorage에서 사용자 정보 복원
  useEffect(() => {
    if (!user) {
      restoreFromStorage();
    }
  }, [user, restoreFromStorage]);

  // 강사 ID와 사용자 ID (댓글 작성, 수정, 삭제 시 필요)
  const instructorId = user?.instructorId;
  const userId = user?.id;

  // 문의 목록 및 필터링 관련 상태
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("전체")
  const [filterCourse, setFilterCourse] = useState("전체")

  // 페이징 관련 상태
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5 // 페이지당 데이터 수
  const [totalCount, setTotalCount] = useState(0)
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  // 댓글 관련 상태
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null)
  const [editReplyContent, setEditReplyContent] = useState("")

  // 문의 목록 조회 API 호출  
  const fetchInquiries = async () => {
    const paramsObj = new URLSearchParams();
    if (searchQuery) paramsObj.append("query", searchQuery);
    if (filterStatus !== "전체") paramsObj.append("status", filterStatus);
    if (filterCourse !== "전체") paramsObj.append("courseId", filterCourse);

    // 페이징 정보 추가
    paramsObj.append("page", currentPage.toString())
    paramsObj.append("size", itemsPerPage.toString())

    const res = await fetch(`/api/instructor/inquiries/${instructorId}?${paramsObj.toString()}`);
    const json = await res.json();
    setInquiries(json.data || []);
  }

  useEffect(() => {
    if (instructorId) fetchInquiries();
  }, [instructorId, searchQuery, filterStatus, filterCourse]);

  // 댓글(답변) 등록 시 API 호출 (userId를 쿼리 파라미터로 전달)
  const handleReplySubmit = async (boardId: number) => {
    await fetch(`/api/instructor/inquiries/${boardId}/reply?userId=${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyContent })
    });
    setReplyingTo(null);
    setReplyContent("");
    fetchInquiries();
  }

  // 댓글(답변) 수정 시 API 호출 (userId를 쿼리 파라미터로 전달)
  const handleUpdateReply = async (replyId: number) => {
    await fetch(`/api/instructor/inquiries/reply/${replyId}?userId=${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editReplyContent })
    });
    setEditingReplyId(null);
    setEditReplyContent("");
    fetchInquiries();
  }

  // 댓글(답변) 삭제 시 API 호출 (userId를 쿼리 파라미터로 전달)
  const handleDeleteReply = async (replyId: number) => {
    await fetch(`/api/instructor/inquiries/reply/${replyId}?userId=${userId}`, {
      method: "DELETE"
    });
    fetchInquiries();
  }

  // 댓글 수정 버튼 클릭 시 (편집 모드로 전환)
  const handleEditReply = (replyId: number, content: string) => {
    setEditingReplyId(replyId);
    setEditReplyContent(content);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <InstructorHeader />
      <div className="flex">
        <InstructorSidebar />
        <main className="ml-64 flex-1 px-6 py-8 pt-24">
          <h1 className="text-2xl font-bold mb-6">수강전 문의관리</h1>

          {/* 검색 및 필터 영역 */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="문의 제목, 내용, 작성자 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="flex items-center gap-2">
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                      강의: {filterCourse === "전체" ? "전체" : "선택됨"}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                    <DropdownMenuItem onClick={() => setFilterCourse("전체")}>전체</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterCourse("Part1")}>
                      Part1: C++ 프로그래밍 입문
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterCourse("Part4")}>Part4: 게임 서버</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* 문의 목록 렌더링 */}
            <div className="space-y-6">
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="border border-gray-800 rounded-lg overflow-hidden"
                >
                  <div className="bg-gray-800 p-4">
                    <div className="flex justify-between items-center">
                      {/* 강의 제목 */}
                      <h3 className="mb-2 font-semibold">
                        {inquiry.courseTitle}
                      </h3>

                      {/* 상태 뱃지 */}
                      <Badge
                        className={
                          inquiry.replyCount === 0
                            ? "bg-red-600"
                            : "bg-green-600"
                        }
                      >
                        {inquiry.replyCount === 0 ? "미답변" : "답변완료"}
                      </Badge>
                    </div>

                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <span>{inquiry.author}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(inquiry.regDate).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-900">
                    <p className="text-gray-300 whitespace-pre-line mb-4">{inquiry.content}</p>

                    {/* 댓글(답변) 목록 렌더링 */}
                    {inquiry.replyCount > 0 &&
                      inquiry.replies.map((reply) => (
                        <div key={reply.id} className="bg-gray-800 p-3 rounded-lg mb-2">
                          <div className="flex justify-between">
                            <div className="text-green-400">{reply.author}</div>
                            <div className="text-gray-400 text-sm">
                              {new Date(reply.regDate).toLocaleString()}
                            </div>
                          </div>
                          {editingReplyId === reply.id ? (
                            <>
                              <Textarea
                                value={editReplyContent}
                                onChange={(e) => setEditReplyContent(e.target.value)}
                                placeholder="댓글 수정"
                                className="bg-gray-700 border-gray-600 text-white mt-2"
                              />
                              <div className="flex justify-end gap-2 mt-2">
                                <Button variant="outline" onClick={() => setEditingReplyId(null)}>
                                  취소
                                </Button>
                                <Button onClick={() => handleUpdateReply(reply.id)} className="bg-green-600">
                                  수정완료
                                </Button>
                              </div>
                            </>
                          ) : (
                            <div className="mt-2">{reply.content}</div>
                          )}
                          <div className="flex justify-end gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingReplyId(reply.id);
                                setEditReplyContent(reply.content);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-1" /> 수정
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteReply(reply.id)}
                              className="text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> 삭제
                            </Button>
                          </div>
                        </div>
                      ))
                    }

                    {/* 댓글 추가 입력 영역 (댓글이 없을 때만 표시) */}
                    {inquiry.replyCount === 0 && replyingTo === inquiry.id && (
                      <>
                        <Textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="댓글을 입력하세요"
                          className="bg-gray-700 border-gray-600 text-white mb-3"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <Button variant="outline" onClick={() => setReplyingTo(null)}>
                            취소
                          </Button>
                          <Button onClick={() => handleReplySubmit(inquiry.id)} className="bg-green-600">
                            댓글 제출
                          </Button>
                        </div>
                      </>
                    )}

                    {/* 댓글 작성 버튼 (댓글이 없을 경우만 표시) */}
                    {inquiry.replyCount === 0 && replyingTo !== inquiry.id && (
                      <div className="flex justify-end">
                        <Button onClick={() => setReplyingTo(inquiry.id)} className="bg-green-600">
                          <MessageSquare className="h-4 w-4 mr-1" /> 댓글 작성
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  이전
                </Button>
  
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className={`border-gray-700 ${currentPage === i + 1 ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-800"}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
  
                <Button
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  다음
                </Button>
              </div>
            </div>
            )}
            
          </div>
        </main>
      </div>
    </div>
  )
}
