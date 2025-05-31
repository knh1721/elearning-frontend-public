"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Mail, Check } from "lucide-react"
import { Button } from "@/components/user/ui/button"
import { Input } from "@/components/user/ui/input"
import { Label } from "@/components/user/ui/label"
import NetflixHeader from "@/components/netflix-header"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("") // 이메일 입력값
  const [isSubmitted, setIsSubmitted] = useState(false) // 요청 완료 여부
  const [isLoading, setIsLoading] = useState(false) // 로딩 상태

  // 비밀번호 재설정 링크 요청 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
  
    try {
      const response = await fetch("/api/auth/password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
  
      const result = await response.json()
  
      if (response.ok) {
        // 이메일 정상 발송 시 완료 화면 전환
        setIsSubmitted(true)
      } else {
        alert(result.msg || "이메일 발송에 실패했습니다.")
      }
    } catch (err) {
      console.error("비밀번호 재설정 요청 실패:", err)
      alert("오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  // 이메일 재전송 핸들러
  const handleResend = async () => {
    setIsLoading(true)
  
    try {
      const response = await fetch("/api/auth/password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
  
      const result = await response.json()
  
      // 제한 초과 메시지 처리
    if (result.totalCount === 1) {
      alert("인증 이메일이 다시 발송되었습니다.")
    } else {
      if (result.msg?.includes("초과")) {
        alert(result.msg.replace(/\n/g, "\n"))
      } else {
        alert(result.msg || "재전송 실패: 서버 오류 발생")
      }
    }
    } catch (err) {
      console.error("재전송 요청 실패:", err)
      alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NetflixHeader />

      <div className="flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link href="/auth/user/login" className="inline-flex items-center text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-1" />
              로그인으로 돌아가기
            </Link>
          </div>

          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Image
                src="/logo/CodeFlix.png?height=40&width=120"
                alt="CODEFLIX 로고"
                width={120}
                height={40}
                className="h-10 mx-auto"
              />
            </Link>
            <h2 className="mt-6 text-3xl font-bold">비밀번호 찾기</h2>
            <p className="mt-2 text-sm text-gray-400">
              가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
            </p>
          </div>

          <div className="bg-gray-900 py-8 px-6 shadow-lg rounded-lg border border-gray-800">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    이메일
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="example@example.com"
                      className="appearance-none block w-full px-3 py-2 bg-gray-800 border-gray-700 text-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                    {isLoading ? "처리 중..." : "비밀번호 재설정 링크 받기"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-medium mb-2">이메일이 발송되었습니다</h3>
                <p className="text-gray-300 mb-6">
                  <span className="font-medium">{email}</span>로 비밀번호 재설정 링크를 보냈습니다. 이메일을 확인하고
                  링크를 클릭하여 비밀번호를 재설정해주세요.
                </p>
                <div className="text-sm text-gray-400 mb-4">
                  이메일을 받지 못하셨나요?<br/>
                  <span className="text-red-500">1시간 이내 최대 10회까지만 발송 가능합니다.</span>
                </div>
                
                <Button
                   onClick={handleResend}
                   variant="outline"
                   className="border-gray-700 text-gray-300 hover:bg-gray-800"
                   disabled={isLoading}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {isLoading ? "재전송 중..." : "다시 보내기"}
                </Button>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              계정이 기억나셨나요?{" "}
              <Link href="/auth/user/login" className="font-medium text-red-500 hover:text-red-400">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

