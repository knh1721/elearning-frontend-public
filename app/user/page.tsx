"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Play, Star, Award, Users, BookOpen, TrendingUp, } from "lucide-react"
import { Button } from "@/components/user/ui/button"
import { Badge } from "@/components/user/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/user/ui/tabs"
import NetflixHeader from "@/components/netflix-header"
import CourseCard from "@/components/course-card"

import Slider, {SliderData} from "@/components/user/main/slider"
import Hero from "@/components/user/main/hero/hero"
import CourseSection from "@/components/user/main/course-section"
import Footer from "@/components/footer"
import axios from "axios"
import userStore from "@/app/auth/userStore"
import AutoScrollingReviews from "@/components/user/main/auto-scrolling-reviews"
import RecommendedInstructors from "@/components/user/main/recommended-instructors"

interface UserMainData {
  existPhone: boolean
  existCourse: boolean
  sliderList: SliderData[]
  popularCourses: any[]
  latestCourses: any[]
  freeCourses: any[]
  recommendedInstructors: any[]
  userReviews: any[]
}

interface UserReview {
  userName: string
  profileUrl?: string | null
  courseName: string
  review: string
  rating: number
}

export default function UserHomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [sliderList, setSliderList] = useState<SliderData[]>([]);
  const [popularCourses, setPopularCourses] = useState([]);
  const [newCourses, setNewCourses] = useState([]);
  const [freeCourses, setFreeCourses] = useState([]);
  const [recommendedInstructors, setRecommendedInstructors] = useState([]);
  const [existCourse, setExistCourse] = useState(false);
  const [userMainData, setUserMainData] = useState<UserMainData | null>(null);
  const [phoneInput, setPhoneInput] = useState("")
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [userReviews, setUserReviews] = useState<UserReview[]>([])
  
  const { restoreFromStorage, accessToken, user } = userStore()
  
  const API_URL = "/api";

  // 카테고리별 이미지 매핑
  const categoryImageMap: { [category: string]: string } = {
    "프론트앤드": "/main-github.png",
    "백앤드": "/main-docker.png",
    "AI, 머신러닝": "/main-react.jpg",
    "데이터베이스": "/main-spring.png",
    "프로그래밍 언어": "/main-spring2.png",
    "풀스택": "/main-fullstack.png",
    "알고리즘, 자료구조": "/main-algo.png",
    "프로그래밍 자격증": "/main-cert.png",
    "모바일 앱 개발": "/main-mobile.png",
    "기타": "/main-etc.png"
  }

  useEffect(() => {
    restoreFromStorage()
  }, [])

  useEffect(() => {
    console.log("유스이펙트시작")
    // 메인 정보
    axios.get(`${API_URL}/course/main`, { withCredentials: true })
    .then(res => {
      const data = res.data.data;
      console.log("메인 강의 로드 성공", data);

      // 슬라이더 이미지 카테고리 기준 매핑
      const processedSliderList = data.sliderList.map((slide: SliderData) => {
        const matchedImage = categoryImageMap[slide.category] || "/main-default.png"
        return {
          ...slide,
          imageUrl: matchedImage
        }
      })

      setUserMainData(data);
      setExistCourse(data.existCourse);
      setSliderList(processedSliderList);
      // setSliderList(data.sliderList)
      setPopularCourses(data.popularCourses);
      setNewCourses(data.latestCourses)
      setFreeCourses(data.freeCourses);
      setUserReviews(data.userReviews);
      setRecommendedInstructors(data.recommendedInstructors);
    })
    .catch(err => console.error("메인 강의 로드 실패", err));
  }, [])

  // 전화 번호 모달 - 첫 번째 코드의 로직 통합
  useEffect(() => {
    // 로그인 했고 + userMainData 있고 + 전화번호 없을 때만 모달 띄움
    if (user && userMainData && !userMainData.existPhone) {
      setShowPhoneModal(true)
    }
  }, [user, userMainData])

  // 전화번호 저장 - 첫 번째 코드의 향상된 로직 통합
  const handleSavePhone = async () => {
    const phoneRegex = /^010\d{8}$/
    if (!phoneRegex.test(phoneInput)) {
      alert("전화번호s 형식이 올바르지 않습니다.\n예시) 01012345678")
      return
    }

    try {
      const response = await axios.post("/api/user/updatePhone", { phone: phoneInput }, { headers: { "Content-Type": "application/json" }, withCredentials: true })
      console.log("전화번호 저장 응답:", response.data)
      // 응답 코드에 따른 처리
      if (response.data.totalCount === 1) {
        // 성공
        alert("전화번호가 등록되었습니다.")
        setShowPhoneModal(false)
        location.reload()
      } else if (response.data.totalCount === -1) {
        // 전화번호 중복
        console.log("전화번호 중복")
        alert("이미 사용 중인 전화번호입니다. 다른 번호를 입력해주세요.")
      } else {
        // 기타 에러
        alert(response.data.message || "전화번호 등록에 실패했습니다.")
      }
    } catch (error: any) {
      // 네트워크 에러 등 기타 예외
      const errorMessage = error.response?.data?.message || "전화번호 등록 실패! 다시 시도해주세요."
      alert(errorMessage)
    }
  }

  // 애니메이션을 위한 상태 설정
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // 통계 데이터
  const stats = [
    { icon: BookOpen, value: "1,200+", label: "강의 수" },
    { icon: Users, value: "50만+", label: "수강생" },
    { icon: Award, value: "300+", label: "전문 강사진" },
    { icon: TrendingUp, value: "98%", label: "수강 만족도" },
  ]

  // 슬라이드 변경 함수
  const changeSlide = (index: number) => {
    setCurrentSlide(index)
  }

  // 캐러셀 스크롤 함수
  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { current } = carouselRef
      const scrollAmount = direction === "left" ? -current.offsetWidth * 0.75 : current.offsetWidth * 0.75
      current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NetflixHeader />

      {/* 메인 슬라이더 */}
      {/* <Slider slides={sliderList} existCourse={existCourse}/> */}
      <Hero slides={sliderList} existCourse={existCourse} />

      {/* 통계 섹션 */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`flex flex-col items-center text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center mb-4">
                  <stat.icon className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 인기 강의 섹션 */}
      <CourseSection
        title="인기 강의"
        link="/user/course"
        scrollable
        carouselRef={carouselRef}
        onScrollLeft={() => scroll("left")}
        onScrollRight={() => scroll("right")}
        courses={popularCourses}
        sectionId="popular"
      />

      {/* 추천 강사 섹션 */}
      <RecommendedInstructors instructors={recommendedInstructors} />

      {/* 신규 & 무료 강의 섹션 */}
      {/* <section className="py-16 bg-black"> */}
      <section className="py-16 bg-black relative overflow-hidden">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="new" className="w-full">
            <div className="flex items-center justify-between mb-8">
              <TabsList className="bg-gray-800">
                <TabsTrigger value="new" className="data-[state=active]:bg-red-600 transition-all">
                  신규 강의
                </TabsTrigger>
                <TabsTrigger value="free" className="data-[state=active]:bg-red-600 transition-all">
                  무료 강의
                </TabsTrigger>
              </TabsList>
              <Link href="/user/courses" className="text-red-500 hover:text-red-400 flex items-center group">
                더 보기
                <ChevronRight className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* 신규 강의 */}
            <TabsContent value="new" className="mt-0">
              <CourseSection
                showHeader={false}
                link="/user/courses"
                courses={newCourses}
                sectionId="new"
              />
            </TabsContent>

            {/* 무료 강의 */}
            <TabsContent value="free" className="mt-0">
              <CourseSection
                showHeader={false}
                link="/user/courses"
                courses={freeCourses}
                sectionId="free"
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* 수강생 후기 섹션 */}
      <section className="pt-60 bg-black relative overflow-hidden">
        {/* 상단 페이드 인 (검정→투명) */}
        <div
          className="absolute top-0 left-0 w-full h-32 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))' }}
        />
        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/50 to-black opacity-50 z-0" />
        <div className="relative z-10 w-screen">
          <h2 className="text-3xl font-bold mb-16 text-center">수강생 후기</h2>
          <div className="mt-8">
            <AutoScrollingReviews reviews={userReviews} />
          </div>       
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="pt-56 py-48 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/50 to-black opacity-50 bg-cover bg-center" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">지금 시작하세요</h2>
            <p className="text-xl text-gray-300 mb-8">
              1,200개 이상의 강의와 함께 당신의 커리어를 한 단계 업그레이드할 준비가 되었나요?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-red-600 hover:bg-red-700 text-lg py-6 px-8 transition-transform hover:scale-105">
                무료 강의 둘러보기
              </Button>
              <Button
                variant="outline"
                className="border-gray-600 hover:bg-gray-800 text-lg py-6 px-8 transition-transform hover:scale-105"
              >
                멤버십 가입하기
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* 전화번호 모달 - 첫 번째 코드의 모달 디자인 및 기능 통합 */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative z-50 bg-gray-900 p-6 rounded-xl w-[320px]">
            <h2 className="text-xl font-bold mb-4 text-center">전화번호를 입력해주세요</h2>
            <input
              type="text"
              placeholder="01012345678"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="w-full p-2 rounded mb-4 text-white text-center bg-gray-800 placeholder-gray-500"
              maxLength={11}
            />
            <div className="flex justify-between gap-2">
              <Button
                onClick={handleSavePhone}
                className="bg-red-600 hover:bg-red-700 w-full"
              >
                저장
              </Button>
              <Button
                onClick={() => setShowPhoneModal(false)}
                variant="outline"
                className="border-gray-600 w-full"
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}