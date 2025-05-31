import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, Info, FileText, Upload, Settings } from "lucide-react"
import { Button } from "@/components/user/ui/button"
import CourseBasicInfo from "./course-basic-info"
import CourseDetailedDescription from "./course-detailed-description"
import CourseCurriculum from "./course-curriculum"
import CourseCoverImage from "./course-cover-image"
import CoursePricing from "./course-pricing"
import CourseFaq from "./course-faq"
import AddSectionModal from "./add-section-modal"
// import AddLectureModal from "./add-lecture-modal"
import useUserStore from "@/app/auth/userStore"
import { useSearchParams } from "next/navigation"
interface CourseFormData {
  // 기본 정보
  courseId: number | null
  title: string
  description: string
  detailedDescription: string

  // 카테고리
  categoryId: number | null
  categoryName: string
  category: string // UI용
  subCategory: string // UI용

  // 커버/썸네일 이미지
  coverImage: string | null // 프론트에서 업로드한 파일
  thumbnailUrl: string | null // 실제 S3 주소
  backImageUrl: string | null // 이전에는 사용했지만 지금은 대체되었을 수 있음

  // 강사 정보
  instructorName: string
  instructorId?: number | null // POST용으로 존재하면 좋음

  // 가격 정보
  price: number
  discountRate: number
  discountPrice: number
  viewLimit: string
  startDate: string | null
  endDate: string | null

  // 공개 설정
  status: "PREPARING" | "ACTIVE" | "CLOSED"
  isPublic: boolean // 사용 중이 아니면 제거해도 무방

  // 학습 관련
  learning: string
  recommendation: string
  requirement: string
  target: string
  level: string
  tags: string[]

  // 기술 스택
  techStackIds: number[]
  techStacks?: { id: number; name: string }[] // UI 렌더용 (선택사항)

  // 커리큘럼
  curriculum: {
    title: string
    lectures: {
      title: string
      videoUrl: string
      duration: number
    }[]
  }[]

  // FAQ
  faqVisible: number // 사용 여부
  faqs: {
    content: string
    answer: string
    visible: number
  }[]

  // 기타
  introVideo: string | null
}
const STEPS = [
  { id: "basic-info", label: "강의 정보", icon: Info },
  { id: "detailed-description", label: "강의 상세 설명", icon: FileText },
  { id: "curriculum", label: "커리큘럼", icon: FileText },
  { id: "cover-image", label: "커버 이미지", icon: Upload },
  { id: "pricing", label: "강의 설정", icon: Settings },
  { id: "faq", label: "자주 묻는 질문", icon: FileText },
]

interface CourseCreateFormProps {
  initialData?: any
  isEdit?: boolean
}

