"use client"

import { use, useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Eye, MessageSquare, Pencil, ThumbsUp, Trash2 } from "lucide-react"
import { Button } from "@/components/user/ui/button"
import { Textarea } from "@/components/user/ui/textarea"
import { Separator } from "@/components/user/ui/separator"
import { Badge } from "@/components/user/ui/badge"
import InstructorHeader from "@/components/netflix-header"
import InstructorSidebar from "@/components/instructor/instructor-sidebar"
import useUserStore from "@/app/auth/userStore"
import { useParams } from "next/navigation"

const colors = [
  "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500",
  "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500",
  "bg-orange-500", "bg-gray-500",
]
const getColorById = (id: number) => colors[id % colors.length]

export default function QuestionDetailPage() {

  const params = useParams()
  const { user, restoreFromStorage } = useUserStore()
  const [question, setQuestion] = useState<any>(null)
  const [replyContent, setReplyContent] = useState("")
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null)
  const [editReplyContent, setEditReplyContent] = useState("")

  useEffect(() => {
    if (!user) restoreFromStorage()
  }, [user, restoreFromStorage])

  const fetchQuestionDetail = async () => {
    if (!params.id) return
    const res = await axios.get(`/api/instructor/questions/detail/${params.id}`, {
      params: { instructorId: user?.instructorId }
    })
    setQuestion(res.data.data)
  }
  

  useEffect(() => {
    if (user) fetchQuestionDetail()
  }, [user, params.id])

  const handleAddReply = async () => {
    if (!replyContent.trim()) return
    await axios.post(`/api/instructor/questions/${params.id}/reply`, {
      content: replyContent
    }, { params: { userId: user?.id } })
    setReplyContent("")
    fetchQuestionDetail()
  }

  const handleUpdateReply = async (replyId: number) => {
    if (!editReplyContent.trim()) return
    await axios.put(`/api/instructor/questions/reply/${replyId}`, {
      content: editReplyContent
    }, { params: { userId: user?.id } })
    setEditingReplyId(null)
    fetchQuestionDetail()
  }

  const handleDeleteReply = async (replyId: number) => {
    await axios.delete(`/api/instructor/questions/reply/${replyId}`, {
      params: { userId: user?.id }
    })
    fetchQuestionDetail()
  }

  if (!question) return null

  return (
    <div className="min-h-screen bg-black text-white">
      <InstructorHeader />
      <div className="flex">
        <InstructorSidebar />
        <main className="ml-64 flex-1 px-6 py-8 pt-24">
          <div className="mb-6">
            <Link href="/instructor/questions" className="inline-flex items-center text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-1" />
              질문 목록으로 돌아가기
            </Link>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-8">
            <h1 className="text-2xl font-bold mb-4">{question.title}</h1>

            <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-4">
              <span>{question.regDate.split("T")[0]}</span>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  {question.likeCount}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {question.replies.length}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {question.viewCount}
                </span>
              </div>
            </div>

              <Badge className="bg-blue-600">{question.courseTitle}</Badge>
            </div>

            <Separator className="my-4 bg-gray-800" />

            <div className="flex items-start gap-4 mb-6">
              {question.profileUrl ? (
                <Image src={question.profileUrl} alt={question.author} width={40} height={40} className="rounded-full" />
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getColorById(question.id)}`}>
                  <span className="text-white font-semibold">{question.author.charAt(0)}</span>
                </div>
              )}
              <div>
                <div className="font-medium mb-2">{question.author}</div>
                <p className="whitespace-pre-line">{question.content}</p>
              </div>
            </div>

            <h2 className="text-xl font-bold mb-4">답변 {question.replies.length}</h2>

            {question.replies.map((reply: any) => (
              <div key={reply.id} className="border border-gray-800 rounded-lg p-4 mb-4 bg-gray-800/50">
                <div className="flex items-start gap-4">
                  {reply.profileUrl ? (
                    <Image src={reply.profileUrl} alt={reply.author} width={40} height={40} className="rounded-full" />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getColorById(reply.userId)}`}>
                      <span className="text-white font-semibold">{reply.author.charAt(0)}</span>
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="font-medium text-green-400">{reply.author}</span>
                        <span className="text-xs text-gray-400 ml-2">{reply.regDate.split("T")[0]}</span>
                      </div>
                      {reply.instructor && <Badge className="bg-green-600">강사</Badge>}
                    </div>

                    {editingReplyId === reply.id ? (
                      <>
                        <Textarea value={editReplyContent} onChange={(e) => setEditReplyContent(e.target.value)} className="bg-gray-700 border-gray-600 text-white mb-2" />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setEditingReplyId(null)}>취소</Button>
                          <Button className="bg-green-600" onClick={() => handleUpdateReply(reply.id)}>수정완료</Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="whitespace-pre-line">{reply.content}</p>
                        <div className="flex justify-end gap-2 mt-2">
                          <Button size="sm" variant="outline" onClick={() => { setEditingReplyId(reply.id); setEditReplyContent(reply.content) }}>
                            <Pencil className="h-4 w-4 mr-1" /> 수정
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-400" onClick={() => handleDeleteReply(reply.id)}>
                            <Trash2 className="h-4 w-4 mr-1" /> 삭제
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-6">
              <h3 className="font-medium mb-2">답변 작성</h3>
              <Textarea placeholder="답변을 작성해주세요..." value={replyContent} onChange={(e) => setReplyContent(e.target.value)} className="min-h-[150px] bg-gray-800 border-gray-700 text-white mb-2" />
              <div className="flex justify-end">
                <Button className="bg-red-600 hover:bg-red-700" onClick={handleAddReply}>답변 등록</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
