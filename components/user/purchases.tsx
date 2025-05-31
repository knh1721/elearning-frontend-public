"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Download, CheckCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/user/ui/button"
import { Input } from "@/components/user/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/user/ui/select"
import { Badge } from "@/components/user/ui/badge"
import { Separator } from "@/components/user/ui/separator"
import axios from "axios"
import useUserStore from "@/app/auth/userStore"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { useRouter } from "next/navigation"
import PurchaseDetailComponent from "@/components/user/purchase-detail"


interface Purchase {
  orderId: string
  impUid: string
  courseId: string   
  courseTitle: string
  instructor: string
  originalPrice: number
  discountPrice: number
  discountAmount: number
  paymentMethod: string
  cardName: string
  cardNumber: string
  paymentStatus: string
  paymentDate: string
  imageUrl: string
  pgProvider: string
  buyerName: string
  buyerEmail: string
  buyerPhone: string
}

// 그룹 정보 (UI 표시용)
interface PurchaseGroup {
  impUid: string
  paymentDate: string
  courses: Purchase[]
  totalAmount: number
  paymentStatus: string
  paymentMethod: string
}

export default function PurchasesComponent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPeriod, setFilterPeriod] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [purchaseGroups, setPurchaseGroups] = useState<PurchaseGroup[]>([])
  const [visibleCount, setVisibleCount] = useState(5)
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseGroup | null>(null)
  const receiptRef = useRef<HTMLDivElement>(null)
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null)

  const router = useRouter()
  const { user, restoreFromStorage } = useUserStore()

  useEffect(() => {
    restoreFromStorage() // 페이지 로드 시 사용자 정보 복원
  }, [restoreFromStorage])

  useEffect(() => {
    if (!user) return // 사용자가 없으면 리턴

    // 쿠키에 담긴 자동 인증 정보로 API 호출
    axios
      .get(`/api/purchases`, { withCredentials: true, params: { userId: user.id } })
      .then((res) => {
        console.log("구매 내역 조회 성공", res.data)
        if (res.data) {
          setPurchases(res.data)
        }
      })
      .catch((err) => {
        console.error("구매 내역 조회 오류", err)
      })
  }, [user]) // user 상태가 변경될 때마다 실행

  // impUid 기준으로 구매 목록 그룹화
  useEffect(() => {
    if (!purchases.length) return

    // impUid 기준으로 그룹화
    const groupMap: Record<string, PurchaseGroup> = {}

    purchases.forEach((purchase) => {
      const { impUid } = purchase

      if (!groupMap[impUid]) {
        groupMap[impUid] = {
          impUid,
          paymentDate: purchase.paymentDate,
          courses: [],
          totalAmount: 0,
          paymentStatus: purchase.paymentStatus,
          paymentMethod: purchase.paymentMethod,
        }
      }

      groupMap[impUid].courses.push(purchase)
      groupMap[impUid].totalAmount += purchase.discountPrice
    })

    // 객체를 배열로 변환하고 날짜별 정렬
    const groups = Object.values(groupMap).sort(
      (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    )

    setPurchaseGroups(groups)
  }, [purchases])

  // 가격 포맷팅 함수
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price)
  }

  // 날짜 포맷팅 함수 (예: "2025.04.02 23:30")
  const formatDateCustom = (dateStr: string) => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = ("0" + (date.getMonth() + 1)).slice(-2)
    const day = ("0" + date.getDate()).slice(-2)
    const hours = date.getHours()
    const minutes = ("0" + date.getMinutes()).slice(-2)
    // 예: "2025-04-07 오후 04:29"
    const ampm = hours >= 12 ? "오후" : "오전"
    const adjustedHour = hours % 12 === 0 ? 12 : hours % 12
    return `${year}-${month}-${day} ${ampm} ${("0" + adjustedHour).slice(-2)}:${minutes}`
  }

  // 필터링된 구매 그룹
  const filteredPurchaseGroups = purchaseGroups.filter((group) => {
    // 그룹 내 아이템 중 하나라도 검색어와 일치하는지 확인
    const matchesSearch = group.courses.some((item) =>
      item.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
    )

    let matchesPeriod = true
    if (filterPeriod !== "all") {
      const purchaseDate = new Date(group.paymentDate)
      const today = new Date()
      const monthsAgo = new Date()

      if (filterPeriod === "1month") {
        monthsAgo.setMonth(today.getMonth() - 1)
        matchesPeriod = purchaseDate >= monthsAgo
      } else if (filterPeriod === "3months") {
        monthsAgo.setMonth(today.getMonth() - 3)
        matchesPeriod = purchaseDate >= monthsAgo
      } else if (filterPeriod === "6months") {
        monthsAgo.setMonth(today.getMonth() - 6)
        matchesPeriod = purchaseDate >= monthsAgo
      }
    }

    // 결제 상태 필터링
    const matchesStatus = filterStatus === "all" || group.paymentStatus === filterStatus

    return matchesSearch && matchesPeriod && matchesStatus
  })

  // 보여줄 항목만 잘라내기
  const visiblePurchaseGroups = filteredPurchaseGroups.slice(0, visibleCount)

  // 더보기 버튼 클릭 시 visibleCount 증가
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5)
  }

  // 환불 요청 함수: 선택한 결제의 impUid refund 금액을 백엔드 환불 API로 요청
  const handleRefund = async (impUid: string, refundAmount: number) => {
    try {
      // JWT 토큰은 jwtProvider.resolveToken을 사용해서 일관되게 추출합니다.
      const token = localStorage.getItem("accessToken") || ""
      console.log("환불 요청 데이터:", { impUid, cancelAmount: refundAmount })

      const response = await axios.post(
        "/api/payment/refund",
        { impUid, cancelAmount: refundAmount },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (response.data && response.data.success) {
        alert("환불이 성공적으로 처리되었습니다.")
        // 환불 성공 후 상태 업데이트
        setPurchaseGroups((prev) =>
          prev.map((group) =>
            group.impUid === impUid ? { ...group, paymentStatus: "환불완료" } : group
          )
        )
      } else {
        alert("환불 실패: " + response.data.message)
      }
    } catch (error: any) {
      console.error("환불 요청 오류:", error);

      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message;
        
        if (errorMessage === "이미 수강을 시작한 강의는 환불할 수 없습니다.") {
          // 이 메시지 정확히 보고 alert
          alert("이미 수강중인 강의/수강 완료된 강의는 환불이 불가능합니다.");
        } else {
          // 다른 400 오류면 그냥 메시지 띄움
          alert(errorMessage || "요청이 잘못되었습니다.");
        }
      } else {
        alert("환불 요청 중 오류가 발생했습니다.")
      }
    }
  };

  // 결제수단 표시 (카드정보 포함)
  const displayPaymentMethod = (method: string, pgProvider: string, cardName: string) => {
    const methodMap: { [key: string]: string } = {
      card: "카드",
      point: "포인트",
      phone: "휴대폰 결제",
      vbank: "가상계좌",
      trans: "실시간 계좌이체",
    }
    const translated = methodMap[method] || method
    // 간편결제 처리 (ex. kakaopay, tosspay 등)
    const easyPay = ["kakaopay", "tosspay", "naverpay"].includes(pgProvider)
    if (method === "card" && easyPay) {
      return `간편결제 (${cardName})`
    } else if (method === "card") {
      return `${translated} (${cardName})`
    }
    return translated
  }
  
  // 상세 보기 모드로 전환
  const handleViewDetail = (group: PurchaseGroup) => {
    // setSelectedPurchase(group)
    router.push(`/user/dashboard/purchases/${group.impUid}`)
  }

  // 목록으로 돌아가기
  const handleBackToList = () => {
    setSelectedPurchase(null)
  }

  // 상세보기 전환 시 해당 컴포넌트 보여줌
  if (selectedPurchaseId) {
    return (
      <PurchaseDetailComponent
        impUid={selectedPurchaseId}
        onBack={() => setSelectedPurchaseId(null)}
      />
    )
  }

  // 목록 보기 모드일 때
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">구매 내역</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="강의명 검색"
              className="pl-8 bg-gray-900 border-gray-800 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-full sm:w-32 bg-gray-900 border-gray-800 text-white">
                <SelectValue placeholder="기간 선택" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800 text-white">
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="1month">1개월</SelectItem>
                <SelectItem value="3months">3개월</SelectItem>
                <SelectItem value="6months">6개월</SelectItem>
                <SelectItem value="1year">1년</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-32 bg-gray-900 border-gray-800 text-white">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800 text-white">
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="결제완료">결제완료</SelectItem>
                <SelectItem value="환불완료">환불완료</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {visiblePurchaseGroups.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">구매 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {visiblePurchaseGroups.map((group, index) => (
            <div key={index} className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              {/* 주문 정보 헤더 */}
              <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <div className="font-medium">
                    주문번호: ORDER-{group.courses[0].orderId}
                    {group.impUid.replace("imp_", "")}
                  </div>
                  <div className="text-sm text-gray-400">
                    {group.paymentDate ? formatDateCustom(group.paymentDate) : "날짜 없음"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={group.paymentStatus === "결제완료" ? "bg-green-600" : "bg-red-600"}>
                    {group.paymentStatus}
                  </Badge>
                  {group.totalAmount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                      // onClick={() => handleViewDetail(group)}
                      onClick={() => setSelectedPurchaseId(group.impUid)}
                    >
                      상세보기
                    </Button>
                  )}
                </div>
              </div>

              {/* 강의 목록 */}
              <div className="divide-y divide-gray-800">
                {group.courses.map((course, courseIndex) => (
                  <div key={courseIndex} className="p-4 flex flex-col sm:flex-row gap-4">
                    <div className="flex-shrink-0">
                      <Link href={`/user/course/${course.courseId}`}>
                        <Image
                          src={course.imageUrl || "/placeholder.svg"}
                          alt={course.courseTitle}
                          width={120}
                          height={68}
                          className="w-full sm:w-[120px] h-auto object-cover rounded"
                        />
                      </Link>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/user/course/${course.courseId}`}>
                        <h3 className="font-medium truncate hover:underline">{course.courseTitle}</h3>
                      </Link>
                      <p className="text-sm text-gray-400">{course.instructor}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-gray-400">결제금액:</span>{" "}
                          <span className="font-medium">₩{formatPrice(course.discountPrice)}</span>
                        </div>
                        {/* <div className="text-sm">
                          <span className="text-gray-400">결제방법:</span>{" "}
                          {displayPaymentMethod(course.paymentMethod, course.pgProvider, course.cardName)}
                        </div> */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 결제 금액 및 환불 버튼 */}
              <div className="p-4 bg-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-sm">
                  <span className="text-gray-400">총 결제금액:</span>{" "}
                  <span className="font-medium">₩{formatPrice(group.totalAmount)}</span>
                </div>
                {group.paymentStatus === "결제완료" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    onClick={() => handleRefund(group.impUid, group.totalAmount)}
                  >
                    환불 요청
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* 더보기 버튼 */}
          {visibleCount < filteredPurchaseGroups.length && (
            <div className="text-center">
              <Button
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={handleLoadMore}
              >
                더보기
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 