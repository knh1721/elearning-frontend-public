"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
  ChevronDown,
  Clock,
  Eye,
  Filter,
  Flame,
  MessageSquare,
  Search,
  ThumbsUp,
  TrendingUp,
  FileText,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/user/ui/button"
import { Badge } from "@/components/user/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/user/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/user/ui/tabs"
import { Skeleton } from "@/components/user/ui/skeleton"
import NetflixHeader from "@/components/netflix-header"
import Pagination from "@/components/user/coding-test/pagination"
import useUserStore from "@/app/auth/userStore"
import { useRouter } from "next/navigation"

const colors = [
  "bg-indigo-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-gray-500",
]
const getColorById = (id: number) => colors[id % colors.length]

interface Author {
  userId: number
  name: string
  image: string
  level: string
}

interface Post {
  id: number
  title: string
  content: string
  author: Author
  likes: number
  views: number
  comments: number
  courseSubject: string
  createdAt: string
  category: string
}

interface PopularPost {
  id: number
  title: string
  userId: number
  userName: string
  profileImage: string
}

interface CommunityInfo {
  allPosts: Post[]
  weeklyPopularPosts: PopularPost[]
  monthlyPopularPosts: PopularPost[]
}

interface TopWriter {
  userId: number
  nickname: string
  profileUrl: string
  postCount: number
}

interface UserStats {
  postCount: number
  commentCount: number
}

