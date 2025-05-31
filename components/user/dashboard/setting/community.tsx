"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/user/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/user/ui/card"
import { Button } from "@/components/user/ui/button"
import {
  MessageSquare,
  FileText,
  Code,
  Users,
  ExternalLink,
  ThumbsUp,
  MessageCircle,
  Calendar,
  Eye,
  Trash2,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { Badge } from "@/components/user/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/user/ui/tooltip"
import axios from "axios"
import Link from "next/link"
import { toast } from "react-hot-toast"

interface Post {
  id: number
  title: string
  content: string
  category: "question" | "project" | "free" | "other"
  createdAt: string
  commentCount: number
  likeCount: number
  viewCount: number
  thumbnailUrl?: string
  solved?: boolean
  isNew?: boolean
  isTrending?: boolean
  commentId?: number
}

const CATEGORY_OPTIONS = [
  { value: "all", label: "전체", icon: <BookOpen className="h-4 w-4 mr-1" /> },
  { value: "question", label: "질문 및 답변", icon: <MessageSquare className="h-4 w-4 mr-1" /> },
  { value: "project", label: "프로젝트", icon: <Code className="h-4 w-4 mr-1" /> },
  { value: "free", label: "자유게시판", icon: <Users className="h-4 w-4 mr-1" /> },
]

export default function Community() {
  const [mainTab, setMainTab] = useState("myPosts")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true)
      let url = ""

      if (mainTab === "myPosts") url = "/api/mypage/mycommunity/posts"
      else if (mainTab === "liked") url = "/api/mypage/mycommunity/liked"
      else if (mainTab === "commented") url = "/api/mypage/mycommunity/commented"

      try {
        const res = await axios.get(url, { withCredentials: true })
        const postsData = mainTab === "commented" 
          ? res.data.data.map((post: any) => ({
              ...post,
              commentId: post.commentId
            }))
          : res.data.data;
        setPosts(postsData)
      } catch (error) {
        console.error("게시글 불러오기 실패:", error)
        setPosts([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchPosts()
  }, [mainTab])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "question": return <MessageSquare className="h-4 w-4" />
      case "project": return <Code className="h-4 w-4" />
      case "free": return <Users className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case "question": return "질문 및 답변"
      case "project": return "프로젝트"
      case "free": return "자유게시판"
      default: return "기타"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
  }

  const filteredPosts = posts.filter((post) => categoryFilter === "all" || post.category === categoryFilter)

  const handleDeletePost = async (postId: number | undefined) => {
    if (typeof postId === 'undefined') {
      toast.error('게시글 ID가 유효하지 않습니다.');
      return;
    }

    try {
      const post = mainTab === "commented" 
        ? posts.find(p => p.commentId === postId)
        : posts.find(p => p.id === postId);
        
      if (!post) {
        toast.error('게시글을 찾을 수 없습니다.');
        return;
      }

      if (mainTab === "commented" && !post.commentId) {
        toast.error('댓글 ID를 찾을 수 없습니다.');
        return;
      }

      if (mainTab === "commented" && post.commentId) {
        const deleteCommentResponse = await axios.post(`/api/mypage/mycommunity/comments/${post.commentId}/delete`, {}, { withCredentials: true });
        console.log('Delete comment response:', deleteCommentResponse);
        console.log('Delete comment response data:', deleteCommentResponse.data);
        
        if (deleteCommentResponse.data.totalCount !== 1) {
          throw new Error('댓글 삭제에 실패했습니다.');
        }
      } else {
        const deletePostResponse = await axios.delete(`/api/mypage/mycommunity/posts/${post.id}/delete`, { withCredentials: true });
        console.log('Delete post response:', deletePostResponse.data);
        
        if (deletePostResponse.data.totalCount !== 1) {
          throw new Error('게시글 삭제에 실패했습니다.');
        }
      }

      setPosts(posts.filter(p => p.id !== post.id));
      toast.success(mainTab === "commented" ? '댓글이 삭제되었습니다.' : '게시글이 삭제되었습니다.');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : '삭제에 실패했습니다.');
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 text-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-yellow-400" />내 커뮤니티 활동
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={mainTab} onValueChange={(value) => { setMainTab(value); setIsLoading(true) }} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-800/60 mb-4 rounded-lg p-1">
                  <TabsTrigger value="myPosts" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white transition-all duration-200">
                    <FileText className="h-4 w-4 mr-2" />게시글
                  </TabsTrigger>
                  <TabsTrigger value="liked" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white transition-all duration-200">
                    <ThumbsUp className="h-4 w-4 mr-2" />좋아요
                  </TabsTrigger>
                  <TabsTrigger value="commented" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white transition-all duration-200">
                    <MessageCircle className="h-4 w-4 mr-2" />댓글
                  </TabsTrigger>
                </TabsList>

                <motion.div className="flex gap-2 mb-6 flex-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.3 }}>
                  {CATEGORY_OPTIONS.map((opt, index) => (
                    <motion.div key={opt.value} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + index * 0.1 }}>
                      <Button size="sm" variant={categoryFilter === opt.value ? "default" : "outline"} onClick={() => setCategoryFilter(opt.value)}
                        className={`transition-all duration-300 ${categoryFilter === opt.value ? "bg-gray-700 text-white border-gray-600 shadow-md" : "bg-transparent text-gray-300 border-gray-700 hover:bg-gray-700/50"}`}>
                        {opt.icon}{opt.label}
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>

                <TabsContent value={mainTab} className="focus-visible:outline-none focus-visible:ring-0">
                  {isLoading ? (
                    <div className="space-y-4"> {/* ...로딩 생략... */} </div>
                  ) : filteredPosts.length === 0 ? (
                    <motion.div className="text-center py-10 text-gray-400" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>게시글이 없습니다.</p>
                      {/* <Button variant="outline" className="mt-4 border-gray-700 text-gray-300 hover:bg-gray-700">
                        <FileText className="h-4 w-4 mr-2" />새 게시글 작성하기
                      </Button> */}
                    </motion.div>
                  ) : (
                    <AnimatePresence>
                      <div className="space-y-4">
                        {filteredPosts.map((post, index) => (
                          <motion.div 
                            key={`${mainTab}-${post.commentId || post.id}`} 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, x: -20 }} 
                            transition={{ duration: 0.3, delay: index * 0.1 }} 
                            className="group"
                          >
                            <div className="p-4 bg-gray-800/80 hover:bg-gray-800 rounded-lg transition-all duration-200 border border-gray-700 hover:border-gray-600 shadow-sm hover:shadow-md">
                              <div className="flex items-start">
                                {post.thumbnailUrl ? (
                                  <div className="relative w-[100px] h-[70px] rounded-md overflow-hidden bg-gray-700 mr-4 flex-shrink-0 group-hover:shadow-lg transition-all duration-300">
                                    <Image src={post.thumbnailUrl || "/placeholder.svg"} alt={post.title} width={100} height={70} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                                  </div>
                                ) : (
                                  <div className="relative w-[100px] h-[70px] rounded-md overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 mr-4 flex-shrink-0 flex items-center justify-center">
                                    {getCategoryIcon(post.category)}
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center mb-1 flex-wrap gap-2">
                                    <Badge variant="outline" className="mr-2 text-xs bg-gray-700 text-gray-300 border-gray-600 flex items-center">
                                      {getCategoryIcon(post.category)}
                                      <span className="ml-1">{getCategoryName(post.category)}</span>
                                    </Badge>
                                    {post.category === "question" && (
                                      <Badge className={`text-xs flex items-center ${post.solved ? "bg-green-600/80 hover:bg-green-600" : "bg-yellow-600/80 hover:bg-yellow-600"} transition-colors duration-200`}>
                                        {post.solved ? <><CheckCircle className="h-3 w-3 mr-1" />해결됨</> : <><HelpCircle className="h-3 w-3 mr-1" />미해결</>}
                                      </Badge>
                                    )}
                                    {post.isNew && <Badge className="text-xs bg-blue-600/80 hover:bg-blue-600 transition-colors duration-200">NEW</Badge>}
                                    {post.isTrending && <Badge className="text-xs bg-purple-600/80 hover:bg-purple-600 transition-colors duration-200 flex items-center"><TrendingUp className="h-3 w-3 mr-1" />인기</Badge>}
                                  </div>
                                  <Link href={`/user/community/post/${post.id}`} passHref legacyBehavior>
                                    <a className="block">
                                      <h3 className="font-medium text-lg mb-1 group-hover:text-white transition-colors duration-200">{post.title}</h3>
                                      <p className="text-sm text-gray-400 line-clamp-2 mb-2 group-hover:text-gray-300 transition-colors duration-200">{post.content}</p>
                                    </a>
                                  </Link>
                                  <div className="flex items-center text-xs text-gray-500 flex-wrap gap-y-1">
                                    <div className="flex items-center mr-3"><Calendar className="h-3 w-3 mr-1" />{formatDate(post.createdAt)}</div>
                                    <div className="flex items-center mr-3 text-yellow-500/70"><ThumbsUp className="h-3 w-3 mr-1" />{post.likeCount}</div>
                                    <div className="flex items-center mr-3 text-blue-500/70"><MessageCircle className="h-3 w-3 mr-1" />{post.commentCount}</div>
                                    <div className="flex items-center text-gray-500/70"><Eye className="h-3 w-3 mr-1" />{post.viewCount}</div>
                                  </div>
                                </div>
                                <div className="flex flex-col space-y-2 ml-4">
                                  <Tooltip><TooltipTrigger asChild>
                                    <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-700 transition-all duration-200 hover:text-white" onClick={() => window.open(`/user/community/post/${post.id}`, "_blank")}> <ExternalLink className="h-4 w-4 mr-1" /> 보기 </Button>
                                  </TooltipTrigger><TooltipContent side="left"><p>새 탭에서 게시글 열기</p></TooltipContent></Tooltip>
                                  
                                  {mainTab === "myPosts" && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-red-900/30 hover:border-red-700 hover:text-red-400" onClick={() => handleDeletePost(post.id)}>
                                          <Trash2 className="h-4 w-4 mr-1" /> 삭제
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="left"><p>게시글 삭제하기</p></TooltipContent>
                                    </Tooltip>
                                  )}
                                  {/* <Tooltip><TooltipTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="border-gray-700 text-gray-300 hover:bg-red-900/30 hover:border-red-700 hover:text-red-400 transition-all duration-200" 
                                      onClick={() => handleDeletePost(mainTab === "commented" ? post.commentId : post.id)}
                                    > 
                                      <Trash2 className="h-4 w-4 mr-1" /> 삭제 
                                    </Button>
                                  </TooltipTrigger><TooltipContent side="left"><p>게시글 삭제하기</p></TooltipContent></Tooltip> */}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </AnimatePresence>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </TooltipProvider>
  )
}