export default function CourseCreateForm({ initialData, isEdit = false }: CourseCreateFormProps) {
  const router = useRouter()
  const { user } = useUserStore()
  const searchParams = useSearchParams()
  const stepParam = searchParams.get("step")
  const [techStacks, setTechStacks] = useState<{ value: number; label: string }[]>([]);
  const [currentStep, setCurrentStep] = useState("basic-info")
  const [openSectionModal, setOpenSectionModal] = useState(false)
  const [openLectureModal, setOpenLectureModal] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [showImageUploadModal, setShowImageUploadModal] = useState(false)
 // 1) 최초 상태는 빈값
 const [formData, setFormData] = useState<CourseFormData>({
  courseId: null,
  title: "",
  description: "",
  detailedDescription: "",
  categoryId: null,
  categoryName: "",
  category: "",
  subCategory: "",
  coverImage: null,
  thumbnailUrl: null,
  backImageUrl: null,
  instructorName: "",
  instructorId: null,

  price: 0,
  discountRate: 0,
  discountPrice: 0,
  viewLimit: "unlimited",
  startDate: null,
  endDate: null,

  status: "PREPARING",
  isPublic: false,

  learning: "",
  recommendation: "",
  requirement: "",
  target: "",
  level: "beginner",
  tags: [""],

  techStackIds: [],
  techStacks: [],

  curriculum: [
    {
      title: "섹션 1",
      lectures: [{ title: "", videoUrl: "", duration: 0 }],
    },
  ],

  faqVisible: 0,
  faqs: [{ content: "", answer: "", visible: 1 }],

  introVideo: null,
});
useEffect(() => {
  if (stepParam) {
    setCurrentStep(stepParam)
  }
}, [stepParam])
useEffect(() => {
  fetch("/api/courses/tech-stacks")
    .then((res) => res.json())
    .then((data) => {
      const formatted = data.map((item: { id: number; name: string }) => ({
        value: item.id,
        label: item.name,
      }));
      setTechStacks(formatted);
    });
}, []);
useEffect(() => {
  console.log("🔥 formData:", formData);
  console.log("🧩 techStacks:", techStacks);
}, [formData, techStacks]);
useEffect(() => {
  if (
    initialData &&
    Array.isArray(initialData.techStackIds) &&
    techStacks.length > 0
  ) {
    setFormData((prev) => ({
      ...prev,
      techStackIds: initialData.techStackIds.map(Number),
    }));
  }
}, [techStacks, initialData]);
 // ✅ 1. 여기에 로그용 useEffect 추가
 useEffect(() => {
  if (initialData) {
    console.log("🎯 initialData 확인:", initialData);
  }
}, [initialData]);
// 2) 초기 데이터 들어오면 업데이트 (⭐ 핵심 패치)
useEffect(() => {
  if (initialData) {
    setFormData((prev) => ({
      ...prev,
      ...initialData,

      courseId: initialData.id ?? null,
      instructorId: initialData.instructorId ?? user?.instructorId ?? null,

      // ✅ 명시적 매핑
      title: initialData.title ?? "",
      description: initialData.description ?? "",
      detailedDescription: initialData.detailedDescription ?? "",
      coverImage: initialData.thumbnailUrl ?? "",
      thumbnailUrl: initialData.thumbnailUrl ?? "",
      categoryId: initialData.categoryId ?? null,
      category: initialData.categoryName ?? "",

      learning: initialData.learningContent ?? "",
      recommendation: initialData.recommendationContent ?? "",
      requirement: initialData.requirementContent ?? "",
      target: initialData.targetContent ?? "",
      faqs: initialData.faqs ?? [{ content: "", answer: "", visible: 1 }],
      curriculum: initialData.curriculum ?? [],

      status: initialData.status ?? "PREPARING",
      viewLimit: initialData.viewLimit ?? "unlimited",
      startDate: initialData.startDate ?? null,
      endDate: initialData.endDate ?? null,
    }));
  }
}, [initialData, user]);
useEffect(() => {
  if (initialData && Array.isArray(initialData.techStackIds) && techStacks.length > 0) {
    setFormData((prev) => ({
      ...prev,
      techStackIds: initialData.techStackIds.map(Number),
    }));
  }
}, [initialData, techStacks]);

  const [newSectionTitle, setNewSectionTitle] = useState("섹션 2")

  const currentStepIndex = STEPS.findIndex((step) => step.id === currentStep)

  const goToNextStep = () => currentStepIndex < STEPS.length - 1 && setCurrentStep(STEPS[currentStepIndex + 1].id)
  const goToPrevStep = () => currentStepIndex > 0 && setCurrentStep(STEPS[currentStepIndex - 1].id)
  const goToStep = (stepId: string) => setCurrentStep(stepId)
  const updateFormData = (field: string, value: any) => setFormData((prev: any) => ({ ...prev, [field]: value }))
  const mapFormDataToCourseRequest = (formData: CourseFormData, instructorId: number | null) => {
    return {
      title: formData.title,
      description: formData.description,
      detailedDescription: formData.detailedDescription,
      thumbnailUrl: formData.thumbnailUrl, // coverImage도 가능
      backImageUrl: formData.backImageUrl,
      categoryId: formData.categoryId,
      instructorId: instructorId,
      learning: formData.learning,
      recommendation: formData.recommendation,
      requirement: formData.requirement,
      target: formData.target,
      price: formData.price,
      discountRate: formData.discountRate,
      discountPrice: formData.discountPrice,
      viewLimit: formData.viewLimit,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
      techStackIds: formData.techStackIds ?? [],
      faqs: formData.faqs,
      curriculum: formData.curriculum,
      tags: formData.tags,
      introVideo: formData.introVideo,
      level: formData.level,
      subCategory: formData.subCategory,
    };
  };
  const saveCourse = async () => {
    const payload = mapFormDataToCourseRequest(formData, user?.instructorId ?? null);
  
    try {
      const url = isEdit ? `/api/courses/${formData.courseId}/basic-info` : "/api/courses";
      const method = isEdit ? "PATCH" : "POST";
  
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(isEdit ? "강의 수정 실패" : "강의 생성 실패");
  
      if (!isEdit) {
        updateFormData("courseId", data.courseId);
      }
  
      goToNextStep(); // 다음 단계로 이동
    } catch (err) {
      console.error("강의 저장 중 에러:", err);
    }
  };


  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        <div className="w-64 bg-gray-900 min-h-screen p-6 border-r border-gray-800">
          <h2 className="text-lg font-medium mb-4 text-white">강의 제작</h2>
          <ul className="space-y-6">
            {STEPS.map((step, index) => {
              const isActive = step.id === currentStep
              const isCompleted = currentStepIndex > index
              return (
                <li key={step.id} className="relative">
                  {index > 0 && (
                    <div className={`absolute left-3 -top-6 w-0.5 h-6 ${isCompleted || isActive ? "bg-red-500" : "bg-gray-700"}`} />
                  )}
                  <button className="flex items-center w-full text-left" onClick={() => goToStep(step.id)}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${isActive ? "bg-red-600" : isCompleted ? "bg-red-600" : "bg-gray-700"}`}>
                      {isCompleted ? <Check className="h-3 w-3" /> : <span className="text-xs">{index + 1}</span>}
                    </div>
                    <div className={`font-medium ${isActive ? "text-white" : "text-gray-300"}`}>{step.label}</div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="flex-1 p-8 bg-black">
          {currentStep === "basic-info" && (
            <CourseBasicInfo formData={formData} updateFormData={updateFormData} goToNextStep={goToNextStep} goToPrevStep={goToPrevStep} />
          )}
          {currentStep === "detailed-description" && (
            <CourseDetailedDescription formData={formData} updateFormData={updateFormData} goToNextStep={goToNextStep} goToPrevStep={goToPrevStep} />
          )}
          {currentStep === "curriculum" && (
            <CourseCurriculum formData={formData} updateFormData={updateFormData} setOpenSectionModal={setOpenSectionModal} setOpenLectureModal={setOpenLectureModal} openLectureModal={openLectureModal} goToPrevStep={goToPrevStep} goToNextStep={goToNextStep} />
          )}
          {currentStep === "cover-image" && (
            <CourseCoverImage formData={formData} goToPrevStep={goToPrevStep} goToNextStep={goToNextStep} updateFormData={updateFormData} />
          )}
          {currentStep === "pricing" && (
            <CoursePricing formData={formData} updateFormData={updateFormData} goToPrevStep={goToPrevStep} goToNextStep={goToNextStep} />
          )}
          {currentStep === "faq" && (
            <CourseFaq formData={formData} updateFormData={updateFormData} goToPrevStep={goToPrevStep} />
          )}
        </div>
      </div>
      <AddSectionModal open={openSectionModal} setOpen={setOpenSectionModal} newSectionTitle={newSectionTitle} setNewSectionTitle={setNewSectionTitle} formData={formData} updateFormData={updateFormData} />
    </div>
  )
}