const CATEGORIES = [
  { id: "all", name: "전체", icon: Filter, color: "bg-gradient-to-r from-gray-500 to-gray-700" },
  { id: "qna", name: "질문및답변", icon: MessageSquare, color: "bg-gradient-to-r from-red-600 to-red-800" },
  { id: "projects", name: "프로젝트", icon: Clock, color: "bg-gradient-to-r from-blue-600 to-blue-800" },
  { id: "free", name: "자유게시판", icon: Flame, color: "bg-gradient-to-r from-green-600 to-green-800" },
]

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [weeklyPopular, setWeeklyPopular] = useState<PopularPost[]>([])
  const [monthlyPopular, setMonthlyPopular] = useState<PopularPost[]>([])
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState<UserStats>({ postCount: 0, commentCount: 0 })

  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("latest")

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const { user, restoreFromStorage } = useUserStore()

  const [topWriters, setTopWriters] = useState<TopWriter[]>([])
  const router = useRouter()

  // 절대 경로를 사용하여 API 요청
  const API_URL = typeof window !== 'undefined'
    ? `${window.location.origin}/api/community`
    : '/api/community'

  const API_URL2 = `/api/user/community`

  const handleWriterClick = async (userId: number) => {
    try {
      const res = await fetch(`${API_URL}/instructorId?userId=${userId}`)
      const result = await res.json()
      const instructorId = result.data

      if (instructorId) {
        router.push(`/instructor/${instructorId}/home`)
      } else {
        router.push(`/user/${userId}/home`)
      }
    } catch (error) {
      console.error("이동 오류:", error)
    }
  }

  const fetchUserStats = async (userId: number) => {
    try {
      const response = await fetch(`${API_URL2}/userStats?userId=${userId}`)
      const result = await response.json()
      console.log(result)
      if (result.data) {
        setUserStats({
          postCount: result.data.postCount || 0,
          commentCount: result.data.commentCount || 0,
        })
      }
    } catch (error) {
      console.error("사용자 통계 로딩 실패:", error)
      setUserStats({ postCount: 0, commentCount: 0 })
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [communityRes, writersRes] = await Promise.all([
        fetch(`${API_URL}`),
        fetch(`${API_URL}/top-writers`)
      ])
      const communityData: CommunityInfo = (await communityRes.json()).data
      const topWriterData: TopWriter[] = (await writersRes.json()).data

      setPosts(communityData.allPosts)
      setWeeklyPopular(communityData.weeklyPopularPosts)
      setMonthlyPopular(communityData.monthlyPopularPosts)
      setTopWriters(topWriterData)

      // 사용자 통계 가져오기
      if (user && user.id) {
        await fetchUserStats(user.id)
      }
    } catch (err) {
      console.error("데이터 로딩 실패:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    restoreFromStorage()
    fetchData()
  }, [])

  useEffect(() => {
    if (user && user.id) {
      fetchUserStats(user.id)
    }
  }, [user])

  const sortedPosts = [...posts].sort((a, b) => {
    switch (sortBy) {
      case "latest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "popular":
        return b.likes - a.likes
      case "views":
        return b.views - a.views
      case "comments":
        return b.comments - a.comments
      default:
        return 0
    }
  })

  const selectedCategoryName = CATEGORIES.find((c) => c.id === selectedCategory)?.name || ""

  const filteredPosts = sortedPosts.filter((post) => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategoryName
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const indexOfLastPost = currentPage * itemsPerPage
  const indexOfFirstPost = indexOfLastPost - itemsPerPage
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60))
        return `${diffMinutes}분 전`
      }
      return `${diffHours}시간 전`
    } else if (diffDays < 7) {
      return `${diffDays}일 전`
    } else {
      return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
    }
  }

  // Helper function to get category icon
  const getCategoryIcon = (categoryName: string) => {
    const category = CATEGORIES.find((c) => c.name === categoryName)
    if (category) {
      const Icon = category.icon
      return <Icon className="h-3.5 w-3.5 mr-1 text-indigo-400" />
    }
    return <Filter className="h-3.5 w-3.5 mr-1 text-indigo-400" />
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NetflixHeader />

      <main className="container mx-auto px-4 py-20">
        {/* 알바스토리 스타일 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-7 w-7 text-indigo-500" />
            <h1 className="text-3xl font-bold">개발자 커뮤니티</h1>
            <div className="bg-indigo-600 h-7 px-3 flex items-center rounded-full">
              <span className="text-white text-xs font-medium">함께 성장하는 개발자들의 공간</span>
            </div>
          </div>
          <div className="h-1 w-full bg-indigo-600 mt-2"></div>
        </div>

        {/* 검색 영역 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="궁금한 내용을 검색해보세요!"
                className="w-full bg-gray-900 border border-gray-800 rounded-lg py-3 px-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 좌측: 사이드바 콘텐츠 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* 사용자 정보 섹션 */}
            {user ? (
              <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg border border-gray-800 p-4 shadow-xl shadow-black/20">
                <div className="flex items-center gap-3 mb-3">
                  {user.profileUrl ? (
                    <img
                      src={user.profileUrl || "/placeholder.svg"}
                      alt={user.nickname}
                      className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500"
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${getColorById(user.id)} border-2 border-indigo-500`}
                    >
                      <span className="text-white font-semibold">{user.nickname?.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{user.nickname}</p>
                    <p className="text-xs text-gray-400">환영합니다!</p>
                  </div>
                </div>

                {/* 사용자 통계 정보 */}
                <div className="grid grid-cols-2 gap-2 mb-3 bg-gray-800/50 rounded-lg p-2">
                  <div className="flex items-center gap-2 p-2">
                    <div className="p-1.5 bg-indigo-900/50 rounded-md">
                      <FileText className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">작성한 글</p>
                      <p className="font-medium text-indigo-300">{userStats.postCount}개</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2">
                    <div className="p-1.5 bg-indigo-900/50 rounded-md">
                      <MessageSquare className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">작성한 댓글</p>
                      <p className="font-medium text-indigo-300">{userStats.commentCount}개</p>
                    </div>
                  </div>
                </div>

                <Link href="/user/community/write">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">새 글 작성하기</Button>
                </Link>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg border border-gray-800 p-4 shadow-xl shadow-black/20">
                <p className="text-center mb-3">로그인하고 커뮤니티에 참여하세요!</p>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => router.push("/auth/user/login")}
                >
                  로그인
                </Button>
              </div>
            )}

            {/* 인기 게시글 섹션 */}
            <div className="space-y-6">
              <Tabs defaultValue="weekly" className="w-full">
                <TabsList className="w-full bg-gray-900 border border-gray-800">
                  <TabsTrigger value="weekly" className="flex-1 data-[state=active]:bg-indigo-600">
                    <Clock className="h-4 w-4 mr-2 text-indigo-500" /> 주간 인기
                  </TabsTrigger>
                  <TabsTrigger value="monthly" className="flex-1 data-[state=active]:bg-indigo-600">
                    <TrendingUp className="h-4 w-4 mr-2 text-indigo-500" /> 월간 인기
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="weekly">
                  <PopularSection title="주간 인기 게시글" posts={weeklyPopular} loading={loading} />
                </TabsContent>
                <TabsContent value="monthly">
                  <PopularSection title="월간 인기 게시글" posts={monthlyPopular} loading={loading} />
                </TabsContent>
              </Tabs>
            </div>

            {/* TOP Writers Section */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden shadow-xl shadow-black/20">
              <div className="p-4 border-b border-gray-800">
                <h2 className="text-lg font-medium">TOP Writers</h2>
              </div>
              <div className="p-4 space-y-3">
                {Array.isArray(topWriters) &&
                  topWriters.map((writer, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => handleWriterClick(writer.userId)}
                    >
                      <div className="flex items-center gap-2">
                        {writer.profileUrl ? (
                          <img
                            src={writer.profileUrl || "/placeholder.svg"}
                            alt={writer.nickname}
                            className="w-8 h-8 rounded-full object-cover border border-gray-700"
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${getColorById(writer.userId)}`}
                          >
                            <span className="text-white text-xs font-semibold">
                              {writer.nickname.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-300">{writer.nickname}</span>
                      </div>
                      <span className="text-sm text-gray-400">{writer.postCount}</span>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>

          {/* 중앙 및 우측: 카테고리 탭 및 게시글 목록 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-3"
          >
            {/* 카테고리 탭 - 가로로 변경 */}
            <div className="mb-6">
              <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                <div className="flex">
                  {CATEGORIES.map((category) => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.id}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-colors ${
                          selectedCategory === category.id
                            ? "bg-indigo-500/10 text-indigo-500 border-b-2 border-indigo-500"
                            : "text-gray-400 hover:bg-gray-800/50"
                        }`}
                        onClick={() => {
                          setSelectedCategory(category.id)
                          setCurrentPage(1)
                        }}
                      >
                        <Icon className="h-5 w-5 text-indigo-500" />
                        <span>{category.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-400">총 {filteredPosts.length}개의 게시글</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-400">
                    {
                      {
                        latest: "최신순",
                        popular: "인기순",
                        views: "조회순",
                        comments: "댓글순",
                      }[sortBy]
                    }
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-32 bg-gray-900 border-gray-800">
                  {[
                    { id: "latest", name: "최신순", icon: Clock },
                    { id: "popular", name: "인기순", icon: ThumbsUp },
                    { id: "views", name: "조회순", icon: Eye },
                    { id: "comments", name: "댓글순", icon: MessageSquare },
                  ].map((option) => {
                    const Icon = option.icon
                    return (
                      <DropdownMenuItem
                        key={option.id}
                        onClick={() => {
                          setSortBy(option.id)
                          setCurrentPage(1)
                        }}
                        className="text-gray-300 focus:bg-gray-800 focus:text-white"
                      >
                        <Icon className="h-4 w-4 mr-2 text-indigo-500" />
                        {option.name}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* 게시글 리스트 */}
            <div className="space-y-4">
              {loading ? (
                // 로딩 스켈레톤
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-3" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <AnimatePresence mode="wait">
                  {currentPosts.length > 0 ? (
                    currentPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group bg-gray-900 rounded-lg border border-gray-800 hover:border-indigo-500/50 transition-all duration-300 shadow-lg shadow-black/10 hover:shadow-indigo-900/5"
                      >
                        <Link href={`/user/community/post/${post.id}`}>
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className="bg-gray-800 text-gray-300 border border-gray-700 flex items-center px-2.5 py-0.5">
                                    {getCategoryIcon(post.category)}
                                    {post.category}
                                  </Badge>
                                  {post.author.level === "시니어" && (
                                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
                                      시니어
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="text-lg font-medium mb-2 group-hover:text-indigo-500 transition-colors">
                                  {post.title}
                                </h3>
                                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{post.content}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-400">
                              <div className="flex items-center gap-2">
                                {post.author.image ? (
                                  <img
                                    src={post.author.image || "/placeholder.svg"}
                                    alt={post.author.name}
                                    className="w-6 h-6 rounded-full ring-2 ring-gray-800 object-cover"
                                  />
                                ) : (
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center ${getColorById(post.author.userId)} ring-2 ring-gray-800`}
                                  >
                                    <span className="text-white text-xs font-semibold">
                                      {post.author.name?.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <span className="font-medium text-gray-300">{post.author.name}</span>
                                <span>•</span>
                                <span>{formatDate(post.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="h-4 w-4 text-indigo-500" /> {post.likes}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="h-4 w-4 text-indigo-500" /> {post.views}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-4 w-4 text-indigo-500" /> {post.comments}
                                </span>
                              </div>
                            </div>
                            {post.courseSubject && post.courseSubject.trim() !== "" && (
                              <span className="text-xs text-gray-500 mt-2 inline-block">
                                From. {post.courseSubject}
                              </span>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-gray-900 rounded-lg border border-gray-800 p-8 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="p-4 rounded-full bg-gray-800">
                          <Search className="h-8 w-8 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-medium">게시글이 없습니다</h3>
                        <p className="text-gray-400 max-w-md">
                          검색 조건에 맞는 게시글이 없습니다. 다른 키워드로 검색하거나 새 글을 작성해보세요.
                        </p>
                        <Link href="/user/community/write">
                          <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700">새 글 작성하기</Button>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>

            {filteredPosts.length > itemsPerPage && (
              <div className="mt-6">
                <Pagination
                  totalItems={filteredPosts.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}

function PopularSection({ title, posts, loading }: { title: string; posts: PopularPost[]; loading: boolean }) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 shadow-xl shadow-black/20">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="p-4 space-y-3">
        {loading ? (
          // 로딩 스켈레톤
          Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="p-3 rounded-lg">
                <Skeleton className="h-4 w-full mb-2" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))
        ) : posts.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">게시글이 없습니다.</p>
        ) : (
          posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={`/user/community/post/${post.id}`}
                className="block p-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <p className="text-sm text-gray-300 font-medium truncate">{post.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  {post.profileImage ? (
                    <img
                      src={post.profileImage || "/placeholder.svg"}
                      alt={post.userName}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${getColorById(post.userId)}`}
                    >
                      <span className="text-xs text-white font-semibold">{post.userName.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <span className="text-xs text-gray-400">{post.userName}</span>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
