"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import {
  Search,
  Filter,
  Users,
  Check,
  CheckCircle,
  Code,
  Trophy,
  BookOpen,
  Clock,
  BarChart,
  Zap,
  X,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Loader2,
  Flame,
  Award,
  Star,
  Tag,
  FileCode,
  Brain,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/user/ui/button"
import { Input } from "@/components/user/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/user/ui/accordion"
import { Checkbox } from "@/components/user/ui/checkbox"
import { Label } from "@/components/user/ui/label"
import { Badge } from "@/components/user/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/user/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/user/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/user/ui/tooltip"
import NetflixHeader from "@/components/netflix-header"
import useUserStore from "@/app/auth/userStore"

// 타입 정의
interface ProblemData {
  id: number
  title: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  description: string
  inputExample: string
  outputExample: string
  participants: number
  successRate: number
  status: "SUCCESS" | "FAIL" | "NOT_ATTEMPTED"
}

interface CodingTest {
  id: number
  title: string
  difficulty: string
  participants: number
  successRate: number
  status: "SUCCESS" | "FAIL" | "NOT_ATTEMPTED"
}

// 사용자 진행률 타입 정의
interface UserProgress {
  totalProblems: number
  solvedProblems: number
  progressRate: number
}

export default function CodingTestPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [codingTests, setCodingTests] = useState<CodingTest[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const { user, restoreFromStorage } = useUserStore()
  const [activeTab, setActiveTab] = useState("all")

  // 사용자 진행률 상태
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalProblems: 0,
    solvedProblems: 0,
    progressRate: 0,
  })

  // 컴포넌트 마운트 시 로컬 스토리지에서 유저 정보 복원
  useEffect(() => {
    restoreFromStorage()
  }, [])

  // 진행률 데이터를 가져오는 함수
  const fetchUserProgress = async (userId: string) => {
    try {
      const response = await fetch(`/api/coding/submissions/progress?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Progress data fetch failed")
      }

      const data = await response.json()

      // null 체크를 추가하여 더 안전하게 처리
      setUserProgress({
        totalProblems: data?.totalProblems ?? 0,
        solvedProblems: data?.solvedProblems ?? 0,
        progressRate: data?.progressRate ?? 0,
      })
    } catch (error) {
      console.error("진행률을 불러오는데 실패했습니다:", error)
      // 에러 발생 시 기본값 설정
      setUserProgress({
        totalProblems: 0,
        solvedProblems: 0,
        progressRate: 0,
      })
    }
  }

  // 문제 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // user.id가 있으면 진행률 데이터 가져오기
        if (user && user.id) {
          await fetchUserProgress(user.id.toString())
        }

        // 문제 목록 가져오기
        const endpoint = user ? `/api/coding/problems?userId=${user.id}` : "/api/coding/problems"
        const response = await fetch(endpoint)
        const data = await response.json()

        const mappedData: CodingTest[] = data.map((problem: ProblemData) => ({
          id: problem.id,
          title: problem.title,
          difficulty: problem.difficulty === "EASY" ? "초급" : problem.difficulty === "MEDIUM" ? "중급" : "고급",
          participants: problem.participants,
          successRate: problem.successRate,
          status: user ? problem.status : "NOT_ATTEMPTED",
        }))

        setCodingTests(mappedData)
      } catch (error) {
        console.error("데이터를 불러오는데 실패했습니다:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // 페이지네이션 계산
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber: number): void => {
    setCurrentPage(pageNumber)
    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // 필터링된 문제 목록 (메모이제이션)
  const filteredProblems = useMemo(() => {
    return codingTests
      .filter((problem) => {
        const matchesSearch = searchQuery === "" || problem.title.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesDifficulty = selectedDifficulties.length === 0 || selectedDifficulties.includes(problem.difficulty)
        const matchesTab =
          activeTab === "all" ||
          (activeTab === "solved" && problem.status === "SUCCESS") ||
          (activeTab === "unsolved" && problem.status !== "SUCCESS")
        return matchesSearch && matchesDifficulty && matchesTab
      })
      .sort((a, b) => {
        // 성공한 문제를 상단에 표시
        if (activeTab === "solved" && a.status === "SUCCESS" && b.status === "SUCCESS") {
          return 0
        }
        // 난이도별 정렬 (초급 -> 중급 -> 고급)
        const difficultyOrder = { 초급: 1, 중급: 2, 고급: 3 }
        return (
          difficultyOrder[a.difficulty as keyof typeof difficultyOrder] -
          difficultyOrder[b.difficulty as keyof typeof difficultyOrder]
        )
      })
  }, [codingTests, searchQuery, selectedDifficulties, activeTab])

  // 현재 페이지의 문제 목록
  const currentProblems = filteredProblems.slice(indexOfFirstItem, indexOfLastItem)

  // 필터 초기화 함수
  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedDifficulties([])
  }

  // 난이도 체크박스 핸들러
  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulties((prev) => {
      if (difficulty === "전체") {
        return []
      }
      if (prev.includes(difficulty)) {
        return prev.filter((d) => d !== difficulty)
      }
      return [...prev, difficulty]
    })
  }

  // 난이도별 배지 색상
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "초급":
        return "bg-emerald-600 text-white"
      case "중급":
        return "bg-amber-600 text-white"
      case "고급":
        return "bg-rose-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  // 난이도별 아이콘
  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "초급":
        return <BookOpen className="h-4 w-4" />
      case "중급":
        return <Flame className="h-4 w-4" />
      case "고급":
        return <Zap className="h-4 w-4" />
      default:
        return <Tag className="h-4 w-4" />
    }
  }

  // 상태별 배지 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-emerald-600 text-white"
      case "FAIL":
        return "bg-rose-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  // 상태별 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "성공"
      case "FAIL":
        return "실패"
      default:
        return "미시도"
    }
  }

  // 로딩 화면
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <NetflixHeader />
        <div className="container mx-auto px-4 pt-24 pb-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-indigo-300">코딩 테스트 문제를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <NetflixHeader />

      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* 헤더 섹션 */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white flex items-center">
                <Code className="h-8 w-8 mr-2 text-indigo-400" />
                코딩 테스트 연습
              </h1>
              <p className="text-gray-400">다양한 알고리즘 문제를 풀고 코딩 실력을 향상시켜보세요.</p>
            </div>
            {user && (
              <div className="flex gap-3">
                <Button variant="outline" className="border-indigo-700 text-indigo-300 hover:bg-indigo-900/50">
                  <BookOpen className="h-4 w-4 mr-2" />
                  학습 가이드
                </Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Trophy className="h-4 w-4 mr-2" />
                  랭킹 보기
                </Button>
              </div>
            )}
          </div>

          {/* 사용자 진행 상황 */}
          {user && (
            <Card className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-indigo-800/50 shadow-lg mb-8">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <Award className="h-5 w-5 mr-2 text-indigo-400" />내 진행 상황
                </CardTitle>
                <CardDescription>
                  지금까지 {userProgress.totalProblems}개 중 {userProgress.solvedProblems}개의 문제를 해결했습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-indigo-300 flex items-center">
                        <BarChart className="h-4 w-4 mr-1" />
                        전체 진행률
                      </span>
                      <span className="text-lg font-medium">
                        {userProgress.solvedProblems}/{userProgress.totalProblems} 문제
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${userProgress.progressRate}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-right text-sm text-indigo-300">
                      {userProgress.progressRate?.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex items-center text-sm text-gray-400">
                  <Clock className="h-4 w-4 mr-1" />
                  마지막 업데이트: {new Date().toLocaleDateString()}
                </div>
              </CardFooter>
            </Card>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 왼쪽: 필터 */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700/50 shadow-lg sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-medium flex items-center text-white">
                  <Filter className="h-4 w-4 mr-2 text-indigo-400" />
                  필터
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-gray-400 hover:text-white hover:bg-gray-700/50"
                  onClick={handleResetFilters}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  초기화
                </Button>
              </div>

              <div className="mb-5">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="문제 검색"
                    className="pl-9 bg-gray-900 border-gray-700 text-white focus-visible:ring-indigo-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <Accordion type="multiple" defaultValue={["difficulty"]} className="space-y-3">
                <AccordionItem value="difficulty" className="border-gray-700">
                  <AccordionTrigger className="py-2 text-indigo-300 hover:text-indigo-200">난이도</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center">
                        <Checkbox
                          id="difficulty-all"
                          className="border-gray-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                          checked={selectedDifficulties.length === 0}
                          onCheckedChange={() => handleDifficultyChange("전체")}
                        />
                        <Label htmlFor="difficulty-all" className="ml-2 text-sm text-gray-300 cursor-pointer">
                          전체
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox
                          id="difficulty-beginner"
                          className="border-gray-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                          checked={selectedDifficulties.includes("초급")}
                          onCheckedChange={() => handleDifficultyChange("초급")}
                        />
                        <Label
                          htmlFor="difficulty-beginner"
                          className="ml-2 text-sm text-emerald-400 flex items-center cursor-pointer"
                        >
                          <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                          초급
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox
                          id="difficulty-intermediate"
                          className="border-gray-600 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                          checked={selectedDifficulties.includes("중급")}
                          onCheckedChange={() => handleDifficultyChange("중급")}
                        />
                        <Label
                          htmlFor="difficulty-intermediate"
                          className="ml-2 text-sm text-amber-400 flex items-center cursor-pointer"
                        >
                          <Flame className="h-3.5 w-3.5 mr-1.5" />
                          중급
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox
                          id="difficulty-advanced"
                          className="border-gray-600 data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                          checked={selectedDifficulties.includes("고급")}
                          onCheckedChange={() => handleDifficultyChange("고급")}
                        />
                        <Label
                          htmlFor="difficulty-advanced"
                          className="ml-2 text-sm text-rose-400 flex items-center cursor-pointer"
                        >
                          <Zap className="h-3.5 w-3.5 mr-1.5" />
                          고급
                        </Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {user && (
                  <AccordionItem value="status" className="border-gray-700">
                    <AccordionTrigger className="py-2 text-indigo-300 hover:text-indigo-200">상태</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center">
                          <Checkbox
                            id="status-all"
                            className="border-gray-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            checked={activeTab === "all"}
                            onCheckedChange={() => setActiveTab("all")}
                          />
                          <Label htmlFor="status-all" className="ml-2 text-sm text-gray-300 cursor-pointer">
                            전체
                          </Label>
                        </div>
                        <div className="flex items-center">
                          <Checkbox
                            id="status-solved"
                            className="border-gray-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                            checked={activeTab === "solved"}
                            onCheckedChange={() => setActiveTab(activeTab === "solved" ? "all" : "solved")}
                          />
                          <Label
                            htmlFor="status-solved"
                            className="ml-2 text-sm text-emerald-400 flex items-center cursor-pointer"
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                            해결한 문제
                          </Label>
                        </div>
                        <div className="flex items-center">
                          <Checkbox
                            id="status-unsolved"
                            className="border-gray-600 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                            checked={activeTab === "unsolved"}
                            onCheckedChange={() => setActiveTab(activeTab === "unsolved" ? "all" : "unsolved")}
                          />
                          <Label
                            htmlFor="status-unsolved"
                            className="ml-2 text-sm text-amber-400 flex items-center cursor-pointer"
                          >
                            <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                            미해결 문제
                          </Label>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                <AccordionItem value="categories" className="border-gray-700">
                  <AccordionTrigger className="py-2 text-indigo-300 hover:text-indigo-200">카테고리</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center">
                        <Checkbox
                          id="category-all"
                          className="border-gray-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                          checked={true}
                        />
                        <Label htmlFor="category-all" className="ml-2 text-sm text-gray-300 cursor-pointer">
                          전체
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox id="category-array" className="border-gray-600" disabled />
                        <Label htmlFor="category-array" className="ml-2 text-sm text-gray-500 cursor-not-allowed">
                          배열
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox id="category-string" className="border-gray-600" disabled />
                        <Label htmlFor="category-string" className="ml-2 text-sm text-gray-500 cursor-not-allowed">
                          문자열
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox id="category-dp" className="border-gray-600" disabled />
                        <Label htmlFor="category-dp" className="ml-2 text-sm text-gray-500 cursor-not-allowed">
                          동적 프로그래밍
                        </Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* 필터 결과 요약 */}
              <div className="mt-6 p-4 bg-indigo-900/20 rounded-lg border border-indigo-800/30">
                <h3 className="text-sm font-medium text-indigo-300 mb-2">필터 결과</h3>
                <div className="text-sm text-gray-400">
                  <p>총 {filteredProblems.length}개 문제</p>
                  {selectedDifficulties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedDifficulties.map((diff) => (
                        <Badge key={diff} className={getDifficultyColor(diff)}>
                          {diff}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {searchQuery && (
                    <p className="mt-2">
                      검색어: <span className="text-indigo-300">"{searchQuery}"</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 코딩 테스트 목록 */}
          <div className="flex-1">
            <div className="mb-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                <div className="flex items-center">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <FileCode className="h-5 w-5 mr-2 text-indigo-400" />
                    문제 목록
                  </h2>
                  <Badge className="ml-3 bg-indigo-600 text-white">{filteredProblems.length}개</Badge>
                </div>

                {user && (
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                    <TabsList className="bg-gray-800/50 p-1 rounded-lg">
                      <TabsTrigger
                        value="all"
                        className="rounded-md data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                      >
                        전체
                      </TabsTrigger>
                      <TabsTrigger
                        value="solved"
                        className="rounded-md data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                        해결
                      </TabsTrigger>
                      <TabsTrigger
                        value="unsolved"
                        className="rounded-md data-[state=active]:bg-amber-600 data-[state=active]:text-white"
                      >
                        <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                        미해결
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}
              </div>

              {/* 문제 목록 테이블 */}
              <Card className="bg-gray-800/50 border-gray-700/50 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-700/50 bg-gray-900/30">
                        <th className="py-3 px-4 text-left text-gray-400 font-medium">문제</th>
                        <th className="py-3 px-4 text-left text-gray-400 font-medium">난이도</th>
                        <th className="py-3 px-4 text-left text-gray-400 font-medium">참여자</th>
                        <th className="py-3 px-4 text-left text-gray-400 font-medium">정답비율</th>
                        {user && <th className="py-3 px-4 text-left text-gray-400 font-medium">상태</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {currentProblems.length > 0 ? (
                        currentProblems.map((test) => (
                          <tr
                            key={test.id}
                            className="border-b border-gray-700/50 hover:bg-indigo-900/10 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <Link
                                href={`/user/coding-test/${test.id}`}
                                className="font-medium text-indigo-300 hover:text-indigo-200 transition-colors flex items-center"
                              >
                                <Brain className="h-4 w-4 mr-2 text-indigo-400" />
                                {test.title}
                              </Link>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center text-gray-300">
                                {getDifficultyIcon(test.difficulty)}
                                <span className="ml-2">{test.difficulty}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center text-gray-300">
                                <Users className="h-4 w-4 mr-1.5 text-indigo-400" />
                                <span>{test.participants.toLocaleString()}명</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center">
                                {user && test.status === "SUCCESS" ? (
                                  <div className="flex items-center text-emerald-500">
                                    <Check className="h-4 w-4 mr-1.5" />
                                    <span>{test.successRate.toFixed(1)}%</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-300">{test.successRate.toFixed(1)}%</span>
                                )}
                              </div>
                            </td>
                            {user && (
                              <td className="py-4 px-4">
                                {test.status === "SUCCESS" ? (
                                  <div className="flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                      <Check className="h-4 w-4 text-white" />
                                    </div>
                                  </div>
                                ) : test.status === "FAIL" ? (
                                  <div className="flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-full bg-gray-600"></div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-full bg-gray-600"></div>
                                  </div>
                                )}
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={user ? 5 : 4} className="py-8 text-center text-gray-400">
                            <div className="flex flex-col items-center">
                              <AlertCircle className="h-8 w-8 mb-2 text-gray-500" />
                              <p>검색 결과가 없습니다.</p>
                              <Button
                                variant="link"
                                className="text-indigo-400 hover:text-indigo-300 mt-2"
                                onClick={handleResetFilters}
                              >
                                필터 초기화하기
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* 페이지네이션 */}
              {filteredProblems.length > 0 && (
                <div className="flex justify-center mt-6">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.ceil(filteredProblems.length / itemsPerPage) }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={
                            currentPage === page
                              ? "bg-indigo-600 hover:bg-indigo-700"
                              : "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                          }
                        >
                          {page}
                        </Button>
                      ),
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === Math.ceil(filteredProblems.length / itemsPerPage)}
                      className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* 추천 문제 섹션 */}
            {user && (
              <Card className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-purple-800/50 shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
                    추천 문제
                  </CardTitle>
                  <CardDescription>당신의 실력에 맞는 문제를 추천해 드립니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {codingTests
                      .filter((p) => p.status !== "SUCCESS")
                      .slice(0, 3)
                      .map((problem) => (
                        <Link
                          key={problem.id}
                          href={`/user/coding-test/${problem.id}`}
                          className="bg-gray-800/50 hover:bg-gray-800 rounded-lg p-4 border border-gray-700/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</Badge>
                            <div className="flex items-center text-gray-400 text-sm">
                              <Star className="h-3.5 w-3.5 mr-1 text-amber-500" />
                              <span>{problem.successRate.toFixed(1)}%</span>
                            </div>
                          </div>
                          <h3 className="font-medium text-indigo-300 mb-2">{problem.title}</h3>
                          <div className="flex items-center text-gray-400 text-sm">
                            <Users className="h-3.5 w-3.5 mr-1.5" />
                            <span>{problem.participants.toLocaleString()}명 참여</span>
                          </div>
                        </Link>
                      ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="text-indigo-400 hover:text-indigo-300 p-0">
                    더 많은 추천 문제 보기 <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* 학습 가이드 */}
            <Card className="bg-gray-800/50 border-gray-700/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-indigo-400" />
                  알고리즘 학습 가이드
                </CardTitle>
                <CardDescription>코딩 테스트 준비를 위한 학습 로드맵을 확인하세요.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 rounded-lg p-4 border border-emerald-800/30">
                    <div className="flex items-center mb-3">
                      <div className="bg-emerald-900/50 p-2 rounded-lg mr-3">
                        <BookOpen className="h-5 w-5 text-emerald-400" />
                      </div>
                      <h3 className="font-medium text-emerald-400">기초 알고리즘</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      배열, 문자열, 해시맵 등 기본 자료구조와 알고리즘을 학습합니다.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-emerald-800 text-emerald-400 hover:bg-emerald-900/50"
                    >
                      학습하기
                    </Button>
                  </div>

                  <div className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 rounded-lg p-4 border border-amber-800/30">
                    <div className="flex items-center mb-3">
                      <div className="bg-amber-900/50 p-2 rounded-lg mr-3">
                        <Flame className="h-5 w-5 text-amber-400" />
                      </div>
                      <h3 className="font-medium text-amber-400">중급 알고리즘</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      그래프, 트리, 동적 프로그래밍 등 심화 알고리즘을 학습합니다.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-amber-800 text-amber-400 hover:bg-amber-900/50"
                    >
                      학습하기
                    </Button>
                  </div>

                  <div className="bg-gradient-to-br from-rose-900/20 to-rose-800/10 rounded-lg p-4 border border-rose-800/30">
                    <div className="flex items-center mb-3">
                      <div className="bg-rose-900/50 p-2 rounded-lg mr-3">
                        <Zap className="h-5 w-5 text-rose-400" />
                      </div>
                      <h3 className="font-medium text-rose-400">고급 알고리즘</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      최적화 문제, 고급 자료구조, 복잡한 알고리즘을 학습합니다.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-rose-800 text-rose-400 hover:bg-rose-900/50"
                    >
                      학습하기
                    </Button>
                  </div>

                  <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-lg p-4 border border-purple-800/30">
                    <div className="flex items-center mb-3">
                      <div className="bg-purple-900/50 p-2 rounded-lg mr-3">
                        <Trophy className="h-5 w-5 text-purple-400" />
                      </div>
                      <h3 className="font-medium text-purple-400">실전 연습</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">실제 코딩 테스트와 유사한 환경에서 문제를 풀어봅니다.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-purple-800 text-purple-400 hover:bg-purple-900/50"
                    >
                      시작하기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
