"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Clock,
  Award,
  Tag,
  CheckCircle,
  Play,
  Save,
  Send,
  Code,
  Terminal,
  FileCode,
  AlertCircle,
  CheckSquare,
  Clock3,
} from "lucide-react"
import { Button } from "@/components/user/ui/button"
import { Badge } from "@/components/user/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/user/ui/select"
import dynamic from "next/dynamic"
import { useParams } from "next/navigation"
import { codeTemplates } from "@/components/user/coding-test/code"
import useUserStore from "@/app/auth/userStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/user/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/user/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/user/ui/tooltip"

// 동적으로 헤더 import
const NetflixHeader = dynamic(() => import("@/components/netflix-header"), {
  ssr: false,
})

// 타입 정의 추가
interface Example {
  input: string
  output: string
  explanation?: string
}

interface Problem {
  id: number
  title: string
  description: string
  difficulty: string
  category: string
  submissionCount: number
  passRate: number
  createdAt: string
  examples: Example[]
}

interface Submission {
  id: string
  status: "ACCEPTED" | "ERROR" | "PENDING" | "WRONG_ANSWER"
  language: string
  runtime: string
  memory: string
  submittedAt: string
  errorMessage?: string
  code: string
  actualOutput?: string
}

export default function CodingTestDetailPage() {
  const params = useParams()
  const id = Number(params?.id)
  const { user, restoreFromStorage } = useUserStore()

  const [mounted, setMounted] = useState(false)
  const [problem, setProblem] = useState<Problem | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof codeTemplates>("JAVASCRIPT")
  const [code, setCode] = useState(codeTemplates.JAVASCRIPT)
  const [showHints, setShowHints] = useState(false)
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [activeTab, setActiveTab] = useState("problem")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
    restoreFromStorage()
  }, [])

  useEffect(() => {
    if (!mounted || !id) return

    const fetchProblemAndSubmissions = async () => {
      try {
        // 1. 문제 정보와 통계 정보를 따로 호출
        const [problemResponse, statsResponse] = await Promise.all([
          fetch(`/api/coding/problems/${id}`),
          fetch(`/api/coding/problems/${id}/stats`),
        ])

        const problemData = await problemResponse.json()
        const statsData = await statsResponse.json()

        // 백엔드 데이터를 프론트엔드 구조에 맞게 변환
        const formattedProblem = {
          id: problemData.id,
          title: problemData.title,
          description: problemData.description,
          difficulty:
            problemData.difficulty === "EASY" ? "쉬움" : problemData.difficulty === "MEDIUM" ? "보통" : "어려움",
          category: "배열",
          submissionCount: statsData.totalSubmissions || 0,
          passRate: statsData.successRate ? Number(statsData.successRate.toFixed(1)) : 0,
          createdAt: problemData.createdAt,
          examples: [
            {
              input: problemData.inputExample,
              output: problemData.outputExample,
              explanation: "예제 설명",
            },
          ],
        }

        setProblem(formattedProblem)

        // 2. 제출 기록을 추가로 호출
        const submissionsResponse = await fetch(`/api/coding/submissions?problemId=${id}`)
        const submissionsData = await submissionsResponse.json()
        setSubmissions(submissionsData)
      } catch (error) {
        console.error("데이터를 불러오는데 실패했습니다:", error)
      }
    }

    fetchProblemAndSubmissions()
  }, [id, mounted])

  // 언어 변경 시 코드 템플릿 업데이트
  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage as keyof typeof codeTemplates)
    setCode(codeTemplates[newLanguage as keyof typeof codeTemplates])
  }

  if (!mounted || !problem) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <NetflixHeader />
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-indigo-300">문제를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      // localStorage에서 한번 더 확인
      restoreFromStorage()

      if (!user) {
        alert("로그인이 필요합니다.")
        // 로그인 페이지로 리다이렉트 추가
        window.location.href = "/login" // 또는 router.push('/login') 사용
        return
      }

      const response = await fetch(`/api/coding/submissions/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: selectedLanguage,
          code: code,
          userId: user.id,
        }),
      })

      const result = await response.json()

      // 제출 후 제출 기록 새로고침
      const updatedSubmissions = await fetch(`/api/coding/submissions?problemId=${id}`)
      const updatedSubmissionsData = await updatedSubmissions.json()
      setSubmissions(updatedSubmissionsData)

      // 결과에 따른 알림 표시
      alert(result.status === "ACCEPTED" ? "정답입니다!" : "틀렸습니다. 다시 시도해주세요.")

      // 제출 후 자동으로 제출 기록 탭으로 전환
      setActiveTab("submissions")
    } catch (error) {
      console.error("코드 제출에 실패했습니다:", error)
      alert("코드 제출 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "쉬움":
        return "bg-emerald-600 text-white"
      case "보통":
        return "bg-amber-600 text-white"
      case "어려움":
        return "bg-rose-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  // status ENUM을 한글로 변환하는 함수 추가
  const getStatusInKorean = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "성공"
      case "ERROR":
        return "오류"
      case "PENDING":
        return "대기중"
      case "WRONG_ANSWER":
        return "실패"
      default:
        return status
    }
  }

  // 날짜 포맷 함수 추가
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  }

  // 언어별 파일 확장자 가져오기
  const getFileExtension = (language: string) => {
    switch (language) {
      case "JAVASCRIPT":
        return "js"
      case "PYTHON":
        return "py"
      case "JAVA":
        return "java"
      case "C":
        return "c"
      default:
        return "txt"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <NetflixHeader />

      <main className="container mx-auto px-4 py-20">
        <div className="mb-6">
          <Link
            href="/coding-test"
            className="inline-flex items-center text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            문제 목록으로 돌아가기
          </Link>
        </div>

        {/* 문제 헤더 */}
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-6 rounded-xl border border-indigo-800/50 shadow-lg mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{problem.title}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={`${getDifficultyColor(problem.difficulty)} px-3 py-1`}>{problem.difficulty}</Badge>
                <Badge variant="outline" className="border-indigo-700 text-indigo-300 px-3 py-1">
                  {problem.category}
                </Badge>
                <div className="flex items-center text-indigo-300 text-sm">
                  <Tag className="h-4 w-4 mr-1" />
                  <span>제출 수: {problem.submissionCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-indigo-300 text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>통과율: {problem.passRate}%</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-indigo-700 text-indigo-300 hover:bg-indigo-800/50"
                    >
                      <Award className="h-4 w-4 mr-1" />
                      북마크
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>이 문제를 북마크에 추가합니다</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {user && (
                <Link href={`/user/coding-test/submissions/${id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-indigo-700 text-indigo-300 hover:bg-indigo-800/50"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />내 제출 기록
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 왼쪽: 문제 설명 및 제출 기록 (3/5) */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 bg-gray-800/50 p-1 rounded-lg mb-4">
                <TabsTrigger
                  value="problem"
                  className="rounded-md data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                >
                  <FileCode className="h-4 w-4 mr-2" />
                  문제
                </TabsTrigger>
                <TabsTrigger
                  value="submissions"
                  className="rounded-md data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  제출 기록
                </TabsTrigger>
              </TabsList>

              <TabsContent value="problem" className="mt-0">
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-lg">
                  <div className="prose prose-invert max-w-none mb-6">
                    <h2 className="text-xl font-medium mb-4 text-indigo-300">문제 설명</h2>
                    <p className="text-gray-300 leading-relaxed">{problem.description}</p>

                    <h2 className="text-xl font-medium mt-8 mb-4 text-indigo-300">예제</h2>
                    {problem.examples.map((example, index) => (
                      <div key={index} className="mb-6 bg-gray-900/80 p-5 rounded-lg border border-gray-700/50">
                        <div className="mb-3">
                          <h3 className="font-medium text-indigo-300 mb-2">입력:</h3>
                          <pre className="bg-gray-950 p-3 rounded-md text-gray-300 font-mono text-sm overflow-x-auto">
                            {example.input}
                          </pre>
                        </div>
                        <div className="mb-3">
                          <h3 className="font-medium text-indigo-300 mb-2">출력:</h3>
                          <pre className="bg-gray-950 p-3 rounded-md text-gray-300 font-mono text-sm overflow-x-auto">
                            {example.output}
                          </pre>
                        </div>
                        {example.explanation && (
                          <div>
                            <h3 className="font-medium text-indigo-300 mb-2">설명:</h3>
                            <p className="text-gray-300">{example.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="submissions" className="mt-0">
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-lg">
                  <h2 className="text-xl font-medium mb-4 text-indigo-300">제출 기록</h2>

                  {submissions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-700/50">
                            <th className="py-3 px-4 text-left text-gray-400 font-medium">상태</th>
                            <th className="py-3 px-4 text-left text-gray-400 font-medium">언어</th>
                            <th className="py-3 px-4 text-left text-gray-400 font-medium">실행 시간</th>
                            <th className="py-3 px-4 text-left text-gray-400 font-medium">메모리</th>
                            <th className="py-3 px-4 text-left text-gray-400 font-medium">제출 시간</th>
                            <th className="py-3 px-4 text-left text-gray-400 font-medium">코드</th>
                          </tr>
                        </thead>
                        <tbody>
                          {submissions.map((submission) => (
                            <tr
                              key={submission.id}
                              className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors"
                            >
                              <td className="py-4 px-4">
                                <Badge className={submission.status === "ACCEPTED" ? "bg-emerald-600" : "bg-rose-600"}>
                                  {getStatusInKorean(submission.status)}
                                </Badge>
                              </td>
                              <td className="py-4 px-4">
                                <Badge variant="outline" className="border-gray-600 text-gray-300">
                                  {submission.language}
                                </Badge>
                              </td>
                              <td className="py-4 px-4 text-gray-300">{submission.runtime}</td>
                              <td className="py-4 px-4 text-gray-300">{submission.memory}</td>
                              <td className="py-4 px-4 text-gray-300">{formatDate(submission.submittedAt)}</td>
                              <td className="py-4 px-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30"
                                  onClick={() => {
                                    setSelectedSubmission(submission)
                                    setShowCodeModal(true)
                                  }}
                                >
                                  <Code className="h-4 w-4 mr-1" />
                                  코드 보기
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <AlertCircle className="h-12 w-12 mb-4 text-gray-500" />
                      <p>아직 제출 기록이 없습니다.</p>
                      <p className="text-sm mt-2">코드를 작성하고 제출해보세요!</p>
                    </div>
                  )}

                  {submissions.some((s) => s.status === "WRONG_ANSWER" && s.errorMessage) && (
                    <div className="mt-6 bg-rose-900/20 p-4 rounded-lg border border-rose-800/50">
                      <h3 className="font-medium mb-2 text-rose-400 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        오류 메시지
                      </h3>
                      <pre className="text-rose-300 bg-rose-950/50 p-3 rounded-md font-mono text-sm overflow-x-auto">
                        {submissions.find((s) => s.status === "WRONG_ANSWER" && s.errorMessage)?.errorMessage}
                      </pre>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* 오른쪽: 코드 에디터 (2/5) */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-lg sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium text-indigo-300 flex items-center">
                  <Terminal className="h-5 w-5 mr-2" />
                  코드 작성
                </h2>
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700 focus:ring-indigo-500">
                    <SelectValue placeholder="언어 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="JAVASCRIPT">JavaScript</SelectItem>
                    <SelectItem value="PYTHON">Python</SelectItem>
                    <SelectItem value="JAVA">Java</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
                <div className="bg-gray-900 rounded-t-md p-2 text-sm text-gray-400 border border-gray-700 border-b-0 flex justify-between items-center">
                  <div className="flex items-center">
                    <FileCode className="h-4 w-4 mr-1.5 text-indigo-400" />
                    {selectedLanguage === "JAVASCRIPT" && "solution.js"}
                    {selectedLanguage === "PYTHON" && "solution.py"}
                    {selectedLanguage === "JAVA" && "Main.java"}
                    {selectedLanguage === "C" && "solution.c"}
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="border-gray-700 text-gray-400 text-xs">
                      {getFileExtension(selectedLanguage)}
                    </Badge>
                  </div>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-[450px] bg-gray-900 text-gray-200 font-mono p-4 rounded-b-md border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  spellCheck="false"
                />
              </div>

              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        저장
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>코드를 저장합니다</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        실행
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>코드를 실행하여 결과를 확인합니다</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Clock3 className="h-4 w-4 mr-1 animate-spin" />
                      제출 중...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1" />
                      제출
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-4 text-xs text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>자동 저장됨: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 코드 표시 모달 */}
      <Dialog open={showCodeModal} onOpenChange={setShowCodeModal}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <Code className="h-5 w-5 mr-2 text-indigo-400" />
              제출한 코드
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="bg-gray-950 rounded-md p-4 border border-gray-800">
              <div className="flex justify-between items-center mb-2 text-sm text-gray-400">
                <div className="flex items-center">
                  <FileCode className="h-4 w-4 mr-1.5 text-indigo-400" />
                  {selectedSubmission?.language === "JAVASCRIPT" && "solution.js"}
                  {selectedSubmission?.language === "PYTHON" && "solution.py"}
                  {selectedSubmission?.language === "JAVA" && "Main.java"}
                  {selectedSubmission?.language === "C" && "solution.c"}
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={selectedSubmission?.status === "ACCEPTED" ? "bg-emerald-600" : "bg-rose-600"}>
                    {selectedSubmission && getStatusInKorean(selectedSubmission.status)}
                  </Badge>
                  <Badge variant="outline" className="border-gray-700 text-gray-300">
                    {selectedSubmission?.language}
                  </Badge>
                </div>
              </div>
              <pre className="text-sm font-mono whitespace-pre-wrap text-gray-300 overflow-x-auto max-h-[400px] overflow-y-auto">
                {selectedSubmission?.code}
              </pre>
            </div>
            {selectedSubmission?.actualOutput && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-indigo-400 mb-2 flex items-center">
                  <Terminal className="h-4 w-4 mr-1.5" />
                  실행 결과
                </h3>
                <div className="bg-gray-950 rounded-md p-4 border border-gray-800">
                  <pre className="text-sm font-mono whitespace-pre-wrap text-gray-300 overflow-x-auto max-h-[200px] overflow-y-auto">
                    {selectedSubmission.actualOutput}
                  </pre>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  실행 시간: {selectedSubmission?.runtime}
                </div>
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  메모리: {selectedSubmission?.memory}
                </div>
              </div>
              <div>제출 시간: {selectedSubmission && formatDate(selectedSubmission.submittedAt)}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
