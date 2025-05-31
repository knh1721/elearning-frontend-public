"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Info, FileText, Upload, Settings } from "lucide-react"
import { Button } from "@/components/user/ui/button"
import CourseBasicInfo from "../../../../components/instructor/course-create/course-basic-info"
import CourseDetailedDescription from "../../../../components/instructor/course-create/course-detailed-description"
import CourseCurriculum from "../../../../components/instructor/course-create/course-curriculum"
// import CourseIntro from "../../../../components/instructor/course-create/course-intro"
import CourseCoverImage from "../../../../components/instructor/course-create/course-cover-image"
import CoursePricing from "../../../../components/instructor/course-create/course-pricing"
import CourseFaq from "../../../../components/instructor/course-create/course-faq"
import AddSectionModal from "../../../../components/instructor/course-create/add-section-modal"
import AddLectureModal from "../../../../components/instructor/course-create/add-lecture-modal"
import useUserStore from "@/app/auth/userStore"

type Step = {
  id: string
  label: string
  icon: any // 또는 정확히 하고 싶으면 LucideIcon
  subLabel?: string
}
// 강의 생성 단계
const STEPS: Step[] = [
  { id: "basic-info", label: "강의 정보", icon: Info },
  { id: "detailed-description", label: "강의 상세 설명", icon: FileText },
  { id: "curriculum", label: "커리큘럼", icon: FileText },
  //{ id: "intro", label: "상세소개", icon: FileText, subLabel: "200자 이상 작성" },
  { id: "cover-image", label: "커버 이미지", icon: Upload },
  { id: "pricing", label: "강의 설정", icon: Settings },
  { id: "faq", label: "자주 묻는 질문", icon: FileText },
]

