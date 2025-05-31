"use client"

import { Button } from "@/components/user/ui/button"
import { Input } from "@/components/user/ui/input"
import { useState } from "react"

interface CourseFaqProps {
  goToPrevStep: () => void
  formData: any
  updateFormData: (field: string, value: any) => void
}

export default function CourseFaq({ goToPrevStep, formData, updateFormData }: CourseFaqProps) {
  const saveCourse = async () => {
    const courseId = formData.courseId

    if (!courseId) {
      alert("강의 ID가 없습니다. 1단계에서 강의를 먼저 생성해주세요.")
      return
    }

    try {
   
        console.log("📤 전송할 FAQ 리스트:", formData.faqs)
        const response = await fetch(`/api/courses/${courseId}/faq`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData.faqs), // 개별 visible 포함 전송
        })

        if (!response.ok) {
          throw new Error("FAQ 저장 실패: " + response.statusText)
        
      }

      console.log("✅ FAQ 저장 성공")

      const confirmed = window.confirm("강의 제작을 완료하셨습니까?")
      if (confirmed) {
        window.location.href = "/instructor/courses/manage"
      }
    } catch (err) {
      console.error("FAQ 저장 중 에러 발생:", err)
    }
  }

  const addFaq = () => {
    const newFaqs = [...formData.faqs, { content: "", answer: "", visible: 1 }]
    updateFormData("faqs", newFaqs)
  }

  const updateFaqField = (index: number, field: string, value: any) => {
    const updatedFaqs = [...formData.faqs]
    updatedFaqs[index][field] = value
    updateFormData("faqs", updatedFaqs)
  }

  return (
    <div className="bg-gray-900 p-8 rounded-lg shadow-sm border border-gray-800">
      <h2 className="text-xl font-bold mb-6 text-white">자주 묻는 질문 설정</h2>

      {formData.faqs.map((faq: any, index: number) => (
  <div key={index} className="relative mb-6 border border-gray-700 rounded-lg p-4 bg-gray-800">
   
    <Input
      value={faq.content}
      placeholder="질문을 입력하세요"
      onChange={(e) => updateFaqField(index, "content", e.target.value)}
      className="mb-2 text-white bg-gray-700"
    />
    <Input
      value={faq.answer}
      placeholder="답변을 입력하세요"
      onChange={(e) => updateFaqField(index, "answer", e.target.value)}
      className="mb-2 text-white bg-gray-700"
    />

    <div className="flex gap-2 mt-2">
      <Button
        onClick={() => updateFaqField(index, "visible", 1)}
        className={`${
          faq.visible === 1
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-gray-700 text-gray-300 hover:bg-gray-700"
        }`}
      >
        노출
      </Button>
      <Button
        onClick={() => updateFaqField(index, "visible", 0)}
        className={`${
          faq.visible === 0
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-gray-700 text-gray-300 hover:bg-gray-700"
        }`}
      >
        비노출
      </Button>
       {/* ✕ 삭제 버튼 옆에 붙이기 */}
  <Button
    onClick={() => {
      const updatedFaqs = formData.faqs.filter((_: { content: string; answer: string; visible: number }, i: number) => i !== index)
      updateFormData("faqs", updatedFaqs)
    }}
    variant="outline"
    className="ml-2 px-3 py-2 text-sm text-white border-gray-600 hover:bg-red-600 hover:text-white"
  >
    ✕ 삭제
  </Button>
    </div>
  </div>
))}

<Button onClick={addFaq} className="mt-4 bg-red-600 text-white hover:bg-red-700">
  질문 추가
</Button>

      <div className="mt-6 flex justify-between">
        <Button onClick={goToPrevStep} variant="outline">
          이전
        </Button>
        <Button onClick={saveCourse} className="bg-red-600 text-white hover:bg-red-700">
  저장 후 완료
</Button>
      </div>
    </div>
  )
}