"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Download, CheckCircle } from "lucide-react"
import { Button } from "@/components/user/ui/button"
import { Separator } from "@/components/user/ui/separator"
import { Badge } from "@/components/user/ui/badge"
import NetflixHeader from "@/components/netflix-header"
import axios from "axios"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
// import { useParams } from "next/navigation"

interface Props {
    impUid: string
    onBack: () => void
}

interface PurchaseDetail {
  orderId: string
  impUid: string
  courseId: string
  courseTitle: string
  instructor: string
  originalPrice: number
  discountPrice: number
  discountAmount: number
  payMethod: string
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

export default function PurchaseDetailComponent({ impUid, onBack }: Props) {
  // impUid가 동일한 결제(강의)들을 담을 배열
  const id = impUid // props로 받은 값 사용
  const [purchaseList, setPurchaseList] = useState<PurchaseDetail[]>([])
  const receiptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    console.log("params.id (impUid):",id)
    // 여러 강의가 있을 수 있으므로 /api/purchases/{impUid}를 호출 (백엔드에서 List<PaymentDetailDTO> 반환)
    axios
      .get(`/api/purchases/${id}`)
      .then((res) => {
        // res.data 구조가 { resultCode: number, msg: string, data: PurchaseDetail[] }
        console.log("상세상세세", res.data.data )
        if (res.data && res.data.data) {
          setPurchaseList(res.data.data)
        }
      })
      .catch((err) => console.error("결제 상세 정보 불러오기 오류", err))
  // }, [params.id])
  }, [id])

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price)
  }

  // 날짜 포맷팅
  const formatDateCustom = (dateStr: string) => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = ('0' + (date.getMonth() + 1)).slice(-2)
    const day = ('0' + date.getDate()).slice(-2)
    const hours = date.getHours()
    const minutes = ('0' + date.getMinutes()).slice(-2)
    const ampm = hours >= 12 ? "오후" : "오전"
    const adjustedHour = hours % 12 === 0 ? 12 : hours % 12
    return `${year}-${month}-${day} ${ampm} ${('0' + adjustedHour).slice(-2)}:${minutes}`
  }

  // PDF 영수증 다운로드
  const handleDownloadReceipt = async () => {
    if (purchaseList.length === 0) return
    const common = purchaseList[0] // 공통 결제 정보
    if (!receiptRef.current) return

    const canvas = await html2canvas(receiptRef.current)
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("p", "mm", "a4")

    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)

    // 파일명에 날짜, 구매자, 강의명 등 포함
    const date = new Date(common.paymentDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const formattedDate = `${year}-${month}-${day}`

    const buyer = (common.buyerName || "사용자").replace(/\s+/g, "")
    const title = (common.courseTitle || "강의").replace(/[^가-힣a-zA-Z0-9\s]/g, "_").slice(0, 20)

    const fileName = `${formattedDate}_${buyer}_${title}_영수증.pdf`
    pdf.save(fileName)
  }

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

  if (purchaseList.length === 0) {
    return <div className="text-white p-10">로딩중...</div>
  }

  // 공통 결제 정보(배열 첫 번째 항목)
  const common = purchaseList[0]

  return (
    <div className="flex flex-col gap-8">
        <div>
            <Button
                onClick={onBack}
                variant="ghost"
                className="inline-flex items-center text-gray-400 hover:text-white px-0"
            >
                <ArrowLeft className="h-4 w-4 mr-1" />
                구매 내역으로 돌아가기
            </Button>
        </div>
        {/* <div>
            <Link href="/user/dashboard/purchases" className="inline-flex items-center text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-1" />
            구매 내역으로 돌아가기
            </Link>
        </div> */}
        {/* 페이지 상단 제목 */}
        <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">주문 상세 내역</h1>
        </div>

        {/* 하나의 큰 박스 안에 강의 정보 + 결제 정보 */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-8">
        {/* 주문번호 / 결제상태 */}
        <div className="flex justify-between items-center mb-6">
            <div>
            <h2 className="text-xl font-bold">주문번호: ORDER-{common.orderId}{common.impUid.replace("imp_", "")}</h2>
            <p className="text-gray-400">
                주문일시: {common.paymentDate ? formatDateCustom(common.paymentDate) : "날짜 없음"}
            </p>
            </div>
            <Badge className={common.paymentStatus === "결제완료" ? "bg-green-600" : "bg-red-600"}>
            {common.paymentStatus}
            </Badge>
        </div>

        <Separator className="bg-gray-800 mb-6" />

        {/* 강의 목록: 여러 개면 여러 줄, 하나면 한 줄 */}
        {purchaseList.map((item, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-shrink-0">
                <Link href={`/user/course/${item.courseId}`}>
                <Image
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.courseTitle}
                    width={280}
                    height={160}
                    className="w-full md:w-[280px] h-auto object-cover rounded"
                />
                </Link>
            </div>
            <div className="flex-1">
            <Link href={`/user/course/${item.courseId}`}>
                <h3 className="text-lg font-medium mb-1 cursor-pointer hover:underline">
                {item.courseTitle}
                </h3>
            </Link>
                <p className="text-gray-400 mb-4">{item.instructor}</p>

                <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-gray-300">평생 무제한 수강</span>
                </div>

                <div className="flex justify-between items-center">
                <div>
                    <div className="text-sm text-gray-400">정가</div>
                    <div className="line-through">₩{formatPrice(item.originalPrice)}</div>
                </div>
                <div>
                    <div className="text-sm text-gray-400">할인</div>
                    <div className="text-green-500">-₩{formatPrice(item.discountAmount)}</div>
                </div>
                <div>
                    <div className="text-sm text-gray-400">결제 금액</div>
                    <div className="font-bold">₩{formatPrice(item.discountPrice)}</div>
                </div>
                </div>
            </div>
            </div>
        ))}

        <Separator className="bg-gray-800 mb-6" />

        {/* 결제 + 구매자 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
            <h3 className="font-medium mb-3">결제 정보</h3>
            <div className="space-y-2 text-gray-300">
                <div className="flex justify-between">
                <span>결제 방법</span>
                <span>{displayPaymentMethod(common.payMethod, common.pgProvider, common.cardName)}</span>
                </div>
                <div className="flex justify-between">
                <span>카드 정보</span>
                <span>
                    {common.cardName} ({common.cardNumber})
                </span>
                </div>
                <div className="flex justify-between">
                <span>결제일</span>
                <span>{common.paymentDate.split(" ")[0]}</span>
                </div>
                <div className="flex justify-between">
                <span>주문 상태</span>
                <span className="font-medium text-green-500">{common.paymentStatus}</span>
                </div>
            </div>
            </div>

            <div>
            <h3 className="font-medium mb-3">구매자 정보</h3>
            <div className="space-y-2 text-gray-300">
                <div className="flex justify-between">
                <span>이름</span>
                <span>{common.buyerName}</span>
                </div>
                <div className="flex justify-between">
                <span>이메일</span>
                <span>{common.buyerEmail}</span>
                </div>
                <div className="flex justify-between">
                <span>연락처</span>
                <span>{common.buyerPhone}</span>
                </div>
            </div>
            </div>
        </div>
        </div>

        {/* 영수증 정보 */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-8" ref={receiptRef}>
        <h2 className="text-xl font-bold mb-4">영수증 정보</h2>

        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
            <div className="bg-gray-800 p-3 rounded-lg mr-3">
                <Download className="h-5 w-5 text-gray-400" />
            </div>
            <div>
                <div className="font-medium">전자 영수증</div>
                <div className="text-sm text-gray-400">
                PDF 형식으로 다운로드할 수 있습니다.
                </div>
            </div>
            </div>
            <Button
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
            onClick={handleDownloadReceipt}
            >
            <Download className="h-4 w-4 mr-1" />
            다운로드
            </Button>
        </div>
        </div>

        {/* 하단 이동 버튼 */}
        <div className="flex justify-between">
        <Button onClick={onBack} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
            구매 내역으로 돌아가기
        </Button>
        {/* <Link href="/user/dashboard/purchases">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
            구매 내역으로 돌아가기
            </Button>
        </Link> */}
        {/* 맨 첫 번째 Payment의 orderId 기준으로 강의 바로가기 */}
        <Link href={`/user/course/${common.orderId}`}>
            <Button className="bg-red-600 hover:bg-red-700">
            강의 바로가기
            </Button>
        </Link>
        </div>
    </div>
  )
}