export default function CreateCoursePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState("basic-info")
  const [openSectionModal, setOpenSectionModal] = useState(false)
  const [openLectureModal, setOpenLectureModal] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [showImageUploadModal, setShowImageUploadModal] = useState(false)
  const { user } = useUserStore()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    detailedDescription: "",
    tags: [""],
    level: "beginner",
    category: "",
    subCategory: "",
    learning: "",
    recommendation: "",
    requirement: "",
    coverImage: null,
    introVideo: null,
    curriculum: [{ title: "섹션 1", lectures: [{ title: "", videoUrl: "", duration: 0 }] }],
    price: 0,
    discountPrice: 0,
    discountRate: 0,
    isPublic: false,
    viewLimit: "unlimited",
    // durationType: "unlimited", ← 삭제  지금 coursePricing.tsx에서 durationType을 사용하지 않음
    categoryId: null,
    courseId: null,
    faqVisible: 0,
    faqs: [
      {
        content: "",
        answer: "",
        visible: 1, // ✅ 이걸 각 질문 항목에 추가
      },
    ],
  })

  // 섹션 제목을 추적하기 위한 상태 변수
  const [newSectionTitle, setNewSectionTitle] = useState("섹션 2")

  // 현재 단계 인덱스
  const currentStepIndex = STEPS.findIndex((step) => step.id === currentStep)

  // 다음 단계로 이동
  const goToNextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1].id)
    }
  }

  // 이전 단계로 이동
  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].id)
    }
  }

  // 특정 단계로 이동
  const goToStep = (stepId: string) => {
    setCurrentStep(stepId)
  }

  // 폼 데이터 업데이트
  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const saveCourse = async () => {
    const payload = {
      title: formData.title,
      description: formData.description,
      categoryId: formData.categoryId,
      instructorId: user?.instructorId, // 하드코딩된 강사 ID
    }

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error("강의 생성 실패")

      // ✅ courseId를 상태에 저장
      updateFormData("courseId", data.courseId)

      goToNextStep() // 다음 단계로 이동
    } catch (err) {
      console.error("강의 생성 중 에러:", err)
    }
  }

  // 이미지 업로드 핸들러 함수
  const handleImageUpload = () => {
    const newImageUrl = `/placeholder.svg?height=300&width=500&text=Uploaded+Image+${uploadedImages.length + 1}`
    setUploadedImages([...uploadedImages, newImageUrl])
    setShowImageUploadModal(false)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 상단 헤더 */}
      <div className="bg-gray-900 text-white py-3 px-6 flex items-center justify-between border-b border-gray-800">
        <h1 className="text-xl font-bold">입력한 강의 제목</h1>
        <div className="flex items-center gap-2">

          <Button
            variant="outline"
            className="bg-gray-500 text-white hover:bg-gray-600"
            onClick={async () => {
              if (!formData.courseId) {
                alert("강의제작 1단계 완료시 부터 가능합니다.");
                return;
              }

              const confirmed = window.confirm("지금까지 작성한 내용을 저장하고 나가시겠습니까?");
              if (!confirmed) return;

              try {
                await fetch(`/api/courses/${formData.courseId}/basic-info`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    categoryId: formData.categoryId,
                    learning: formData.learning,
                    recommendation: formData.recommendation,
                    requirement: formData.requirement,
                  }),
                });

                router.push("/instructor");
              } catch (err) {
                console.error("저장 중 에러:", err);
              }
            }}
          >
            저장
          </Button>

          <Button
            variant="outline"
            className="bg-transparent text-white hover:bg-gray-800"
            onClick={async () => {
              const confirmed = window.confirm("정말 강의 작성을 중단하시겠습니까? 지금까지 작성한 정보는 저장되지 않습니다.");
              if (confirmed) {
                if (formData.courseId) {
                  try {
                    await fetch(`/api/courses/${formData.courseId}`, {
                      method: "DELETE",
                    });
                    console.log("💥 삭제 시도 - courseId:", formData.courseId)
                    console.log("⛔ 작성 중인 강의 삭제됨");
                  } catch (err) {
                    console.error("강의 삭제 중 에러 발생:", err);
                  }
                }
                router.push("/instructor");
              }
            }}
          >
            X
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* 왼쪽 사이드바: 강의 제작 순서 */}
        <div className="w-64 bg-gray-900 min-h-screen p-6 border-r border-gray-800">
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4 text-white">강의 제작</h2>
            <ul className="space-y-6">
              {STEPS.map((step, index) => {
                const isActive = step.id === currentStep
                const isCompleted = STEPS.findIndex((s) => s.id === currentStep) > index

                return (
                  <li key={step.id} className="relative">
                    {index > 0 && (
                      <div
                        className={`absolute left-3 -top-6 w-0.5 h-6 ${
                          isCompleted || isActive ? "bg-red-500" : "bg-gray-700"
                        }`}
                      />
                    )}
                    <button className="flex items-center w-full text-left" onClick={() => goToStep(step.id)}>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                          isActive
                            ? "bg-red-600 text-white"
                            : isCompleted
                              ? "bg-red-600 text-white"
                              : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {isCompleted ? <Check className="h-3 w-3" /> : <span className="text-xs">{index + 1}</span>}
                      </div>
                      <div>
                        <div className={`font-medium ${isActive ? "text-white" : "text-gray-300"}`}>{step.label}</div>
                        {step.subLabel && <div className="text-xs text-gray-400">{step.subLabel}</div>}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* 오른쪽: 현재 단계 폼 */}
        <div className="flex-1 p-8 bg-black">
          {/* 강의 정보 단계 */}
          {currentStep === "basic-info" && (
            <CourseBasicInfo
              formData={formData}
              updateFormData={updateFormData}
              goToNextStep={goToNextStep}
              goToPrevStep={goToPrevStep}
            />
          )}

          {/* 강의 상세 설명 단계 */}
          {currentStep === "detailed-description" && (
            <CourseDetailedDescription
              formData={formData}
              updateFormData={updateFormData}
              // uploadedImages={uploadedImages}
              // setUploadedImages={setUploadedImages}
              // setShowImageUploadModal={setShowImageUploadModal}
              // showImageUploadModal={showImageUploadModal}
              // handleImageUpload={handleImageUpload}
              goToPrevStep={goToPrevStep}
              goToNextStep={goToNextStep}
            />
          )}

          {/* 커리큘럼 단계 */}
          {currentStep === "curriculum" && (
            <CourseCurriculum
              formData={formData}
              updateFormData={updateFormData}
              setOpenSectionModal={setOpenSectionModal}
              setOpenLectureModal={setOpenLectureModal}
              openLectureModal={openLectureModal}
              goToPrevStep={goToPrevStep}
              goToNextStep={goToNextStep}
            />
          )}

          {/* 상세소개 단계 */}
          {/* {currentStep === "intro" && <CourseIntro goToPrevStep={goToPrevStep} goToNextStep={goToNextStep} />} */}

          {/* 커버 이미지 단계 */}
          {currentStep === "cover-image" && (
            <CourseCoverImage
              formData={formData}
              goToPrevStep={goToPrevStep}
              goToNextStep={goToNextStep}
              updateFormData={updateFormData} // ✅ 요거만 추가!
            />
          )}

          {/* 강의 설정 단계 */}
          {currentStep === "pricing" && (
            <CoursePricing
              formData={formData}
              updateFormData={updateFormData}
              goToPrevStep={goToPrevStep}
              goToNextStep={goToNextStep}
            />
          )}

          {/* 자주 묻는 질문 단계 */}
          {currentStep === "faq" &&
            <CourseFaq
              formData={formData}
              updateFormData={updateFormData}
              goToPrevStep={goToPrevStep}
            />}
        </div>
      </div>

      {/* 섹션 추가 모달 */}
      <AddSectionModal
        open={openSectionModal}
        setOpen={setOpenSectionModal}
        newSectionTitle={newSectionTitle}
        setNewSectionTitle={setNewSectionTitle}
        formData={formData}
        updateFormData={updateFormData}
      />

      {/* 수업 추가 모달
      <AddLectureModal
      open={openLectureModal}
      setOpen={setOpenLectureModal}
      formData={formData}
      updateFormData={updateFormData} /> */}

      {/* 이미지 업로드 모달은 CourseDetailedDescription 컴포넌트 내부로 이동 */}
    </div>
  )
}