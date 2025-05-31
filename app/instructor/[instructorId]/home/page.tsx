"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import useUserStore from "@/app/auth/userStore"
import InstructorHomeSidebar from "@/components/instructor/home/instructor-home-sidebar"
import InstructorIntro from "@/components/instructor/home/instructor-intro"
import InstructorCourses from "@/components/instructor/home/instructor-courses"
import InstructorReviews from "@/components/instructor/home/instructor-reviews"
import InstructorPosts from "@/components/instructor/home/instructor-posts"
import NetflixHeader from "@/components/netflix-header"

const API_URL = "/api/instructor/home"

type ExpertiseOption = {
  id: number
  name: string
}

type Course = {
  courseId: number
  subject: string
  instructor: string
  thumbnailUrl: string
  price: number
  discountRate: number
  rating: number
  categoryName: string
  tags: string[]
}

type Review = {
  id: number
  courseId: number
  subject: string
  thumbnailUrl: string
  nickname: string
  rating: number
  content: string
  regDate: string
  likes: number
}

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

type InstructorData = {
  userId: number; 
  nickName: string
  bio: string
  githubLink: string
  expertise: string
  profileUrl: string
  totalStudents: number
  totalReviews: number
  totalRating: number
  expertiseName: string
  followerCount: number
}

export default function InstructorProfile() {
  const { user, restoreFromStorage } = useUserStore()
  const loginInstructorId = user?.instructorId;
  const userId = user?.id;

  const params = useParams();
  //const instructorId = params?.instructorId ? Number(params.instructorId) : null;
  const instructorId = params?.instructorId && !isNaN(Number(params.instructorId)) ? Number(params.instructorId) : null;


  const isMyPage = loginInstructorId === instructorId;
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("home")
  const [bio, setBio] = useState("")
  const [instructorData, setInstructorData] = useState<InstructorData | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [isEditingExpertise, setIsEditingExpertise] = useState(false)
  const [selectedExpertiseId, setSelectedExpertiseId] = useState<number | null>(null)
  const [expertiseOptions, setExpertiseOptions] = useState<ExpertiseOption[]>([])
  const [targetUserId, setTargetUserId] = useState<number | null>(null)

  useEffect(() => {
    if (instructorData?.userId) {
      setTargetUserId(instructorData.userId) // userId 저장
    }
  }, [instructorData])

  useEffect(() => {
    if (instructorData) {
      console.log("🔥 instructorData:", instructorData)
    }
  }, [instructorData])

  
  useEffect(() => {
    
    if (!instructorId) return

    const fetchAll = async () => {
      try {
        console.log("🔍 강사 프로필 데이터 가져오기 시작");
        console.log("🔍 요청 URL:", `${API_URL}/profile/${instructorId}`);
        
        const res = await fetch(`${API_URL}/profile/${instructorId}`, { credentials: "include" })
        console.log("🔍 프로필 응답 상태:", res.status);
        
        if (res.status === 401 || res.status === 403) {
          console.error("🔍 인증 오류:", res.status);
          alert("세션이 만료되었습니다. 다시 로그인해주세요.")
          router.push("/auth/user/login")
          return
        }
        
        const data = await res.json()
        console.log("🔍 받은 프로필 데이터:", data);
        
        setInstructorData(data)
        setBio(data.bio)

        const expertiseRes = await fetch(`/api/instructor/meta/expertise`)
        const expertiseData = await expertiseRes.json()
        setExpertiseOptions(expertiseData?.data ?? [])

        const courseRes = await fetch(`${API_URL}/courses/${instructorId}`)
        const courseResult = await courseRes.json()
        setCourses(courseResult?.data ?? [])

        const reviewRes = await fetch(`${API_URL}/reviews/${instructorId}`)
        const reviewResult = await reviewRes.json()
        setReviews(reviewResult?.data ?? [])

        const postRes = await fetch(`${API_URL}/posts/${instructorId}`)
        const postResult = await postRes.json()
        const postsRaw = postResult?.data
        if (Array.isArray(postsRaw)) {
          setPosts(
            postsRaw.map((post: any) => ({
              id: post.id,
              type: post.bname,
              title: post.subject,
              content: post.content,
              date: formatDate(post.regDate),
              views: post.viewCount,
              comments: post.commentCount,
              likes: post.likeCount,
              reply: post.reply,
            })),
          )
        } else {
          console.error("게시글 응답 오류:", postResult)
          setPosts([])
        }
      } catch (err) {
        console.error("강사 데이터 로딩 실패", err)
      }
    }

    fetchAll()
  }, [instructorId])

  useEffect(() => {
    if (!instructorData) return
    const checkFollowStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/follow/status/${instructorData.userId}`, { credentials: "include" })
        const result = await res.json()
        if (result && (result.data === true || result.data === "true")) {
          setIsFollowing(true);
        } else {
          setIsFollowing(false);
        }
      } catch (err) {
        console.error("팔로우 상태 확인 실패:", err)
      }
    }

    checkFollowStatus()
  }, [instructorData, instructorId])

  useEffect(() => {
    if (!user) {
      restoreFromStorage();
    }
  }, [user, restoreFromStorage]);

  const handleFollowToggle = async () => {
    if (!targetUserId) return;
  
    try {
      const res = await fetch(`${API_URL}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetUserId }),
      });
  
      const result = await res.json();
      if (result.msg === "팔로우 성공") {
        setIsFollowing(true);
        setInstructorData((prev) =>
          prev ? { ...prev, followerCount: prev.followerCount + 1 } : null
        );
      } else if (result.msg === "팔로우 취소 성공") {
        setIsFollowing(false);
        setInstructorData((prev) =>
          prev ? { ...prev, followerCount: prev.followerCount - 1 } : null
        );
      } else if (result.msg === "본인은 팔로우할 수 없습니다.") {
        alert(result.msg);
      }
    } catch (err) {
      console.error("팔로우 처리 실패", err);
    }
  };

  const handleSaveExpertise = async () => {
    if (selectedExpertiseId !== null) {
      const res = await fetch(`${API_URL}/expertise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ expertiseId: selectedExpertiseId }),
      })

      if (res.ok) {
        const updated = expertiseOptions.find((e) => e.id === selectedExpertiseId)
        setInstructorData((prev) => (prev ? { ...prev, expertiseName: updated?.name ?? "" } : null))
        setIsEditingExpertise(false)
      } else {
        alert("전문 분야 수정 실패")
      }
    }
  }

  const handleSaveBio = async () => {
    try {
      console.log("🔍 Bio 업데이트 시작:", bio);
      console.log("🔍 API URL:", `${API_URL}/bio`);
      
      const res = await fetch(`${API_URL}/bio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bio }),
      })
      
      console.log("🔍 Bio 업데이트 응답 상태:", res.status);
      console.log("🔍 Bio 업데이트 응답 OK:", res.ok);
      
      if (res.ok) {
        const responseData = await res.json();
        console.log("🔍 Bio 업데이트 응답 데이터:", responseData);
        
        // bio 업데이트 성공 후 instructorData도 업데이트
        setInstructorData(prev => {
          console.log("🔍 이전 instructorData:", prev);
          const updated = prev ? { ...prev, bio } : null;
          console.log("🔍 업데이트된 instructorData:", updated);
          return updated;
        });
        
        // 강사 프로필 데이터 다시 불러오기
        console.log("🔍 프로필 데이터 다시 불러오기 시작");
        const profileRes = await fetch(`${API_URL}/profile/${instructorId}`, { credentials: "include" });
        console.log("🔍 프로필 데이터 응답 상태:", profileRes.status);
        
        if (profileRes.ok) {
          const data = await profileRes.json();
          console.log("🔍 새로 불러온 프로필 데이터:", data);
          setInstructorData(data);
          setBio(data.bio);
        } else {
          console.error("🔍 프로필 데이터 불러오기 실패:", profileRes.status);
        }
        
        alert("소개글이 성공적으로 수정되었습니다.")
      } else {
        const errorData = await res.json();
        console.error("🔍 Bio 업데이트 실패:", errorData);
        alert("소개글 수정에 실패했습니다.")
      }
    } catch (err) {
      console.error("🔍 소개 수정 오류", err)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = `0${date.getMonth() + 1}`.slice(-2)
    const day = `0${date.getDate()}`.slice(-2)
    return `${year}. ${month}. ${day}.`
  }

  if (!instructorData) {
    return <div className="text-white p-8">로딩 중...</div>
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <NetflixHeader />

      <div className="max-w-7xl mx-auto px-6 pt-24 flex">
        <InstructorHomeSidebar
          instructorData={instructorData}
          isMyPage={isMyPage}
          isFollowing={isFollowing}
          followerCount={instructorData.followerCount}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          expertiseOptions={expertiseOptions}
          isEditingExpertise={isEditingExpertise}
          setIsEditingExpertise={setIsEditingExpertise}
          selectedExpertiseId={selectedExpertiseId}
          setSelectedExpertiseId={setSelectedExpertiseId}
          handleSaveExpertise={handleSaveExpertise}
          handleFollowToggle={handleFollowToggle}
        />
        <main className="flex-1 ml-6 space-y-6 pb-16">
          {activeTab === "home" && (
            <InstructorIntro
              instructorData={instructorData}
              bio={bio}
              setBio={setBio}
              isMyPage={isMyPage}
              isFollowing={isFollowing}
              followerCount={instructorData.followerCount}
              expertiseOptions={expertiseOptions}
              isEditingExpertise={isEditingExpertise}
              setIsEditingExpertise={setIsEditingExpertise}
              selectedExpertiseId={selectedExpertiseId}
              setSelectedExpertiseId={setSelectedExpertiseId}
              handleSaveExpertise={handleSaveExpertise}
              handleFollowToggle={handleFollowToggle}
              handleSaveBio={handleSaveBio}
            />
          )}

          {(activeTab === "home" || activeTab === "courses") && (
            <InstructorCourses courses={courses} activeTab={activeTab} setActiveTab={setActiveTab} />
          )}

          {(activeTab === "home" || activeTab === "reviews") && (
            <InstructorReviews reviews={reviews} activeTab={activeTab} setActiveTab={setActiveTab} />
          )}

          {(activeTab === "home" || activeTab === "posts") && (
            <InstructorPosts posts={posts} activeTab={activeTab} setActiveTab={setActiveTab} />
          )}
        </main>
      </div>
    </div>
  )
}
