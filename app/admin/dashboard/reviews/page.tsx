"use client"

import {useEffect, useState} from "react"
import {BookOpen, Calendar, Check, Clock, Eye, FileText, X} from "lucide-react"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/user/ui/card"
import {Button} from "@/components/user/ui/button"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/user/ui/avatar"
import {Badge} from "@/components/user/ui/badge"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/user/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/user/ui/dialog"
import {Textarea} from "@/components/user/ui/textarea"
import {Label} from "@/components/user/ui/label"
import axios from "axios";
import CourseDetailModal from "@/components/admin/CourseDetailModal";

interface CourseReview {
  id: number;
  title: string;
  instructor: string;
  instructorEmail: string;
  category: string;
  description: string;
  price: number;
  createdAt: string;
  status: string;
  sections: number;
  videos: number;
  duration: number;
}

export default function ReviewsPage() {
  // 모달 상태 관리
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [selectedCourse, setSelectedCourse] = useState<CourseReview>({
    id: 0,
    title: "",
    instructor: "",
    instructorEmail: "",
    category: "",
    description: "",
    price: 0,
    createdAt: "",
    status: "",
    sections: 0,
    videos: 0,
    duration: 0
  });
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewFeedback, setReviewFeedback] = useState("")
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null)
  const [isCourseDetailOpen, setIsCourseDetailOpen] = useState(false)

  const API_URL = "/api/admin";

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingReviews, setPendingReviews] = useState<CourseReview[]>([]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/pending`);
      console.log(response);
      const sortedData = response.data.data.sort((a: CourseReview, b: CourseReview) => {
        // `createdAt` 기준으로 내림차순 정렬 (최신 강의부터)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setPendingReviews(sortedData);
    } catch (err) {
      setError("강의 목록을 불러오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  };

  const [isLatestFirst, setIsLatestFirst] = useState(true);
  const toggleSortOrder = () => {
    setPendingReviews((prevReviews) => {
      // 최신순과 오래된순을 반전시켜서 정렬
      const sortedReviews = [...prevReviews].reverse();
      return sortedReviews;
    });

    // 최신순/오래된순 상태 변경
    setIsLatestFirst((prev) => !prev);
  };

  useEffect(() => {
    fetchCourses().then(() => {
    })
  }, [])

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>오류 발생: {error}</p>;
  if (!pendingReviews) return <p>데이터가 없습니다.</p>;

  const handleReviewAction = async () => {
    try {
      const response = await fetch(`${API_URL}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: selectedCourseId,
          action: reviewAction, // "approve" 또는 "reject"
          feedback: reviewFeedback,
        }),
      });

      if (!response.ok) {
        throw new Error("리뷰 처리 중 오류가 발생했습니다.");
      }

      const result = await response.json();
      console.log("리뷰 처리 완료:", result);

      await fetchCourses();

      // 성공 후 모달 닫고 초기화
      setIsReviewDialogOpen(false);
      setReviewFeedback("");
      setReviewAction(null);

      // 필요시 알림 또는 강의 목록 새로고침 등 추가
    } catch (error) {
      console.error("리뷰 처리 오류:", error);
      alert("리뷰 처리에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const min = Math.floor(seconds / 60);
    return `${hours}시간 ${min}분`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">강의 심사</h2>
        <p className="text-muted-foreground">새로 등록된 강의를 검토하고 승인 또는 거부하세요.</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            대기 중
            <Badge variant="secondary" className="ml-2 px-1.5 py-0.5">
              {pendingReviews.length}
            </Badge>
          </TabsTrigger>
          {/*<TabsTrigger value="approved">승인됨</TabsTrigger>
          <TabsTrigger value="rejected">거부됨</TabsTrigger>*/}
        </TabsList>
        <Button onClick={toggleSortOrder}>
          {!isLatestFirst ? '오래된순' : '최신순'}
        </Button>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingReviews.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <Badge variant="secondary">검토 필요</Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Calendar className="h-3.5 w-3.5"/>
                    <span>제출일: {new Date(course.createdAt).toLocaleDateString("ko-KR")}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`/abstract-geometric-shapes.png?height=32&width=32&query=${course.instructor}`}
                          alt={course.instructor}
                        />
                        <AvatarFallback>{course.instructor.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{course.instructor}</p>
                        <p className="text-xs text-muted-foreground">{course.instructorEmail}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground"/>
                        <span>{course.sections} 섹션</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground"/>
                        <span>{course.videos} 강의</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground"/>
                        <span>{formatDuration(course.duration)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="h-5 px-1.5 py-0">
                          {course.category}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>

                    <div className="font-medium">
                      {new Intl.NumberFormat("ko-KR", {
                        style: "currency",
                        currency: "KRW",
                      }).format(course.price)}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCourseId(course.id)
                      setSelectedCourse(course)
                      setIsCourseDetailOpen(true)
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4"/>
                    상세 보기
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedCourseId(course.id)
                        setSelectedCourse(course)
                        setReviewAction("reject")
                        setIsReviewDialogOpen(true)
                      }}
                    >
                      <X className="mr-2 h-4 w-4"/>
                      거부
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setSelectedCourseId(course.id)
                        setSelectedCourse(course)
                        setReviewAction("approve")
                        setIsReviewDialogOpen(true)
                      }}
                    >
                      <Check className="mr-2 h-4 w-4"/>
                      승인
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/*<TabsContent value="approved" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {approvedReviews.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <Badge variant="default">승인됨</Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Calendar className="h-3.5 w-3.5"/>
                    <span>제출일: {new Date(course.submittedAt).toLocaleDateString("ko-KR")}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`/abstract-geometric-shapes.png?height=32&width=32&query=${course.instructor}`}
                          alt={course.instructor}
                        />
                        <AvatarFallback>{course.instructor.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{course.instructor}</p>
                        <p className="text-xs text-muted-foreground">{course.instructorEmail}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground"/>
                        <span>{course.sections} 섹션</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground"/>
                        <span>{course.videos} 강의</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground"/>
                        <span>{formatDuration(course.duration)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="h-5 px-1.5 py-0">
                          {course.category}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedCourse(course)
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4"/>
                    상세 보기
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>*/}

        {/*<TabsContent value="rejected" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rejectedReviews.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <Badge variant="destructive">거부됨</Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Calendar className="h-3.5 w-3.5"/>
                    <span>제출일: {new Date(course.submittedAt).toLocaleDateString("ko-KR")}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`/abstract-geometric-shapes.png?height=32&width=32&query=${course.instructor}`}
                          alt={course.instructor}
                        />
                        <AvatarFallback>{course.instructor.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{course.instructor}</p>
                        <p className="text-xs text-muted-foreground">{course.instructorEmail}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground"/>
                        <span>{course.sections} 섹션</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground"/>
                        <span>{course.videos} 강의</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground"/>
                        <span>{formatDuration(course.duration)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="h-5 px-1.5 py-0">
                          {course.category}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedCourse(course)
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4"/>
                    상세 보기
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>*/}
      </Tabs>

      {/* 강의 상세 보기 모달 */}
      <Dialog open={isCourseDetailOpen} onOpenChange={setIsCourseDetailOpen}>
        <DialogTitle>강의 상세 정보</DialogTitle>
        <DialogContent className="sm:max-w-[800px]">
          <CourseDetailModal courseId={selectedCourseId}/>
        </DialogContent>
      </Dialog>

      {/* 강의 심사 다이얼로그 */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{reviewAction === "approve" ? "강의 승인" : "강의 거부"}</DialogTitle>
            <DialogDescription>
              {reviewAction === "approve"
                ? "이 강의를 승인하시겠습니까? 승인 후 강의가 플랫폼에 공개됩니다."
                : "이 강의를 거부하시겠습니까? 거부 사유를 작성해주세요."}
            </DialogDescription>
          </DialogHeader>

          {selectedCourse && (
            <div className="py-2">
              <h3 className="font-medium">{selectedCourse.title}</h3>
              <p className="text-sm text-muted-foreground">강사: {selectedCourse.instructor}</p>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="feedback">피드백</Label>
              <Textarea
                id="feedback"
                placeholder={
                  reviewAction === "approve" ? "승인 메시지를 입력하세요 (선택사항)" : "거부 사유를 입력하세요"
                }
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant={reviewAction === "approve" ? "default" : "destructive"}
              onClick={handleReviewAction}
              disabled={reviewAction === "reject" && !reviewFeedback.trim()}
            >
              {reviewAction === "approve" ? "승인하기" : "거부하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
