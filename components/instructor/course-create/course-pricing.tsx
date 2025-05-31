"use client"

import { Button } from "@/components/user/ui/button"
import { Input } from "@/components/user/ui/input"
import { useEffect } from "react"

interface CoursePricingProps {
  formData: {
    price: number
    discountRate: number
    discountPrice: number
    [key: string]: any
  }
  updateFormData: (field: string, value: any) => void
  goToPrevStep: () => void
  goToNextStep: () => void
}

export default function CoursePricing({ formData, updateFormData, goToPrevStep, goToNextStep }: CoursePricingProps) {
  
  
   useEffect(() => {
    if (formData.viewLimit !== "period") {
      updateFormData("startDate", "")
      updateFormData("endDate", "")
    }
  }, [formData.viewLimit])

  const saveAndNext = async () => {
    if (!formData.courseId) {
      console.error("❌ courseId가 없습니다.");
      return;
    }
    console.log("📦 저장 전 isPublic 값:", formData.isPublic);
    try {
      const res = await fetch(`/api/courses/${formData.courseId}/pricing`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: formData.price,
          discountRate: formData.discountRate,
          status: formData.status ?? "PREPARING",
          viewLimit: formData.viewLimit,
          target: formData.target,
          ...(formData.viewLimit === "period"
            ? {
                startDate: formData.startDate,
                endDate: formData.endDate,
              }
            : {}),
        }),
      });
      if (!res.ok) throw new Error("가격 정보 저장 실패");
  
      console.log("✅ 가격 정보 저장 성공");
      goToNextStep();
    } catch (err) {
      console.error("가격 저장 중 에러:", err);
    }
  };
  return (
    <div className="bg-gray-900 p-8 rounded-lg shadow-sm border border-gray-800">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-6 text-white">강의 설정</h2>

        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-white">강의 설정 - 가격 및 수강 기간</h3>
          <p className="text-sm text-gray-400 mb-4">
            설정에 따라 강의 가격과 수강 기간이 달라집니다.
            <br />
            수강 기간은 결제 후 수강 신청시 기간이 설정됩니다.
          </p>

          <div className="border border-gray-700 rounded-lg p-4 mb-4 bg-gray-800">
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium text-white">가격 설정</label>
              <div className="text-sm text-gray-400">(가격 설정에 따라 수강 기간이 달라집니다)</div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Input
                type="number"
                placeholder="0"
                value={formData.price || ""}
                onChange={(e) => updateFormData("price", Number.parseInt(e.target.value) || 0)}
                className="w-32 border-gray-700 bg-gray-700 text-white"
              />
              <span className="text-white">원</span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <label className="text-white mr-2">할인율</label>
              <Input
                type="number"
                placeholder="0"
                min="0"
                max="100"
                value={formData.discountRate || ""}
                onChange={(e) => {
                  const rate = Math.min(100, Math.max(0, Number.parseInt(e.target.value) || 0))
                  updateFormData("discountRate", rate)
                  if (formData.price > 0) {
                    const discountedPrice = formData.price * (1 - rate / 100)
                    updateFormData("discountPrice", Math.floor(discountedPrice))
                  }
                }}
                className="w-20 border-gray-700 bg-gray-700 text-white"
              />
              <span className="text-white">%</span>
            </div>

            {formData.discountRate > 0 && formData.price > 0 && (
              <div className="mb-4">
                <div className="text-sm text-gray-400">할인 적용 가격:</div>
                <div className="text-lg text-red-500 font-bold">
                  {Math.floor(formData.price * (1 - formData.discountRate / 100)).toLocaleString()}원
                  <span className="text-sm text-gray-400 ml-2 line-through">{formData.price.toLocaleString()}원</span>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-400">
              수강생에게 제공되는 가격:{" "}
              {formData.discountRate > 0
                ? Math.floor(formData.price * (1 - formData.discountRate / 100)).toLocaleString()
                : formData.price.toLocaleString()}
              원
            </div>
          </div>
        </div>

        <div className="mb-8">
  <h3 className="text-lg font-medium mb-4 text-white">강의 영상보기 제한</h3>
  <div className="flex items-center gap-4">
    <Button
      variant={formData.viewLimit === "unlimited" ? "default" : "outline"}
      className={formData.viewLimit === "unlimited" ? "bg-red-600 text-white" : "border-gray-700 text-gray-300"}
      onClick={() => updateFormData("viewLimit", "unlimited")}
    >
      무제한
    </Button>
    <Button
      variant={formData.viewLimit === "period" ? "default" : "outline"}
      className={formData.viewLimit === "period" ? "bg-red-600 text-white" : "border-gray-700 text-gray-300"}
      onClick={() => updateFormData("viewLimit", "period")}
    >
      기간 설정
    </Button>
    <Button
      variant={formData.viewLimit === "block" ? "default" : "outline"}
      className={formData.viewLimit === "block" ? "bg-red-600 text-white" : "border-gray-700 text-gray-300"}
      onClick={() => updateFormData("viewLimit", "block")}
    >
      URL 접근 방지
    </Button>
  </div>
</div>
        
{/* <div className="mb-8">
  <h3 className="text-lg font-medium mb-4 text-white">강의 공개 설정</h3>
  <div className="flex gap-4">
    <Button
      variant={formData.status === "ACTIVE" ? "default" : "outline"}
      onClick={() => updateFormData("status", "ACTIVE")}
      className={formData.status === "ACTIVE" ? "bg-red-600 text-white" : "border-gray-700 text-gray-300"}
    >
      공개
    </Button>
    <Button
      variant={formData.status === "PREPARING" ? "default" : "outline"}
      onClick={() => updateFormData("status", "PREPARING")}
      className={formData.status === "PREPARING" ? "bg-red-600 text-white" : "border-gray-700 text-gray-300"}
    >
      비공개
    </Button>
  </div>
</div> */}

<div className="mb-8">
  <h3 className="text-lg font-medium mb-4 text-white">강의 공개 설정</h3>
  <div className="flex gap-4">
    <Button
      variant={formData.status === "ACTIVE" ? "default" : "outline"}
      disabled={!(formData.status === "ACTIVE" || formData.status === "CLOSED")} // ✅ 활성 상태가 아닐 경우 버튼 비활성화
      onClick={() => updateFormData("status", "ACTIVE")}
      className={formData.status === "ACTIVE" ? "bg-red-600 text-white" : "border-gray-700 text-gray-300"}
    >
      공개
    </Button>
    <Button
      variant={formData.status === "CLOSED" ? "default" : "outline"}
      disabled={!(formData.status === "ACTIVE" || formData.status === "CLOSED")} // ✅ ACTIVE 상태만 CLOSED로 전환 가능
      onClick={() => updateFormData("status", "CLOSED")}
      className={formData.status === "CLOSED" ? "bg-red-600 text-white" : "border-gray-700 text-gray-300"}
    >
      비공개
    </Button>
  </div>

  {/* ✅ 상태가 ACTIVE가 아닐 때 설명 메시지 출력 */}
  {formData.status === "PREPARING" && (
  <p className="text-sm text-gray-400 mt-2">
    ※ 강의가 공개 상태(ACTIVE)일 때만 상태를 변경할 수 있습니다.
  </p>
)}
</div>

<h3 className="text-lg font-medium mb-4 text-white">강의 난이도</h3>
<div className="flex gap-4">
  {["입문", "초급", "중급", "고급"].map((level) => (
    <Button
      key={level}
      variant={formData.target === level ? "default" : "outline"}
      onClick={() => updateFormData("target", level)}
      className={formData.target === level ? "bg-red-600 text-white" : "border-gray-700 text-gray-300"}
    >
      {level}
    </Button>
  ))}
</div>

{formData.viewLimit === "period" && (
  <div className="mb-8">
    <h3 className="text-lg font-medium mb-4 text-white">강의 공개 기간 설정</h3>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div>
        <label className="text-sm text-white">시작일</label>
        <Input
          type="datetime-local"
          value={formData.startDate || ""}
          onChange={(e) => updateFormData("startDate", e.target.value)}
          className="border-gray-700 bg-gray-700 text-white"
        />
      </div>
      <div>
        <label className="text-sm text-white">종료일</label>
        <Input
          type="datetime-local"
          value={formData.endDate || ""}
          onChange={(e) => updateFormData("endDate", e.target.value)}
          className="border-gray-700 bg-gray-700 text-white"
        />
      </div>
    </div>
  </div>
)}

{/* <div className="mb-8">
  <h3 className="text-lg font-medium mb-4 text-white">수강 기한</h3>
  <div className="flex items-center gap-4">
    <Button
      variant={formData.durationType === "unlimited" ? "default" : "outline"}
      className={formData.durationType === "unlimited" ? "bg-red-600 text-white" : "border-gray-700 text-gray-300"}
      onClick={() => updateFormData("durationType", "unlimited")}
    >
      무제한
    </Button>
    <Button
      variant={formData.durationType === "fixed" ? "default" : "outline"}
      className={formData.durationType === "fixed" ? "bg-red-600 text-white" : "border-gray-700 text-gray-300"}
      onClick={() => updateFormData("durationType", "fixed")}
    >
      단일 기간
    </Button>
  </div>
</div> */}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={goToPrevStep} className="border-gray-700 text-gray-300 hover:bg-gray-800">
          이전
        </Button>
        <Button onClick={saveAndNext} className="bg-red-600 hover:bg-red-700 text-white">
          저장 후 다음 이동
        </Button>
      </div>
    </div>
  )
}

